class Card {

    #popup; #properties;
    #updated = false;

    constructor(image) {
        this.#properties = {
            image: image,
            filename: image.name,
            title: image.name,
            description: 'A description about the image'
        };
    }

    getPopup = () => {
        if (!this.#popup) this.#setPopup();
        return this.#popup;
    }

    properties = () => this.#properties

    static updatePopup = ({ popupContent }, { title, description }) => {
        const elTitle = popupContent.querySelector('h4');
        elTitle.textContent = title;

        const elDescription = popupContent.querySelector('p');
        elDescription.textContent = description;
    }

    wasUpdated = () => this.#updated

    #setPopup() {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const { filename } = this.#properties;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this.#properties.image);
        img.alt = filename;

        const title = card.querySelector('h4');
        title.innerHTML = filename;

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
        <h4 contenteditable="true" style="caret-color: red;"></h4>
        <p contenteditable="true" style="caret-color: red;"></p>
    </div>
</div>
`;
}

export { Card }