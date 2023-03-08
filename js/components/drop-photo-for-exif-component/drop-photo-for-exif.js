import { dropFiles } from "./drop-photo-for-exif-files.js";
import { exifData } from "./drop-photo-for-exif-data.js";
import { svgCss } from "./drop-photo-for-exif-dom.js";
import { getDirname } from "./utils.js";
import { getExifReaderScript } from "./drop-photo-for-exif-load.js";

class DropPhotoForExif extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#extractExifDataOnDrop();
        this.#stopBehaviorOnDragOver();
    }

    connectedCallback() {
        this.#addCss();
        this.#addIcon();
    }

    #addCss = () => {
        const css = document.createElement('style');
        css.innerHTML = svgCss;
        this.shadowRoot.appendChild(css);
    }

    #addIcon = () => {
        const div = document.createElement('div');
        div.className = 'svg-container';
        this.shadowRoot.appendChild(div);

        const svg = document.createElement('object');
        svg.setAttribute('class', 'svg-object');
        svg.setAttribute('type', 'image/svg+xml');

        const dirname = this.#getDirname();
        svg.setAttribute('data', `${dirname}drop-photo.svg`);

        div.appendChild(svg);
    }

    #extractExifDataOnDrop = () => this.addEventListener('drop', (event) => {
        event.preventDefault();

        dropFiles.collectImages(event)
            .forEach((image) => {
                exifData.extractExif(image)
                    .then((exif) => {
                        this.#fireExifData({
                            name: image.name,
                            image: image,
                            location: exif.location,
                            exif: exif.details
                        });
                    });
            });
    });

    #fireExifData = imageData => {
        const evt = new CustomEvent('drop-photo-for-exif:data', {
            bubbles: true,
            composed: true,
            detail: imageData
        });
        this.shadowRoot.dispatchEvent(evt);
    }

    #getDirname = () => {
        const dirname = getDirname('drop-photo-for-exif.js');
        return dirname || './components/drop-photo-for-exif-component/';
    }

    #stopBehaviorOnDragOver = () => this.addEventListener('dragover', (event) => {
        event.preventDefault()
    });
}

let exifReaderjs = getExifReaderScript();
exifReaderjs.onload = function (ev) {
    customElements.define('drop-photo-for-exif', DropPhotoForExif);
    exifReaderjs = null;
}

document.head.append(exifReaderjs);
