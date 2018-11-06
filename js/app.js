/**
 * @author: Upendra Sahoo
 * @since : 2018-Nov-6th
 * @Company: AT&T Inc.
 * @All Rights Reserved
 ***
 */

// Normally we'd have these in a database instead.
// But here we will define the Model.
var locations = [
    {title: 'American Museum of Natural History', lat: 40.781006, lng: -73.973363},
    {title: 'Central Park', lat: 40.784083, lng: -73.964853},
    {title: 'Columbia University', lat: 40.806290, lng: -73.963005},
    {title: 'Empire State Building', lat: 40.748817, lng: -73.985428},
    {title: 'One World Trade Center', lat: 40.712742, lng: -74.013382},
    {title: 'Statue of Liberty', lat: 40.689247, lng: -74.044502},
    {title: 'Times Square', lat: 40.758896, lng: -73.985130}
];
// Model end

// Create a styles array to use with the map.
var styles = [
    {
        'featureType': 'water',
        'stylers': [
            {'visibility': 'on'},
            {'color': '#b5cbe4'}
        ]
    },
    {
        'featureType': 'landscape',
        'stylers': [
            {'color': '#efefef'}
        ]
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry',
        'stylers': [
            {'color': '#83a5b0'}
        ]
    },
    {
        'featureType': 'road.arterial',
        'elementType': 'geometry',
        'stylers': [
            {'color': '#bdcdd3'}
        ]
    },
    {
        'featureType': 'road.local',
        'elementType': 'geometry',
        'stylers': [
            {'color': '#ffffff'}
        ]
    },
    {
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [
            {'color': '#e3eed3'}
        ]
    },
    {
        'featureType': 'administrative',
        'stylers': [
            {'visibility': 'on'},
            {'lightness': 33}
        ]
    },
    {
        'featureType': 'road'
    },
    {
        'featureType': 'poi.park',
        'elementType': 'labels',
        'stylers': [
            {'visibility': 'on'},
            {'lightness': 20}
        ]
    },
    {
        'featureType': 'road',
        'stylers': [
            {'lightness': 20}
        ]
    }
];

//set window height
$(document).ready(function () {
    function setHeight() {
        windowHeight = $(window).innerHeight();
        $('#map').css('min-height', windowHeight - 50);
        $('#sidebar').css('min-height', windowHeight - 50);
    }
    setHeight();

    $(window).resize(function () {
        setHeight();
    });
});

// Global variable to create a new Map
var map;

// Create placeMarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

