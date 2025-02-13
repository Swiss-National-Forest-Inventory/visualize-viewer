/**
 * The base URL for chart/map visualization.
 * @type {string}
 */
export const VISUALIZE_URL = 'https://int.visualize.admin.ch';

/**
 * The main (cached) LINDAS SPARQL endpoint URL for data queries.
 * @type {string}
 */
export const LINDAS_ENDPOINT = 'https://lindas-cached.cluster.ldbar.ch/query';

/**
 * A specific cached endpoint for the 2024-1 NFI cube.
 * @type {string}
 */
export const LINDAS_CACHED_ENDPOINT = `${LINDAS_ENDPOINT}/https://environment.ld.admin.ch/foen/nfi/nfi_C-96/cube/2024-1`;

/**
 * A global debug flag. If `true`, filter changes and other debug logs will be printed.
 * @type {boolean}
 */
export const DEBUG_LOGS = false; // turn off to not log filter changes in console

/**
 * First part of the link to display a cube on visualize
 * @type {string}
 */
export const VISUALIZE_CUBE_LINK_START = 'https://visualize.admin.ch/create/new?cube=';

/**
 * The IRI of the topic that should get selected as default on startup:
 * 44 = Waldfläche
 * @type {string}
 */
export const DEFAULT_TOPIC = 'https://environment.ld.admin.ch/foen/nfi/Topic/44';

/**
 * After selecting a topic, the classification is selected from this list.
 * Classifications are listed by priority as not all classifications are available for all topics
 *
 * @type {string[]}
 */
export const DEFAULT_CLASSIFICATION_LIST = [
  'https://environment.ld.admin.ch/foen/nfi/nfi_C-94/cube/2024-1', // Eigentum (2 Klassen)
  'https://environment.ld.admin.ch/foen/nfi/nfi_C-96/cube/2024-1', // Nadelholz, Laubholz
  'https://environment.ld.admin.ch/foen/nfi/nfi_C-20/cube/2024-1', // Entwicklungsstufe
  'https://environment.ld.admin.ch/foen/nfi/nfi_C-2632/cube/2024-1', // NaiS-Vegetationshöhenstufen (10 Klassen)
];

/**
 * Topics that are fetched from Visualize, but should be ignored for simplicity of the app
 * Discussed with Barbara 2025-01-29
 *
 * @type {string[]}
 */
export const TOPICS_TO_IGNORE = [
  'https://environment.ld.admin.ch/foen/nfi/Topic/47',
  'https://environment.ld.admin.ch/foen/nfi/Topic/47r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/48',
  'https://environment.ld.admin.ch/foen/nfi/Topic/48r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/397',
  'https://environment.ld.admin.ch/foen/nfi/Topic/397r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/19',
  'https://environment.ld.admin.ch/foen/nfi/Topic/19r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/70',
  'https://environment.ld.admin.ch/foen/nfi/Topic/70r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/69',
  'https://environment.ld.admin.ch/foen/nfi/Topic/69r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/72',
  'https://environment.ld.admin.ch/foen/nfi/Topic/72r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/49',
  'https://environment.ld.admin.ch/foen/nfi/Topic/49r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/50',
  'https://environment.ld.admin.ch/foen/nfi/Topic/50r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/125',
  'https://environment.ld.admin.ch/foen/nfi/Topic/214',
  'https://environment.ld.admin.ch/foen/nfi/Topic/214r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/215',
  'https://environment.ld.admin.ch/foen/nfi/Topic/215r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/417',
  'https://environment.ld.admin.ch/foen/nfi/Topic/417r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/395',
  'https://environment.ld.admin.ch/foen/nfi/Topic/395r',
  'https://environment.ld.admin.ch/foen/nfi/Topic/210',
  'https://environment.ld.admin.ch/foen/nfi/Topic/210r',
];

/**
 * Classifications that should be ignored
 * @type {string[]}
 */
export const CLASSIFICATIONS_TO_IGNORE = [
  /**
   * Baumarten (56 Klassen)
   * Ignored because atm tree names are only available in latin
   */
  'https://environment.ld.admin.ch/foen/nfi/nfi_C-2207/cube/2024-1',
];