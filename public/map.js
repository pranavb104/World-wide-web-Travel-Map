//For the layer activations
var route = L.layerGroup();
var city_markers = L.layerGroup();

var nightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{username}/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 10,
    username: 'pranavb104',
    id: 'cks409l1x8ew018qgzyhu5q55',
    tileSize: 512,
    zoomOffset: -1,
    detectRetina: true,
    accessToken: 'pk.eyJ1IjoicHJhbmF2YjEwNCIsImEiOiJja3J5YzRmd2YweXJ2MndzN3AyYWdocWFvIn0.DXOVPli32grqP_Hj8hJIWQ'
});

var pinkMap = L.tileLayer('https://api.mapbox.com/styles/v1/{username}/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 10,
    username: 'pranavb104',
    id: 'cks4fzoj79ubb18nxk8ifzrf9',
    tileSize: 512,
    zoomOffset: -1,
    detectRetina: true,
    accessToken: 'pk.eyJ1IjoicHJhbmF2YjEwNCIsImEiOiJja3J5YzRmd2YweXJ2MndzN3AyYWdocWFvIn0.DXOVPli32grqP_Hj8hJIWQ'
});

 
var mymap = L.map('mapid', {
	center: [38.95, -4.21],
	zoom: 2,
	layers: [nightmap,route]
}); 

getMapData();

async function getMapData(){
	const data = { command:'getdata' }; 
	const options = {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify(data)
	    };

	const mapdata = await fetch('/latlon',options);
	const json = await mapdata.json();

	console.log(json.length);

	const map_color = ['orange', 'green', 'purple'];

	//Iterate through all data
	for (var i=0; i<json.length; i++){
		const site_name = json[i].site_name;
		const geoData = json[i].ipgeo;
		const errorCode = json[i].code;

		//Get unique color code
		const colorCode = map_color[i];
		//Get paths
		const pathCoords = connectTheDots(geoData);
		const popupContent = (getInfo(geoData));
		//Draw paths
		drawMarkers(pathCoords,colorCode,popupContent,site_name);
	} 
	
	//Print maps
	printmyMap();

	//Layer control
	var overlays = {
	"Routes": route,
	"Cities": city_markers
	};

	var baseLayers = {
		"NightMap": nightmap,
		"PinkMap": pinkMap
	};

	L.control.layers(baseLayers,overlays).addTo(mymap);

}

function printmyMap(){
	var customActionToPrint = function(context, mode) {
		return function() {
			window.alert("We are printing the MAP. Let's do Custom print here!");
			context._printCustom(mode);
		}
	}

	L.control.browserPrint({
		title: 'Print me!',
		documentTitle: 'Exclusively printed for the love of the internet',
		printLayer: L.tileLayer('https://api.mapbox.com/styles/v1/{username}/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
				    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				    minZoom: 2,
				    maxZoom: 18,
				    username: 'pranavb104',
				    id: 'cks409l1x8ew018qgzyhu5q55',
				    tileSize: 512,
				    zoomOffset: -1,
				    detectRetina: true,
				    accessToken: 'pk.eyJ1IjoicHJhbmF2YjEwNCIsImEiOiJja3J5YzRmd2YweXJ2MndzN3AyYWdocWFvIn0.DXOVPli32grqP_Hj8hJIWQ'
				}),
		closePopupsOnPrint: false,
		printModes: [
			L.control.browserPrint.mode.auto("Preferred", "A4")
		],
		manualMode: false
	}).addTo(mymap);
}


function drawMarkers(pathCoords,colorChoose,popupContent,site_name){

	//Marker additions
	for (var i = 0; i < pathCoords.length; i++) {
		var marker = new L.marker([pathCoords[i][0], pathCoords[i][1]], {icon: goldIcon}); 
		marker.addTo(mymap);

		const popupString = popupContent[i].toString();
		marker.bindPopup(popupString).addTo(city_markers);

		marker.on('mouseover', function (e) {
		    this.openPopup();
		});
		marker.on('mouseout', function (e) {
		    this.closePopup();
		});

	}

	//Line additions with animation
	var line = L.motion.polyline(pathCoords, {
						color: colorChoose
					}, {
						auto: true,
						duration: 5000,
						easing: L.Motion.Ease.easeInOutQuart
					},	{
						 removeOnEnd: true,
						 showMarker: false,
					}).addTo(mymap);

	line.bindPopup(site_name).openPopup().addTo(route);

	line.on('click', function (e) {
	    	this.openPopup();
		});

}

function getInfo(geoData){
    var c = [];
    for(i in geoData) {
    	const city = geoData[i].city;
        const lat = geoData[i].latitude;
        const lon = geoData[i].longitude;
        c.push([city,lat,lon]);
    }
    return c;
}

function connectTheDots(data){
    var c = [];
    for(i in data) {
        const x = data[i].latitude;
        const y = data[i].longitude;
        c.push([x, y]);
    }
    return c;
}