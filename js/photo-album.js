import { mapActions } from './map-actions.js';

window.onload = () => {

    const setMapActions = () => {
        const actions = (() => {
            return mapActions(
                savingAreaShow,
                () => {
                    savingAreaHide();
                    pageTitleClear();
                }
            )
        })();

        const atDropEnds = () => {
            document.addEventListener('drop-photo-for-exif:completed-batch', _ => {
                helperDialog.close()

                if (imagesWithoutLocation.length > 0) {
                    const imagesStr = imagesWithoutLocation.map(name => `'${name}'`).join(', ');
                    alert(`Added photos without geolocation metadata: ${imagesStr}.

You can check the images metadata at
https://migupl.github.io/drop-photo-get-exif-data/`);
                    imagesWithoutLocation = [];
                }
            })

        };

        let imagesWithoutLocation = [];

        const onAddingPoint = () => {
            document.addEventListener('x-leaflet-map:marker-pointed-out', event => {
                const { detail: { latlng } } = event;
                actions.addPoint(latlng);
            })
        };

        const onDroppingGeojsonFile = () => {
            document.addEventListener('drop-photo-for-exif:file', (event) => {
                const file = event.detail;
                actions.addGeojson(file, pageTitleSet);
            });
        };

        const onDroppingPhoto = () => {
            document.addEventListener('drop-photo-for-exif:image', (event) => {
                const data = event.detail;
                if (data.location) {
                    actions.addPhoto(data);
                }
                else {
                    imagesWithoutLocation.push(data.name);
                }
            });
        };

        const onRemovingPoint = () => {
            document.addEventListener('x-leaflet-map:marker-removed', (event) => {
                const { feature } = event.detail;
                actions.remove(feature);
            })
        };

        const onSavingPage = () => {
            const save = document.getElementById('save-all');
            save.addEventListener('click', (event) => {
                event.stopPropagation();

                const title = pageTitleContent();
                actions.saveAllPoints(title);
            });
        };

        const stopEventsPropagation = () =>  [
            'drop-photo-for-exif:image',
            'drop-photo-for-exif:file',
            'drop-photo-for-exif:completed-batch',
            'x-leaflet-map:marker-removed',
            'x-leaflet-map:marker-pointed-out'
        ].forEach(eventName => { 
            document.addEventListener(eventName, e => e.stopPropagation())
        });

        stopEventsPropagation()

        onDroppingGeojsonFile()
        onDroppingPhoto()
        atDropEnds()

        onAddingPoint()
        onRemovingPoint()
        onSavingPage()
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

    setMapActions();
}
