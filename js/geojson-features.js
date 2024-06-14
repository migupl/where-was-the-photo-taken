import { Point } from './point.js'
import { saveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    #pointsMap = new Map();
    #geojson;

    #addToMap; #removeFromMap;

    constructor(
        addToMap = feature => console.log('Action for adding to map'),
        removeFromMap = feature => console.log('Action for removing from map')
    ) {
        this.#addToMap = addToMap;
        this.#removeFromMap = removeFromMap;
    }

    add = (file, doAfter = (title) => console.error(`Doing something with title: '${title}'`)) => {
        if (this.#isGeojson(file)) {
            try {
                this.#readGeojsonFile(file, doAfter);

            } catch (err) {
                alert(err);
            }
        }
    }

    addPoint = latlng => {
        const { lat, lng } = latlng;

        const feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            data: {
            },
            properties: {
                draggable: true
            }
        };

        this.#addPoint({ latlng: latlng, geojson: feature });
    }

    addPhoto = metadata => {
        try {
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

            this.#addPoint({ image: image, geojson: feature });

        } catch (err) {
            alert(err);
        }
    }

    remove = ({ id }) => {
        const feature = this.#pointsMap.get(id).feature;
        if (!this.#pointsMap.delete(id)) {
            this.#error(`Sorry, something went wrong deleting the photo '${id}'`)
        }

        this.#removeFromMap(feature)
    }

    saveAllPoints = (title) => {
        const points = this.#pointsArray()
            .map(point => point.feature);

        if (points.length > 0) {
            saveFeatures.toFile(points, title);
        }
    }

    #addPoint = ({ image, latlng, geojson }) => {
        const point = Point(image, latlng, geojson);
        this.#checkExisting(point.id);

        this.#pointsMap.set(point.id, point);

        this.#addToMap(point.feature);
        this.#updateUsingGeojson(point);
    }

    #areGeojsonEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

    #checkExisting = filename => {
        if (this.#pointsMap.get(filename)) {
            this.#error(`The image '${filename}' already exists`);
        }
    }

    #checkIsValid = json => {
        if (!json.hasOwnProperty('type')) {
            this.#error('Invalid GeoJSON format')
        }
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

    #DMS2Decimal = (latitude, longitude) => {
        let lat = this.#extractNumeric(latitude);
        let lng = this.#extractNumeric(longitude);

        if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
        if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

        return [lat, lng];
    }

    #extractNumeric = text => text.match(/[0-9.]/g).join('')

    #hasElements = array => array && array.length > 0;

    #isGeojson = file => 'application/geo+json' === file.type;

    #isAPointWithoutPhoto = feature => !feature.data.image

    #pointsArray() {
        const points = this.#pointsMap.values();
        return points ? Array.from(points) : [];
    }

    #readGeojsonFile = (file, doAfter) => {
            if (this.#geojson) this.#error('Only a GeoJSON file is allowed');

            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const json = JSON.parse(reader.result);
                this.#checkIsValid(json);

                this.#geojson = json;
                const title = this.#composeTitle(file.name);

                doAfter(title);
                this.#updateUsingGeojson();
            });

            reader.readAsText(file);
    }

    #updatePoint(data, point) {
        if (this.#hasElements(data)) {
            const newerGeojson = data[0];
            if (!this.#areGeojsonEqual(newerGeojson, point.feature)) {
                point.updatePopupWith(newerGeojson);
            }
        }
    }

    #updateUsingGeojson = pointOnMap => {
        if (this.#geojson) {
            this.#geojson.features
                .forEach(feature => {
                    if (pointOnMap) {
                        pointOnMap.id === feature.id && this.#updateWithGeojson(pointOnMap, feature)
                    }
                    else {
                        const point = this.#pointsMap.get(feature.id);
                        this.#updateWithGeojson(point, feature);
                    }
                })
        }
    }

    #updateWithGeojson(point, feature) {
        if (point) {
            !point.wasUpdated() && this.#updatePoint([feature], point);
        }
        else if (this.#isAPointWithoutPhoto(feature)) {
            const [lng, lat] = feature.geometry.coordinates;
            this.#addPoint({ latlng: { lat: lat, lng: lng }, geojson: feature });
        }
    }
}

export { GeoJSONFeatures }
