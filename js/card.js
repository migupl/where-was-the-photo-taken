class Card {

    constructor(image) {
        this._image = image;
        this.properties = {
            filename: image.name,
            title: image.name,
            description: null
        };
    }

    add = () => {
        const template = document.getElementById('card-template');
        const card = template.content.cloneNode(true);

        const name = this.properties.filename;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this._image);
        img.alt = name;

        const title = card.querySelector('h4');
        title.innerHTML = name;

        const description = card.querySelector('p');
        this.properties.description = description.textContent;

        this.el = document.createElement('div');
        this.el.appendChild(card);

        title.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.properties.title = el.textContent;
        });
        description.addEventListener('input', event => {
            event.stopPropagation();
            const el = event.target;
            this.properties.description = el.textContent;
        });
    }
}

export { Card }