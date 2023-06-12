import { Card } from "./card.js";

class Point {
    feature; card;

    constructor({ image, latlng, geojson }) {
        const id = image ? image.name : this.#label(latlng);

        this.feature = JSON.parse(JSON.stringify(geojson));
        this.feature.id = id;

        const { data } = this.feature;
        if (image) {
            data.image = image;
        }

        this.feature.properties = {
            name: image ? id : 'A point',
            description: `A description about the ${image ? 'image' : 'point'}`
        };

        this.card = new Card(this.feature);
    }

    id = () => this.feature.id

    has = feature => this.id() === feature.id
    wasUpdated = () => this.card.wasUpdated()

    #label = latlng => `lat: ${latlng.lat}, lng: ${latlng.lng}`
}

export { Point }