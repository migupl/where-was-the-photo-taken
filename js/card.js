class Card {

    #properties;

    constructor(image) {
        this.#properties = {
            image: image,
            filename: image.name,
            title: image.name,
            description: null
        };
    }

    add = () => {
        const card = document
            .createRange()
            .createContextualFragment(this.#template);

        const name = this.#properties.filename;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this.#properties.image);
        img.alt = name;

        const title = card.querySelector('h4');
        title.innerHTML = name;

        const description = card.querySelector('p');
        this.#properties.description = description.textContent;

        this.el = document.createElement('div');
        this.el.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.title = el.textContent;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.#properties.description = el.textContent;
        });
    }

    properties = () => this.#properties

    #template = `
<div>
<img src="" alt="" style="width: 100%;">
    <div>
        <h4 contenteditable="true" style="caret-color: red;"></h4>
        <p contenteditable="true" style="caret-color: red;">A description about the image</p>
    </div>
</div>
`;
}

export { Card }