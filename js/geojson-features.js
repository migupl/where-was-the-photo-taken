import { Point } from './point.js'
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    #pointsMap = new Map();
    #geojson;

    add = (geojsonFile, doAfter = (title) => console.error(`Doing something with title: '${title}'`)) => {
        this.#read(geojsonFile, doAfter);
    }

    addPhoto = metadata => {
        try {
            const { name } = metadata;
            this.#checkExisting(name);

            const { image, location: { latitude, longitude, altitude }, exif } = metadata;
            const [lat, lng] = this.#DMS2Decimal(latitude, longitude);

            const lnglatalt = [lng, lat, altitude]
                .filter((value) => !isNaN(value));

            const feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: lnglatalt
                },
                data: {
                    exif: exif
                }
            };

            const point = new Point(image, feature);
            this.#pointsMap.set(point.id(), point);

        } catch (err) {
            alert(err);
        }
    }

    isGeojson = file => 'application/geo+json' === file.type;

    getGeoJSONPoints = () => {
        const pointsArr = this.#pointsArray();
        this.#updateUsingGeojson(pointsArr);

        return pointsArr.map(point => {
            const { feature } = point;
            return {
                id: point.id(),
                geojson: feature
            }
        });
    }

    remove = id => {
        if (!this.#pointsMap.delete(id)) this.#error(`Sorry, something went wrong deleting the photo '${id}'`)
    }

    saveAllPoints = async (title) => {
        const points = this.#pointsArray()
            .map(point => point.feature);

        if (points.length > 0) {
            await SaveFeatures.toFile(points, title);
        }
    }

    #areGeojsonEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

    #checkExisting = filename => {
        if (this.#pointsMap.get(filename)) this.#error(`The image '${filename}' already exists`)
    }

    #checkIsValid = json => {
        if (!json.hasOwnProperty('type')) this.#error('Invalid GeoJSON format')
    }

    #composeTitle = filename => {
        const separator = '.';
        if (filename.includes(separator)) {
            const texts = filename.split(separator);
            texts.pop();
            return texts.join(separator);
        }

        return filename;
    }

    #error = message => {
        throw {
            toString() {
                return message;
            },
        }
    }

    #extractNumeric = text => text.match(/[0-9.]/g).join('')

    #hasElements = array => array && array.length > 0;

    #DMS2Decimal = (latitude, longitude) => {
        let lat = this.#extractNumeric(latitude);
        let lng = this.#extractNumeric(longitude);

        if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
        if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

        return [lat, lng];
    }

    #pointsArray() {
        const points = this.#pointsMap.values();
        return points ? Array.from(points) : [];
    }

    #read = (geojsonFile, doAfter) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            try {
                if (this.#geojson) this.#error('Only a GeoJSON file is allowed');

                const json = JSON.parse(reader.result);
                this.#checkIsValid(json);

                this.#geojson = json;
                const title = this.#composeTitle(geojsonFile.name);

                doAfter(title);
                this.#updateUsingGeojson();

            } catch (err) {
                alert(err);
            }
        });

        reader.readAsText(geojsonFile);
    }

    #updatePoint(data, point) {
        if (this.#hasElements(data)) {
            const newerGeojson = data[0];
            const { card, feature } = point;
            if (!this.#areGeojsonEqual(newerGeojson, feature)) {
                card.updatePopup(newerGeojson);
            }
        }
    }

    #updateUsingGeojson = (points = this.#pointsArray()) => {
        if (this.#geojson) {
            points
                .filter(point => !point.wasUpdated())
                .forEach(point => {
                    const data = this.#geojson.features
                        .filter(feature => point.has(feature));
                    this.#updatePoint(data, point);
                })
        }
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }
