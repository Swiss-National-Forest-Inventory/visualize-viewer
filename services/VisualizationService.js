/**
 * A service class responsible for managing the visualization mode (chart or map)
 * and whether the data should be grouped by region types. It also updates the UI
 * and triggers re-rendering whenever these values change.
 */
export class VisualizationService {
  /**
   * The current visualization mode, either 'chart' or 'map'.
   * @type {string}
   */
  mode = 'chart';

  /**
   * Indicates whether the data should be grouped by region types.
   * @type {boolean|undefined}
   */
  groupedRegion;

  /**
   * Indicates whether the data should be grouped by classifications.
   * @type {boolean|undefined}
   */
  groupedClassification;

  /**
   * A computed property that returns `true` if region types should be displayed
   * (i.e., if grouping is enabled or if mode is 'map').
   * @type {boolean}
   * @readonly
   */
  get displayRegionTypes() {
    return this.groupedRegion || this.mode === 'map';
  }

  /**
   * A computed property that returns `true` if region types should be displayed
   * (i.e., if grouping is enabled or if mode is 'map').
   * @type {boolean}
   * @readonly
   */
  get displayClassificationTypes() {
    return this.groupedClassification || this.mode !== 'map';
  }

  /**
   * Constructs a new VisualizationService instance.
   * @param {Object} uiAccessService - The UI service for toggling UI elements.
   * @param {Object} urlService - The URL service for reading/updating URL parameters.
   * @param {Object} chartService - The chart service for re-rendering the visualization.
   */
  constructor(uiAccessService, urlService, chartService) {
    this.uiAccessService = uiAccessService;
    this.urlService = urlService;
    this.chartService = chartService;
  }

  /**
   * Sets the visualization mode to either 'chart' or 'map'.
   * If the specified mode is invalid, removes 'mode' from the URL.
   * Otherwise, updates the mode in the URL, sets the internal mode state,
   * updates the UI, and triggers a chart re-render.
   * @param {string} mode - The desired visualization mode ('chart' or 'map').
   * @returns {void}
   */
  setMode = (mode) => {
    if (!['chart', 'map'].includes(mode)) {
      this.urlService.removeFilterInUrl('mode');
      return;
    }

    this.urlService.putFilterInUrl('mode', mode);
    this.mode = mode;

    this.uiAccessService.setGroupedRegion(this.displayRegionTypes);
    this.uiAccessService.setMode(mode);

    this.chartService.rerender();
  };

  setGroupedClassification = (groupedClassification) => {
    if (groupedClassification !== true && groupedClassification !== false) {
      groupedClassification = false;
    }

    this.groupedClassification = groupedClassification;

    this.urlService.putFilterInUrl('grouped-classification', groupedClassification);
    this.uiAccessService.setGroupedClassification(groupedClassification);

    this.chartService.rerender();
  };

  /**
   * Sets the grouped state. If the provided value is not strictly boolean, defaults to false.
   * Updates the URL, toggles grouping in the UI, and triggers a re-render.
   * @param {boolean} groupedRegion - Whether to group data by region types.
   * @returns {void}
   */
  setGroupedRegion = (groupedRegion) => {
    if (groupedRegion !== true && groupedRegion !== false) {
      groupedRegion = false;
    }

    this.groupedRegion = groupedRegion;

    this.urlService.putFilterInUrl('grouped-region', groupedRegion);
    this.uiAccessService.setGroupedRegion(this.displayRegionTypes);

    this.chartService.rerender();
  };
}
