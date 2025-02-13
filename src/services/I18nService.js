/**
 * I18nService is responsible for handling internationalization and localization logic.
 */
export class I18nService {

  /**
   * An array containing the supported language codes for the application.
   *
   * @type {string[]}
   */
  supportedLanguages = ['de', 'fr', 'it', 'en'];

  /**
   * Configuration object containing multilingual translations for various terms used in the application.
   * Each term supports translations in German (de), French (fr), Italian (it), and English (en).
   * @type {Object}
   */
  config = {
    filter: {
      de: 'Schritte',
      fr: 'Étapes',
      it: 'Passi',
      en: 'Steps',
    },
    chart: {
      de: 'Diagramm',
      fr: 'Diagramme',
      it: 'Diagramma',
      en: 'Chart',
    },
    map: {
      de: 'Karte',
      fr: 'Carte',
      it: 'Mappa',
      en: 'Map',
    },
    topic: {
      de: 'Thema',
      fr: 'Sujet',
      it: 'Tema',
      en: 'Topic',
    },
    classification: {
      de: 'Klassifizierungsmerkmal',
      fr: 'Variable de classification',
      it: 'Variabile di classificazione',
      en: 'Classification variable',
    },
    region: {
      de: 'Region',
      fr: 'Région',
      it: 'Regione',
      en: 'Region',
    },
    canton: {
      de: 'Kanton',
      fr: 'Canton',
      it: 'Cantone',
      en: 'Canton',
    },
    switzerland: {
      de: 'Schweiz',
      fr: 'Suisse',
      it: 'Svizzera',
      en: 'Switzerland',
    },
    regionType: {
      de: 'Regionsart',
      fr: 'Type de région',
      it: 'Tipo di regione',
      en: 'Region Type',
    },
    segmentation: {
      de: 'Segmentierung',
      fr: 'Segmentation',
      it: 'Segmentazione',
      en: 'Segmentation',
    },
    geography: {
      de: 'Regionale Gliederung',
      fr: 'Découpage régional',
      it: 'Suddivisione regionale',
      en: 'Regional demarcation',
    },
    error: {
      de: 'Etwas ist schief gelaufen. Bitte versuche es später.',
      fr: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      it: 'Si è verificato un errore. Per favore riprova più tardi.',
      en: 'Something went wrong. Please try again later.',
    },
    next: {
      de: 'Weiter',
      fr: 'Suivant',
      it: 'Avanti',
      en: 'Next',
    },
    last: {
      de: 'Zurück',
      fr: 'Dernier',
      it: 'Ultimo',
      en: 'Previous',
    },
    additionalFilters: {
      de: 'Zusätzliche Filter',
      fr: 'Filtres supplémentaires',
      it: 'Filtri aggiuntivi',
      en: 'Additional filters',
    },
    visualizeLink: {
      de: 'Auf visualize.admin.ch öffnen',
      fr: 'Ouvrir sur visualize.admin.ch',
      it: 'Aprire su visualize.admin.ch',
      en: 'Open on visualize.admin.ch',
    },
    resetButton: {
      de: 'zurücksetzen',
      fr: 'réinitialiser',
      it: 'resettare',
      en: 'reset',
    },
    backlink: {
      de: 'Zurück',
      fr: 'page précédente',
      it: 'indietro',
      en: 'back'
    },
    translatedPathname: {
      de: '/de/ergebnisabfrage/visualize-viewer',
      fr: '/fr/recherche-de-resultats/visualize-viewer',
      it: '/it/ricerca-di-risultati/visualize-viewer',
      en: '/en/result-query-system/visualize-viewer',
    },
    backlinkHref: {
      de: '/de/ergebnisabfrage/visualize',
      fr: '/fr/recherche-de-resultats/visualize',
      it: '/it/ricerca-di-risultati/visualize',
      en: '/en/result-query-system/visualize',
    },
    backlinkTitle: {
      de: 'Zurück zur vorherigen Seite',
      fr: 'Retour à la page précédente',
      it: 'Indietro alla pagina precedente',
      en: 'Back to the previous page'
    }
  };

