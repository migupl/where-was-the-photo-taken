import { Card } from "./card.js";
import { SaveFeatures } from "./save-features.js";

class GeoJSONFeatures {

    pointsMap = new Map();

    getGeoJSONPoint = (metadata) => {
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
                exif: exif
            }
        };

        this.pointsMap.set(image.name, geojson);

        return geojson;
    }

    saveAllPoints = async () => {
        const title = document.getElementById('title').value;
        const points = Array.from(this.pointsMap.values());
        await SaveFeatures.toFile(points, title);
    }

    #extractNumeric = text => text.match(/[0-9.]/g).join('')

    #DMS2Decimal = (latitude, longitude) => {
        let lat = this.#extractNumeric(latitude);
        let lng = this.#extractNumeric(longitude);

        if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
        if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

        return [lat, lng];
    }
}

const geojsonFeatures = new GeoJSONFeatures();
export { geojsonFeatures as GeoJSONFeatures }