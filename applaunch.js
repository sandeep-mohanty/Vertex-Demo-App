(function() {
	
	var container = require("vertx/container");
	var serverConfiguration = {
		"node": 80 ,
		"host": "10.195.14.115",
		"ssl": false,
		"bridge": true,
		"inbound_permitted": [ { address: "mindMaps.list" },
			{ address: "mindMaps.save" },
			{ address: "mindMaps.delete" },
			{ address: "mindMaps.editor.addNode" },
			{ address: "mindMaps.editor.renameNode" },
			{ address: "mindMaps.editor.deleteNode"}],
		"outbound_permitted":[ { address: "mindMaps.update" },
			{ address_re: "mindMaps\\.events\\..+"}]
	};
	var mongoDBConfiguration = {
		"address": "mindMaps.persistor",
		"pool_size": 10000,
		"db_name": "Mind_Maps"
	};
	container.deployModule("io.vertx~mod-web-server~2.1.0-SNAPSHOT", serverConfiguration);
	container.deployModule("io.vertx~mod-mongo-persistor~2.1.0", mongoDBConfiguration);
	container.deployVerticle("./web/scripts/server/mindmap.js");
	container.deployVerticle("./web/scripts/server/mindmap_editor.js");
	
}());
