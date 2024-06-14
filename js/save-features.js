export const saveFeatures = (() => {

    const saveGeoJsonFile = async (file, name) => {
        const filename = name + '.geojson';
        const supportsApi = 'showSaveFilePicker' in window &&
            (() => {
                try {
                    return window.self === window.top;
                } catch {
                    return false;
                }
            })();

        if (supportsApi) {
            await saveFileUsingFSAApi(file, filename)
        }
        else {
            saveFileWithoutFSAApi(file, filename)
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
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err.name, err.message);
            }
        }
    }

    const toFile = (features, suggestedName = 'photos.zip') => {
        const filename = suggestedName.endsWith('.zip') ? suggestedName : (suggestedName + '.zip');
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
        };
        const name = filename.split('.').slice(0, -1).join('.');

        const geojsonFile = getGeojsonFile(features, name);

        saveGeoJsonFile(geojsonFile, name);
    }

    return {
        toFile
    }
})()
