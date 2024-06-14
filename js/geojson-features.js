import { point } from './point.js'
import { saveFeatures } from "./save-features.js";

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

        addPointProperties({ latlng: latlng, geojson: feature });
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

            addPointProperties({ image: image, geojson: feature });

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

    const addPointProperties = ({ image, latlng, geojson }) => {
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
            addPointProperties({ latlng: { lat: lat, lng: lng }, geojson: feature });
        }
    }

    const pointsMap = new Map();
    let geojson;

    return {
        add, addPoint, addPhoto, remove, saveAllPoints
    }
};

export { geojson as GeoJSONFeatures }
