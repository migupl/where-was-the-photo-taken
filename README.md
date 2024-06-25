# Another way to view photos on a map

Behind this solution is the location of the photo on a map based on its GPS metadata and the ability to add information about it afterwards.

## A use case

Let's suppose we have some photos of a trip

<img src="./docs/lets_start_0.webp" width="75%" alt="Photos of a trip">

and we want to add information to have in the future.

As we can see in the video below,

https://github.com/migupl/where-was-the-photo-taken/assets/1670474/ae540af7-3a8e-4dd9-bc30-d59f51d55c3b

The information will be saved in a [GeoJSON](https://geojson.org/) file for later use. *Madrid.geojson* in this case where the name corresponds to the text of the main text field

The videos show the existing functionality although the actual layout is a bit different. As you can see below, files can be dragged or selected for uploading.

<img src="./docs/new_layout.webp" width="75%" style="" alt="New Layout">

Some time later we can retrieve the information by adding this GeoJSON file and the photos to work on them as we can see below

https://github.com/migupl/where-was-the-photo-taken/assets/1670474/0f442c0f-e4e4-4147-8ba6-bf7d749d901b

We can always add new photos, but only one GeoJSON file.

## Manually add a marker to the map

Add a marker is done clicking with the right button in any point of the map. This action opens a popup with a button for confirmation.

This marker will be draggable.

https://github.com/migupl/where-was-the-photo-taken/assets/1670474/4b8ce691-5d9c-4014-89bc-1787dc64baaa

## Remove a marker from the map

Any of the markers on the map can be deleted by double clicking on it and confirming the deletion.

https://github.com/migupl/where-was-the-photo-taken/assets/1670474/eecc83b4-5137-421f-bd50-0bab800fac09

## Helpers

A [container is used for hot reloading](https://github.com/migupl/hot-reloading-container) during development.

Web Components behind this idea are:
- [Dropping a photo and getting EXIF data](https://github.com/migupl/drop-photo-get-exif-data)
- [Locate the photo on a Leaflet map](https://github.com/migupl/vanilla-js-web-component-leaflet-geojson)
- [Yet Another GitHub Corner](https://github.com/migupl/yagc)

I hope you enjoy it!!!
