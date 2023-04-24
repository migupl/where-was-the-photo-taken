import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')
        , onComplete = () => console.log('Do something on complete')) => {
        this._afterImageReady = afterImageReady;
        this._afterFileReady = afterFileReady;
        this._onComplete = onComplete;

        this.#filesToProcess(items.length);

        for (let item of items) {
            if (!(this.#supportsFileSystemAccessAPI || this.#supportsWebkitGetAsEntry)) {
                this.#processFile(item.getAsFile());
            }

            const entry = this.#supportsFileSystemAccessAPI
                ? item.getAsFileSystemHandle()
                : item.webkitGetAsEntry();

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
        if (!this._remainToCompleteBatch) this._onComplete();
    }

    #processFile = file => {
        const fileWithType = file.type ? file : new File([file], file.name, { type: this.#mimetype(file.name) })
        if (this.#isAnImage(fileWithType)) {
            exifData.extractExif(fileWithType)
                .then((exif) => this._afterImageReady(fileWithType, exif));
        }
        else {
            this._afterFileReady(fileWithType);
        }

        this.#onCompletion();
    }

    #supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }