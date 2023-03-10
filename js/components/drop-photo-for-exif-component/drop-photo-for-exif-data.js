class DropPhotoForExifData {

    async extractExif(file) {
        let exif = await ExifReader.load(file);
        let data = {
            details: exif
        };

        if (exif.GPSLatitude && exif.GPSLongitude) {
            data.location = {
                latitude: `${exif.GPSLatitude.description} ${exif.GPSLatitudeRef.value[0]}`,
                longitude: `${exif.GPSLongitude.description} ${exif.GPSLongitudeRef.value[0]}`
            }
        }

        if (exif.GPSAltitude) {
            const [value, divisor] = exif.GPSAltitude.value;
            data.location.altitude = value / divisor;
        }

        return data;
    }
}

const exifData = new DropPhotoForExifData();
export { exifData }