import { Card } from "./card.js";

class Point {
    feature; card;

    constructor({ image, geojson }) {
        const id = image.name;

        this.feature = JSON.parse(JSON.stringify(geojson));
        this.feature.id = id;

        const { data } = this.feature;
        data.image = image;

        this.feature.properties = {
            name: id,
            description: 'A description about the image'
        };

        this.card = new Card(this.feature);
    }

    id = () => this.feature.id

    has = feature => this.id() === feature.id
    wasUpdated = () => this.card.wasUpdated()
}

export { Point }