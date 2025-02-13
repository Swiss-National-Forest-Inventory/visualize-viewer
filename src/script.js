import {showLoader, hideLoader, showError} from './util/LoaderUtil.js';
import {getUrlParams} from './util/shared.js';
import {VISUALIZE_URL} from './config.js';
import {LfiViewer} from './LfiViewer.js';
import {I18nService} from './services/I18nService.js';

/**
 * Global variables and function definitions used to initialize and manage the main
 * LFI Viewer application, including event registration, language handling, and
 * step navigation.
 */

/**
 * A global reference to the main LfiViewer instance. Set once initialization completes.
 * @type {LfiViewer|undefined}
 */
let lfiViewer;

/**
 * A global instance of the internationalization service.
 * @type {I18nService}
 */
const i18nService = new I18nService();

// Register DOM event handlers
registerEvents();

/**
 * Initializes the LfiViewer with a given language. Fetches data, sets up UI and
 * event listeners, and handles error scenarios.
 *
 * @async
 * @function initialize
 * @param {string} lang - The language code (e.g., 'en', 'de', 'fr').
 * @returns {Promise<void>}
 */
async function initialize(lang) {
  try {
    showLoader();

    const element = document.getElementById('main-content');

    if (element) {

      // Instantiate the main viewer object
      lfiViewer = new LfiViewer(
          lang,
          VISUALIZE_URL,
          element,
      );

      // Set and display the language
      i18nService.setLanguage(lang);
      i18nService.updateLanguageDisplay(lang);

      // Perform the LfiViewer initialization sequence
      await lfiViewer.initialize();

      hideLoader();
    }
    else {
      console.error('Initialization failed: Target element not found');
    }

  }
  catch (error) {
    console.error('Initialization failed: ', error);
    showError(i18nService, lang);
  }
}

/**
 * Event handler for DOMContentLoaded. Reads the language from the URL and initializes the app.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = getUrlParams();
  const language = i18nService.getLanguageFromUrl(urlParams);
  await initialize(language);
});

/**
 * Registers all necessary DOM event handlers for the application, including steps,
 * navigation, grouping, mode switching, and language changes.
 * @function registerEvents
 * @returns {void}
 */
function registerEvents() {
  const stepElements = document.querySelectorAll('.step');
  for (const stepElement of stepElements) {
    stepElement.addEventListener('click', onChangeStep);
  }

  const nextStepElement = document.getElementById('next-button');
  nextStepElement.addEventListener('click', onNextStep);

  const lastStepElement = document.getElementById('last-button');
  lastStepElement.addEventListener('click', onPreviousStep);

  const groupedClassificationElement = document.getElementById(
      'grouped-classification');
  groupedClassificationElement.addEventListener('change',
      onGroupedClassificationChanged);

  const groupedRegionElement = document.getElementById('grouped-region');
  groupedRegionElement.addEventListener('change', onGroupedRegionChanged);

  const chartButtonElements = document.querySelectorAll(
      '.visualization-buttons .button');
  for (const chartButtonElement of chartButtonElements) {
    chartButtonElement.addEventListener('click', onSwitchMode);
  }

  const changeLangElements = document.querySelectorAll(
      '.header .menu .lang.item');
  for (const changeLangElement of changeLangElements) {
    changeLangElement.addEventListener('click', onChangeLang);
  }

  const resetButton = document.getElementById('reset-button');
  resetButton.addEventListener('click', onResetClick)
}

/**
 * Event handler for step selection (click on step navigation elements).
 * @param {PointerEvent} event - The click event.
 * @returns {void}
 */
function onChangeStep(event) {
  lfiViewer.setStep(Number(event.target.dataset.step));
}

/**
 * Event handler for the "next step" button click.
 * @returns {void}
 */
function onNextStep() {
  lfiViewer.setNextStep();
}

/**
 * Event handler for the "previous step" button click.
 * @returns {void}
 */
function onPreviousStep() {
  lfiViewer.setLastStep();
}

/**
 * Handles the event triggered when the grouped classification option changes.
 *
 * @param {Event} event - The event object triggered by the change in grouped classification state.
 * @return {void} This method does not return a value.
 */
function onGroupedClassificationChanged(event) {
  setClassificationFilterHidden(event.target.checked);
  if (event.target.checked) { // if new view = classification segmentation
    lfiViewer.setGroupedRegion(false); // remove region segmentation
    lfiViewer.setMode('chart'); // Show chart when classification segmentation
  }
  lfiViewer.setGroupedClassification(event.target.checked);
}

/**
 * Event handler for the grouped (segmentation) toggler change.
 * @param {Event} event - The change event from the grouped checkbox.
 * @returns {void}
 */
function onGroupedRegionChanged(event) {
  lfiViewer.setGroupedClassification(false);
  lfiViewer.setGroupedRegion(event.target.checked);
}

/**
 * Event handler for chart/map mode switch buttons.
 * @param {PointerEvent} event - The click event.
 * @returns {void}
 */
function onSwitchMode(event) {
  if (event.target.dataset.mode === 'map') {
    lfiViewer.setGroupedClassification(false);
  }
  lfiViewer.setMode(event.target.dataset.mode);
}

/**
 * Event handler for changing the language in the navigation menu.
 * @async
 * @param {PointerEvent} event - The click event.
 * @returns {Promise<void>}
 */
async function onChangeLang(event) {
  if (event) {
    const lang = event.target.dataset.lang;
    if (i18nService.isValidLanguage(lang)) {
      await initialize(lang);
    }
  }
}

function onResetClick() {
  window.location = window.location.pathname;
}

function setClassificationFilterHidden(hidden) {
  const classificationFilter = document.getElementById('classification-filter');
  classificationFilter.classList.toggle('hidden', hidden);
}
