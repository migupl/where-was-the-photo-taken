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
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.style.display = 'none'

        a.onClick = () => URL.revokeObjectURL(a.href)
        a.click();
        a.remove();
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

    const toFile = (features, name) => {
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

        const geojsonFile = getGeojsonFile(features, name);

        saveGeoJsonFile(geojsonFile, name);
    }

    return {
        toFile
    }
})()
