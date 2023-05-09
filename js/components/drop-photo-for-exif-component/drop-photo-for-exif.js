import { dropFiles } from "./drop-photo-for-exif-files.js";
import { svgCss } from "./drop-photo-for-exif-dom.js";
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

        const { items } = event.dataTransfer;
        dropFiles.process(items, this.#fireImageEvent, this.#fireFileEvent, this.#fireOnCompleted);
    })

    #fireImageEvent = (image, exif) => {
        const evt = new CustomEvent('drop-photo-for-exif:image', {
            bubbles: true,
            composed: true,
            detail: {
                name: image.name,
                image: image,
                location: exif.location,
                exif: exif.details
            }
        });
        this.shadowRoot.dispatchEvent(evt);
    }

    #fireFileEvent = file => {
        const evt = new CustomEvent('drop-photo-for-exif:file', {
            bubbles: true,
            composed: true,
            detail: file
        });
        this.shadowRoot.dispatchEvent(evt);
    }

    #fireOnCompleted = () => {
        const evt = new CustomEvent('drop-photo-for-exif:completed-batch', {
            bubbles: true,
            composed: true,
        });
        this.shadowRoot.dispatchEvent(evt);
    }

    #getDirname = () => {
        const src = 'drop-photo-for-exif.js';
        const scripts = document.getElementsByTagName("script");

        for (let script of scripts) {
            if (script.src.endsWith(src)) return script.src.replace(src, '');
        }

        return './components/drop-photo-for-exif-component/';
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
