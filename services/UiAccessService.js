import {cssifyString} from '../util/shared.js';
import {TOPICS_TO_IGNORE} from '../config.js';

/**
 * A service class that provides methods to manage and update UI elements such as
 * dropdowns, checkboxes, and layout classes. This includes setting dropdown values,
 * populating selects, handling nested select structures, and toggling visibility.
 */
export class UiAccessService {
  /**
   * Sets the value of a dropdown (select element) by ID.
   * @param {string} id - The ID of the dropdown element in the DOM.
   * @param {string|number} value - The value to be set for the dropdown.
   * @returns {void}
   */
  setValueForDropdown = (id, value) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    element.value = value;
  };

  /**
   * Toggles UI elements based on the current mode (e.g., "chart" or "map").
   * Updates active states of buttons and hides/shows relevant fields.
   * @param {string} value - The mode value ("chart" or "map").
   * @returns {void}
   */
  setMode = (value) => {
    document.getElementById('chart-button').classList.toggle('active', value === 'chart');
    document.getElementById('map-button').classList.toggle('active', value === 'map');
    document.getElementById('grouped-region-field').classList.toggle('hidden', value === 'map');
  };

  setGroupedClassification = (checked) => {
    const checkbox = document.getElementById('grouped-classification');
    checkbox.checked = checked;

    document.getElementById('classification-filter').classList.toggle('hidden', checked);
  };

  /**
   * Sets the "grouped" checkbox state and toggles visibility of the region and region-type fields.
   * @param {boolean} displayRegionTypes - If true, displays the region-type field
   *  and hides the region field; otherwise, the reverse.
   * @returns {void}
   */
  setGroupedRegion = (displayRegionTypes) => {
    const checkbox = document.getElementById('grouped-region');
    checkbox.checked = displayRegionTypes;

    document.getElementById('region-field').classList.toggle('hidden', displayRegionTypes);
    document.getElementById('region-type-field').classList.toggle('hidden', !displayRegionTypes);
  };

  /**
   * Sets the value of the region-type dropdown.
   * @param {string} value - The value to set for the region-type dropdown.
   * @returns {void}
   */
  setRegionType = (value) => {
    this.setValueForDropdown('region-type', value);
  };

  /**
   * Sets the value of the region dropdown.
   * @param {string} value - The value to set for the region dropdown.
   * @returns {void}
   */
  setRegion = (value) => {
    this.setValueForDropdown('region', value);
  };

  /**
   * Sets the value of the measures dropdown.
   * @param {string} value - The measure to set in the measures dropdown.
   * @returns {void}
   */
  setMeasure = (value) => {
    this.setValueForDropdown('measures', value);
  };

  /**
   * Sets the value of the classification dropdown.
   * @param {string} value - The classification to set in the classification dropdown.
   * @returns {void}
   */
  setClassification = (value) => {
    this.setValueForDropdown('classification', value);
  };

  /**
   * Sets the value of a generic filter dropdown based on a filter key.
   * @param {string} key - The key identifying the filter (e.g., dimension path).
   * @param {string|number} value - The value to set in the dropdown.
   * @returns {void}
   */
  setOtherFilter = (key, value) => {
    const id = `${cssifyString(key)}-filter`;
    this.setValueForDropdown(id, value);
  };

  /**
   * Populates a single-level select (dropdown) element within a given container field.
   * Optionally sorts elements if populating the "topic-field".
   * @param {string} fieldId - The ID of the container element for this field.
   * @param {string} selectId - The ID to assign to the created <select> element.
   * @param {Array<any>} elements - The array of elements to populate in the dropdown.
   * @param {Function} getValue - A function that returns the value attribute for an element.
   * @param {Function} getDisplayText - A function that returns the display text for an element.
   * @param {boolean} isSearch - If `true`, adds 'search' CSS class to the dropdown.
   * @param {Function} onChange - The callback function to invoke on the dropdown's 'change' event.
   * @param {string} labelText - The text to display in the associated <label>.
   * @param {string|null} selectedClassification - The id of the cube (classification)
   * @returns {void}
   */
  populateSelect = (
      fieldId,
      selectId,
      elements,
      getValue,
      getDisplayText,
      isSearch,
      onChange,
      labelText,
      selectedClassification = null
  ) => {
    let sanitizedElements = elements

    if (fieldId === 'topic-field') {
      // Filter the elements that are not in the topics ignore list
      sanitizedElements = sanitizedElements.filter((element) => {
        return TOPICS_TO_IGNORE.includes(element.dimPath.value) === false;
      });
    }

    if (fieldId === 'topic-field' || fieldId === 'classification-field') {
      sanitizedElements = sanitizedElements.sort((a, b) => a.dimName.value > b.dimName.value);
    }

    if (fieldId === 'https://environment.ld.admin.ch/foen/nfi/classificationUnit-filter-field') {
      sanitizedElements = sanitizeClassificationFilterField(sanitizedElements)
    }

    const container = document.getElementById(fieldId);
    container.className = 'field';
    container.innerHTML = '';

    const select = document.createElement('select');
    select.id = selectId;
    select.className = 'ui dropdown' + (isSearch ? ' search': '');
    select.addEventListener('change', onChange);
    if (sanitizedElements.length <= 1) {
      select.classList.add('disabled');
    }

    const label = document.createElement('label');
    label.htmlFor = selectId;
    label.innerHTML = labelText;

    container.append(label, select);

    sanitizedElements.forEach((element) => {
      select.append(
          this.createOptionElement(getValue(element), getDisplayText(element), selectedClassification),
      );
    });

    this.initDropdowns();
  };

  /**
   * Populates a nested select (dropdown) element, grouping items under <optgroup>.
   * @param {string} fieldId - The ID of the container element for this field.
   * @param {string} selectId - The ID to assign to the created <select> element.
   * @param {Array<any>} entries - An array of entries where each entry is typically [key, groupArray].
   * @param {Function} getGroup - A function that returns the label for the <optgroup>.
   * @param {Function} getValue - A function that returns the value attribute for an element.
   * @param {Function} getDisplayText - A function that returns the display text for an element.
   * @param {boolean} isSearch - If `true`, adds 'search' CSS class to the dropdown.
   * @param {Function} onChange - The callback function to invoke on the dropdown's 'change' event.
   * @param {string} labelText - The text to display in the associated <label>.
   * @returns {void}
   */
  populateNestedSelect = (
      fieldId,
      selectId,
      entries,
      getGroup,
      getValue,
      getDisplayText,
      isSearch,
      onChange,
      labelText,
  ) => {
    const container = document.getElementById(fieldId);
    container.className = 'field';
    container.innerHTML = '';

    const select = document.createElement('select');
    select.id = selectId;
    select.className = 'ui dropdown' + (isSearch ? ' search': '');
    select.addEventListener('change', onChange);
    if (entries.length <= 1) {
      select.classList.add('disabled');
    }

    const label = document.createElement('label');
    label.htmlFor = selectId;
    label.innerHTML = labelText;

    container.append(label, select);

    entries.forEach((entry) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = getGroup(entry);
      select.append(optgroup);

      entry[1].forEach((value) => {
        optgroup.append(
            this.createOptionElement(getValue(value), getDisplayText(value)),
        );
      });
    });

    this.initDropdowns();
  };

  /**
   * Creates an <option> element for a select dropdown.
   * @param {string|number} value - The value for the option element.
   * @param {string} innerHtml - The text or HTML content to display inside the option.
   * @param {string} selectedClassification
   * @returns {HTMLOptionElement} The newly created option element.
   */
  createOptionElement = (value, innerHtml, selectedClassification) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = innerHtml;
    if (value === selectedClassification) {
      opt.selected = true;
    }
    return opt;
  };

  /**
   * Initializes all checkboxes (with Semantic UI styling) on the page.
   * @returns {void}
   */
  initCheckboxes = () => {
    $('.ui.checkbox').checkbox();
  };

  /**
   * Initializes all dropdowns (with Semantic UI styling) on the page.
   * @returns {void}
   */
  initDropdowns = () => {
    $('.ui.dropdown').dropdown();
  };
}

