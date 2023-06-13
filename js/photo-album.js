import { GeoJSONFeatures } from './geojson-features.js';

window.onload = () => {

    let points = 0;
    const map = document.querySelector('leaflet-map');
    const geojsonFeatures = new GeoJSONFeatures(
        feature => {
            map.dispatchEvent(new CustomEvent('x-leaflet-map-geojson-add', {
                detail: {
                    geojson: feature
                }
            }));

            points++;
            showSavingArea();
        },
        () => {
            points--;
            if (!points) {
                hideSavingArea();
            }
        }
    );

    [
        'drop-photo-for-exif:image',
        'drop-photo-for-exif:file',
        'drop-photo-for-exif:completed-batch',
        'x-leaflet-map:marker-removed'
    ].forEach(eventName => document.addEventListener(eventName, e => e.stopPropagation()))

    document.addEventListener('drop-photo-for-exif:image', (event) => {
        const data = event.detail;
        if (data.location) {
            const feature = geojsonFeatures.addPhoto(data);
        }
        else {
            alert(`The added photo '${data.name}' has no geolocation data`);
        }
    });

    const titleEl = document.getElementById('title');
    const refreshTitle = title => titleEl.value = title;

    document.addEventListener('drop-photo-for-exif:file', (event) => {
        const file = event.detail;
        geojsonFeatures.add(file, refreshTitle);
    });

    document.addEventListener('drop-photo-for-exif:completed-batch', (event) => {
        console.log(event)
    });

    document.addEventListener('x-leaflet-map:marker-removed', (event) => {
        const { feature } = event.detail;
        geojsonFeatures.remove(feature);
    })

    document.addEventListener('x-leaflet-map:marker-pointed-out', event => {
        const { detail: { latlng } } = event;
        geojsonFeatures.addPoint(latlng);
    })

    const saving = document.getElementById('saving-area');
    const showSavingArea = () => saving.style.display = 'flex'
    const hideSavingArea = () => saving.style.display = 'none'

    const save = document.getElementById('save-all');
    save.addEventListener('click', (event) => {
        event.stopPropagation();

        const title = titleEl.value || titleEl.placeholder
        geojsonFeatures.saveAllPoints(title);
    });
}
