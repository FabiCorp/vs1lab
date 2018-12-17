/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member
    var latitude;
    var longitude;
    var errorHandler = function(msg) {
      alert(msg);
    };

    var successHandler = function(geoObject) {
      latitude = getLatitude(geoObject);
      longitude = getLongitude(geoObject);
      $('#tag-latitude').attr("value", latitude);
      $('#tag-longitude').attr("value", longitude);
      $('#discovery-latitude').attr("value", latitude);
      $('#discovery-longitude').attr("value", longitude);
      var tags = [];

      var allListElements = $( "#result-img" ).attr("src",
      getLocationMapSrc(latitude, longitude, tags, 15));
      console.log(allListElements);
    };

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "IVzw5rTKYqyGceAgXPOxDTd3Gph0n2TS";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",


        updateLocation: function() {
            // TODO Hier Inhalt der Funktion "update" ergänzen

            if (document.getElementById("tag-latitude").value === '' &&
                document.getElementById("tag-longitude").value === '') {
                tryLocate(successHandler, errorHandler);
            } else {
                console.log("ALREADY EXISTS HAHA");
            }

        }

    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function() {
  //  alert("Please change the script 'geotagging.js'");
    gtaLocator.updateLocation();
});

function submitTagging() {
    console.log("TAGGING!");
    var xhttp = new XMLHttpRequest();
    var params = {
        latitude:$('#tag-latitude').val(),
        longitude:$('#tag-longitude').val(),
        name:$('#tag-name').val(),
        hashtag:$('#tag-hashtag').val()};
    xhttp.open("POST","/tagging", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(params));
    $("#discovery-div").load(window.location.href+" #discovery-div");
    return false;
}

function submitApply() {
    console.log("APPLY!");
    var xhttp = new XMLHttpRequest();
    var params = "latitude=" + $('#discovery-latitude').val()+
        "&longitude="+$('#discovery-longitude').val()+
        "&name="+$('#discovery-search').val()+
        "&apply="+"true";
    xhttp.open("GET","/discovery?"+params, true);
    xhttp.send(null);
    $("#discovery-div").load(window.location.href+"discovery?"+ params +" #discovery-div");
}

function submitRemove() {
    console.log("REMOVE!");
    var xhttp = new XMLHttpRequest();
    var params = "latitude=" + $('#discovery-latitude').val()+
        "&longitude="+$('#discovery-longitude').val()+
        "&name="+$('#discovery-search').val()+
        "&remove="+"true";
    xhttp.open("GET","/discovery?"+params, true);
    xhttp.send(null);
    $("#discovery-div").load(window.location.href+" #discovery-div");
}