import {queries, queryLindas} from '../util/QueryUtil.js';
import {onUpdateRegion, onUpdateRegionType} from '../util/shared.js';

/**
 * A service for managing region-related data, including fetching and storing available regions,
 * as well as handling the currently selected region and region type.
 */
export class RegionService {

  lfiViewer;

  /**
   * The current language.
   * @type {string}
   */
  lang;

  /**
   * The currently selected region object.
   * @type {Object}
   */
  selectedRegion;

  /**
   * The currently selected region type.
   * (Regionsart (Bei Segmentierung))
   * @type {string}
   */
  selectedRegionType;

  /**
   * An object containing all regions, grouped by type.
   * @type {Object<string, Object[]>}
   */
  regions;

  /**
   * Constructs a new RegionService.
   * @param {LfiViewer} lfiViewer
   * @param {string} lang - The language code (e.g., 'en', 'de').
   * @param {Object} uiAccessService - A service responsible for UI interactions.
   * @param {Object} urlService - A service for managing URL parameters.
   * @param {Object} chartService - A service for re-rendering charts.
   * @param {Object} i18nService - A service for internationalization.
   */
  constructor(lfiViewer, lang, uiAccessService, urlService, chartService, i18nService) {
    this.lfiViewer = lfiViewer;
    this.lang = lang;
    this.uiAccessService = uiAccessService;
    this.urlService = urlService;
    this.chartService = chartService;
    this.i18nService = i18nService;
  }

  /**
   * Fetches a list of regions from a remote endpoint and groups them by region type.
   * Also sets default region and region type selections.
   * @async
   * @returns {Promise<void>} A promise that resolves once the regions are fetched and processed.
   */
  fetchRegions = async () => {
    const response = await queryLindas(queries.getRegionHierarchy(this.lang));
    const regions = response.results.bindings;

    // Group regions by type
    this.regions = Object.groupBy(regions, (region) => region.type.value);

    // Set name for each region type
    Object.values(this.regions).forEach((regionArray) => {
      regionArray.name = regionArray[0].typeName.value;
    });

    // Preselect Switzerland (Country) and Canton region type
    this.selectedRegion = this.regions['http://schema.org/Country'][0];
    this.selectedRegionType =
        'https://environment.ld.admin.ch/foen/nfi/Cantons';
  };

  /**
   * Updates the currently selected region.
   * If the region is invalid, it removes the 'region' filter from the URL.
   * @param {string} region - The value of the region to select.
   * @returns {boolean} Returns `true` if the region was successfully set, otherwise `false`.
   */
  setRegion = (region) => {
    // As regions are structured to show the hierarchy, we need to flatten them first to find the right region
    const newRegion = Object.values(this.regions).
        flat().
        find((reg) => reg.value.value === region);

    if (!newRegion) {
      this.urlService.removeFilterInUrl('region');
      return false;
    }

    this.selectedRegion = newRegion;
    this.urlService.putFilterInUrl('region', this.selectedRegion.value.value);
    this.chartService.rerender();
    return true;
  };

  /**
   * Updates the currently selected region type.
   * If the region type is invalid, it removes the 'regionType' filter from the URL.
   * @param {string} regionType - The value of the region type to select.
   * @returns {boolean} Returns `true` if the region type was successfully set, otherwise `false`.
   */
  setRegionType = (regionType) => {
    const regionTypeValid = Object.keys(this.regions).includes(regionType);
    if (!regionTypeValid) {
      this.urlService.removeFilterInUrl('regionType');
      return false;
    }

    this.selectedRegionType = regionType;
    this.urlService.putFilterInUrl('regionType', this.selectedRegionType);
    this.chartService.rerender();
    return true;
  };

  /**
   * Populates UI selects for regions and region types, leveraging the UI access service.
   * Uses a nested select for regions and a standard select for region types.
   * @returns {void}
   */
  populateRegionSelect = () => {
    const regionEntries = Object.entries(this.regions);

    this.uiAccessService.populateNestedSelect(
        'region-field',
        'region',
        regionEntries,
        ([_, regionArray]) => regionArray.name,
        (region) => region.value.value,
        (region) => region.valueName.value,
        true,
        (event) => { onUpdateRegion(this.lfiViewer, event); },
        this.i18nService.config.region[this.lang],
    );

    this.uiAccessService.populateSelect(
        'region-type-field',
        'region-type',
        regionEntries,
        ([regionKey]) => regionKey,
        ([_, regionArray]) => regionArray.name,
        false,
        (event) => { onUpdateRegionType(this.lfiViewer, event); },
        this.i18nService.config.regionType[this.lang],
    );
  };
}
