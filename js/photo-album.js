import { GeoJSONFeatures } from './geojson-features.js';

document.addEventListener('drop-photo-for-exif:data', (event) => {
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

document.addEventListener('drop-photo-for-exif:file', (event) => {
    event.preventDefault();

    const isGeojson = file => 'application/geo+json' === file.type;

    const file = event.detail;
    if (isGeojson(file)) {
        console.log('GeoJSON file:', file);
    }
});

const save = document.getElementById('save-all');
save.addEventListener('click', (event) => {
    event.stopPropagation();
    GeoJSONFeatures.saveAllPoints();
});
