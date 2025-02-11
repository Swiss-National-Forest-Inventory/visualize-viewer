import {getUrlParams} from '../util/shared.js'
import {DEBUG_LOGS} from '../config.js';

/**
 * A service class responsible for managing URL parameters (filters) for the application.
 * It provides methods to retrieve, sort, add, and remove query parameters in the URL.
 */
export class UrlService {
  /**
   * A URLSearchParams-like object containing the current URL parameters.
   * @type {URLSearchParams}
   */
  urlParams;

  /**
   * Constructs a new UrlService instance.
   * Initializes the `urlParams` by reading the current URL hash.
   */
  constructor() {
    this.urlParams = getUrlParams();
  }

  /**
   * Retrieves all filters from the URL parameters and sorts them by a predefined order:
   * ['mode', 'grouped-region', 'regionType', 'region', 'measure', 'classification'].
   * Any parameters not in the predefined list are appended at the end.
   * @returns {Array<[string, string]>} An array of key-value pairs in sorted order.
   */
  getSortedFiltersFromUrl = () => {
    const sortOrder = [
      'mode',
      'grouped-classification',
      'grouped-region',
      'regionType',
      'region',
      'measure',
      'classification',
    ];
    return Array.from(this.urlParams).sort(([keyA], [keyB]) => {
      const priorityA = sortOrder.indexOf(keyA);
      const priorityB = sortOrder.indexOf(keyB);

      // Items not in sortOrder should be placed at the end
      const adjustedPriorityA = priorityA > -1 ? priorityA : sortOrder.length;
      const adjustedPriorityB = priorityB > -1 ? priorityB : sortOrder.length;

      return adjustedPriorityA - adjustedPriorityB;
    });
  };

  /**
   * Removes a given filter from the URL parameters and updates the browser's address bar.
   * @param {string} key - The name of the filter (URL parameter) to remove.
   * @returns {void}
   */
  removeFilterInUrl = (key) => {
    this.urlParams.delete(key);
    // window.location.hash = decodeURIComponent(this.urlParams);
    const updatedUrl = `${window.location.origin}${window.location.pathname}#${decodeURIComponent(this.urlParams)}`;
    history.replaceState(null, '', updatedUrl);
  };

  /**
   * Adds or updates a filter in the URL parameters and updates the browser's address bar.
   * @param {string} key - The name of the filter (URL parameter) to add or update.
   * @param {string|number|boolean} value - The value to assign to the specified filter.
   * @returns {void}
   */
  putFilterInUrl = (key, value) => {
    if (DEBUG_LOGS) {
      console.log('set filter:', key, value);
    }
    this.urlParams.set(key, value);
    // window.location.hash = decodeURIComponent(this.urlParams);
    const updatedUrl = `${window.location.origin}${window.location.pathname}#${decodeURIComponent(this.urlParams)}`;
    history.replaceState(null, '', updatedUrl);
  };
}
