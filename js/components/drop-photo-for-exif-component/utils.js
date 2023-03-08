function getDirname(src) {
    let dirname;
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
        if (script.src.endsWith(src)) {
            dirname = script.src.replace(src, '');
        }
    }

    return dirname;
}

export { getDirname }