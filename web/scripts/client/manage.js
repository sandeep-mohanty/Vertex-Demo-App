( function(host,jQuery) {
	var appStart = function () {
	
		// Getting hold of the event bus for the current instance application verticle
		var eventBus = new vertx.EventBus(this.location.protocol + "//" + this.location.hostname + ":" + this.location.port + "/eventbus");
		
		//Mind Map UI grid element
		var mindMapGrid = $("#mindMapGrid");
		
		//Mind map remove callback, updates the UI based on the delete status
		var removeMindMap = function (event) {
			event.preventDefault();
			var mindMapToBeRemoved = {};
			var status_message = $("#status_message");
			mindMapToBeRemoved["_id"] = $(event.target).parent().prev().prev().text();
			mindMapToBeRemoved["name"] = $(event.target).parent().prev().text();
			status_message.attr("style","color:green");
			status_message.html("<strong>Please wait....</strong>");
			//Delete the selected mind map both from UI and the server.
			eventBus.send("mindMaps.delete",mindMapToBeRemoved, function (deleteStatus) {
				if (deleteStatus.status) {
					$(event.target).parent().prev().prev().remove();
					$(event.target).parent().prev().remove();
					$(event.target).parent().remove();
					status_message.val("");
					status_message.attr("style","color:green");
					status_message.html("<strong>Mind map removed successfully</strong>");
					status_message.fadeOut(5000);
				} else {
					status_message.val("");
					status_message.attr("style","color:red");
					status_message.html("<strong>Selected mind map could not be removed due to an system error. Try again after some time.</strong>");
					status_message.fadeOut(5000);
				}
			});
		};
		
		//Renders the mind map UI grid for the mind map and registers a "removeMindMap" handler function for the remove button
		var renderList = function (mindMap) {
			mindMapGrid.first().append('<tr></tr>');
			mindMapGrid.first().children(":last").attr("bgcolor","#FFFF00");
			mindMapGrid.first().children(":last").attr("align","center");
			var mindMapString = "";
			mindMapString += "<td>";
			mindMapString += mindMap._id + "</td><td>";
			mindMapString += mindMap.name + "</td><td><button>Remove</button></td>";
			mindMapGrid.first().children(":last").append(mindMapString);
			var allButtons = mindMapGrid.first().children(":first").find("button");
			var currentButton = allButtons.get(allButtons.length - 1);
			currentButton.addEventListener("click", removeMindMap, false);
		};
		
		//Calls the renderList function for each available mind map on the server, so that, same can be displayed on the mind map UI grid
		var listCallBack = function (result) {
			if (result["Mind Maps"]) {
				for(var i = 0; i < result["Mind Maps"].length; i += 1) {
					renderList(result["Mind Maps"][i]);
				}
			}
		};
		
		// Clears the UI grid for the mind maps
		var cleanList = function () {
			var displayedRows = mindMapGrid.children(":nth-child(1)").children().get();
			for (var i = 0; i < displayedRows.length; i += 1 ) {
				if ( $(displayedRows[i]).attr("id") !== "header") {
					$(displayedRows[i]).remove();
				}
			}
		};
		
		//Handler function to for the click event of the "Add Mind Map" button
		var addMindMap = function(event) {
			event.preventDefault();
			var mindMapName = $("#mindMapName").val().trim();
			var status_message = $("#status_message");
			if (mindMapName.length > 0) {
				var mindMapObject = {name: mindMapName};
				status_message.attr("style","color:green");
				status_message.html("<strong>Please wait....</strong>");
				//Add a new mind map name.
				eventBus.send("mindMaps.save", mindMapObject, function (reply){
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
		addMindMapButton.addEventListener("click", addMindMap, false);
		
		//Handler function to be triggered once the socket connection is established
		eventBus.onopen = function () {
		
			//Bridge connection establish success message
			console.log("Event bus bridge connection has been established successfully");
			
			//Display all the available mind maps from the persistent data store.
			eventBus.send("mindMaps.list",{},listCallBack);
			
			//Handler function to execute whenever there is a change in the mind map status in the persistent data store
			eventBus.registerHandler("mindMaps.update", listenForUpdates);
		};
		
	};
	
	jQuery("document").ready(appStart);
	
}(this,jQuery));