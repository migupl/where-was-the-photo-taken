class DropPhotoForExifData {

    static ALLOWED_MIMETYPES = new Map([
        ['jpg', 'image/jpeg'],
        ['jpeg', 'image/jpeg'],
        ['jfif', 'image/jpeg'],
        ['pjpeg', 'image/jpeg'],
        ['pjp', 'image/jpeg'],
        ['webp', 'image/webp'],
        ['png', 'image/png'],
        ['tif', 'image/tiff'],
        ['tiff', 'image/tiff']
    ]);

    extractExif = async (file) => {
        const exif = await ExifReader.load(file);
        let data = {
            details: exif
        };

        if (exif.GPSLatitude && exif.GPSLongitude && exif.GPSLongitudeRef) {
            data.location = {
                latitude: `${exif.GPSLatitude.description} ${exif.GPSLatitudeRef.value[0]}`,
                longitude: `${exif.GPSLongitude.description} ${exif.GPSLongitudeRef.value[0]}`
            }

            if (exif.GPSAltitude) {
                const [value, divisor] = exif.GPSAltitude.value;
                data.location.altitude = value / divisor;
            }
        }

        return data;
    }

    getAllowedMimetype = ext => {
        return DropPhotoForExifData.ALLOWED_MIMETYPES.get(ext) || ''
    }
}

const exifData = new DropPhotoForExifData();
export { exifData }