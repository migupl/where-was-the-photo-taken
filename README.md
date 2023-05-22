# A photo location solution

Behind this solution is the location of the photo on a map based on its GPS metadata and adding information about it.

# Helpers

A [container is used for hot reloading](https://github.com/migupl/hot-reloading-container) during development.

The vanilla javascript Web Components for:
- [Dropping a photo and getting EXIF data](https://github.com/migupl/drop-photo-get-exif-data)
- [Locate the photo on a Leaflet map](https://github.com/migupl/vanilla-js-web-component-leaflet-geojson)

[StreamSaver.js](https://github.com/jimmywarting/StreamSaver.js) for [saving a zip archive](https://github.com/jimmywarting/StreamSaver.js/blob/master/examples/saving-multiple-files.html) containing all images and geojson files.