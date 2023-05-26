class Point {
    feature; card;

    has = feature => this.card.id() === feature.id
    wasUpdated = () => this.card.wasUpdated()
}

export { Point }