// ViewModel start
function ViewModel() {
    let self = this;

    this.filterOption = ko.observable('');
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function (marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;

            let wikiUrl = 'https://en.wikipedia.org/wiki/' + marker.title.replace(/ /g, '_');

            // Url for Foursquare API
            let URL = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ',' + marker.lng +
                '&client_id=LZVATDU034CCJ5UQFHJR5W0RQKIH0L044IT1C24DIAY2VWPM' +
                '&client_secret=BQSPIW01PSEOAA0FHFAPLIJY4GAIUT1QDICUXPICIHIUDOOO' +
                '&query=' + marker.title + '&v=20181106' + '&m=foursquare';

            // Make FourSquare ajax request for venue info
            $.ajax(URL).done(function (marker) {
                let response = marker.response.venues[0];
                self.htmlContentFoursquare =
                    '<h5 class="venue_subtitle">(' + response.categories[0].shortName + ')</h5>' +
                    '<div>' + '<h6 class="venue_address_title"> Address: </h6>' +
                    '<p class="venue_address">' + response.location.formattedAddress[0] + '</p>' +
                    '<p class="venue_address">' + response.location.formattedAddress[1] + '</p>' +
                    '<br>' +
                    '<p class="venue_address"><b>Read more on <a href="' +
                    wikiUrl + '"rel="noopener noreferrer" target="_blank">Wikipedia</a></b></p>' +
                    '</div>' +
                    '</div>';
                infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
            }).fail(function () {
                alert('Failed to get venue information from Foursquare. Please try again!');
            });

            this.htmlContent = '<div>' + '<h4 class="venue_title">' + marker.title + '</h4>';
            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    this.populateListAndBounceMarker = function () {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    //initialize the Map
    this.initMap = function () {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'),
            {
                center: new google.maps.LatLng(40.7413549, -73.9980244),
                zoom: 13,
                styles: styles
            });

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        for (let x = 0; x < locations.length; x++) {
            this.markerTitle = locations[x].title;
            this.markerLat = locations[x].lat;
            this.markerLng = locations[x].lng;

            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: x,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateListAndBounceMarker);
        }
    };

    this.initMap();

    // This knockout function appends our locations to a list using data-bind
    // And make the filter work
    this.locationsFilter = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.filterOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);

    // Style the markers a bit. This will be our attractions marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    // Create the autoComplete object
    var autoComplete = new google.maps.places.Autocomplete(
        (document.getElementById('places-search')));

    // Listen for the event fired when the user selects a prediction and clicks
    // "Search" more details for that place.
    document.getElementById('go-places').addEventListener('click', textSearchPlaces);

    // This function firest when the user select "Search" on the places search.
    // It will do a nearby search using the entered query string or place.
    function textSearchPlaces() {
        var bounds = map.getBounds();
        hideMarkers(placeMarkers);

        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: document.getElementById('places-search').value,
            bounds: bounds
        }, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                createMarkersForPlaces(results);
            }
        });
    }

    // This function creates markers for each place found in either places search.
    function createMarkersForPlaces(places) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: defaultIcon,
                title: place.name,
                position: place.geometry.location,
                id: place.place_id
            });

            // Create a single infowindow to be used with the place details information
            // so that only one is open at once.
            var placeInfoWindow = new google.maps.InfoWindow();
            // If a marker is clicked, do a place details search on it in the next function.
            marker.addListener('click', function () {
                if (placeInfoWindow.marker === this) {
                    console.log('This infowindow already is on this marker!');
                } else {
                    getPlacesDetails(this, placeInfoWindow);
                }
            });

            // Two event listeners - one for mouseover, one for mouseout,
            // to change the colors back and forth.
            marker.addListener('mouseover', function () {
                this.setIcon(highlightedIcon);
            });

            marker.addListener('mouseout', function () {
                this.setIcon(defaultIcon);
            });

            placeMarkers.push(marker);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the attractions and hide them all.
    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    function getPlacesDetails(marker, infowindow) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Set the marker property on this infowindow so it isn't created again.
                infowindow.marker = marker;
                var innerHTML = '<div class="venue_address">';
                if (place.name) {
                    innerHTML += '<strong>' + place.name + '</strong>';
                }
                if (place.formatted_address) {
                    innerHTML += '<br>' + place.formatted_address;
                }
                if (place.formatted_phone_number) {
                    innerHTML += '<br>' + place.formatted_phone_number;
                }
                if (place.opening_hours) {
                    innerHTML += '<br><br><strong>Hours:</strong><br>' +
                        place.opening_hours.weekday_text[0] + '<br>' +
                        place.opening_hours.weekday_text[1] + '<br>' +
                        place.opening_hours.weekday_text[2] + '<br>' +
                        place.opening_hours.weekday_text[3] + '<br>' +
                        place.opening_hours.weekday_text[4] + '<br>' +
                        place.opening_hours.weekday_text[5] + '<br>' +
                        place.opening_hours.weekday_text[6];
                }
                if (place.photos) {
                    innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                        {maxHeight: 100, maxWidth: 200}) + '">';
                }
                innerHTML += '</div>';
                infowindow.setContent(innerHTML);
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                });
            }
        });
    }
}
// ViewModel end

function googleError() {
    alert('Google Maps did not load. Please refresh the page and try again!');
}

// This function controls execution of the app
function googleSuccess() {
    ko.applyBindings(new ViewModel());
}
