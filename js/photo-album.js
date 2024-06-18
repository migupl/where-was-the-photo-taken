import { mapActions } from './map-actions.js';

window.onload = () => {

    const dialog = (() => {
        const node = document.getElementsByTagName('dialog')[0];

        node.addEventListener('close', event => {
            event.stopPropagation();
            node.style = 'display: none;'
        });

        const button = node.getElementsByTagName('button')[0];
        button.addEventListener('click', event => {
            event.stopPropagation();
            node.close()
        });

        return node;
    })();

    const projectTitle = (() => {
        const node = document.getElementById('title');

        const clear = () => set('');
        const get = () => node.value || node.placeholder;
        const set = title => node.value = title;

        return {
            clear, get, set
        }
    })();

    const setMapActions = () => {
        const actions = (() => {
            const node =  document.getElementById('saving-area');

            const hide = () => node.style.display = 'none'
            const show = () => node.style.display = 'flex'

            return mapActions(
                show,
                () => {
                    hide();
                    projectTitle.clear();
                }
            )
        })();

        const atDropEnds = () => {
            document.addEventListener('drop-photo-for-exif:completed-batch', _ => {
                dialog.close()

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
                actions.addGeojson(file, projectTitle.set);
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
                actions.removePoint(feature);
            })
        };

        const onSavingPage = () => {
            const save = document.getElementById('save-all');
            save.addEventListener('click', (event) => {
                event.stopPropagation();

                const title = projectTitle.get();
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

    setMapActions();

    projectTitle.clear();
    dialog.show();
}
