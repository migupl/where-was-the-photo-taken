function getExifReaderScript() {
    const dependency = {
        url: 'https://cdn.jsdelivr.net/npm/exifreader'
    };

    let js = document.createElement('script');
    js.src = dependency.url;

    return js;
}

export { getExifReaderScript }