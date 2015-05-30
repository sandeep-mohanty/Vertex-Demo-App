/*
## Initialization of the required platform specific variables which will be used in the current verticle ##
*/

//Getting hold of a console object to display any logging message on the console
var console = require("vertx/console");

//Getting hold of an instance of the event bus for inter-verticle and intra-verticle communication
var eventBus = require("vertx/event_bus");

//Getting the utility object
var mindMapUtils = require("../utilities/mindmap_utils.js");

//Utility function to generate an unique key for a node
var generateUniqueNodeKey = function () {
	return java.util.UUID.randomUUID().toString();
};

/* 
### Defining all the required handler functions and getting them registered with appropriate events.
	These are all point-to-point event handlers(which means only one handler should be associated with a specific event address).
###
 */

// Renaming a mind map node
var mindMapsRenameNode_eventHandler = function (args) {

	eventBus.send("mindMaps.find", { _id: args.mindMapId }, function (result) {
		
		if (result.mindMap) {
			
			var mindMap = result.mindMap;
			var node = mindMapUtils.findNodeByKey(result.mindMap, args.key);
			if (node) {

				node["name"] = args["newName"];
				eventBus.send("mindMaps.save", mindMap, function (result) {
			
					if (result) {
					
						publishMindMapEvent(mindMap, { event: "nodeRenamed", key: args.key, newName: args.newName });
						
					} else {
						
						console.log("Could not rename the mind map node due to a system error");
						
					}
				
				});
			}
			
		}
	});
};

eventBus.registerHandler("mindMaps.editor.renameNode", mindMapsRenameNode_eventHandler);
console.log("Mind map rename node handler registered successfully");

// Adding a mind map node
var mindMapAddNode_eventHandler = function (args) {
	
	eventBus.send("mindMaps.find", { _id: args.mindMapId }, function (result) {
		
		if (result.mindMap) {
			var mindMap = result.mindMap;
			var parent = mindMapUtils.findNodeByKey(result.mindMap, args.parentKey);
			var newNode = { key: generateUniqueNodeKey() };
			
			if (args.name) {
				newNode["name"] = args.name;
			} else {
				newNode["name"] = "Click to edit";
			}
			
			if (!parent.children) {
				parent["children"] = [];
			}
			
			parent["children"].push(newNode);
			
			eventBus.send("mindMaps.save", mindMap, function (result) {
			
				if (result) {
					
					publishMindMapEvent(mindMap, { event: "nodeAdded", parentKey: args.parentKey, node: newNode });
					
				} else {
					
					console.log("New node could not be added to the specified mind map due to a system error");
					
				}
				
			});
		}
	});
};

eventBus.registerHandler("mindMaps.editor.addNode", mindMapAddNode_eventHandler);
console.log("Mind map add node handler registered successfully");

// Deleting a mind map node
var mindMapDeleteNode_eventHandler = function (args) {
	
	eventBus.send("mindMaps.find", { _id: args.mindMapId }, function (result) {
		
		if (result.mindMap) {

			var mindMap = result.mindMap;
			var parent = mindMapUtils.findNodeByKey(result.mindMap, args.parentKey);
			if (parent) {
			
				parent.children.forEach( function(child,index) {
					
					if ( child.key === args.key ) {
						parent.children.splice(index, 1);
						
						eventBus.send("mindMaps.save", mindMap, function (result) {
			
							if (result) {
								
								publishMindMapEvent(mindMap, { event: "nodeDeleted", parentKey: args.parentKey, key: args.key });
								
							} else {
								
								console.log("Could not delete the mind map node due to a system error");
								
							}
						
						});
						
					}
					
				});
			}
		}
	});
	
};

eventBus.registerHandler("mindMaps.editor.deleteNode", mindMapDeleteNode_eventHandler);
console.log("Mind map delete node handler registered successfully");

// Function to publishing a mind map event to all the connected clients
var publishMindMapEvent = function (mindMap, event) {
	
	eventBus.publish("mindMaps.events." + mindMap._id, event);
	
};
console.log("Event generator function defined successfully");

//Confirmation message for successful verticle deployment
console.log("Mind maps editor verticle deployed successfully");
