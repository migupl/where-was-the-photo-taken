class Card {

    #feature;
    #popupEl;
    #updated = false;

    constructor(feature) {
        this.#feature = feature;
        this.#setPopup();
    }

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

    #addDescriptionTo = cardEl => {
        const { properties } = this.#feature;

        const description = cardEl.querySelector('textarea');
        description.placeholder = 'A description about...';
        if (properties.description) {
            description.value = properties.description;
        }
        description.addEventListener('input', event => {
            event.stopPropagation();

            const { value: description } = event.target;
            this.#setDescription(description);
            this.#updated = true;
        });
    }

    #addImageTo = cardEl => {
        const { id, data: { image } } = this.#feature;

        if (image) {
            const img = cardEl.querySelector('img');
            img.src = URL.createObjectURL(image);
            img.alt = id;
        }
    }

    #addTitleTo = cardEl => {
        const { id, properties } = this.#feature;

        const title = cardEl.querySelector('input');
        title.placeholder = id;
        if (properties.name) {
            title.value = properties.name;
        }
        title.addEventListener('input', event => {
            event.stopPropagation();

            const { value: name } = event.target;
            this.#setTitle(name);
            this.#updated = true;
        });
    }

    #setDescription = description => {
        if (description) {
            this.#feature.properties.description = description;
        }
    }

    #setPopup = () => {
        const cardEl = document
            .createRange()
            .createContextualFragment(this.#template);

        this.#addImageTo(cardEl);
        this.#addTitleTo(cardEl);
        this.#addDescriptionTo(cardEl);
        this.#setPopupContent(cardEl);
    }

    #setPopupContent = cardEl => {
        this.#popupEl = document.createElement('div');
        this.#popupEl.appendChild(cardEl);

        const { properties } = this.#feature;
        properties.popupContent = this.#popupEl;
    }

    #setTitle = title => {
        if (title) {
            this.#feature.properties.name = title;
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
