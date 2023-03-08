const getGeoJSONPoint = (lat, lng, alt) => {
    const lnglatalt = [lng, lat, alt]
        .filter((value) => !isNaN(value));

    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: lnglatalt
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
        const { latitude, longitude, altitude } = data.location;
        const [lat, lng] = DMS2Decimal(latitude, longitude);

        const point = getGeoJSONPoint(lat, lng);

        const map = document.querySelector('leaflet-map');
        const eventBus = map.eventBus;

        eventBus.dispatch('x-leaflet-map-geojson-add', { leafletMap: map, geojson: point })
    }
    else {
        alert(`The added photo '${data.name}' has no geolocation data`);
    }
});
