import {VISUALIZE_URL} from '../config.js';

export class ChartService {
  lang;
  baseUrl;
  container;
  iframe;

  /**
   * @param {string} lang
   * @param {string} baseUrl
   * @param {HTMLDivElement} container
   */
  constructor(lang, baseUrl, container) {
    this.lang = lang;
    this.baseUrl = baseUrl;
    this.container = container;
  }

  /**
   * Create the iframe with the passed data
   * @param data
   */
  createIframe(data) {
    const iframe = document.createElement('iframe');
    iframe.id = 'chart';
    iframe.src = `${this.baseUrl}/${this.lang}/preview?flag__debug=true`;
    iframe.onload = () => this.reloadIFrame(data);
    this.iframe = iframe;

    this.container.innerHTML = '';
    this.container.append(iframe);
  }

  /**
   * Reload the iframe with new data
   * @param data
   */
  reloadIFrame(data) {
    const iframeWindow = this.iframe?.contentWindow;
    if (iframeWindow) {
      iframeWindow.postMessage(data(), VISUALIZE_URL);
    }
  }

  rerender() {
    if (!this.iframe) {
      return;
    }
    this.iframe.src += ''; // Hack to reload iframe
  }
}
