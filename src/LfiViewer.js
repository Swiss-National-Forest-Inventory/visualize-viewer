import {UiAccessService} from './services/UiAccessService.js';
import {ChartService} from './services/ChartService.js';
import {StepperService} from './services/StepperService.js';
import {UrlService} from './services/UrlService.js';
import {I18nService} from './services/I18nService.js';
import {PropertyService} from './services/PropertyService.js';
import {RegionService} from './services/RegionService.js';
import {VisualizationService} from './services/VisualizationService.js';
import {FilterService} from './services/FilterService.js';
import {chartState} from './util/ChartStateUtil.js';
import {LinkService} from './services/LinkService.js';

/**
 * A top-level class that orchestrates different services in the application,
 * handling the lifecycle of fetching data, initializing UI elements, and managing
 * user interactions via setters for measure, classification, region, etc.
 */
export class LfiViewer {
  /**
   * Creates a new instance of LfiViewer and initializes the service objects.
   * @param {string} lang - The current language code (e.g., 'en', 'de', 'fr').
   * @param {string} baseUrl - The base URL for constructing endpoints or references.
   * @param {HTMLElement} container - The container element where charts or UI components are rendered.
   * @param {string|null} container - The container element where charts or UI components are rendered.
   * @param env
   */
  constructor(lang, baseUrl, container, env) {

    /**
     * The current language code in use (e.g., 'en', 'de', 'fr').
     * @type {string}
     */
    this.lang = lang;

    /**
     * A service that provides methods for UI interactions (dropdowns, checkboxes, etc.).
     * @type {UiAccessService}
     */
    this.uiAccessService = new UiAccessService();

    /**
     * A service for creating and rendering charts.
     * @type {ChartService}
     */
    this.chartService = new ChartService(this.lang, baseUrl, container);

    /**
     * A service for managing step transitions in a stepper UI component.
     * @type {StepperService}
     */
    this.stepperService = new StepperService();

    /**
     * A service for reading and updating URL parameters.
     * @type {UrlService}
     */
    this.urlService = new UrlService();

    /**
     * A service for providing internationalization (i18n) capabilities.
     * @type {I18nService}
     */
    this.i18nService = new I18nService();

    /**
     * A service for managing properties (dimensions/measures) and their options.
     * @type {PropertyService}
     */
    this.propertyService = new PropertyService(
        this,
        this.lang,
        this.uiAccessService,
        this.urlService,
        this.chartService,
        this.i18nService,
    );

    /**
     * A service for handling region data, including fetching and selecting regions.
     * @type {RegionService}
     */
    this.regionService = new RegionService(
        this,
        this.lang,
        this.uiAccessService,
        this.urlService,
        this.chartService,
        this.i18nService,
    );

    /**
     * A service for managing the visualization mode (chart/map) and whether data is grouped.
     * @type {VisualizationService}
     */
    this.visualizationService = new VisualizationService(
        this.uiAccessService,
        this.urlService,
        this.chartService,
    );

    /**
     * A service for managing filters, updating URL parameters, and re-rendering the chart.
     * @type {FilterService}
     */
    this.filterService = new FilterService(
        this.uiAccessService,
        this.propertyService,
        this.regionService,
        this.urlService,
        this.chartService,
        this.visualizationService,
    );

    this.linkService = new LinkService();
  }

  /**
   * Initializes the LfiViewer by setting default language filters in the URL,
   * fetching necessary data, populating UI elements, applying filters, and finally
   * rendering the chart.
   * @async
   * @returns {Promise<void>} A promise that resolves once initialization is complete.
   */
  initialize = async () => {
    // Store the language in the URL as a filter
    this.urlService.putFilterInUrl('lang', this.lang);

    // Fetch initial properties (dimensions) and region data concurrently
    await Promise.all([
      this.propertyService.fetchProperties(),
      this.regionService.fetchRegions(),
    ]);

    // Fetch the additional property options
    await this.propertyService.fetchPropertiesOptions();

    // Populate UI select elements
    this.propertyService.populateMeasureSelect();
    this.propertyService.populateClassificationSelect();
    this.regionService.populateRegionSelect();

    // Reset filters to defaults, then apply any existing URL filters
    this.filterService.resetSelectedFilters();
    this.filterService.applyFiltersFromUrl();

    // Create the chart iframe with a config derived from the chartState
    this.chartService.createIframe(() =>
        chartState[this.visualizationService.mode](
            this,
            this.filterService.selectedFilters
        )
    );
    this.chartService.rerender();

    // Initialize dropdowns and checkboxes (Semantic UI)
    this.uiAccessService.initDropdowns();
    this.uiAccessService.initCheckboxes();
  };

  /**
   * Sets the current step in the stepper UI.
   * @param {number} value - The step number to switch to.
   * @returns {void}
   */
  setStep = (value) => {
    this.stepperService.changeStep(Number(value));
  };

  /**
   * Moves to the next step in the stepper UI, if available.
   * @returns {void}
   */
  setNextStep = () => {
    this.stepperService.onNextStep();
  };

  /**
   * Moves to the previous step in the stepper UI, if possible.
   * @returns {void}
   */
  setLastStep = () => {
    this.stepperService.onLastStep();
  };

  /**
   * Sets the current measure dimension using the PropertyService.
   * @param {string} value - The measure dimension to select.
   * @returns {void}
   */
  setMeasure = (value) => {
    this.propertyService.setMeasure(value);
  };

  /**
   * Sets the classification dimension using the PropertyService.
   * @param {string} value - The classification dimension to select.
   * @returns {void}
   */
  setClassification = (value) => {
    this.propertyService.setClassification(value);
    this.linkService.setCube(value);
  };

  /**
   * Sets the currently selected region using the RegionService.
   * @param {string} value - The region to select.
   * @returns {void}
   */
  setRegion = (value) => {
    this.regionService.setRegion(value);
  };

  /**
   * Sets the currently selected region type using the RegionService.
   * @param {string} value - The region type to select.
   * @returns {void}
   */
  setRegionType = (value) => {
    this.regionService.setRegionType(value);
  };

  /**
   * Sets the visualization mode (e.g., 'chart' or 'map') using the VisualizationService.
   * @param {string} value - The desired visualization mode.
   * @returns {void}
   */
  setMode = (value) => {
    this.visualizationService.setMode(value);
  };

  /**
   * Sets the grouped classification in the visualization service.
   *
   * @param {boolean} value - The value to set as the grouped classification.
   * @returns {void}
   */
  setGroupedClassification = (value) => {
    this.visualizationService.setGroupedClassification(value);
  };

  /**
   * Toggles whether data should be grouped (segmentation) by region type using the VisualizationService.
   * @param {boolean} value - If true, groups data by region; otherwise, does not group.
   * @returns {void}
   */
  setGroupedRegion = (value) => {
    this.visualizationService.setGroupedRegion(value);
  };

  /**
   * Sets a filter (key-value pair) using the FilterService.
   * @param {string} key - The filter key (usually a dimension path).
   * @param {string|number|boolean} value - The filter value.
   * @returns {void}
   */
  setSelectedFilter = (key, value) => {
    this.filterService.setSelectedFilter(key, value);
  };

  /**
   * Logs the current chart configuration to the console for debugging purposes.
   * Call from debug console with `lfiViewer.printChartState()`.
   * @returns {void}
   */
  printChartState = () => {
    console.log(
        chartState[this.visualizationService.mode](
            this,
            this.filterService.selectedFilters,
        ),
    );
  };
}
