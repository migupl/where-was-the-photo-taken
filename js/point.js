import { Card } from "./card.js";

class Point {

    #feature; #card;

    constructor({ image, latlng, geojson }) {
        const id = image ? image.name : this.#label(latlng);

        this.#feature = JSON.parse(JSON.stringify(geojson));
        this.#feature.id = id;

        const { data } = this.#feature;
        if (image) {
            data.image = image;
        }

        this.#feature.properties = this.#feature.properties || {};

        this.#card = new Card(this.#feature);
    }

    id = () => this.#feature.id
    feature = () => this.#feature

    has = feature => this.id() === feature.id
    updatePopupWith = feature => this.#card.updatePopup(feature)
    wasUpdated = () => this.#card.wasUpdated()

    #label = latlng => `lat: ${latlng.lat}, lng: ${latlng.lng}`
}

export { Point }