const express = require('express')
const Datastore = require('nedb');
const Traceroute = require('nodejs-traceroute');
const fetch = require('node-fetch'); 
const app = express();
const port = 3000; 

// Geolocation API 
const ENDPOINT = 'https://api.ipgeolocation.io/ipgeo' 
const API_KEY = '81ea148f1a084a0384568ac388812177'
const FIELDS = '&fields=latitude,longitude,city' 


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(express.static('public'));
app.use(express.json({ limit: '1mb'}));
 
//Database for ipgeolocation
const database = new Datastore('database.db');
database.loadDatabase(); 


//Traceroute and ipgeolocation functions
app.post('/text', async (request, response) => { 

	var incoming_data = [];
	let name = request.body;
	const website_name = name.website;

	try {

    const tracer = new Traceroute();
    tracer
        .on('pid', (pid) => {
        	name.pid = pid;
            console.log(`pid: ${pid}`);
        })
        .on('destination', (destination) => {
            //console.log(`destination: ${destination}`);
        })
        .on('hop', (hop) => {
        	if(incoming_data.length > 15){//If hops take too long to complete
        		process.kill(name.pid, 'SIGTERM');
        	}else {
	        	var arr = {};
	        	arr.ip = hop.ip;
	        	incoming_data.push(arr);//Push all ips into a json object for parsing in orderly fashion
	        	console.log(`hop: ${JSON.stringify(hop.ip)}`);
	        }
        })
        .on('close', async (code) => {
        	//console.log(incoming_data);
        	const logs = await getIPData(code,website_name,incoming_data);
        	const results = {};
        	results.web = website_name;
        	results.log = logs;
	    	response.json(results);
            console.log(`close: code ${code}`);
        });

    tracer.trace(website_name);
    
	} catch (ex) {
	    console.log(ex);
	    const results = {};
	    results.logs = "Invalid website name, try a new one";
	    response.json(results)
	}
}); 

const getIPData = async (code,website_name,incoming_data) => {

	//Filter loop
	for (var i = incoming_data.length - 1; i >= 0; i--) {
		//Filter out any ip hops
	    if (incoming_data[i].ip == "*") { 
	        incoming_data.splice(i, 1);
	    }
	}
	
	//HTTP request for IP Geolocation
	var obj = {};
	obj.site_name = website_name;
	obj.ipgeo = [];
	for (var i=0; i<incoming_data.length; i++) {
		const URL = ENDPOINT + '?apiKey=' + API_KEY + '&ip=' + incoming_data[i].ip + FIELDS ;
		try{
			const ip_response = await fetch(URL);
			var ip_data = await ip_response.json();
			if(ip_data.hasOwnProperty('message')) {//Filter out bogon ips with china
				ip_data = {"ip":"101.87.83.120","latitude":"39.90657","longitude":"116.38765","city":"Beijing","type":"Bogon IP"};
				code = 2;
			} 
			obj.ipgeo.push(ip_data); 
		}catch (e) {
	        console.error(e);
	        code = 1;
	        break;
	    }
	}
	//Add the resulting code for reference
	obj.code = code;
	//Logging errors and successes
	switch (code){
		case 1:
			return "Problem in connecting with IPGeo server...."
			break;
		case null:
			database.insert(obj);
			return "Mapping succeeded, but may be incomplete...."
			break;
		case 0:
			database.insert(obj);
			return "Mapping succeded!!";
			break;
		case 2:
			database.insert(obj);
			return "Mapping succeded, but found some strange results...."
			break;
	}
}



//Post map data
app.post('/latlon', (request, response) => {
	const incoming = request.body;

	if(incoming.command = "getdata"){
		//Send data to map server
		database.find({}, function (err,data) {
		  	if (err) {
		      response.end();
		      return;
		    }else{
		    	response.json(data);
		    }
		});


	}else {
	  response.end();
      return;
	}

});






