/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

 app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// id initialization
var id = 1;

function GeoTag(latitude,longitude,name,hashtag) {
    this.id = id++;
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
var geoTagArray = [];
var input;
const radius = 1;

var searchRadius = (geoBody) => {
    let searchArray = [];
    geoTagArray.forEach(function(arrayElement) {
        let latDifference = Math.abs(arrayElement.latitude - geoBody.latitude) ;
        let longDifference = Math.abs(arrayElement.longitude - geoBody.longitude);
        if ((latDifference + longDifference) <= radius) {
            searchArray.push(arrayElement);
        }
    });
    console.log(searchArray);
    return searchArray;
};

var searchText = (geoBody) => {
    let searchArray = [];
    geoTagArray.forEach(function(arrayElement) {
       if (arrayElement.name.includes(geoBody.name)) {
           searchArray.push(arrayElement);
       }
    });
    console.log(searchArray);
    return searchArray;
};

var addGeoTag = (geoBody) => {
   // var parsedBody = JSON.parse(geoBody);
    let geoTag = new GeoTag(geoBody.latitude, geoBody.longitude,
        geoBody.name, geoBody.hashtag);
    geoTagArray.push(geoTag);
    return geoTag.id;
};

var setInput = (geoBody) => {
    input = new GeoTag(geoBody.latitude, geoBody.longitude,
        geoBody.name, geoBody.hashtag);
};

var removeGeoTag = (geoBody) => {
    geoTagArray.filter(function(arrayElement){
        return geoBody.name === arrayElement.name
    }).forEach(function(arrayElement){
        geoTagArray.splice(geoTagArray.indexOf(arrayElement), 1);
    });
};

var findGeoTagById = (geoTagId, idCallback) => {
    let elementWithId;
    for (let counter = 0; counter < geoTagArray.length; counter++) {
        if (geoTagArray[counter].id == geoTagId) {
            console.log("HELLO");
            elementWithId = geoTagArray[counter];
        }
    }
    idCallback(elementWithId);
    // geoTagArray.forEach(idCallback,function(arrayElement) {
    //     if (arrayElement.id === geoTagId) {
    //        // elementWithId = 123;
    //     }
    //     itemsProcessed++;
    //     if(itemsProcessed === geoTagArray.length) {
    //         idCallback("123");
    //     }
    // });
};

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */


app.get('/', function(req, res) {
    res.render('gta', {
        taglist: geoTagArray,
        input: input
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

 app.post('/tagging', function(req, res) {
     console.log("TAGGING");
     if(input === undefined) {
         setInput(req.body);
     }
    addGeoTag(req.body);
     res.render('gta', {
        taglist: geoTagArray,
        input: input
    });
 });

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

 app.get('/discovery', function(req, res) {
    if(req.query.remove === "true"){
        console.log("REMOVE");
        removeGeoTag(req.query);
        res.render('gta', {
            taglist: geoTagArray,
            input: input
        });
    } else if(req.query.apply === "true"){
        console.log("APPLY");
        let searchArray;
        if(req.query.name === ''){
            console.log("RADIUS");
            searchArray = searchRadius(req.query)
        } else {
            console.log("TEXT");
            searchArray = searchText(req.query);
        }
        res.render('gta', {
            taglist: searchArray,
            input: input
        });
    }
 });

 /**
  * Route mit Pfad '/geotags' für HTTP  Requests.
  * (http://expressjs.com/de/4x/api.html)
  * */

app.get('/geotags', function(req, res) {
    console.log("GEOTAGS");
    if (req.query.search === "radius") {
        res.send(searchRadius(req.query))
    } else if (req.query.search === "text") {
        res.send(searchText(req.query));
    }
});

app.post('/geotags', function(req, res) {
    let id = addGeoTag(req.body);
    res.statusCode = 201;
    res.header('Location', req.url + "/" + id);
    res.end();
});

app.get('/geotags/:id', function(req, res) {
    console.log("HEY");
    findGeoTagById(req.params.id, function (elementWithId) {
        console.log(elementWithId);
        if (elementWithId !== undefined) {
            res.send(elementWithId);
        } else {
            res.statusCode = 404;
            res.send("ID NOT FOUND");
        }
    });
});

app.put('/geotags/:id', function(req, res) {
    findGeoTagById(req.params.id, function (elementWithId) {
        if (elementWithId !== undefined) {
            elementWithId.longitude = req.body.longitude;
            elementWithId.latitude = req.body.latitude;
            elementWithId.name = req.body.name;
            elementWithId.hashtag = req.body.hashtag;
            res.send(elementWithId);
        } else {
            res.statusCode = 404;
            res.send("ID NOT FOUND");
        }
    });
});

app.delete('/geotags/:id', function(req, res) {
    findGeoTagById(req.params.id, function (elementWithId) {
        if (elementWithId !== undefined) {
            removeGeoTag(elementWithId);
            res.statusCode = 202;
            res.end();
        } else {
            res.statusCode = 404;
            res.send("ID NOT FOUND");
        }
    });
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
