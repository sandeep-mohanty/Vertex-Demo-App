( function(host,jQuery) {
	var appStart = function () {
	
		// Getting hold of the event bus for the current application verticle
		var eventBus = new vertx.EventBus(this.location.protocol + "//" + this.location.hostname + ":" + this.location.port + "/eventbus");
		
		//Mind map UI grid element
		var mindMapGrid = $("#mindMapGrid");
		
		//Mind map view port text
		var viewPort = $("#viewPort");
		
		//Mind map list
		var mindMapList = null;
		
		//Mind map editor list
		var mindMapEditorList = {};
		
		//Mind map view callback, opens the mind map editor view
		var viewMap = function (event) {
			event.preventDefault();
			var requiredMindMapId = $(event.target).parent().prev().prev().text();
			for (var i = 0; i < mindMapList.length; i += 1) {
				if ( mindMapList[i]["_id"] === requiredMindMapId ) {
				
					viewPort.text(mindMapList[i]["name"]);
					mindMapEditorList[mindMapList[i]["_editor"]] = new MindMapEditor(mindMapList[i], eventBus);
					continue;
				}
				mindMapEditorList[mindMapList[i]["_editor"]] = null;
				
			}
		};
		
		//Renders the mind map UI grid for the new mind map and registers a view map handler function for the view button
		var renderList = function (mindMap) {
			mindMapGrid.first().append('<tr></tr>');
			mindMapGrid.first().children(":last").attr("bgcolor","#FFFF00");
			mindMapGrid.first().children(":last").attr("align","center");
			var mindMapString = "";
			mindMapString += "<td>";
			mindMapString += mindMap._id + "</td><td>";
			mindMapString += mindMap.name + "</td><td><button>View</button></td>";
			mindMapGrid.first().children(":last").append(mindMapString);
			var allButtons = mindMapGrid.first().children(":first").find("button");
			var currentViewButton = allButtons.get(allButtons.length - 1);
			currentViewButton.addEventListener("click", viewMap, false);
			
		};
		
		//Calls the renderList function for each available mind map on the server, so that same can be displayed on UI mind map list grid
		var listCallBack = function (result) {
			if (result["Mind Maps"]) {
				mindMapList = [];
				for(var i = 0; i < result["Mind Maps"].length; i += 1) {
					mindMapList.push(result["Mind Maps"][i]);
					renderList(result["Mind Maps"][i]);
				}
			}
		};
		
		// Clears the UI grid for mind map
		var cleanList = function () {
			var displayedRows = mindMapGrid.children(":nth-child(1)").children().get();
			for (var i = 0; i < displayedRows.length; i += 1 ) {
				if ( $(displayedRows[i]).attr("id") !== "header") {
					$(displayedRows[i]).remove();
				}
			}
		};
		
		//Handler function for the click event of the "Add Mind Map" button
		var addMindMap = function(event) {
			event.preventDefault();
			var mindMapName = $("#mindMapName").val().trim();
			var status_message = $("#status_message");
			if (mindMapName.length > 0) {
				var mindMapObject = {name: mindMapName};
				status_message.attr("style","color:green");
				status_message.html("<strong>Please wait....</strong>");
				//Add a new mind map.
				eventBus.send("mindMaps.save",mindMapObject, function (reply){
					if (!reply) {
						status_message.val("");
						status_message.attr("style","color:red");
						status_message.html("<strong>The new mind map could not be added due to a system error. Please try again after some time.</strong>");
						status_message.fadeOut(10000);
					} else {
						status_message.val("");
						$("#mindMapName").val("");
						status_message.attr("style","color:green");
						status_message.html("<strong>New mind map added successfully</strong>");
						status_message.fadeOut(5000);
					}
				});
				
			} else {
				$("#mindMapName").val("");
				status_message.attr("style","color:red");
				status_message.html("<strong>Mind map name cannot be blank</strong>");
				status_message.fadeOut(10000);
			}
		};
		
		//Handler function which listens to the "mindMaps.update" event triggered by the verticle
		var listenForUpdates = function(obj) {
			//Clean the grid
			cleanList();
			//Add the updated list to the grid
			listCallBack(obj);
		};
		
		//UI "Add Mind Map" button element
		var addMindMapButton = $("#add").get(0);
		
		//Registering the handler function "addMindMap" for the click event
		addMindMapButton.addEventListener("click",addMindMap,false);
		
		//Handler function to be triggered once the socket connection is established
		eventBus.onopen = function () {
			//Bridge connection establish message
			console.log("Event bus bridge connection has been established successfully");
			
			//Display all the available mind maps.
			eventBus.send("mindMaps.list",{},listCallBack);
			
			//Handler function to execute whenever there is a change in the mind map status on the server
			eventBus.registerHandler("mindMaps.update", listenForUpdates);
		};
		
	};
	
	jQuery("document").ready(appStart);
	
}(this,jQuery));