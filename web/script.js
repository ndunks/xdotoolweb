
// Debug and logging function
var DEBUG = false,
	DEBUG_EL = document.getElementById('debug');

if(!DEBUG)
	DEBUG_EL.remove();

function log(){
	if(!DEBUG) return;
	DEBUG_EL.innerText += Array.from(arguments).join(" ") + "\n";
	console.log.apply(this, arguments)
}

log('script.js');

// WebSocket
var WS	= new WebSocket("ws://" + location.hostname + ":8081")

WS.onclose = function(e)
{
	log('WS: CLOSE');
	alert('Connection closed, please reload.');
	location.reload()
}

WS.onerror = function(e)
{
	// alert('Connection error, please reload.');
	log('WS: ERROR')
}
WS.onopen = function(e)
{
	log('WS: OPEN')
}

WS.onmessage = function(e)
{
	console.log('WS:', e.data)
}

function cmdButtonClick(e)
{
	//Find correct button
	var btn = e.target, step = 0;

	while(!( btn.dataset && btn.dataset.cmd) && step < 5){
		step++;
		btn = btn.parentNode;
	}
	if(!btn)
	{
		alert('No cmd attribute, bad HTML or Scripting')
		return;
	}
	log('CMD:', btn.dataset.cmd);
	WS.send(btn.dataset.cmd);
}

// Init CMD Button
Array.from(document.querySelectorAll('[data-cmd]')).forEach(function(self, i){
	self.onclick = cmdButtonClick;
})

window.onerror = function (errorMsg, url, lineNumber) {
    log(errorMsg, url + ':' + lineNumber);
}

document.getElementById('sendtext').onkeypress = function(e){
	if(e.keyCode == 13)
	{
		log('Send: ' + this.value);
		WS.send('T' + this.value);
		this.value = "";
		return false;
	}
}