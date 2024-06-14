export const saveFeatures = (() => {

    const getGeojsonFile = (features, name) => {
        const featureCollection = {
            type: "FeatureCollection",
            features: features
        };

        const text = JSON.stringify(featureCollection);
        const blob = new Blob([text], { type: 'text/plain' });

        const filename = name + '.geojson';
        const file = new File([blob], filename, {
            type: blob.type,
        });
        return file;
    }

    const saveGeoJsonFile = (file, name) => {
        const filename = name + '.geojson';
        saveFile(file, filename);
    }

    const saveFile = (blob, filename) => {
        const supportsApi = 'showSaveFilePicker' in window &&
                (() => {
                    try {
                        return window.self === window.top;
                    } catch {
                        return false;
                    }
                })();

        if (supportsApi) {
            saveFileUsingFSAApi(blob, filename);
        }
        else {
            saveFileWithoutFSAApi(blob, filename);
        }
    }

    const saveFileWithoutFSAApi = (blob, filename) => {
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

    const saveFileUsingFSAApi = async (blob, filename) => {
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

    const toFile = (features, suggestedName = 'photos.zip') => {
        const filename = suggestedName.endsWith('.zip') ? suggestedName : (suggestedName + '.zip');
        const name = filename.split('.').slice(0, -1).join('.');

        const geojsonFile = getGeojsonFile(features, name);

        saveGeoJsonFile(geojsonFile, name);
    }

    return {
        toFile
    }
})()
