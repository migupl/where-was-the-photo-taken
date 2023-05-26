class Card {

    #point;
    #popup;
    #updated = false;

    constructor(image, geojson) {
        const id = image.name;

        const feature = JSON.parse(JSON.stringify(geojson));
        feature.id = id;
        this.#point = {
            feature: feature,
            card: this
        }

        const { data } = feature;
        data.card = {
            image: image,
        };

        feature.properties = {
            name: id,
            description: 'A description about the image'
        };

        feature.properties.popupContent = this.#getPopup();
    }

    getPoint = () => this.#point;

    id = () => this.#point.feature.id
    isThis = properties => this.id() === properties.id

    updatePopup = feature => {
        const { name, description } = feature.properties;
        this.#setProperties(name, description);

        const titleEl = this.#popup.querySelector('input');
        titleEl.value = name;

        const descriptionEl = this.#popup.querySelector('textarea');
        descriptionEl.value = description;
    }

    wasUpdated = () => this.#updated

    #getPopup = () => {
        if (!this.#popup) this.#setPopup();
        return this.#popup;
    }

    #setPopup() {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const { properties, data } = this.getPoint().feature;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(data.card.image);
        img.alt = this.id();

        const title = card.querySelector('input');
        title.placeholder = this.id();

        const description = card.querySelector('textarea');
        description.placeholder = properties.description;

        this.#popup = document.createElement('div');
        this.#popup.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#setProperties(el.value);
            this.#updated = true;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#setProperties(null, el.value);
            this.#updated = true;
        });
    }

    #setProperties(title, description) {
        if (title) {
            this.getPoint().feature.properties.name = title;
        }

        if (description) {
            this.getPoint().feature.properties.description = description;
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
