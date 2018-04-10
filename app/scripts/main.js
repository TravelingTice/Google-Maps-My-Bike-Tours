(function($){

    var $w=$(window);
    $.fn.visible = function(partial,hidden,direction,container){

        if (this.length < 1)
            return;

	// Set direction default to 'both'.
	direction = direction || 'both';

        var $t          = this.length > 1 ? this.eq(0) : this,
						isContained = typeof container !== 'undefined' && container !== null,
						$c				  = isContained ? $(container) : $w,
						wPosition        = isContained ? $c.position() : 0,
            t           = $t.get(0),
            vpWidth     = $c.outerWidth(),
            vpHeight    = $c.outerHeight(),
            clientSize  = hidden === true ? t.offsetWidth * t.offsetHeight : true;

        if (typeof t.getBoundingClientRect === 'function'){

            // Use this native browser method, if available.
            var rec = t.getBoundingClientRect(),
                tViz = isContained ?
												rec.top - wPosition.top >= 0 && rec.top < vpHeight + wPosition.top :
												rec.top >= 0 && rec.top < vpHeight,
                bViz = isContained ?
												rec.bottom - wPosition.top > 0 && rec.bottom <= vpHeight + wPosition.top :
												rec.bottom > 0 && rec.bottom <= vpHeight,
                lViz = isContained ?
												rec.left - wPosition.left >= 0 && rec.left < vpWidth + wPosition.left :
												rec.left >= 0 && rec.left <  vpWidth,
                rViz = isContained ?
												rec.right - wPosition.left > 0  && rec.right < vpWidth + wPosition.left  :
												rec.right > 0 && rec.right <= vpWidth,
                vVisible   = partial ? tViz || bViz : tViz && bViz,
                hVisible   = partial ? lViz || rViz : lViz && rViz,
		vVisible = (rec.top < 0 && rec.bottom > vpHeight) ? true : vVisible,
                hVisible = (rec.left < 0 && rec.right > vpWidth) ? true : hVisible;

            if(direction === 'both')
                return clientSize && vVisible && hVisible;
            else if(direction === 'vertical')
                return clientSize && vVisible;
            else if(direction === 'horizontal')
                return clientSize && hVisible;
        } else {

            var viewTop 				= isContained ? 0 : wPosition,
                viewBottom      = viewTop + vpHeight,
                viewLeft        = $c.scrollLeft(),
                viewRight       = viewLeft + vpWidth,
                position          = $t.position(),
                _top            = position.top,
                _bottom         = _top + $t.height(),
                _left           = position.left,
                _right          = _left + $t.width(),
                compareTop      = partial === true ? _bottom : _top,
                compareBottom   = partial === true ? _top : _bottom,
                compareLeft     = partial === true ? _right : _left,
                compareRight    = partial === true ? _left : _right;

            if(direction === 'both')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop)) && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
            else if(direction === 'vertical')
                return !!clientSize && ((compareBottom <= viewBottom) && (compareTop >= viewTop));
            else if(direction === 'horizontal')
                return !!clientSize && ((compareRight <= viewRight) && (compareLeft >= viewLeft));
        }
    };

})(jQuery);
/* global google */
// The lines object contains all the trips (lines) and those contain all the markers
const lines = {
  none: [],
  ImHere: [],
  // Add your lines here: LINENAME: [];
  EUp1: [],
  EUp2: [],
  EUp2P: []
};

const  lineIntervals = {
  none: 0,
  ImHere: 0,
  // Add intervals here
  EUp1: 30,
  EUp2: 30,
  EUp2P: 0
}

// Here you can style your lines if you need to
const lineStyles = {
  EUp1: {
    name: 'EUp1',
    strokeWeight: 1.5
  },
  EUp2: {
    name: 'EUp2',
    strokeWeight: 1.5
  },
  EUp2P: {
    name: 'EUp2P',
    strokeWeight: 1,
    strokeOpacity: 0.5
  }
}

// Add optional KML Lines
const kmlLines = {
  EUp1: {
    url: 'http://travelingtice.com/wp-content/uploads/google-maps/kml/EUp1.kml'
  }
}

