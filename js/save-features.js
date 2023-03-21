class SaveFeatures {

    constructor() {
        this._supportsApi = this.#allowsFileSystemAccess();
    }

    toFile = (features, filename) => {
        this.#saveGeoJsonFile(features, filename);
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

    #saveGeoJsonFile = async (features, suggestedName = 'photos.geojson') => {
        const featureCollection = {
            type: "FeatureCollection",
            features: features
        };

        const text = JSON.stringify(featureCollection);

        const filename = suggestedName.endsWith('.geojson') ? suggestedName : (suggestedName + '.geojson');
        const blob = new Blob([text], { type: 'text/plain' });
        this.#saveFile(blob, filename);
    }

    #saveFile = async (blob, filename) => {
        if (this._supportsApi) {
            try {
                const handle = await showSaveFilePicker({
                    filename,
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

        this.#saveFileAsClassicIs(blob, filename);
    }

    #saveFileAsClassicIs = (blob, filename) => {
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
}

const saveFeatures = new SaveFeatures();
export { saveFeatures as SaveFeatures }
