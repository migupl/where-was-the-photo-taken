import { Card } from "./card.js";

class Point {
    feature; card;

    constructor({ image, label, geojson }) {
        const id = image ? image.name : label;

        this.feature = JSON.parse(JSON.stringify(geojson));
        this.feature.id = id;

        const { data } = this.feature;
        if (image) {
            data.image = image;
        }

        this.feature.properties = {
            name: id,
            description: `A description about the ${image ? 'image' : 'point'}`
        };

        this.card = new Card(this.feature);
    }

    id = () => this.feature.id

    has = feature => this.id() === feature.id
    wasUpdated = () => this.card.wasUpdated()
}

export { Point }