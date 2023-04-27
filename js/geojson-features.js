import { Card } from "./card.js";
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    #pointsMap = new Map();
    #geojson;
    #title;

    add = geojsonFile => {
        this.#setTitle(geojsonFile.name);
        this.#read(geojsonFile);
    }

    addPhoto = metadata => {
        const { image, name, location, exif } = metadata;
        const { latitude, longitude, altitude } = location;
        const [lat, lng] = this.#DMS2Decimal(latitude, longitude);

        const lnglatalt = [lng, lat, altitude]
            .filter((value) => !isNaN(value));

        const card = new Card(image);
        card.add();

        const geojson = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: lnglatalt
            },
            properties: {
                popupContent: card.el
            },
            data: {
                exif: exif,
                card: card.properties
            }
        };

        this.#pointsMap.set(name, geojson);
    }

    isGeojson = file => 'application/geo+json' === file.type;

    getGeoJSONPoints = () => {
        const points = this.#pointsMap.values();
        return points ? Array.from(points) : []
    }

    getTitle = () => {
        return this.#title;
    }

    saveAllPoints = async () => {
        const title = document.getElementById('title').value;
        const points = Array.from(this.#pointsMap.values());
        const images = points.reduce((arr, point) => {
            const card = point.data.card;
            arr.push(card.image);
            return arr;
        }, []);

        await SaveFeatures.toFile(points, images, title);
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

    #read = geojsonFile => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            try {
                if (this.#geojson) this.#error('Only a GeoJSON file is allowed');

                const json = JSON.parse(reader.result);
                this.#simpleCheck(json);
                this.#geojson = json;

            } catch (err) {
                alert(err);
            }
        });

        reader.readAsText(geojsonFile);
    }

    #setTitle = filename => {
        const separator = '.';
        if (filename.includes(separator)) {
            const texts = filename.split(separator);
            texts.pop();
            this.#title = texts.join(separator);
        }
        else {
            this.#title = filename;
        }
    }

    #simpleCheck = geojsonFile => {
        if (!geojsonFile.hasOwnProperty('type')) this.#error('Invalid GeoJSON format')
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }