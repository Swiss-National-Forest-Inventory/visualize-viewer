import {CLASSIFICATIONS_TO_IGNORE, DEFAULT_TOPIC} from '../config.js';
import {queries, queryLindas} from '../util/QueryUtil.js';
import {onUpdateClassification, onUpdateMeasure, onUpdateFilter, cssifyString, evaluateCube} from '../util/shared.js';
import '../types.js';

/**
 * The URL for the classification dimension.
 * @constant {string}
 */
const classificationUnit =
    'https://environment.ld.admin.ch/foen/nfi/classificationUnit';

/**
 * A service class that manages property data, selections, and UI interactions for a chart.
 */
export class PropertyService {
  lfiViewer;

  /**
   * The selected language.
   * @type {string}
   */
  lang;

  /**
   * The properties object containing key dimensions and measures.
   * @type {{ keys: Array<Measure>, measures: Array<Measure> }}
   */
  properties;

  /**
   * The currently selected measure object.
   * @type {Measure}
   */
  measure;

  /**
   * @type {Array<string>}
   */
  classificationDimensions = [];

  /**
   * The currently selected cube URL.
   * @type {string}
   */
  cube;

  /**
   * The currently selected dimension path (used for the Y-axis).
   * @type {string}
   */
  yAxis;

  /**
   * Creates a new instance of the PropertyService.
   * @param {LfiViewer} lfiViewer
   * @param {string} lang - The language code (e.g., 'en', 'de', 'fr').
   * @param {Object} uiAccessService - A service for manipulating the UI (populating selects, etc.).
   * @param {Object} urlService - A service for managing URL filters.
   * @param {Object} chartService - A service for re-rendering the chart.
   * @param {Object} i18nService - A service for internationalization configuration.
   */
  constructor(lfiViewer, lang, uiAccessService, urlService, chartService, i18nService) {
    this.lfiViewer = lfiViewer;
    this.lang = lang;
    this.properties = {keys: [], measures: []};
    this.uiAccessService = uiAccessService;
    this.urlService = urlService;
    this.chartService = chartService;
    this.i18nService = i18nService;
  }

  /**
   * Sets the currently selected measure.
   * Updates the cube, Y-axis, and URL filters accordingly.
   * @param {string} measure - The ID of the measure to set.
   * @returns {boolean} Returns `true` if measure is set successfully, otherwise `false`.
   */
  setMeasure = (measure) => {
    const populatedMeasures = this.properties.measures.filter(
        (prop) => prop.id === measure,
    );
    if (!populatedMeasures) {
      this.urlService.removeFilterInUrl('measure');
      return false;
    }

    this.measure = evaluateCube(populatedMeasures);
    this.cube = this.measure.cube.value;
    this.yAxis = this.measure.dimPath.value;

    this.urlService.putFilterInUrl('measure', this.yAxis);
    // this.urlService.removeFilterInUrl('classification');

    this.populateClassificationSelect();
    this.chartService.rerender();
    return true;
  };

  /**
   * Sets the classification (key dimension) for the currently selected measure.
   * Updates the cube, Y-axis, and URL filters accordingly.
   * @param {string} propertyId - The ID of the classification property to set.
   * @returns {boolean} Returns `true` if classification is set successfully, otherwise `false`.
   */
  setClassification = (propertyId) => {
    const key = this.properties.keys.find((m) => m.id === propertyId);
    if (!key) {
      this.urlService.removeFilterInUrl('classification');
      return false;
    }

    this.cube = key.cube.value;

    let parentMeasure = this.getMeasureDimensions().find(
        (m) => m.dimName.value === this.measure.dimName.value,
    );
    if (!parentMeasure) {
      // wrong classification for measure
      this.urlService.removeFilterInUrl('classification');
      this.setClassification(this.getCubesForMeasure()[0]);
      return false;
    }

    this.yAxis = parentMeasure.dimPath.value;

    this.urlService.putFilterInUrl('classification', this.cube);

    this.populateFilterSelects();
    this.chartService.rerender();
    return true;
  };

  /**
   * Fetches property data (both key dimensions and measure dimensions) from a remote endpoint.
   * Populates the `properties` object with the fetched data.
   * @async
   * @returns {Promise<void>} A promise that resolves when properties have been fetched and populated.
   */
  fetchProperties = async () => {
    const response = await queryLindas(
        queries.getPropertiesForCubes(this.lang),
    );
    const props = response.results.bindings;

    const sortByDimPath = (a, b) =>
        a.dimPath.value.localeCompare(b.dimPath.value);

    this.properties.keys = props.filter(
        (prop) => prop.dimType.value === 'https://cube.link/KeyDimension').
        sort(sortByDimPath).
        map((prop) => ({...prop, id: prop.cube.value, options: []}));

    this.properties.measures = props.filter(
        (prop) => prop.dimType.value === 'https://cube.link/MeasureDimension',
    ).sort(sortByDimPath).map((prop) => ({...prop, id: prop.dimPath.value}));

    // Set initial measure and cube properties
    const measures = this.properties.measures.filter((m) => m.dimPath.value === DEFAULT_TOPIC);
    this.measure = evaluateCube(measures);
    this.cube = this.measure.cube.value;
    this.yAxis = this.measure.dimPath.value;
  };

