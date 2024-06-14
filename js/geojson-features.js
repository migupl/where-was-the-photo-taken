import { point } from './point.js'
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
        const p = point(image, latlng, geojson);
        this.#checkExisting(p.id);

        this.#pointsMap.set(p.id, p);

        this.#addToMap(p.feature);
        this.#updateUsingGeojson(p);
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
            !point.wasUpdated && this.#updatePoint([feature], point);
        }
        else if (this.#isAPointWithoutPhoto(feature)) {
            const [lng, lat] = feature.geometry.coordinates;
            this.#addPoint({ latlng: { lat: lat, lng: lng }, geojson: feature });
        }
    }
}

const geojson = (
    addToMap = feature => console.log('Action for adding to map'),
    removeFromMap = feature => console.log('Action for removing from map')
) => {

    const add = (file, doAfter = (title) => console.error(`Doing something with title: '${title}'`)) => {
        if (isGeojson(file)) {
            try {
                readGeojsonFile(file, doAfter);

            } catch (err) {
                alert(err);
            }
        }
    }

    const addPoint = latlng => {
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

        _addPoint({ latlng: latlng, geojson: feature });
    }

    const addPhoto = metadata => {
        try {
            const { image, location: { latitude, longitude, altitude }, exif } = metadata;
            const [lat, lng] = DMS2Decimal(latitude, longitude);

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

            _addPoint({ image: image, geojson: feature });

        } catch (err) {
            alert(err);
        }
    }

    const remove = ({ id }) => {
        const feature = pointsMap.get(id).feature;
        if (!pointsMap.delete(id)) {
            error(`Sorry, something went wrong deleting the photo '${id}'`)
        }

        removeFromMap(feature)
    }

    const saveAllPoints = (title) => {
        const points = pointsArray()
            .map(point => point.feature);

        if (points.length > 0) {
            saveFeatures.toFile(points, title);
        }
    }

    const _addPoint = ({ image, latlng, geojson }) => {
        const p = point(image, latlng, geojson);
        checkExisting(p.id);

        pointsMap.set(p.id, p);

        addToMap(p.feature);
        updateUsingGeojson(p);
    }

    const areGeojsonEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

    const checkExisting = filename => {
        if (pointsMap.get(filename)) {
            error(`The image '${filename}' already exists`);
        }
    }

    const checkIsValid = json => {
        if (!json.hasOwnProperty('type')) {
            error('Invalid GeoJSON format')
        }
    }

    const composeTitle = filename => {
        const separator = '.';
        if (filename.includes(separator)) {
            const texts = filename.split(separator);
            texts.pop();
            return texts.join(separator);
        }

        return filename;
    }

    const error = message => {
        throw {
            toString() {
                return message;
            },
        }
    }

    const DMS2Decimal = (latitude, longitude) => {
        let lat = extractNumeric(latitude);
        let lng = extractNumeric(longitude);

        if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
        if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

        return [lat, lng];
    }

    const extractNumeric = text => text.match(/[0-9.]/g).join('')

    const hasElements = array => array && array.length > 0;

    const isGeojson = file => 'application/geo+json' === file.type;

    const isAPointWithoutPhoto = feature => !feature.data.image

    const pointsArray = () => {
        const points = pointsMap.values();
        return points ? Array.from(points) : [];
    }

    const readGeojsonFile = (file, doAfter) => {
        if (geojson) error('Only a GeoJSON file is allowed');

        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            const json = JSON.parse(reader.result);
            checkIsValid(json);

            geojson = json;
            const title = composeTitle(file.name);

            doAfter(title);
            updateUsingGeojson();
        });

        reader.readAsText(file);
    }

    const updatePoint = (data, point) => {
        if (hasElements(data)) {
            const newerGeojson = data[0];
            if (!areGeojsonEqual(newerGeojson, point.feature)) {
                point.updatePopupWith(newerGeojson);
            }
        }
    }

    const updateUsingGeojson = pointOnMap => {
        if (geojson) {
            geojson.features
                .forEach(feature => {
                    if (pointOnMap) {
                        pointOnMap.id === feature.id && updateWithGeojson(pointOnMap, feature)
                    }
                    else {
                        const point = pointsMap.get(feature.id);
                        updateWithGeojson(point, feature);
                    }
                })
        }
    }

    const updateWithGeojson = (point, feature) => {
        if (point) {
            !point.wasUpdated && updatePoint([feature], point);
        }
        else if (isAPointWithoutPhoto(feature)) {
            const [lng, lat] = feature.geometry.coordinates;
            _addPoint({ latlng: { lat: lat, lng: lng }, geojson: feature });
        }
    }

    const pointsMap = new Map();
    let geojson;

    return {
        add, addPoint, addPhoto, remove, saveAllPoints
    }
};

export { geojson as GeoJSONFeatures }
