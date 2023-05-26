class Point {
    feature; card;

    id = () => this.feature.id

    has = feature => this.id() === feature.id
    wasUpdated = () => this.card.wasUpdated()
}

export { Point }