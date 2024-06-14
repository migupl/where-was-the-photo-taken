import { card } from "./card.js";

const point = (image, latlng, geojson) => {
    const feature = JSON.parse(JSON.stringify(geojson));

    if (image) {
        feature.id = image.name
        feature.data.image = image
    } else {
        feature.id = `lat: ${latlng.lat}, lng: ${latlng.lng}`
    }

    feature.properties = feature.properties || {}


    const has = f => feature.id == f.id;

    const c = card(feature);
    const updatePopupWith = feature => c.updatePopup(feature);
    const wasUpdated = () => c.wasUpdated();

    return {
        id: feature.id,
        feature,
        has,
        updatePopupWith,
        wasUpdated,
    }
};
export { point as Point }