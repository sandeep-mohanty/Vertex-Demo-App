/*
## Initialization of the required platform specific variables which will be used in the current verticle ##
*/

//Getting hold of a console object to display any logging message on the console
var console = require("vertx/console");

//Getting hold of an instance of the event bus for inter-verticle and intra-verticle communication
var eventBus = require("vertx/event_bus");

//This object will contain all the responders
var responders = {
	listResponder: null,
	findResponder: null,
	saveResponder: null,
	deleteResponder: null
};

// Displaying mind maps from the data store
var dbResults_list_handler = function (reply) {
	if (reply.status === "ok") {
		responders.listResponder({"Mind Maps": reply.results});
	} else {
		responders.listResponder(null);
		console.log(reply.message);
	}
};
var mindMapsList_eventHandler = function (args, responder) {
	responders["listResponder"] = responder;
	eventBus.send("mindMaps.persistor", {action: "find", collection: "mindMaps", matcher: {} }, dbResults_list_handler);
};
eventBus.registerHandler("mindMaps.list", mindMapsList_eventHandler);
console.log("Mind map listing handler registered successfully");

// Finding a mind map from the data store
var dbResults_find_handler = function (reply) {
	if (reply.status === "ok") {
		responders.findResponder({"mindMap": reply.results[0]});
	} else {
		console.log(reply.message);
	}
};
var mindMapsFind_eventHandler = function (args, responder) {
	responders["findResponder"] = responder;
	eventBus.send("mindMaps.persistor", {action: "find", collection: "mindMaps", matcher: {_id: args._id} }, dbResults_find_handler);
};
eventBus.registerHandler("mindMaps.find", mindMapsFind_eventHandler);
console.log("Mind map find handler registered successfully");

// Saving a mind map
var dbResults_save_handler = function (reply) {
	if (reply.status === "ok") {
		responders.saveMindMap._id = reply._id;
		responders.saveResponder(responders.saveMindMap);
		eventBus.send("mindMaps.list",{},function(reply) {
			eventBus.publish("mindMaps.update", reply);
		});
		
	} else {
		console.log(reply.message);
	}
};

var mindMapSave_eventHandler = function (mindMap, responder) {
	responders["saveResponder"] = responder;
	responders["saveMindMap"] = mindMap;
	mindMap["key"] = "MindMap_Root_Key";
	eventBus.send("mindMaps.persistor", {action: "save", collection: "mindMaps", document: mindMap }, dbResults_save_handler);
};
eventBus.registerHandler("mindMaps.save", mindMapSave_eventHandler);
console.log("Mind map save handler registered successfully");

// Deleting a mind map
var dbResults_delete_handler = function (reply) {
	if (reply.status === "ok") {
		responders.deleteResponder({"status": true});
		//Only trigger the event if delete operation was successful
		eventBus.send("mindMaps.list",{},function(reply) {
			//Get hold of all the mind maps and invoke the publish the update event
			eventBus.publish("mindMaps.update", reply);
		});
		
	} else {
		responder({"status": false});
		console.log(reply.message);
	}
};
var mindMapDelete_eventHandler = function (mindMap, responder) {
	responders["deleteResponder"] = responder;
	eventBus.send("mindMaps.persistor", {action: "delete", collection: "mindMaps", matcher: {_id: mindMap._id }}, dbResults_delete_handler);
};

eventBus.registerHandler("mindMaps.delete", mindMapDelete_eventHandler);
console.log("Mind map delete handler registered successfully");


//Confirmation message that the verticle has been deployed successfully
console.log("Mind map verticle deployed successfully");
