import { dropFiles } from "./drop-photo-for-exif-files.js";
import { shadowCss } from "./drop-photo-for-exif-dom.js";
import { getExifReaderScript } from "./drop-photo-for-exif-load.js";

class DropPhotoForExif extends HTMLElement {

    #isMobile; #helperText;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.#setProperties();

        this.#stopDefaultsForDragAndDropEvents();
        this.#extractExifData();
    }

    connectedCallback() {
        this.#addCss();
        this.#addIcon();
        this.#addHelperText();
    }

    #addCss = () => {
        const contentCss = document.createElement('style');
        contentCss.textContent = shadowCss;
        this.shadowRoot.appendChild(contentCss);
    }

    #addHelperText() {
        const divEl = document.createElement('div');
        divEl.className = 'item';
        this.shadowRoot.appendChild(divEl);

        const helpEl = document.createElement('span');
        helpEl.textContent = this.#helperText;
        divEl.appendChild(helpEl);
    }

    #addIcon = () => {
        const divEl = document.createElement('div');
        divEl.className = 'item';
        this.shadowRoot.appendChild(divEl);

        const svgEl = document.createElement('object');
        svgEl.setAttribute('type', 'image/svg+xml');

        const dirname = this.#getDirname();
        const svgFilename = this.#isMobile ? 'alt-plus-folder' : 'drop-photo'
        svgEl.setAttribute('data', `${dirname}${svgFilename}.svg`);

        divEl.appendChild(svgEl);
    }

    #extractExifData = () => this.#isMobile ? this.#extractExifDataOnClick() : this.#extractExifDataOnDrop()

    #extractExifDataOnClick = () => this.addEventListener('click', (_, process = this.#process) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = "multiple"
        input.onchange = _ => {
            const files = Array.from(input.files);
            process(files)
        }

        input.click();
    })

    #extractExifDataOnDrop = () => this.addEventListener('drop', (event) => {
        const { items } = event.dataTransfer;
        this.#process(items);
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

    #isMobileBrowser = userAgent => (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
        .test(userAgent.substr(0, 4)))

    #preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    }

    #process = (
        items,
        fireOnImage = this.#fireImageEvent,
        fireOnFile = this.#fireFileEvent,
        fireOnCompletion = this.#fireOnCompleted
    ) => dropFiles.process(items, fireOnImage, fireOnFile, fireOnCompletion)

    #setProperties() {
        this.#isMobile = this.#isMobileBrowser(navigator.userAgent || window.opera);
        this.#helperText = this.getAttribute('helperText') ||
            (this.#isMobile ? 'Choose files' : 'Drop files here');
    }

    #stopDefaultsForDragAndDropEvents = () => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.addEventListener(eventName, this.#preventDefaults);
        });
    }
}

let exifReaderjs = getExifReaderScript();
exifReaderjs.onload = function (ev) {
    customElements.define('drop-photo-for-exif', DropPhotoForExif);
    exifReaderjs = null;
}

document.head.append(exifReaderjs);
