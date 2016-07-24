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
	return ['fact check 1', 'fact check 2'];
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
		data.forEach(function (text) {
			var d = document.createElement('div');
			var t = document.createTextNode(text); 

			/*d.style.cssText = "\
				margin: 10px;\
				background-color: #AAFFFF;\
			";

			t.style.cssText = "\
				padding: 10px;\
				font-size: 16;\
			";*/
			d.appendChild(t);
			sidebar.appendChild(d);
		});

		sidebar.style.cssText = "\
			position:fixed;\
			top:0px;\
			left:0px;\
			width:30%;\
			height:100%;\
			background:white;\
			box-shadow:inset 0 0 1em black;\
			z-index:999999;\
		";
		document.body.appendChild(sidebar);
		
		sidebarOpen = true;
	}
}