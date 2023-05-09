import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    #afterFileReady; #afterImageReady; #doOnCompletion;

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , onCompletion = () => console.log('Do something on complete')) => {

        this.#setAfterActions(afterImageReady, afterFileReady, onCompletion);
        this.#filesToProcess(items.length);
        this.#process(items);
    }

    #process = items => {
        for (let item of items) {
            if (!this.#supportsWebkitGetAsEntry) {
                this.#processFile(item.getAsFile());
            }

            const entry = item.webkitGetAsEntry();
            if (entry.isFile) {
                this.#processFile(item.getAsFile());
            }
            else if (entry.isDirectory) {
                this.#exploreDirectoryContent(entry)
            }
        }
    }

    #isAnImage = file => file.type.startsWith('image/')

    #exploreDirectoryContent = dirEntry => {
        dirEntry.createReader()
            .readEntries((entries) => {
                const files = entries.filter((entry) => entry.isFile);
                this.#filesToProcess(files.length - 1);

                files.forEach(entryFile =>
                    entryFile.file(this.#processFile)
                )
            });
    }

    #filesToProcess = n => this._remainToCompleteBatch = (this._remainToCompleteBatch || 0) + n

    #mimetype = filename => {
        const ext = filename.split('.').pop();

        if ('geojson' == ext) return 'application/geo+json';
        return exifData.getAllowedMimetype(ext);
    }

    #onCompletion = () => {
        --this._remainToCompleteBatch;
        if (!this._remainToCompleteBatch) this.#doOnCompletion();
    }

    #processFile = file => {
        const fileWithType = file.type ? file : new File([file], file.name, { type: this.#mimetype(file.name) })
        if (this.#isAnImage(fileWithType)) {
            exifData.extractExif(fileWithType)
                .then((exif) => this.#afterImageReady(fileWithType, exif));
        }
        else {
            this.#afterFileReady(fileWithType);
        }
    }

    #setAfterActions = (afterImageReady, afterFileReady, onCompletion) => {
        this.#afterImageReady = (image, exif) => {
            afterImageReady(image, exif);
            this.#onCompletion();
        };

        this.#afterFileReady = file => {
            afterFileReady(file);
            this.#onCompletion();
        };

        this.#doOnCompletion = onCompletion;
    }

    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }