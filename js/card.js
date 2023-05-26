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
            id: id,
            title: id,
            description: 'A description about the image'
        };

        feature.properties = {
            popupContent: this.getPopup()
        };
    }

    getPoint = () => this.#point;

    getPopup = () => {
        if (!this.#popup) this.#setPopup();
        return this.#popup;
    }

    id = () => this.#point.feature.id
    isThis = properties => this.id() === properties.id

    properties = () => this.#point.feature.data.card

    updatePopup = ({ title, description }) => {
        this.#setProperties(title, description);

        const titleEl = this.#popup.querySelector('input');
        titleEl.value = title;

        const descriptionEl = this.#popup.querySelector('textarea');
        descriptionEl.value = description;
    }

    wasUpdated = () => this.#updated

    #setPopup() {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this.properties().image);
        img.alt = this.id();

        const title = card.querySelector('input');
        title.placeholder = this.id();

        const description = card.querySelector('textarea');
        description.placeholder = this.properties().description;

        this.#popup = document.createElement('div');
        this.#popup.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.properties().title = el.value;
            this.#updated = true;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.properties().description = el.value;
            this.#updated = true;
        });
    }

    #setProperties(title, description) {
        this.properties().title = title;
        this.properties().description = description;
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