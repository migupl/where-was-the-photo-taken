const point = (image, latlng, jsonFeature) => {
    const feature = JSON.parse(JSON.stringify(jsonFeature));

    feature.id = feature.id || (
        image? image.name : `lat: ${latlng.lat}, lng: ${latlng.lng}`
    )

    if (image) feature.data.image = image
    const hasImage = image instanceof File;

    feature.properties = feature.properties || {}
    const c = card(feature);

    const updatePopupWith = feature => c.updatePopup(feature);
    const wasUpdated = c.wasUpdated;

    return {
        id: feature.id,
        feature,
        hasImage,
        updatePopupWith,
        wasUpdated,
    }
};

const card = jsonFeature => {

    const updatePopup = feature => {
        const { name, description } = feature.properties;

        const titleEl = popupEl.querySelector('input');
        titleEl.value = name;

        const descriptionEl = popupEl.querySelector('textarea');
        descriptionEl.value = description;
    }

    const setPopup = () => {
        const addDescriptionTo = cardEl => {
            const { properties } = jsonFeature;

            const description = cardEl.querySelector('textarea');
            description.placeholder = 'A description about...';
            if (properties.description) {
                description.value = properties.description;
            }
            description.addEventListener('input', event => {
                event.stopPropagation();

                const { value: description } = event.target;
                if(description) jsonFeature.properties.description = description
                updated = true;
            });
        }

        const addImageTo = cardEl => {
            const { id, data: { image } } = jsonFeature;

            if (image) {
                const img = cardEl.querySelector('img');
                img.src = URL.createObjectURL(image);
                img.alt = id;
            }
        }

        const addTitleTo = cardEl => {
            const { id, properties } = jsonFeature;

            const title = cardEl.querySelector('input');
            title.placeholder = id;
            if (properties.name) {
                title.value = properties.name;
            }
            title.addEventListener('input', event => {
                event.stopPropagation();

                const { value: name } = event.target;
                if (name) jsonFeature.properties.name = name
                updated = true
            });
        }

        const setPopupContent = cardEl => {
            popupEl = document.createElement('div');
            popupEl.appendChild(cardEl);

            const { properties } = jsonFeature;
            properties.popupContent = popupEl;
        }

        const cardEl = document
            .createRange()
            .createContextualFragment(template);

        addImageTo(cardEl);
        addTitleTo(cardEl);
        addDescriptionTo(cardEl);
        setPopupContent(cardEl);
    }

    const template = `
<div>
    <img src="" alt="">
    <input type="text" name="title" id="card-title" placeholder="a title">
    <textarea name="description" id="card-description"></textarea>
</div>
`;

    let popupEl;
    let updated = false;

    setPopup()

    return {
        updatePopup,
        wasUpdated: updated
    }
};

export { point }