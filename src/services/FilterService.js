import {DEBUG_LOGS} from '../config.js';
import {cssifyString} from '../util/shared.js';

/**
 * A service class responsible for managing the various filters used in the application.
 * It coordinates with other services to update filter states, reflect them in the URL,
 * and re-render the visualization accordingly.
 */
export class FilterService {

  /**
   * An object storing the current filter selections, mapped by filter key.
   * @type {Object<string, Object>}
   */
  selectedFilters = {}; // Filteroptionen zwischen Themen und Region/Regionsart

  /**
   * Creates a new instance of FilterService.
   * @param {Object} uiAccessService - Service responsible for UI interactions (setting UI elements).
   * @param {Object} propertyService - Service handling property (dimension/measure) information.
   * @param {Object} regionService - Service handling region data and selection.
   * @param {Object} urlService - Service for managing URL parameters related to filters.
   * @param {Object} chartService - Service for re-rendering the chart (note: assigned to `this.urlService`).
   * @param {Object} visualizationService - Service for managing the visualization mode/grouping, etc.
   */
  constructor(
      uiAccessService,
      propertyService,
      regionService,
      urlService,
      chartService,
      visualizationService,
  ) {
    this.uiAccessService = uiAccessService;
    this.propertyService = propertyService;
    this.regionService = regionService;
    this.filterUrlService = urlService;
    this.urlService = chartService;
    this.visualizationService = visualizationService;
  }

  /**
   * Sets a filter to a specified value, updating the URL and triggering a chart re-render if necessary.
   * Certain filters ('lang' or 'mode') are ignored in this method.
   * @param {string} filter - The filter key (e.g., 'region', 'measure').
   * @param {string|boolean} value - The value to set for this filter.
   * @returns {boolean} Returns `true` if the filter was successfully set, otherwise `false`.
   */
  setSelectedFilter = (filter, value) => {
    if (filter === 'lang' || filter === 'mode') {
      return false;
    }

    const availableFilters = this.propertyService.getKeyDimensionsForCube().map((property) => cssifyString(property.dimPath.value));

    if (!availableFilters.includes(filter)) {
      this.filterUrlService.removeFilterInUrl(filter);
      delete this.selectedFilters[filter];
      return false;
    }

    const filterValue = this.propertyService.getKeyDimensionsForCube().find((prop) => cssifyString(prop.dimPath.value) === filter).options.find((option) => option.value.value == value);
    if (!filterValue) {
      this.filterUrlService.removeFilterInUrl(filter);
      return false;
    }

    this.selectedFilters[filter] = filterValue;

    this.filterUrlService.putFilterInUrl(filter, value);
    this.urlService.rerender();
    return true;
  };

  /**
   * Resets all selected filters to their default values by removing them from the URL
   * and re-initializing `selectedFilters` with the first option for each key dimension.
   * Finally, updates the URL with default filters.
   * @returns {void}
   */
  resetSelectedFilters = () => {
    Object.keys(this.selectedFilters).forEach(
        this.filterUrlService.removeFilterInUrl,
    );
    this.selectedFilters = {};
    this.propertyService.getKeyDimensionsForCube().forEach((key) => {
      this.selectedFilters[cssifyString(key.dimPath.value)] = key.options[0];
    });
    this.fillDefaultFiltersInUrl();
  };

  /**
   * Ensures that all possible filters have some default value set in the URL.
   * If a filter is not currently set, it assigns either a hardcoded default
   * or the first option of the corresponding key dimension.
   * @returns {void}
   */
  fillDefaultFiltersInUrl = () => {
    const possibleFilters = this.getPossibleFiltersFromUrl();
    const setFilters = this.filterUrlService.getSortedFiltersFromUrl();
    const unsetFilters = possibleFilters.filter(
        (f) => !setFilters.map((e) => e[0]).includes(f),
    );
    unsetFilters.forEach((filter) => {
      if (DEBUG_LOGS) {
        console.log('setting default for filter: ', filter);
      }
      switch (filter) {
        case 'mode':
          this.filterUrlService.putFilterInUrl(filter, 'chart');
          break;
        case 'grouped-classification':
          this.filterUrlService.putFilterInUrl(filter, false);
          break;
        case 'grouped-region':
          this.filterUrlService.putFilterInUrl(filter, false);
          break;
        case 'regionType':
          this.filterUrlService.putFilterInUrl(
              filter,
              this.regionService.selectedRegionType,
          );
          break;
        case 'region':
          this.filterUrlService.putFilterInUrl(
              filter,
              this.regionService.selectedRegion.value.value,
          );
          break;
        case 'measure':
          this.filterUrlService.putFilterInUrl(
              filter,
              this.propertyService.yAxis,
          );
          break;
        case 'classification':
          this.filterUrlService.putFilterInUrl(
              filter,
              this.propertyService.cube,
          );
          break;
        default:
          const defaultValue = this.propertyService.getKeyDimensionsForCube().find((property) => cssifyString(property.dimPath.value) ===
              filter)?.options[0].value.value;
          this.filterUrlService.putFilterInUrl(filter, defaultValue);
          break;
      }
    });
  };

