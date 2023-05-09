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

        const _titleEl = this.#popup.querySelector('h4');
        _titleEl.textContent = title;

        const _descriptionEl = this.#popup.querySelector('p');
        _descriptionEl.textContent = description;
    }

    wasUpdated = () => this.#updated

    #setPopup() {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this.#properties.image);
        img.alt = this.#id;

        const _title = card.querySelector('h4');
        _title.textContent = this.#id;

        const _description = card.querySelector('p');
        _description.textContent = this.#properties.description;

        this.#popup = document.createElement('div');
        this.#popup.appendChild(card);

        _title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.title = el.textContent;
            this.#updated = true;
        });
        _description.addEventListener('input', event => {
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
        <input type="text" name="title" id="card-title" value="a title">
        <textarea name="description" id="card-description"></textarea>
    </div>
</div>
`;
}

export { Card }