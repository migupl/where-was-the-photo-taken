const getGeoJSONPoint = (metadata) => {
    const { image, name, location } = metadata;
    const { latitude, longitude, altitude } = location;
    const [lat, lng] = DMS2Decimal(latitude, longitude);

    const lnglatalt = [lng, lat, altitude]
        .filter((value) => !isNaN(value));

    const template = document.getElementById('card-template');
    const clone = template.content.cloneNode(true);

    const img = clone.querySelector('img');
    img.src = URL.createObjectURL(image);
    img.alt = name;

    const title = clone.querySelector('h4');
    title.innerHTML = `<strong>${name}</strong>`;

    const trick = document.createElement('div');
    trick.appendChild(clone);

    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: lnglatalt
        },
        properties: {
            popupContent: trick.innerHTML
        }
    }
}

const extractNumeric = text => text.match(/[0-9.]/g).join('')

const DMS2Decimal = (latitude, longitude) => {
    let lat = extractNumeric(latitude);
    let lng = extractNumeric(longitude);

    if (latitude.toUpperCase().indexOf('S') > -1) lat = -lat;
    if (longitude.toUpperCase().indexOf('W') > -1) lng = -lng;

    return [lat, lng];
}

document.addEventListener("drop-photo-for-exif:data", (event) => {
    event.preventDefault();

    const data = event.detail;
    if (data.location) {
        const point = getGeoJSONPoint(data);

        const map = document.querySelector('leaflet-map');
        const eventBus = map.eventBus;

        eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: point })
    }
    else {
        alert(`The added photo '${data.name}' has no geolocation data`);
    }
});
