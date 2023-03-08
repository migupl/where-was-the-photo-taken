import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    collectImages(event) {
        const files = this.#collectFiles(event);
        const images = this.#filterImages(files);
        return images;
    }

    #collectFiles = event => {
        const { items } = event.dataTransfer;

        let files;
        if (items) {
            files = [...items]
                .filter(item => item.kind === 'file')
                .map(image => image.getAsFile())
        }
        else {
            files = [...event.dataTransfer.files];
        }

        return files;
    }

    #filterImages = files => files.filter(file => file.type.startsWith('image/'));
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }