import { Card } from "./card.js";
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    pointsMap = new Map();
    geojson;

    add = geojsonFile => {
        this.#read(geojsonFile);
    }

    isGeojson = file => 'application/geo+json' === file.type;

    getGeoJSONPoint = metadata => {
        const { name } = metadata;

        this.#addImage(metadata);

        const geojson = this.pointsMap.get(name);
        return geojson;
    }

    saveAllPoints = async () => {
        const title = document.getElementById('title').value;
        const points = Array.from(this.pointsMap.values());
        const images = points.reduce((arr, point) => {
            const card = point.data.card;
            arr.push(card.image);
            return arr;
        }, []);

        await SaveFeatures.toFile(points, images, title);
    }

    #addImage = metadata => {
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

        this.pointsMap.set(name, geojson);
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
                if (this.geojson) this.#error('Only a GeoJSON file is allowed');

                const json = JSON.parse(reader.result);
                this.#simpleCheck(json);
                this.geojson = json;

            } catch (err) {
                alert(err);
            }
        });

        reader.readAsText(geojsonFile);
    }

    #simpleCheck = geojsonFile => {
        if (!geojsonFile.hasOwnProperty('type')) this.#error('Invalid GeoJSON format')
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }