import { GeoJSONFeatures } from './geojson-features.js';

const existingPoints = new Set();;
const addPointToMap = point => {
    const { id, geojson } = point;
    if (!existingPoints.has(id)) {
        const map = document.querySelector('leaflet-map');
        const eventBus = map.eventBus;

        eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: geojson });
        existingPoints.add(id);
    }
}

document.addEventListener('drop-photo-for-exif:image', (event) => {
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
    points.forEach(addPointToMap);

    toggleSaveButton();
});

document.addEventListener('x-leaflet-map:marker-removed', (event) => {
    event.preventDefault();

    const { feature } = event.detail;
    const { card } = feature.data;

    existingPoints.delete(card.id);
    toggleSaveButton();

    GeoJSONFeatures.remove(card);
})


const save = document.getElementById('save-all');
const toggleSaveButton = () => save.style.display = existingPoints.size > 0 ? 'block' : 'none';

toggleSaveButton();
save.addEventListener('click', (event) => {
    event.stopPropagation();
    const title = document.getElementById('title').value
    GeoJSONFeatures.saveAllPoints(title);
});

window.onload = () => {
    const eTitle = document.getElementById('title');
    eTitle.value = eTitle.defaultValue;
}
