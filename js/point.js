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

    const { id, data: { image }, properties } = jsonFeature;
    let updated = false;

    const node = document.createElement('div');

    const img = (() => {
        const img = document.createElement('img');
        img.alt = 'No source image'
        img.hidden = true

        if (image) {
            img.src = URL.createObjectURL(image)
            img.alt = id
            img.hidden = false
        }

        return img
    })();

    const description = (() => {
        const description = document.createElement('textarea');
        description.id = 'card-description'
        description.name = 'description'
        description.placeholder = 'A description about...'

        if (properties.description) {
            description.value = properties.description;
        }

        description.addEventListener('input', ev => {
            ev.stopPropagation()

            const { value: description } = ev.target;
            if (description) jsonFeature.properties.description = description
            updated = true
        });

        return description
    })();

    const title = (() => {
        const title = document.createElement('input');
        title.id = 'card-title'
        title.type = 'text'
        title.name = 'title'
        title.placeholder = 'Some text as title'

        if (properties.name) {
            title.value = properties.name
        }

        title.addEventListener('input', ev => {
            ev.stopPropagation()

            const { value: name } = ev.target;
            if (name) jsonFeature.properties.name = name
            updated = true
        })

        return title
    })();

    node.appendChild(img)
    node.appendChild(title)
    node.appendChild(description)

    const updatePopup = feature => {
        title.value = feature.properties.name;
        description.value = feature.properties.description;
    }

    properties.popupContent = node;

    return {
        updatePopup,
        wasUpdated: updated
    }
};

export { point }