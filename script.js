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
				margin: 10px;\
				background-color: rgba(65, 49, 117, 0.8);\
				border: 1px solid #DCD7E9;\
				color: #DCD7E9;\
				border-radius: 3px;\
				padding: 10px;\
				font-size: 16;\
			";
			sidebar.appendChild(d);
		});

		sidebar.style.cssText = "\
			position:fixed;\
			top:0px;\
			left:0px;\
			width:30%;\
			height:100%;\
			background:rgba(19, 7, 58, 0.5);\
			box-shadow:inset 0 0 1em black;\
			z-index:999999;\
		";
		document.body.appendChild(sidebar);

		sidebarOpen = true;
	}
}


function openPrompter() {
	var prompter = document.createElement('div');
	prompter.id = "myPrompter";
	prompter.style.cssText = "\
		position:fixed;\
		top:0;\
		right:0;\
		padding:10px;\
		background:white;\
		border-radius:10px;\
		margin: 10px;\
		z-index: 1000000;\
		cursor: pointer;\
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
