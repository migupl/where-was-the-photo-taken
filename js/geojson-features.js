import { Card } from "./card.js";
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    #pointsMap = new Map();
    #geojson;

    add = (geojsonFile, doAfter = (title) => console.log(`Do something with title: '${title}'`)) => {
        this.#read(geojsonFile, doAfter);
    }

    addPhoto = metadata => {
        const { image, name, location, exif } = metadata;
        const { latitude, longitude, altitude } = location;
        const [lat, lng] = this.#DMS2Decimal(latitude, longitude);

        const lnglatalt = [lng, lat, altitude]
            .filter((value) => !isNaN(value));

        const card = new Card(image);
        const popup = card.getPopup();

        const point = {
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
                }
            },
            card: card
        };

        this.#pointsMap.set(name, point);
    }

    isGeojson = file => 'application/geo+json' === file.type;

    getGeoJSONPoints = () => {
        const pointsArr = this.#pointsArray();
        this.#updateUsingGeojson(pointsArr);

        return pointsArr.map(point => {
            const { feature } = point;
            const { card } = feature.data;
            return {
                name: card.filename,
                geojson: feature
            }
        });
    }

    saveAllPoints = async (title) => {
        const points = Array.from(this.#pointsMap.values())
            .map(point => point.feature);

        const images = points.reduce((arr, point) => {
            const { card } = point.data;
            arr.push(card.image);
            return arr;
        }, []);

        await SaveFeatures.toFile(points, images, title);
    }

    #areGeojsonEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2)

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
        if (data) {
            const newerGeojson = data[0];
            if (!this.#areGeojsonEqual(newerGeojson, point)) {
                let { card } = point.data;
                const { card: newerCard } = newerGeojson.data;
                card = newerCard;

                Card.updatePopup(point.properties, newerCard);
            }
        }
    }

    #updateUsingGeojson = (points = this.#pointsArray()) => {
        if (this.#geojson) {
            points
                .filter(point => !point.card.wasUpdated())
                .forEach(point => {
                    const { feature } = point;
                    const { filename } = feature.data.card;
                    const data = this.#geojson.features
                        .filter(feature => filename === feature.data.card.filename);
                    this.#updatePoint(data, feature);
                })
        }
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }