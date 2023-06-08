import { GeoJSONFeatures } from './geojson-features.js';

window.onload = () => {
    const existingPoints = new Set();
    const addPointToMap = point => {
        const { id, geojson } = point;
        if (!existingPoints.has(id)) {
            const map = document.querySelector('leaflet-map');
            const eventBus = map.eventBus;

            eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: geojson });
            existingPoints.add(id);
        }
    }

    [
        'drop-photo-for-exif:image',
        'drop-photo-for-exif:file',
        'drop-photo-for-exif:completed-batch',
        'x-leaflet-map:marker-removed'
    ].forEach(eventName => document.addEventListener(eventName, e => e.stopPropagation()))

    document.addEventListener('drop-photo-for-exif:image', (event) => {
        const data = event.detail;
        if (data.location) {
            GeoJSONFeatures.addPhoto(data);
        }
        else {
            alert(`The added photo '${data.name}' has no geolocation data`);
        }
    });

    document.addEventListener('drop-photo-for-exif:file', (event) => {
        const file = event.detail;
        const refreshTitle = title => {
            const eTitle = document.getElementById('title');
            eTitle.value = title;
        }

        if (GeoJSONFeatures.isGeojson(file)) GeoJSONFeatures.add(file, refreshTitle);
    });

    document.addEventListener('drop-photo-for-exif:completed-batch', (event) => {
        const points = GeoJSONFeatures.getGeoJSONPoints();
        points.forEach(addPointToMap);

        toggleSavingArea();
    });

    document.addEventListener('x-leaflet-map:marker-removed', (event) => {
        existingPoints.delete(id);
        toggleSavingArea();

        GeoJSONFeatures.remove(id);
    })


    const saving = document.getElementById('saving-area');
    const toggleSavingArea = () => saving.style.display = existingPoints.size > 0 ? 'flex' : 'none';
    toggleSavingArea();

    const save = document.getElementById('save-all');
    save.addEventListener('click', (event) => {
        event.stopPropagation();
        const title = document.getElementById('title').value || document.getElementById('title').placeholder
        GeoJSONFeatures.saveAllPoints(title);
    });

    const eTitle = document.getElementById('title');
    eTitle.value = eTitle.defaultValue;
}
