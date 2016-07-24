/*Handle requests from background.html*/
function handleRequest(
		//The object data with the request params
		request,
		//These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
		sender, sendResponse
	) {
	if (request.callFunction == "toggleSidebar")
		toggleSidebar();
}
chrome.extension.onRequest.addListener(handleRequest);

/*Small function wich create a sidebar(just to illustrate my point)*/
var sidebarOpen = false;
            //document.getElementById("content").innerHTML='<object type="type/html" data="home.html" ></object>';

function getData(url) {
	return [{'link': 'https://twitter.com/', 'content': 'This fact takes you to Twitter! '},
	{'link': 'https://twitter.com/', 'content': 'This fact also takes you to Twitter! :) '}];
}
function toggleSidebar() {
	if(sidebarOpen) {
		var el = document.getElementById('mySidebar');
		el.parentNode.removeChild(el);
		sidebarOpen = false;
	}
	else {
		var sidebar = document.createElement('div');
		sidebar.id = "mySidebar";
		var data = getData();
		data.forEach(function (item) {
			var d = document.createElement('div');
			var link = document.createElement('a');
			var linkText = document.createTextNode('Source');
			link.appendChild(linkText);
			link.href = item.link;

			link.style.csstext = "\
				color: #A1C5F0;\
				text-decoration: underline;\
			";

			var t = document.createTextNode(item.content);

			d.appendChild(t);
			d.appendChild(link);

			d.style.cssText = "\
				margin: 30px 15px;\
				color: black;\
				padding: 10px;\
				border-left: 4px #0077ff solid;\
			";
			sidebar.appendChild(d);
		});

		sidebar.style.cssText = "\
			position: fixed;\
			top: 0px;\
			left: 0px;\
			width: 30%;\
			height: 100%;\
			margin: 10px;\
			z-index: 999999;\
			background: white;\
			border-radius: 10px;\
			padding: 10px;\
			box-shadow: 0px 0px 5px 3px rgba(0,0,0,0.5);\
		";
		document.body.appendChild(sidebar);

		sidebarOpen = true;
	}
}
/* get the URL from the current tab in chrome */
 
var tab_url = "";
 $.ajax({
    type: "GET",
    url: "http://localhost:3000/api/fact"+ tab_url,
    data: data,
  }).done(function(data){ 
  	var data = data;
  }).fail(function(response){
  	console.log("There's an error");
  
  });

function openPrompter() {
	var prompter = document.createElement('div');
	prompter.id = "myPrompter";
	prompter.style.cssText = "\
		position:fixed;\
		top:0;\
		right:0;\
		padding:15px;\
		background:white;\
		border-radius:10px;\
		margin: 10px;\
		z-index: 1000000;\
		cursor: pointer;\
    box-shadow: 1px 1px 5px rgba(0,0,0,0.5);\
	";
    var numClaims = getData().length;
    var t = document.createTextNode('There are ' + numClaims + ' claims worth fact-checking on this page! Click to view');
	prompter.appendChild(t);
	prompter.onclick = function () {
    toggleSidebar();
	};
	document.body.appendChild(prompter);
}


openPrompter();


var head = document.getElementsByTagName('head')[0];
var style = document.createElement('style');
var declarations = document.createTextNode('#myPrompter:hover { background: #bbbbff !important; }');

style.type = 'text/css';

if (style.styleSheet) {
  style.styleSheet.cssText = declarations.nodeValue;
} else {
  style.appendChild(declarations);
}

head.appendChild(style);
