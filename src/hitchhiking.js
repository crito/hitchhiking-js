/**
 * hitchhiking.js - All javascript relevant to the hitchhiking project. 
 *
 * see: http://mariazendre.org/hitchhiking/
 * Use http://jsdoc.sourceforge.net/ to generate documentation
 */

// Create the global symbol "hike" if it doesn't exist.
// Throw an error if it does exist but is not an object
var hike;
if (!hike) hike = {};
else if (typeof hike != object)
    throw new Error("hike already exists and is not an object.");
if (!hike.map) hike.map = {};
else if (typeof hike.map != object)
    throw new Error("hike.map already exists and is not an object.");

hike.DEBUG = true;

/**
 * Log a debug statement to the console
 * @param {String} logmsg Message to log
 */
hike.log = function(logmsg) {
    if (hike.DEBUG) console.log(logmsg)
}

/**
 * All map operations are collected here. Invoke a map using the following syntax:
 * $(document).ready(function () {
 *    hike.map();
 *    //hike.map(16, 'active', 2000);
 * }
 * @param {Number} itinerary ID of the itinerary to load. If not specified, the active itinerary is used.
 * @param {String} active If set itinerary is active, and map is rendered every  given interval.
 * @param {Number} interval Interval in which to update the track in miliseconds.
 */
hike.map = function() {
    var points = new Array();
    var markers = new Array();

    var itinerary;
    var active = false;
    var interval = 30000;
    
    var lat = 52.368892;
    var lon = 4.888916;
    
    var map;
    var last_position;

    /**
     * Initialize the map.
     */
    function init() {
    map = new mxn.Mapstraction('real_map','openlayers');
    if (map) {
        //map.setCenterAndZoom(new mxn.LatLonPoint(lat,lon), 14);
        map.addControls({
            pan: false,
            zoom: 'small',
            map_type: false,
            overview: false,
            scale: true,
        });
    }
    }
    
    /**
     * Retrieve all gps positions/points for a given itinerary.
     */
    get_points = function get_points() {
    var url = '/hitchhiking/points/';
    if (itinerary) url = url + itinerary + '/';
    
    // If its an archive itinerary, make a GET request
    // otherwise make a POST request and send the last point.

    if (! active || ! last_position) {
        $.getJSON(url, function(){
            json = arguments[0];
            last_position = json.splice(-1);
            for (var i = 0; i < json.length; i++) {
                points.push(new mxn.LatLonPoint(parseFloat(json[i].fields.latitude), parseFloat(json[i].fields.longitude)));
            }
            render_track();
        });
    } else {
        timestamp = last_position[0].fields.timestamp;
        $.post(url, {"last_timestamp": timestamp}, function () {
            json = $.parseJSON(arguments[0]);
            last_position = json.splice(-1);
            for (var i = 0; i < json.length; i++) {
                points.push(new mxn.LatLonPoint(parseFloat(json[i].fields.latitude), parseFloat(json[i].fields.longitude)));
            }
            render_track();
        });
    }
    } 
    /**
     * Render the itinerary as a polyline.
     */
    function render_track() {
		map.removeAllPolylines();
        var track = new mxn.Polyline(points);
		track.setWidth(3);
		track.setColor("#CC0000");
		track.setOpacity(0.5);
        map.addPolyline(track);
        //map.setCenterAndZoom(new mxn.LatLonPoint(points[0].lat,points[0].lon), 14);
        map.autoCenterAndZoom();
    }
    
    // Evaluate all arguments of hike.map()
    if (arguments[0]) itinerary = parseInt(arguments[0]);
    if (arguments[1]) active = true;
    if (arguments[2]) interval = arguments[2];
    
    init();
    if (! active) { get_points(); }
    else { get_points(); window.setInterval('get_points()', interval); }
};


