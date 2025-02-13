import {VISUALIZE_CUBE_LINK_START} from '../config.js';

export class LinkService {

  #linkElementId = 'visualize-link';

  #linkElement;

  constructor() {
    this.#linkElement = document.getElementById(this.#linkElementId);
  }

  setCube(cube) {
    this.#linkElement.href = VISUALIZE_CUBE_LINK_START + cube;
  }
}
