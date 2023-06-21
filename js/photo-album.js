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
                clearPageTitle();
            }
        }
    );

    [
        'drop-photo-for-exif:image',
        'drop-photo-for-exif:file',
        'drop-photo-for-exif:completed-batch',
        'x-leaflet-map:marker-removed'
    ].forEach(eventName => document.addEventListener(eventName, e => e.stopPropagation()))

    let imagesWithouLocation = [];
    document.addEventListener('drop-photo-for-exif:image', (event) => {
        const data = event.detail;
        if (data.location) {
            geojsonFeatures.addPhoto(data);
        }
        else {
            imagesWithouLocation.push(data.name);
        }
    });

    document.addEventListener('drop-photo-for-exif:file', (event) => {
        const file = event.detail;
        geojsonFeatures.add(file, refreshTitle);
    });

    document.addEventListener('drop-photo-for-exif:completed-batch', _ => {
        if (imagesWithouLocation.length > 0) {
            const imagesStr = imagesWithouLocation.map(name => `'${name}'`).join(', ');
            alert(`Added photos without geolocation metadata: ${imagesStr}.

You can check the images metadata at
https://migupl.github.io/drop-photo-get-exif-data/`);
            imagesWithouLocation = [];
        }
    })

    document.addEventListener('x-leaflet-map:marker-removed', (event) => {
        const { feature } = event.detail;
        geojsonFeatures.remove(feature);
    })

    document.addEventListener('x-leaflet-map:marker-pointed-out', event => {
        const { detail: { latlng } } = event;
        geojsonFeatures.addPoint(latlng);
    })

    const titleEl = document.getElementById('title');
    const refreshTitle = title => titleEl.value = title;

    const clearPageTitle = () => titleEl.value = '';
    clearPageTitle();

    const saving = document.getElementById('saving-area');
    const showSavingArea = () => saving.style.display = 'flex'
    const hideSavingArea = () => saving.style.display = 'none'

    const save = document.getElementById('save-all');
    save.addEventListener('click', (event) => {
        event.stopPropagation();

        const title = titleEl.value || titleEl.placeholder
        geojsonFeatures.saveAllPoints(title);
    });

    const getConfiguredHelperDialog = () => {
        const dialog = document.getElementsByTagName('dialog')[0];
        dialog.addEventListener('close', event => {
            event.stopPropagation();
            dialog.style = 'display: none;'
        });

        const closeDialog = dialog.getElementsByTagName('button')[0];
        closeDialog.addEventListener('click', event => {
            event.stopPropagation();
            dialog.close()
        });

        return dialog;
    }
    const helperDialog = getConfiguredHelperDialog();
    helperDialog.show();
}
