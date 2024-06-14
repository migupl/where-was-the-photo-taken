const point = (image, latlng, geojson) => {
    const feature = JSON.parse(JSON.stringify(geojson));

    if (image) {
        feature.id = image.name
        feature.data.image = image
    } else {
        feature.id = `lat: ${latlng.lat}, lng: ${latlng.lng}`
    }

    feature.properties = feature.properties || {}
    const c = card(feature);

    const has = f => feature.id == f.id;
    const updatePopupWith = feature => c.updatePopup(feature);
    const wasUpdated = c.wasUpdated;

    return {
        id: feature.id,
        feature,
        has,
        updatePopupWith,
        wasUpdated,
    }
};

const card = features => {

    const updatePopup = feature => {
        const { name, description } = feature.properties;

        const titleEl = popupEl.querySelector('input');
        titleEl.value = name;

        const descriptionEl = popupEl.querySelector('textarea');
        descriptionEl.value = description;
    }

    const addDescriptionTo = cardEl => {
        const { properties } = feature;

        const description = cardEl.querySelector('textarea');
        description.placeholder = 'A description about...';
        if (properties.description) {
            description.value = properties.description;
        }
        description.addEventListener('input', event => {
            event.stopPropagation();

            const { value: description } = event.target;
            if(description) feature.properties.description = description
            updated = true;
        });
    }

    const addImageTo = cardEl => {
        const { id, data: { image } } = feature;

        if (image) {
            const img = cardEl.querySelector('img');
            img.src = URL.createObjectURL(image);
            img.alt = id;
        }
    }

    const addTitleTo = cardEl => {
        const { id, properties } = feature;

        const title = cardEl.querySelector('input');
        title.placeholder = id;
        if (properties.name) {
            title.value = properties.name;
        }
        title.addEventListener('input', event => {
            event.stopPropagation();

            const { value: name } = event.target;
            if (name) feature.properties.name = name
            updated = true
        });
    }

    const setPopup = () => {
        const cardEl = document
            .createRange()
            .createContextualFragment(template);

        addImageTo(cardEl);
        addTitleTo(cardEl);
        addDescriptionTo(cardEl);
        setPopupContent(cardEl);
    }

    const setPopupContent = cardEl => {
        popupEl = document.createElement('div');
        popupEl.appendChild(cardEl);

        const { properties } = feature;
        properties.popupContent = popupEl;
    }

    const template = `
<div>
    <img src="" alt="">
    <input type="text" name="title" id="card-title" placeholder="a title">
    <textarea name="description" id="card-description"></textarea>
</div>
`;

    const feature = features;
    let popupEl;
    let updated = false;

    setPopup()

    return {
        updatePopup,
        wasUpdated: updated
    }
};

export { point }