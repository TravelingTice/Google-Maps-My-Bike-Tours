// The lines object contains all the trips (lines) and those contain all the markers.
const lines = {
  none: [],
  ImHere: [],
  // Add your lines here: LINENAME: [];
  EUp1: [],
  EUp2P: [],
  EUp2: []
};

const  lineIntervals = {
  none: 0,
  ImHere: 0,
  // Add intervals here
  EUp1: 60,
  EUp2P: 0,
  EUp2: 60
}

// Here you can style your lines if you need to
const lineStyles = {
  EUp1: {
    strokeWeight: 1.5,
  },
  EUp2P: {
    strokeWeight: 1,
    strokeOpacity: 0.5
  }
}

/* WORDPRESS:
* imgPath = http(s)://travelingtice.com/wp-content/uploads/2018/...
* jsonPath = http(s)://travelingtice.com/wp-content/uploads/2018/3/locations.json
*/
const iconPath = 'images/icons/'
const imgPath = 'images/'
const jsonPath = 'scripts/'

let map; // Global variables map
// Status of the map
let mapLoaded = false;

// Map gets initialized
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 53.661212, lng: 10.898780 },
    zoom: 5
  });
  getMarkers();
}

// Get markers from database
function getMarkers() {
  let locations = [];
  // Get info of all locations
  fetch(`${jsonPath}locations.json`).then(resp => resp.json()).then(resp => {
    locations = resp;
    makeMarkers(locations);
  });
}

// Instantiate marker objects from the markers we passed in
function makeMarkers(locations) {
  // Create 1 infowindow so 1 gets shared by all the markers
  const infoWindow = new google.maps.InfoWindow();
  locations.forEach((location, i) => {
    // Check if location has these optional props
    const links = location.links ? location.links : null;
    const youtube = location.youtube ? location.youtube : null;
    const img = location.img ? imgPath + location.img : null;
    const rideData = location.rideData ? location.rideData : null;
    const icon = location.icon ? iconPath + location.icon : null;
    const line = location.line ? location.line : 'none';
    const zIndex = location.zIndex ? location.zIndex : 1;
    const animation = location.animation === false ? null : google.maps.Animation.DROP;
    // Create marker object
    const marker = new google.maps.Marker({
      map: null,
      animation,
      id: i,
      // Assign props all locations have
      position: location.location,
      title: location.title,
      date: location.date,
      description: location.description,
      // Optional props
      youtube,
      img,
      rideData,
      links,
      icon,
      zIndex,
      line
    });
    // Push all markers to appropriate array
    for (const lineName in lines) {
      if (marker.line === lineName) {
        lines[lineName].push(marker)
      }
    }
    // Create click event to open/close infowindow at each marker
    marker.addListener('click', function() {
      if (infoWindow.marker != marker) {
        populateInfoWindow(this, infoWindow);
      } else {
        infoWindow.close();
        infoWindow.marker = null;
      }
    });
  });
  // When the tiles of the map are loaded, display the markers one by one on the map
  const listener1 = google.maps.event.addListener(map, 'tilesloaded', () => {
    openMarkers();
  });
}

function openMarkers() {
  // Go through all marker arrays and filter them so right animation is applied.
  if (!mapLoaded) {
    let longestArray = [];
    let longestArrayName;
    let interval;
    let longestInterval;
    for (const line in lines) {
      const markerArray = lines[line];
      // Set longestArray to this array if it is the longest
      if (markerArray.length > longestArray.length) {
        longestArray = markerArray;
        longestArrayName = line;
      }
      // Choose interval for our arrays
      for (const thisLine in lineIntervals) {
        if (longestArrayName === thisLine) {
          longestInterval = lineIntervals[thisLine];
        }
        if (thisLine === line) {
          if (line !== 'ImHere') {
            interval = lineIntervals[line];
            openMarkerArray(markerArray, 0, interval, line)
          }
        }
      }
    }
    interval = longestArray.length * longestInterval + 1000;
    openImHereMarker(interval);
    mapLoaded = true;
  }
}

// The 'I'm Here' marker will be spawned last
function openImHereMarker (interval) {
  for (const line in lines) {
    if (line === 'ImHere') {
      const ImHereMarker = lines[line];
      openMarkerArray(ImHereMarker, 0, interval, line);
    }
  }
}

// This sets each marker in the array to map.
function openMarkerArray(array, i, interval, line) {
  setTimeout(() => {
    const marker = array[i];
    ++i;
    if (i <= array.length) {
      marker.setMap(map);
      openMarkerArray(array, i, interval, line);
    } else {
      switch (line) {
        case 'none':
          // Open no line
          break;
        case 'ImHere':
          // Open no line
          break;
        default:
          openLine(array, line);
      }
    }
  }, interval);
}

// This one draws the line to the map
function openLine(array, line) {
  const points = [];
  array.forEach(marker => {
    points.push(marker.position);
  });
  let polylineOptions = { strokeWeight: 1.5 };
  // Options for the polyline (derived from lineStyles)
  for (const styleLine in lineStyles) {
    if (styleLine === line) {
      polylineOptions = lineStyles[styleLine];
    }
  }
  // Create polyline
  const polyline = new google.maps.Polyline( polylineOptions );
  // Set path to path we created using the markers
  polyline.setPath(points);
  // Set polyline to our map
  polyline.setMap(map);
}

// Open infowindow at marker
function populateInfoWindow(marker, infowindow) {
  // Check to make sure infowindow is not open already on this marker
  const html = generateHtmlInfowindow(marker);
  infowindow.marker = marker;
  infowindow.setContent(html);
  infowindow.open(map, marker);
  // make sure marker is properly cleared if infowindow is closed
  infowindow.addListener('closeclick', () => infowindow.marker = null);
  // also add event listener to our map, so you can click on the map to close the infowindow as well.
}

// Return html that is content of our infowindow
function generateHtmlInfowindow(marker) {
  let html = `<div class="infowindow"><div class="heading"><img id="icon" src="${marker.icon}" alt="marker"><h1>${marker.title}</h1></div><div class="main-infowindow-content">`;
  // Check if marker has description, img, yt etc.. And generate html accordingly

  // has description
  if (marker.description) {
    html += '<div class="description">';
    // has date
    if (marker.date) {
      html += `<p class="date">${marker.date}</p>`;
    }
    html += `<p>${marker.description}</p>`;
  } else if (marker.date) {
    // has no description but has date
    html += `<div class="description"><p class="date">${marker.date}</p>`;
  } else {
    // has no description and no date
    html += '<div class="description">';
  }

  // has links
  if (marker.links) {
    html += `<div class="links"><p>${marker.links.title}</p>`;
    marker.links.links.forEach(link => {
      html += `<a href="${link.link}" target="_blank">${link.name}</a><br>`;
    });
    html += '</div>';
  }
  if (marker.rideData) {
    html += `<div class="rideData"><a href="${marker.rideData}" target="_blank">View ride data</a></div>`
  }
  html += '</div>'

  if (marker.img) {
    html += `<img src="${marker.img}" alt="${marker.title}">`;
  }
  if (marker.youtube) {
    html += `<iframe width="446" height="251" src="https://www.youtube.com/embed/${marker.youtube}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  html += '</div>';

  return html;
}
