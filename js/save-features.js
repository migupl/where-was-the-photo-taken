class SaveFeatures {

    #supportsApi;

    constructor() {
        this.#supportsApi = this.#allowsFileSystemAccess();
    }

    toZipFile = (features, images, suggestedName = 'photos.zip') => {
        this.#saveGeoJsonFile(features, filename);
        this.#saveImages(images);
    }

    #allowsFileSystemAccess = () => {
        return 'showSaveFilePicker' in window &&
            (() => {
                try {
                    return window.self === window.top;
                } catch {
                    return false;
                }
            })();
    }

    #getGeojsonFile(features) {
        const featureCollection = {
            type: "FeatureCollection",
            features: features
        };

        const text = JSON.stringify(featureCollection);
        const blob = new Blob([text], { type: 'text/plain' });
        return blob;
    }

    #saveGeoJsonFile = (features, suggestedName = 'photos.geojson') => {
        const filename = suggestedName.endsWith('.geojson') ? suggestedName : (suggestedName + '.geojson');
        const file = this.#getGeojsonFile(features);

        this.#saveFile(file, filename);
    }

    #saveFile = (blob, filename) => {
        if (this.#supportsApi) {
            this.#saveFileUsingFSAApi(blob, filename);
        }
        else {
            this.#saveFileWithoutFSAApi(blob, filename);
        }
    }

    #saveFileWithoutFSAApi = (blob, filename) => {
        const blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = filename;
        a.style.display = 'none';
        document.body.append(a);
        a.click();

        setTimeout(() => {
            URL.revokeObjectURL(blobURL);
            a.remove();
        }, 1000);
    }

    #saveFileUsingFSAApi = async (blob, filename) => {
        try {
            const handle = await showSaveFilePicker({
                suggestedName: filename,
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err.name, err.message);
                return;
            }
        }
    }

    #saveImages = images => {
        images.forEach(async (image) => {
            await this.#saveFileWithoutFSAApi(image, image.name);
        });
    }
}

const saveFeatures = new SaveFeatures();
export { saveFeatures as SaveFeatures }
