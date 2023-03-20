class SaveFeatures {

    constructor() {
        this._supportsApi = this.#allowsFileSystemAccess();
    }

    toFile = geojsonPoints => {
        this.#saveFiles(geojsonPoints);
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

    #saveFiles = async (geojsonPoints) => {
        const features = Array.from(geojsonPoints);
        const featureCollection = {
            type: "FeatureCollection",
            features: features
        };

        const text = JSON.stringify(featureCollection);
        const blob = new Blob([text], { type: 'text/plain' });
        this.#saveFile(blob);
    }

    #saveFile = async (blob, suggestedName = 'test.geojson') => {
        if (this._supportsApi) {
            try {
                const handle = await showSaveFilePicker({
                    suggestedName,
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

        const blobURL = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobURL;
        a.download = suggestedName;
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
