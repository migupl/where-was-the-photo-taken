import { GeoJSONFeatures } from './geojson-features.js';

window.onload = () => {

    const existingPoints = new Set();
    const addPoints = () => {
        const map = document.querySelector('leaflet-map');

        GeoJSONFeatures.getGeoJSONPoints()
            .filter(point => !existingPoints.has(point.id))
            .forEach(point => {
                const { id, geojson } = point;
                map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson-add', {
                    detail: {
                        geojson: geojson
                    }
                }));

                existingPoints.add(id);
            })

        toggleSavingArea();
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
        addPoints();
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