  /**
   * Fetches the available options for each key dimension property and assigns them to the corresponding property.
   * @async
   * @returns {Promise<void>} A promise that resolves when property options have been fetched and assigned.
   */
  fetchPropertiesOptions = async () => {
    const response = await queryLindas(queries.getPropertiesOptions(this.lang));
    let options = response.results.bindings;

    // Sort options with "Total" at the top
    options.sort((a, b) =>
        a.valueName.value === 'Total'
            ? -1
            : b.valueName.value === 'Total'
                ? 1
                : ('' + a).localeCompare(b),
    );

    // Add options to the corresponding property keys
    options.forEach((option) => {
      this.properties.keys.filter(
          (prop) => prop.dimName.value === option.dimName.value).
          forEach((prop) => prop.options.push(option));
    });
  };

  /**
   * Gets all cube URLs associated with the current measure (based on dimName).
   * @returns {string[]} An array of cube URLs for the current measure.
   */
  getCubesForMeasure = () => {
    return this.properties.measures.filter(
        (m) => m.dimName.value === this.measure.dimName.value).
        map((m) => m.cube.value);
  };

  /**
   * Gets all key dimensions (properties) for a given cube.
   * If no cube is provided, it uses the currently selected cube.
   * The classification dimension (classificationUnit) is always placed at the start.
   * @param {string} [cube] - The cube value to get the key dimensions for. Defaults to the current cube if not provided.
   * @returns {Object[]} An array of key dimension objects for the specified or current cube.
   */
  getKeyDimensionsForCube = (cube = undefined) => {
    // Always put the classification at the start
    const result = this.properties.keys.filter(
        (k) => k.cube.value === (cube ?? this.cube)).sort((a, b) =>
        a.dimPath.value ===
        'https://environment.ld.admin.ch/foen/nfi/classificationUnit'
            ? -1
            : b.dimPath.value ===
            'https://environment.ld.admin.ch/foen/nfi/classificationUnit'
                ? 1
                : a.dimPath.value.localeCompare(b.dimPath.value),
    );

    // TODO: This is called various times, where could I move it?
    this.classificationDimensions = [];
    const classificationDimensions = result.find((element) => element.cube.value === this.cube);
    if (classificationDimensions) {
      classificationDimensions.options.forEach((option) => {
        if (this.classificationDimensions.includes(option.value.value) === false) {
          this.classificationDimensions.push(option.value.value);
        }
      })
    }

    return result;
  };

  /**
   * Gets all measure dimensions (properties) for the currently selected cube.
   * @returns {Object[]} An array of measure dimension objects.
   */
  getMeasureDimensions = () => {
    return this.properties.measures.filter((k) => k.cube.value === this.cube);
  };

  /**
   * Populates the measure select dropdown with unique measures (by `dimName.value`) and sets up an update callback.
   * Uses the UI access service to manipulate the DOM.
   * @returns {void}
   */
  populateMeasureSelect = () => {
    // Filter duplicates based on dimName.value
    const uniqueMeasures = [
      ...new Map(
          this.properties.measures.map((measure) => [
            measure.dimName.value,
            measure,
          ]),
      ).values(),
    ];

    this.uiAccessService.populateSelect(
        'topic-field',
        'measures',
        uniqueMeasures,
        (measure) => measure.id,
        (measure) => measure.dimName.value,
        true,
        (event) => { onUpdateMeasure(this.lfiViewer, event); },
        this.i18nService.config.topic[this.lang],
    );
  };

  /**
   * Populates the classification select dropdown with any key dimensions related to `classificationUnit`
   * and calls `populateFilterSelects` to set up the rest of the UI.
   * @returns {void}
   */
  populateClassificationSelect = () => {
    // Get key dimensions related to classificationUnit
    let classificationKeys = this.getCubesForMeasure().flatMap((cube) =>
        this.getKeyDimensionsForCube(cube).filter(
            (key) =>
                key.dimPath.value ===
                'https://environment.ld.admin.ch/foen/nfi/classificationUnit',
        ),
    );

    classificationKeys = classificationKeys.filter((element) => {
      return CLASSIFICATIONS_TO_IGNORE.includes(element.cube.value) === false;
    })

    this.uiAccessService.populateSelect(
        'classification-field',
        'classification',
        classificationKeys,
        (key) => key.id,
        (key) => key.dimName.value,
        true,
        (event) => { onUpdateClassification(this.lfiViewer, event); },
        this.i18nService.config.classification[this.lang],
        this.cube,
    );

    // Call setupFilterSelects to finalize UI setup
    this.populateFilterSelects();
  };

  /**
   * Populates the filter selects (other than classification) based on the current cube.
   * Classification (if present) will go into a separate container, others go into the main filters container.
   * @returns {void}
   */
  populateFilterSelects = () => {
    const filterDiv = document.getElementById('filters');
    filterDiv.innerHTML = '';

    const classificationDiv = document.getElementById('classification-filter');
    classificationDiv.innerHTML = '';

    const keyDimensionsForCube = this.getKeyDimensionsForCube();

    keyDimensionsForCube.forEach((property) => {
      const filter = cssifyString(property.dimPath.value);
      const filterId = `${filter}-filter`;
      const containerId = `${filterId}-field`;

      const div = document.createElement('div');
      div.className = 'field';
      div.id = containerId;

      if (filter === classificationUnit) {
        classificationDiv.append(div);
      } else {
        filterDiv.append(div);
      }

      this.uiAccessService.populateSelect(
          containerId,
          filterId,
          property.options,
          (option) => option.value.value,
          (option) => option.valueName.value,
          false,
          (event) => { onUpdateFilter(this.lfiViewer, event); },
          property.dimName.value,
      );
    });
  };
}
