import { Card } from "./card.js";
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    #pointsMap = new Map();
    #geojson;

    add = (geojsonFile, doAfter = (title) => console.error(`Doing something with title: '${title}'`)) => {
        this.#read(geojsonFile, doAfter);
    }

    addPhoto = metadata => {
        try {
            const { image, name, location, exif } = metadata;
            this.#checkExisting(name);

            const { latitude, longitude, altitude } = location;
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

            const card = new Card(image, feature);
            const popup = card.getPopup();

            const point = {
                point: {
                    feature: {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: lnglatalt
                        },
                        properties: {
                            popupContent: popup
                        },
                        data: {
                            exif: exif,
                            card: card.properties()
                        },
                        id: image.name
                    },
                    card: card
                },
                cardPoint: card.getPoint()
            };

            this.#pointsMap.set(card.id(), point);

        } catch (err) {
            alert(err);
        }
    }

    isGeojson = file => 'application/geo+json' === file.type;

    getGeoJSONPoints = () => {
        const pointsArr = this.#pointsArray();
        this.#updateUsingGeojson(pointsArr);

        return pointsArr.map(point => {
            const { card, feature } = point;
            return {
                id: card.id(),
                geojson: feature
            }
        });
    }

    remove = card => {
        if (!this.#pointsMap.delete(card.id())) this.#error(`Sorry, something went wrong deleting the photo '${card.id()}'`)
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
        return points ? Array.from(points).map(value => value.point) : [];
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
                const { card: newerCard } = newerGeojson.data;
                card.updatePopup(newerCard);
            }
        }
    }

    #updateUsingGeojson = (points = this.#pointsArray()) => {
        if (this.#geojson) {
            points
                .filter(point => !point.card.wasUpdated())
                .forEach(point => {
                    const { card } = point;
                    const data = this.#geojson.features
                        .filter(feature => card.isThis(feature));
                    this.#updatePoint(data, point);
                })
        }
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }