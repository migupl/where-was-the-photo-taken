import { GeoJSONFeatures } from './geojson-features.js';

const existingPoints = [];
const addPointToMap = point => {
    const { id, geojson } = point;
    if (!existingPoints.includes(id)) {
        const map = document.querySelector('leaflet-map');
        const eventBus = map.eventBus;

        eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: geojson });
        existingPoints.push(id);
    }
}

document.addEventListener('drop-photo-for-exif:data', (event) => {
    event.preventDefault();

    const data = event.detail;
    if (data.location) {
        GeoJSONFeatures.addPhoto(data);
    }
    else {
        alert(`The added photo '${data.name}' has no geolocation data`);
    }
});

document.addEventListener('drop-photo-for-exif:file', (event) => {
    event.preventDefault();

    const file = event.detail;
    const refreshTitle = title => {
        const eTitle = document.getElementById('title');
        eTitle.value = title;
    }

    if (GeoJSONFeatures.isGeojson(file)) GeoJSONFeatures.add(file, refreshTitle);
});

document.addEventListener('drop-photo-for-exif:completed-batch', (event) => {
    event.preventDefault();

    const points = GeoJSONFeatures.getGeoJSONPoints();
    points.forEach(addPointToMap)
});

const save = document.getElementById('save-all');
save.addEventListener('click', (event) => {
    event.stopPropagation();
    const title = document.getElementById('title').value
    GeoJSONFeatures.saveAllPoints(title);
});

window.onload = () => {
    const eTitle = document.getElementById('title');
    eTitle.value = eTitle.defaultValue;
}
