var numClaims = getData().length;
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
    var url = window.location.toString();

    return [
  {
    link: "https://fullfact.org/immigration/what-would-australian-style-points-system-mean-uk-immigration/",
    content: "The UK probably needs to leave the single market to implement an Australia-style points-based system."
  },
  {
    link: "https://fullfact.org/immigration/what-would-australian-style-points-system-mean-uk-immigration/",
    content: "Norway and Switzerland - which are not in the EU but that are in the European Economic - have higher rates of EU immigration than the UK does at the moment."
   },
  {
    link: "https://fullfact.org/immigration/what-would-australian-style-points-system-mean-uk-immigration/",
    content: "How many people would be let in with a points-based system will depend on the rules on letting people in."
   },
  {
    link: "https://fullfact.org/immigration/what-would-australian-style-points-system-mean-uk-immigration/",
    content: "The UK is unable to control the number of EU immigrants to the UK before it has officially left the EU."
   },
  {
    link: "https://fullfact.org/immigration/what-would-australian-style-points-system-mean-uk-immigration/",
    content: "Immigrants make a net financial contribution to the UK."
   },];
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
		var header1 = document.createElement('h1');
		var headerText = document.createTextNode(numClaims + ' Fact Checks!');

		header1.style.cssText = "\
			text-align:center;\
			font-size:26px;\
			color: #0077ff;\
		";
		header1.appendChild(headerText);
		sidebar.appendChild(header1);
		data.forEach(function (item) {
			var d = document.createElement('div');
			var link = document.createElement('a');
			link.className = 'myFact';
			var linkText = document.createTextNode(item.content);
			link.appendChild(linkText);
			link.href = item.link;
			link.target = "_blank";

			link.style.cssText = "\
				display: block;\
				color: #A1C5F0;\
				text-decoration: none;\
				margin: 30px 20px;\
				color: black;\
				padding: 10px;\
				border-left: 4px #0077ff solid;\
			";

			// var t = document.createTextNode(item.content);

			// d.appendChild(t);
			// d.appendChild(link);

			// d.style.cssText = "\
			// 	margin: 30px 20px;\
			// 	color: black;\
			// 	padding: 10px;\
			// 	border-left: 4px #0077ff solid;\
			// ";
			sidebar.appendChild(link);
		});

		sidebar.style.cssText = "\
			position: fixed;\
			top: 0px;\
			left: 0px;\
			width: 30%;\
			height: 100%;\
			margin: 20px;\
			z-index: 999999;\
			background: white;\
			border-radius: 10px;\
			padding: 10px;\
			box-shadow: 0px 0px 5px 3px rgba(0,0,0,0.4);\
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
    box-shadow: 0px 0px 5px 3px rgba(0,0,0,0.4);\
	";
    var t = document.createTextNode('There are ' + numClaims + ' claims worth fact-checking on this page! Click to view');
	prompter.appendChild(t);
	prompter.onclick = function () {
    toggleSidebar();
	};
	document.body.appendChild(prompter);
}


function highlightPar(parClass) {
	var myPar = document.getElementsByClassName(parClass)[0];
	console.log(myPar);
}



openPrompter();
highlightPar('article__content--intro');


var head = document.getElementsByTagName('head')[0];
var style = document.createElement('style');
var declarations = document.createTextNode('#myPrompter:hover { background: #eeeeff !important; } .myFact:hover { background: #eeeeff !important; text-decoration: underline;}');

style.type = 'text/css';

if (style.styleSheet) {
  style.styleSheet.cssText = declarations.nodeValue;
} else {
  style.appendChild(declarations);
}

head.appendChild(style);