const iconPath = '/images/icons/'// 'http://travelingtice.com/wp-content/uploads/google-maps/icons/';
const imgPath = '/images/'// 'http://travelingtice.com/wp-content/uploads/google-maps/images/';
const jsonPath = '/scripts/Utils/'// 'http://travelingtice.com/wp-content/uploads/google-maps/';

let map; // Global variables map
// Status of the map
let mapLoaded = false;
// Status of KML layer on the map
let isKmlOnMap = false;

// All of our polylines
let polylines = [];

// All of our KML layers
let kmlLayers = [];

// Map gets initialized
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 53.661212, lng: 10.898780 },
    zoom: 4
  });
  getMarkers();
  getKmlLines();
  addBtnListener();
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
        map.addListener('click', function() {
          infoWindow.close();
          infoWindow.marker = null;
        })
      } else {
        infoWindow.close();
        infoWindow.marker = null;
      }
    });
  });
}

$(window).scroll(function() {
  const mapVisible = $('#map').visible(true);
  if (mapVisible) {
      openMarkers();
    $(window).off('scroll');
  }
})

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
      // Last marker is ImHere, so after this, our map is loaded!
      if (line === 'ImHere') {
        mapLoaded = true;
      }
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
  let polylineOptions = { strokeWeight: 1.5, name: line };
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
  // Push to polyline array
  polylines.push(polyline);
}

// This closes the line that is connected between marker of a certain line with name
function closeALine(line) {
  polylines.forEach(polyline => {
    if (polyline.name === line) {
      polyline.setMap(null);
    }
  });
}

// Closes all polylines
function closeAllLines() {
  polylines.forEach(polyline => {
    polyline.setMap(null);
  });
}

// Opens all polylines
function openAllLines() {
  polylines.forEach(polyline => {
    polyline.setMap(map);
  });
}
// This one opens all our markers, if they have been closed before
function openAllMarkers() {
  for (const lineName in lines) {
    const markerArray = lines[lineName];
    markerArray.forEach(marker => {
      marker.setMap(map);
    });
  }
}
// This one closes all our markers, that are not ImHere
function closeAllMarkers() {
  for (const lineName in lines) {
    const markerArray = lines[lineName];
    markerArray.forEach(marker => {
      marker.setMap(null);
    });
  }
}
// Gets all KML files from url in kmlLines object and does not display them
function getKmlLines() {
  for (const line in kmlLines) {
    const url = kmlLines[line].url;
    const kml = new google.maps.KmlLayer({
      url,
      map: null,
      preserveViewport: true,
      suppressInfoWindows: true
    });
    kmlLayers.push(kml);
  }
}
// Open KML layers
function openKmlLines() {
  kmlLayers.forEach(layer => {
    layer.setMap(map);
  });
}
// Close KML layers
function closeKmlLines() {
  kmlLayers.forEach(layer => {
    layer.setMap(null);
  });
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
    html += '<div class="left-panel">';
    // has date
    if (marker.date) {
      html += `<p class="date">${marker.date}</p>`;
    }
    html += `<p class="description">${marker.description}</p>`;
  } else if (marker.date) {
    // has no description but has date
    html += `<div class="left-panel"><p class="date">${marker.date}</p>`;
  } else {
    // has no description and no date
    html += '<div class="left-panel">';
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
    html += `<iframe width="391" height="220" src="https://www.youtube.com/embed/${marker.youtube}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  html += '</div>';

  return html;
}

function addBtnListener() {
  const btn1 = document.getElementById('show-route');
    btn1.addEventListener('click', () => {
      if (mapLoaded) {
        if (!isKmlOnMap) {
          closeAllLines();
          closeAllMarkers();
          openKmlLines();
          btn1.innerHTML = 'Hide Ridden Route';
        } else {
          closeKmlLines();
          openAllMarkers();
          openAllLines();
          btn1.innerHTML = 'Show Ridden Route';
        }
        isKmlOnMap = !isKmlOnMap;
      }
  });
}

function googleError() {
  const theMap = document.getElementById('map');
  const html = 'Unfortunately the map was not able to load 😢. Try reloading the page. If you are using Safari, Opera or Internet Explorer, it might not work for now. Try using <a href="https://www.google.com/chrome/">Google Chrome</a>.';
  theMap.innerHTML = html;
}
