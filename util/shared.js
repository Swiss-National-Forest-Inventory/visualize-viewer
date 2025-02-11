import {DEFAULT_CLASSIFICATION_LIST} from '../config.js';

/**
 * Retrieves URL parameters from the window location hash.
 * @returns {URLSearchParams} The URLSearchParams object representing the current hash parameters.
 */
export function getUrlParams() {
  return new URLSearchParams(window.location.hash?.substring(1));
}

/**
 * Event handler for the Thema (measure) dropdown change.
 * @param {LfiViewer} lfiViewer
 * @param {Event} event - The change event from the measure dropdown.
 * @returns {void}
 */
export function onUpdateMeasure(lfiViewer, event) {
  lfiViewer.setMeasure(event.target.value);
}

/**
 * Event handler for filter (Bezugsfläche) dropdown changes.
 * @param {LfiViewer} lfiViewer
 * @param {Event} event - The change event from the filter dropdown.
 * @returns {void}
 */
export function onUpdateFilter(lfiViewer, event) {
  const filter = event.target.id.replace('-filter', '');
  const value = event.target.value;
  lfiViewer.setSelectedFilter(filter, value);
}

/**
 * Event handler for the Klassifikation dropdown change.
 * @param {LfiViewer} lfiViewer
 * @param {Event} event - The change event from the classification dropdown.
 * @returns {void}
 */
export function onUpdateClassification(lfiViewer, event) {
  lfiViewer.setClassification(event.target.value);
}

/**
 * Event handler for the region dropdown change.
 * @param {LfiViewer} lfiViewer
 * @param {Event} event - The change event from the region dropdown.
 * @returns {void}
 */
export function onUpdateRegion(lfiViewer, event) {
  lfiViewer.setRegion(event.target.value);
}

/**
 * Event handler for the region-type dropdown change.
 * @param {LfiViewer} lfiViewer
 * @param {Event} event - The change event from the region-type dropdown.
 * @returns {void}
 */
export function onUpdateRegionType(lfiViewer, event) {
  lfiViewer.setRegionType(event.target.value);
}

/**
 * Transforms a string to be usable as a CSS class or ID by removing unwanted characters.
 * @param {string} string - The input string to transform.
 * @returns {string} The transformed string, safe for use as a CSS class or ID.
 */
export function cssifyString(string) {
  return string.trim().replaceAll(/\s/g, '-').replaceAll(/[()]/g, '');
}

/**
 * Evaluates a list of measures and returns the first measure that matches a predefined classification value.
 * The classification is determined based on a prioritized list of default classifications.
 * If no matching classification is found, the method returns the first measure by default and logs a message.
 *
 * @param {Array<Measure>} measures - An array of measure objects. Each object must have a `cube` property with a `value`.
 * @return {Measure} The measure object that matches the highest-priority classification or the first measure if no match is found.
 */
export function evaluateCube(measures) {
  let measure = measures[0];

  if (DEFAULT_CLASSIFICATION_LIST && DEFAULT_CLASSIFICATION_LIST.length > 0) {
    const firstFoundClassification = measures.find((m) => m.cube.value === DEFAULT_CLASSIFICATION_LIST[0]);
    if (firstFoundClassification) {
      measure = firstFoundClassification;
    } else {
      const secondFoundClassification = measures.find((m) => m.cube.value === DEFAULT_CLASSIFICATION_LIST[1]);
      if (secondFoundClassification) {
        measure = secondFoundClassification;
      } else {
        const thirdFoundClassification = measures.find((m) => m.cube.value === DEFAULT_CLASSIFICATION_LIST[2]);
        if (thirdFoundClassification) {
          measure = thirdFoundClassification;
        } else {
          const fourthFoundClassification = measures.find((m) => m.cube.value === DEFAULT_CLASSIFICATION_LIST[3]);
          if (fourthFoundClassification) {
            measure = fourthFoundClassification;
          } else {
            console.log("%c" + 'Classification not found in measure', "color:black; background-color:orange;");
          }
        }
      }
    }
  }

  return measure;
}

/**
 * Get a predefined chart color in HEX
 * @param {Number} color 1 or 2
 * @return {string} color value HEX
 */
export function getColor(color) {
  const colors = {
    0: '0, 98, 104', // greenWsl, page-layout.css variable --chart-color-1
    1: '0, 98, 104', // greenWsl, page-layout.css variable --chart-color-1
    2: '152, 39, 41', // redish, page-layout.css variable --chart-color-2
    3: '128, 128, 128', // grey, page-layout.css variable --chart-color-3
    4: '153, 204, 204',
    5: '51, 102, 204',
    6: '153, 204, 153',
    7: '51, 153, 51',
    8: '255, 153, 153',
    9: '204, 51, 51',
    10: '255, 204, 102',
    11: '255, 102, 0',
    12: '204, 153, 204',
    13: '102, 51, 153',
    14: '0, 153, 102',
    15: '153, 102, 51',
    16: '204, 204, 204',
    17: '102, 102, 102',
    18: '51, 51, 51',
  };

  let colorSelected = colors[color];
  if (colorSelected === undefined) {
    colorSelected = colors[0];
    console.error("Not enough colors defined, please add more colors");
  }
  const colorRgb = colorSelected.split(', ');
  return rgbToHex(colorRgb[0], colorRgb[1], colorRgb[2]);
}

/**
 * Converts RGB color values to a hexadecimal color string.
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {string} A string representing the color in hexadecimal format (e.g., "#RRGGBB").
 */
function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | Number(r) << 16 | Number(g) << 8 | Number(b)).toString(16).slice(1);
}