/**
 * Sanitizes the classification filter field by filtering and sorting the input data.
 * "Total" always at the start of the array
 * "-1" and "-99" removed from the array
 * The rest is sorted ascending by ID (as number)
 *
 * @param {Array} data - The input data array containing objects to be filtered and sorted.
 * @return {Array} The sanitized array with specific items removed and the remaining items sorted.
 */
function sanitizeClassificationFilterField(data) {
  const result = [];

  const firstInArray = 'Total';
  const toRemove = [
    '99', // Nicht bestimmbar
    '-1' // Keine Angabe
  ];

  const total = data.find(item => getIdOfDimension(item.value.value) === firstInArray);
  result.push(total);

  const filteredArray = data.filter((item) => {
    if (
        getIdOfDimension(item.value.value) !== firstInArray
        && toRemove.includes(getIdOfDimension(item.value.value)) === false
    ) {
      return true;
    }
  })

  const sortedArray = filteredArray.sort((a, b) => Number(getIdOfDimension(a.value.value)) > Number(getIdOfDimension(b.value.value)));
  result.push(...sortedArray);

  return result;
}

/**
 * Extracts and returns the ID of a dimension from a given IRI.
 *
 * @param {string} dimension - The dimension string in the format of segments separated by '/'.
 * @return {string} The ID of the dimension, which is the last segment of the given dimension string.
 */
function getIdOfDimension(dimension) {
  const array = dimension.split('/');
  return array[array.length - 1];
}