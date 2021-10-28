let website ;
let return_website;

async function getText(){
	website = document.getElementById("text").value;
	var form = document.getElementById('text');
	form.value = '';
	//console.log(website);
	
	const data = { website };
	//console.log (data);

	const options = {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify(data)
	    };

	//console.log("calling");
	const logs = await fetch('/text', options);
	const json = await logs.json();
	document.getElementById("response").textContent = json.logs;
	console.log(json);
}
 
