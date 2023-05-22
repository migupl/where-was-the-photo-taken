import { ZIP } from './deps/zip-streams.js'

class SaveFeatures {

    toZipFile = (features, images, suggestedName = 'photos.zip') => {
        const filename = suggestedName.endsWith('.zip') ? suggestedName : (suggestedName + '.zip');
        const name = filename.split('.').slice(0, -1).join('.');

        const geojsonFile = this.#getGeojsonFile(features, name);

        this.#saveZipFile(geojsonFile, images, filename);
    }

    #getGeojsonFile(features, name) {
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

    #saveZipFile = (geojsonFile, images, filename) => {
        const readableZipStream = new ZIP({
            start(ctrl) {
                ctrl.enqueue(geojsonFile);
                images.forEach(ctrl.enqueue);
                ctrl.close()
            }
        })

        const streamSaver = window.streamSaver;
        const fileStream = streamSaver.createWriteStream(filename);

        const allowFastWay = window.WritableStream && readableZipStream.pipeTo;
        if (allowFastWay) {
            readableZipStream.
                pipeTo(fileStream).
                then(() => console.log('done writing'))
        }
        else {
            const writer = fileStream.getWriter()
            const reader = readableZipStream.getReader()
            const pump = () => reader.read()
                .then(res => res.done ?
                    writer.close() :
                    writer.write(res.value).then(pump)
                )

            pump();
        }
    }
}

const saveFeatures = new SaveFeatures();
export { saveFeatures as SaveFeatures }
