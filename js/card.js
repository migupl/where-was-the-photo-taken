class Card {

    #id;
    #popup; #properties;
    #updated = false;

    constructor(image) {
        this.#id = image.name;
        this.#properties = {
            image: image,
            id: this.#id,
            title: this.#id,
            description: 'A description about the image'
        };
    }

    getPopup = () => {
        if (!this.#popup) this.#setPopup();
        return this.#popup;
    }

    id = () => this.#id
    isThis = properties => this.#id === properties.id

    properties = () => this.#properties

    updatePopup = ({ title, description }) => {
        this.#properties.title = title;
        this.#properties.description = description;

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
        img.src = URL.createObjectURL(this.#properties.image);
        img.alt = this.#id;

        const title = card.querySelector('input');
        title.value = this.#id;

        const description = card.querySelector('textarea');
        description.value = this.#properties.description;

        this.#popup = document.createElement('div');
        this.#popup.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.title = el.value;
            this.#updated = true;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.description = el.value;
            this.#updated = true;
        });
    }

    #template = `
<div>
<img src="" alt="" style="width: 100%;">
    <div>
        <input type="text" name="title" id="card-title" value="a title">
        <textarea name="description" id="card-description"></textarea>
    </div>
</div>
`;
}

export { Card }