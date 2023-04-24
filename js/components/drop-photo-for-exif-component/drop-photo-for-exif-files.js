import { exifData } from "./drop-photo-for-exif-data.js";

class DropPhotoForExifFiles {

    process = (items
        , afterImageReady = (image, exif) => console.log('Do something after image is ready')
        , afterFileReady = file => console.log('Do something after file is ready')) => {
        this._afterImageReady = afterImageReady;
        this._afterFileReady = afterFileReady;

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
                entries.filter((entry) => entry.isFile)
                    .forEach(entryFile =>
                        entryFile.file(this.#processFile)
                    )
            });
    }

    #mimetype = filename => {
        const ext = filename.split('.').pop();

        if ('geojson' == ext) return 'application/geo+json';
        return exifData.getAllowedMimetype(ext);
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
    }

    #supportsFileSystemAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype;
    #supportsWebkitGetAsEntry = 'webkitGetAsEntry' in DataTransferItem.prototype;
}

const dropFiles = new DropPhotoForExifFiles();
export { dropFiles }