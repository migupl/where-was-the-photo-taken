function getExifReaderScript() {
    const dependency = {
        url: 'https://cdn.jsdelivr.net/npm/exifreader@4.12.0/dist/exif-reader.min.js'
    };

    let js = document.createElement('script');
    js.src = dependency.url;

    return js;
}

export { getExifReaderScript }