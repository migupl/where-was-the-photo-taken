class Card {

    constructor(image) {
        this._image = image;
    }

    add = () => {
        const template = document.getElementById('card-template');
        const card = template.content.cloneNode(true);

        const name = this._image.name;

        const img = card.querySelector('img');
        img.src = URL.createObjectURL(this._image);
        img.alt = name;

        const title = card.querySelector('h4');
        title.innerHTML = name;

        this.el = document.createElement('div');
        this.el.appendChild(card);
    }
}

export { Card }