  /**
   * Retrieves the language from the provided URL parameters.
   *
   * @param {URLSearchParams} urlParams - The URLSearchParams object containing query parameters.
   * @returns {string} The resolved language, either from the 'lang' parameter or the fallback.
   */
  getLanguageFromUrl = (urlParams) => {
    let pageLanguageLFI;
    /**
     * Special configuration for NFI
     */
    if (this.env === 'nfi') {
      pageLanguageLFI = this.evaluateFromNFIUrl();
    }
    const fallbackLanguage = 'de';
    let language = pageLanguageLFI ?? urlParams.get('lang') ?? fallbackLanguage;
    return this.isValidLanguage(language) ? language : 'de';
  };

  /**
   * Get the lang string from the NFI website URL
   *
   * @function
   * @returns {string} The second segment from the URL's pathname.
   */
  evaluateFromNFIUrl = () => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[1];
  };

  /**
   * Updates the elements with the specified class name 'lang' to reflect the currently active language.
   *
   * @param {string} value - The value representing the language to set as active.
   */
  setLanguage = (value) => {
    document.querySelectorAll('.lang').forEach((item) => {
      item.classList.toggle(
          'active',
          value.toLocaleUpperCase() === item.innerHTML,
      );
    });
  };

  /**
   * Checks if the provided value is a valid language.
   *
   * @param {string} value - The language value to validate.
   * @returns {boolean} True if the value is a valid language, otherwise false.
   */
  isValidLanguage = (value) => {
    return this.supportedLanguages.includes(value);
  };

  /**
   * Updates the text content of various UI elements to display in the specified language.
   *
   * @param {string} environment - The env, f.e. NFI or BLW
   * @param {string} lang - The language to set for the UI text. This should match a key in the `config` object for localized text.
   * @returns {void}
   */
  updateLanguageDisplay = (environment, lang) => {
    document.getElementById('filter-label').innerHTML = this.config.filter[lang];
    document.getElementById('chart-button').innerHTML = `<i class="chart bar icon"></i>${this.config.chart[lang]}`;
    document.getElementById('map-button').innerHTML = `<i class="map icon"></i>${this.config.map[lang]}`;
    document.getElementById('segmentation-label-region').innerHTML = this.config.segmentation[lang];
    document.getElementById('last-button-label').innerHTML = this.config.last[lang];
    document.getElementById('next-button-label').innerHTML = this.config.next[lang];
    document.getElementById('topic-step').innerHTML = this.config.topic[lang];
    document.getElementById('classification-step').innerHTML = this.config.classification[lang];
    document.getElementById('additional-filters-step').innerHTML = this.config.additionalFilters[lang];
    document.getElementById('geography-step').innerHTML = this.config.geography[lang];
    document.getElementById('step-title-1').innerHTML = this.config.topic[lang];
    document.getElementById('step-title-2').innerHTML = this.config.classification[lang];
    document.getElementById('step-title-3').innerHTML = this.config.additionalFilters[lang];
    document.getElementById('step-title-4').innerHTML = this.config.geography[lang];
    document.getElementById('visualize-link').innerHTML = this.config.visualizeLink[lang];
    document.getElementById('reset-button').title = this.config.resetButton[lang];

    const backlink = document.getElementById('backlink');
    if (backlink) {
      backlink.innerHTML = this.config.backlink[lang];
      backlink.title = this.config.backlinkTitle[lang];
      backlink.href = window.location.origin + this.config.backlinkHref[lang];
    }

    /**
     * Special configuration for NFI
     */
    if (environment === 'nfi') {
      this.translateURL(lang);
      this.setLogoLink(lang);
    } else {
      if (backlink) {
        backlink.remove();
      }
    }
  };

  /**
   * On language change, the pathname in the URL should also be updated
   *
   * @param {string} lang
   */
  translateURL = (lang) => {
    const updatedUrl = `${window.location.origin}${this.config.translatedPathname[lang]}#${window.location.hash}`;
    history.replaceState(null, '', updatedUrl);
  }

  setLogoLink = (lang) => {
    const logolink = document.getElementById('logo-link');
    if (logolink) {
      logolink.href = '/' + lang;
    }
  }
}