  /**
   * Retrieves all filters currently in the URL, sorted by a predefined order:
   * ['mode', 'grouped-region', 'regionType', 'region', 'measure', 'classification'].
   * Any filters not in the predefined list are placed at the end of the array.
   * @returns {Array<[string, string]>} An array of key-value pairs representing the sorted filters.
   */
  getSortedFiltersFromUrl = () => {
    const sortOrder = [
      'mode',
      'grouped-region',
      'regionType',
      'region',
      'measure',
      'classification',
    ];
    return Array.from(this.filterUrlService.urlParams).sort(
        ([keyA], [keyB]) => {
          const priorityA = sortOrder.indexOf(keyA);
          const priorityB = sortOrder.indexOf(keyB);

          // Items not in sortOrder should be placed at the end
          const adjustedPriorityA = priorityA > -1 ? priorityA: sortOrder.length;
          const adjustedPriorityB = priorityB > -1 ? priorityB: sortOrder.length;

          return adjustedPriorityA - adjustedPriorityB;
        },
    );
  };

  /**
   * Returns a list of all possible filters that can appear in the URL.
   * This list is composed of a fixed set of filters plus any dynamic ones
   * derived from the key dimensions of the current cube.
   * @returns {string[]} An array of filter keys.
   */
  getPossibleFiltersFromUrl = () => {
    const fixedFilters = [
      'mode',
      'grouped-classification',
      'grouped-region',
      'regionType',
      'region',
      'measure',
      'classification',
    ];

    const dynamicFilters = this.propertyService.getKeyDimensionsForCube().map((property) => cssifyString(property.dimPath.value));

    return [...fixedFilters, ...dynamicFilters];
  };

  /**
   * Parses a string as a boolean value ('true' or 'false').
   * @param {string} value - The string value to parse.
   * @returns {boolean|undefined} `true` if the string is 'true',
   * `false` if the string is 'false', otherwise `undefined`.
   */
  parseBoolean = (value) => {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return undefined;
  };

  /**
   * Applies filters from the current URL. If a filter is not set, defaults are filled.
   * Then each filter is processed in sorted order, calling appropriate service methods
   * to apply the filter logic (mode, grouped-region, region, measure, classification, etc.).
   * @returns {void}
   */
  applyFiltersFromUrl = () => {
    this.fillDefaultFiltersInUrl();
    this.getSortedFiltersFromUrl().map(([key, value]) => {
      if (DEBUG_LOGS) {
        console.log('apply filter: ', key, value);
      }
      switch (key) {
        case 'mode':
          this.visualizationService.setMode(value);
          break;
        case 'grouped-classification':
          this.visualizationService.setGroupedClassification(this.parseBoolean(value));
          break;
        case 'grouped-region':
          this.visualizationService.setGroupedRegion(this.parseBoolean(value));
          break;
        case 'regionType':
          if (this.regionService.setRegionType(value)) {
            this.uiAccessService.setRegionType(value);
          }
          break;
        case 'region':
          if (this.regionService.setRegion(value)) {
            this.uiAccessService.setRegion(value);
          }
          break;
        case 'measure':
          if (this.propertyService.setMeasure(value)) {
            this.uiAccessService.setMeasure(value);
          }
          this.resetSelectedFilters();
          break;
        case 'classification':
          if (this.propertyService.setClassification(value)) {
            this.uiAccessService.setClassification(value);
          }
          this.resetSelectedFilters();
          break;
        default:
          if (this.setSelectedFilter(key, value)) {
            this.uiAccessService.setOtherFilter(key, value);
          }
          break;
      }
    });

    this.urlService.rerender();
  };
}
