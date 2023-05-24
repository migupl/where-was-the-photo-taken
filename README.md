# A photo location solution

Behind this solution is the location of the photo on a map based on its GPS metadata and adding information about it.

For this we will combine the following Web Components:
- [Dropping a photo and getting EXIF data](https://github.com/migupl/drop-photo-get-exif-data)
- [Locate the photo on a Leaflet map](https://github.com/migupl/vanilla-js-web-component-leaflet-geojson)

## A use case

Let's suppose we have some photos of a trip

<img src="./docs/_lets_start_0.webp" width="75%" alt="Photos of a trip">

and we want to add information to have in the future.

As we can see in the animation below, the information will be saved in a [GeoJSON](https://geojson.org/) file for later use.

![Enrich photos](./docs/lets_start_1.webp)

The name for the saved file will be the text of the main input field. *Madrid trip* in this example.

If the browser supports the showSaveFilePicker() method of the Window interface, such as Chrome, you could choose the folder where the GeoJSON will be saved.

Then, by adding this GeoJSON file and the photos we can continue adding information to them as we can see below

![Continue with the photos](./docs/lets_continue.webp)

We can always add new photos, but only one GeoJSON file.

## Helpers

A [container is used for hot reloading](https://github.com/migupl/hot-reloading-container) during development.
