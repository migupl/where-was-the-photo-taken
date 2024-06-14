import { Card } from "./card.js";

const point = (image, latlng, geojson) => {
    const feature = JSON.parse(JSON.stringify(geojson));

    if (image) {
        feature.id = image.name
        feature.data.image = image
    } else {
        feature.id = `lat: ${latlng.lat}, lng: ${latlng.lng}`
    }

    feature.properties = feature.properties || {}

    const card = new Card(feature);

    const has = f => feature.id == f.id;
    const updatePopupWith = feature => card.updatePopup(feature);
    const wasUpdated = () => card.wasUpdated();

    return {
        id: feature.id,
        feature,
        has,
        updatePopupWith,
        wasUpdated,
    }
};
export { point as Point }