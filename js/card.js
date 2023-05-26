import { Point } from './point.js'

class Card {

    #point;
    #popupEl;
    #updated = false;

    constructor(image, geojson) {
        const id = image.name;

        const feature = JSON.parse(JSON.stringify(geojson));
        feature.id = id;

        this.#point = new Point();
        this.#point.feature = feature;
        this.#point.card = this;

        const { data } = feature;
        data.image = image;

        feature.properties = {
            name: id,
            description: 'A description about the image'
        };

        this.#setPopup();
    }

    getPoint = () => this.#point;

    updatePopup = feature => {
        const { name, description } = feature.properties;

        this.#setTitle(name);
        this.#setDescription(description);

        const titleEl = this.#popupEl.querySelector('input');
        titleEl.value = name;

        const descriptionEl = this.#popupEl.querySelector('textarea');
        descriptionEl.value = description;
    }

    wasUpdated = () => this.#updated

    #setDescription = description => {
        if (description) {
            this.getPoint().feature.properties.description = description;
        }
    }

    #setPopup = () => {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const { properties, data } = this.getPoint().feature;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(data.image);
        img.alt = this.#point.id();

        const title = card.querySelector('input');
        title.placeholder = this.#point.id();
        title.addEventListener('input', event => {
            event.stopPropagation();

            const { value: name } = event.target;
            this.#setTitle(name);
            this.#updated = true;
        });

        const description = card.querySelector('textarea');
        description.placeholder = properties.description;
        description.addEventListener('input', event => {
            event.stopPropagation();

            const { value: description } = event.target;
            this.#setDescription(description);
            this.#updated = true;
        });

        this.#setPopupContent(card);
    }

    #setPopupContent = card => {
        this.#popupEl = document.createElement('div');
        this.#popupEl.appendChild(card);

        const { properties } = this.getPoint().feature;
        properties.popupContent = this.#popupEl;
    }

    #setTitle = title => {
        if (title) {
            this.getPoint().feature.properties.name = title;
        }
    }

    #template = `
<div>
    <img src="" alt="">
    <input type="text" name="title" id="card-title" placeholder="a title">
    <textarea name="description" id="card-description"></textarea>
</div>
`;
}

export { Card }
