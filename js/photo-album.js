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
            savingAreaShow();
        },
        () => {
            points--;
            if (!points) {
                savingAreaHide();
                pageTitleClear();
            }
        }
    );

    const stopEventPropagationOnDocument = () => {
        [
            'drop-photo-for-exif:image',
            'drop-photo-for-exif:file',
            'drop-photo-for-exif:completed-batch',
            'x-leaflet-map:marker-removed'
        ].forEach(eventName => document.addEventListener(eventName, e => e.stopPropagation()))
    }

    const addActionsOnDocumentEvents = () => {
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
            geojsonFeatures.add(file, pageTitleSet);
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
    }

    const addActionOnSavePage = () => {
        const save = document.getElementById('save-all');
        save.addEventListener('click', (event) => {
            event.stopPropagation();

            const title = pageTitleContent();
            geojsonFeatures.saveAllPoints(title);
        });
    }

    const addHelperDialogAndGetIt = () => {
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

    const pageTitle = () => document.getElementById('title');
    const pageTitleClear = () => pageTitle().value = '';
    const pageTitleContent = () => {
        const titleEl = pageTitle();
        return titleEl.value || titleEl.placeholder;
    }
    const pageTitleSet = title => pageTitle().value = title;

    const savingArea = () => document.getElementById('saving-area');
    const savingAreaHide = () => savingArea().style.display = 'none'
    const savingAreaShow = () => savingArea().style.display = 'flex'

    pageTitleClear();

    const helperDialog = addHelperDialogAndGetIt();
    helperDialog.show();

    addActionOnSavePage();

    stopEventPropagationOnDocument();
    addActionsOnDocumentEvents();
}
