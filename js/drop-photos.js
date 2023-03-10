import { GeoJSONFeatures } from "./geojson-features.js";

document.addEventListener("drop-photo-for-exif:data", (event) => {
    event.preventDefault();

    const data = event.detail;
    if (data.location) {
        const point = GeoJSONFeatures.getGeoJSONPoint(data);

        const map = document.querySelector('leaflet-map');
        const eventBus = map.eventBus;

        eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: point })
    }
    else {
        alert(`The added photo '${data.name}' has no geolocation data`);
    }
});
