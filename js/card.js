class Card {

    #id;
    #popup; #properties;
    #updated = false;

    constructor(image) {
        this.#id = image.name;
        this.#properties = {
            image: image,
            filename: this.#id,
            title: this.#id,
            description: 'A description about the image'
        };
    }

    getPopup = () => {
        if (!this.#popup) this.#setPopup();
        return this.#popup;
    }

    properties = () => this.#properties

    updatePopup = ({ title, description }) => {
        this.#properties.title = title;
        this.#properties.description = description;

        const titleEl = this.#popup.querySelector('h4');
        titleEl.textContent = title;

        const descriptionEl = this.#popup.querySelector('p');
        descriptionEl.textContent = description;
    }

    wasUpdated = () => this.#updated

    #setPopup() {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this.#properties.image);
        img.alt = this.#id;

        const title = card.querySelector('h4');
        title.textContent = this.#id;

        const description = card.querySelector('p');
        description.textContent = this.#properties.description;

        this.#popup = document.createElement('div');
        this.#popup.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.title = el.textContent;
            this.#updated = true;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.description = el.textContent;
            this.#updated = true;
        });
    }

    #template = `
<div>
<img src="" alt="" style="width: 100%;">
    <div>
        <h4 contenteditable="true"></h4>
        <p contenteditable="true"></p>
    </div>
</div>
`;
}

export { Card }