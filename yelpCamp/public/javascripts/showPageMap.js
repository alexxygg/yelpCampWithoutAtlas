//Our token dynamically filled, in case it is changed, works through
//script on show page where we saved the ejs value to a variable */

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/outdoors-v11", // style URL
  //Hardcoded location, center of Tijuana
  // center: [-117.01238489411413, 32.511503684737576], // starting position [lng, lat]
  center: campground.geometry.coordinates,
  zoom: 10, // starting zoom
  projection: "globe", // display the map as a 3D globe
});
map.on("style.load", () => {
  map.setFog({}); // Set the default atmosphere style
});

new mapboxgl.Marker()
  // .setLngLat([-117.01238489411413, 32.511503684737576])
  .setLngLat(campground.geometry.coordinates)
  //A popup when clicking the pin on map, with some HTML
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${campground.title}</h6><p>${campground.location}</p>`
    )
  )
  .addTo(map);
