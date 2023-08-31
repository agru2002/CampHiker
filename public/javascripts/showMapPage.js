

// this code runs in browser
mapboxgl.accessToken = mapBoxToken;
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: campground.geometry.coordinates, // starting position [lng, lat]
      zoom: 8 // starting zoom
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-right');

  const marker = new mapboxgl.Marker()  //mapboxgl is library,  Creating new instance of marker (pointer)
  .setLngLat(campground.geometry.coordinates) //setting its long. lat.
  .setPopup(                                        //find from google
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
                )
            )
  .addTo(map); //adding it to map