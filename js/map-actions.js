import { point } from './point.js'
import { saveFeatures } from "./save-features.js";

export const mapActions = (
    onNoEmptyMap = () => console.log('Things to do when map is not empty'),
    onMapEmpties = () => console.log('Things to do when map empties')
) => {

    const addGeojson = (file, doWith = (title) => console.error(`Doing something with title: '${title}'`)) => {
        if ('application/geo+json' === file.type) {
            try {
                if (geojson) error('Only a GeoJSON file is allowed');

                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    const json = JSON.parse(reader.result);
                    if (!json.hasOwnProperty('type')) error('Invalid GeoJSON format')

                    geojson = json;
                    const title = (filename => {
                        const separator = '.';
                        if (filename.includes(separator)) {
                            const texts = filename.split(separator);
                            texts.pop();
                            return texts.join(separator);
                        }

                        return filename;
                    })(file.name);

                    doWith(title);
                    updateUsingGeojson();
                });

                reader.readAsText(file);

            } catch (err) {
                alert(err);
            }
        }
    }

    const addPoint = latlng => {
        const { lat, lng } = latlng;

        addPointProperties({
            latlng: latlng,
            feature: {
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
            }
        });
    }

    const addPhoto = metadata => {
        const DMS2Decimal = (latitude, longitude) => {
            let lat = extractNumeric(latitude);
            let lng = extractNumeric(longitude);

            if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
            if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

            return [lat, lng];
        }

        try {
            const { image, location: { latitude, longitude, altitude }, exif } = metadata;
            const [lat, lng] = DMS2Decimal(latitude, longitude);

            const lnglatalt = [lng, lat, altitude]
                .filter((value) => !isNaN(value));

            addPointProperties({
                image: image,
                feature: {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: lnglatalt
                    },
                    data: {
                        exif: exif
                    }
                }
            });

        } catch (err) {
            alert(err);
        }
    }

    const removePoint = ({ id }) => {
        if (!pointsMap.delete(id)) {
            error(`Sorry, something went wrong deleting the photo '${id}'`)
        }

        if (!pointsMap.size) onMapEmpties()
    }

    const saveAllPoints = (title) => {
        if (pointsMap.size > 0) {
            let features = [];
            pointsMap.values().forEach(point => features.push(point.feature));
            saveFeatures.toFile(features, title);
        }
    }

    const addPointProperties = ({ image, latlng, feature }) => {
        const checkExisting = filename => {
            if (pointsMap.get(filename)) {
                error(`The image '${filename}' already exists`);
            }
        }

        const p = point(image, latlng, feature);
        checkExisting(p.id);

        pointsMap.set(p.id, p);

        addPointToMap(p.feature);
        updateUsingGeojson(p);
    }

    const error = message => {
        throw new Error(message)
    }

    const extractNumeric = text => text.match(/[0-9.]/g).join('')

    const updateUsingGeojson = pointOnMap => {
        const updatePoint = (data, point) => {
            const areGeojsonEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)
            const hasElements = array => array && array.length > 0;

            if (hasElements(data)) {
                const newerGeojson = data[0];
                if (!areGeojsonEqual(newerGeojson, point.feature)) {
                    point.updatePopupWith(newerGeojson);
                }
            }
        }

        const updateWithGeojson = (point, feature) => {
            if (point) {
                !point.wasUpdated && updatePoint([feature], point);
            }
            else if (!feature.data.image) {
                const [lng, lat] = feature.geometry.coordinates;
                addPointProperties({ latlng: { lat: lat, lng: lng }, feature });
            }
        }

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


    const pointsMap = new Map();
    let geojson;

    const addPointToMap = feature => {
        const map = document.querySelector('leaflet-map');
        map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson-add', {
            detail: {
                geojson: feature
            }
        }));

        onNoEmptyMap()
    }

    return {
        addGeojson, addPoint, addPhoto, removePoint, saveAllPoints
    }
};
