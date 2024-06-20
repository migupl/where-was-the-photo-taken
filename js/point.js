const point = (image, latlng, jsonFeature) => {
    let feature = JSON.parse(JSON.stringify(jsonFeature));

    feature.id = feature.id || (
        image? image.name : `lat: ${latlng.lat}, lng: ${latlng.lng}`
    )

    if (image) feature.data.image = image
    let hasImage = image instanceof File;

    feature.properties = feature.properties || {}
    let c = card(feature, hasImage);

    const update = point => {
        if (!hasImage) feature.data.image = point.feature.data.image
        hasImage ||= point.hasImage
        c.updateEmpties(point)
    }

    return {
        id: feature.id,
        feature,
        hasImage,
        update
    }
};

const card = (jsonFeature, hasImage) => {

    const { id, data: { image }, properties } = jsonFeature;

    const img = (() => {
        const img = document.createElement('img');
        img.alt = 'No source image'
        img.hidden = true

        if (hasImage) {
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
        })

        return title
    })();

    const updateEmpties = point => {
        const { id, feature: { properties, data }, hasImage } = point;

        if (hasImage) {
            img.src = URL.createObjectURL(data.image)
            img.alt = id
            img.hidden = false
        }

        title.value ||= properties.name
        description.value ||= properties.description
    }

    const node = document.createElement('div');

    node.appendChild(img)
    node.appendChild(title)
    node.appendChild(description)

    properties.popupContent = node;

    return {
        updateEmpties
    }
};

export { point }