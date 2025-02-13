/**
 * Shows and hides page elements like loader and content, and displays error messages.
 */

/**
 * Displays the loader element and hides the main content element.
 * @function showLoader
 * @returns {void}
 */
export const showLoader = () => {
  const loader = document.getElementById('loader');
  const content = document.getElementById('content');
  loader.classList.remove('hidden');
  content.classList.add('hidden');
};

/**
 * Hides the loader element and displays the main content element.
 * @function hideLoader
 * @returns {void}
 */
export const hideLoader = () => {
  const loader = document.getElementById('loader');
  const content = document.getElementById('content');
  loader.classList.add('hidden');
  content.classList.remove('hidden');
};

/**
 * Displays an error message in the loader element using the provided language setting.
 * @function showError
 * @param {Object} i18nService - A service containing internationalization (i18n) configurations.
 * @param {string} lang - The current language code (e.g., 'en', 'de', 'fr').
 * @returns {void}
 */
export const showError = (i18nService, lang) => {
  const loader = document.getElementById('loader');
  loader.innerHTML = i18nService.config.error[lang];
};
