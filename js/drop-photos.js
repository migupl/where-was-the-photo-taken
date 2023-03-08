document.addEventListener("drop-photo-for-exif:data", (event) => {
    event.preventDefault();

    const data = event.detail;
    console.log('Photo:metadata', data);
});
