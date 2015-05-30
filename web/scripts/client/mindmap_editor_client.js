(function(host){

	host.MindMapEditor = function (mindMap, eventBus) {
		this.mindMap = mindMap;
		this.eventBus = eventBus;
		this.registerEventHandlers();
		this.initVisualization();
		this.renderVisualization();
		console.log("Mind map editor instance created successfully.");
	};
	
	host.MindMapEditor.prototype.addNode = function (parentNode) {
		this.eventBus.send("mindMaps.editor.addNode", { mindMapId: this.mindMap._id, parentKey: parentNode.key });
	};
	
	host.MindMapEditor.prototype.renameNode = function (node, newNameForNode) {
		this.eventBus.send("mindMaps.editor.renameNode", { mindMapId: this.mindMap._id, key: node.key, newName: newNameForNode });
	};
	
	host.MindMapEditor.prototype.deleteNode = function (parentNode, childNode) {
		this.eventBus.send("mindMaps.editor.deleteNode", { mindMapId: this.mindMap._id, parentKey: parentNode.key, key: childNode.key });
	};
	
	host.MindMapEditor.prototype.registerEventHandlers = function () {
		var self = this;
		this.eventBus.registerHandler("mindMaps.events." + self.mindMap._id, function(event) {
			switch (event.event) {
				case "nodeAdded": 
					self.onNodeAdded(event);
					break;
				case "nodeRenamed":
					self.onNodeRenamed(event);
					break;
				case "nodeDeleted":
					self.onNodeDeleted(event);
					break;
			}
		});
	};
	
	host.MindMapEditor.prototype.onNodeAdded = function(event) {
	
		var parent = findNodeByKey(this.mindMap, event.parentKey);
		
		if (parent) {
		
			if (!parent.children) {
				parent.children = [];
			}
			
			parent.children.push(event.node);
			this.renderVisualization();
		}
	};
	
	host.MindMapEditor.prototype.onNodeRenamed = function(event) {
	
		var node = findNodeByKey(this.mindMap, event.key);
		
		if (node) {

			node.name = event.newName;
			this.renderVisualization();
			
		}
	};
	
	host.MindMapEditor.prototype.onNodeDeleted = function(event) {
	
		var parent = findNodeByKey(this.mindMap, event.parentKey);
		
		if (parent) {

			for (var i = 0; i < parent.children.length; i += 1) {
				
				if ( parent.children[i].key === event.key ) {
					
					parent.children.splice( i, 1);
					break;
				}
				
			}
			this.renderVisualization();
		}
	};
	
	//SVG visualization specific definitions
	host.MindMapEditor.width = 1000;
	host.MindMapEditor.height = 400;
	host.MindMapEditor.levelWidth = 150;
	host.MindMapEditor.treeLayout = d3.layout.tree().size([host.MindMapEditor.height, host.MindMapEditor.width]);
	host.MindMapEditor.diagonalGenerator = d3.svg.diagonal().projection( function ( d ) {
		return [d.y, d.x];
	});
	host.MindMapEditor.prototype.initVisualization = function () {
		this.visualization = d3.select(".editor").html("").append("svg:svg")
			.attr("width", host.MindMapEditor.width)
			.attr("height", host.MindMapEditor.height)
			.append("svg:g")
			.attr("transform", "translate(10,0)");
	};
	host.MindMapEditor.prototype.renderVisualization = function () {
		var self = this;
		var nodes = host.MindMapEditor.treeLayout.nodes(this.mindMap).reverse();
		nodes.forEach( function(node) {
			node.y = node.depth * host.MindMapEditor.levelWidth;
		});
		var node = this.visualization.selectAll("g.node").data(nodes, function (data) {
			return data.key;
		});
		var nodeEnter = node.enter().append("svg:g")
			.attr("class","node")
			.attr("opacity", "0")
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")" ; 
			});
			
		nodeEnter.append("svg:circle").attr("r", 10.0)
		.style("fill","lightsteelblue")
		.on("click", function (d) {
			self.addNode(d);
		});
		nodeEnter.append("svg:text").attr("x", 10)
		.attr("dy", ".35em").text( function (d) {
			return d.name;
		})
		.on("click", function (d) {
			var text = prompt("Enter the name of this node" , d.name);
			if (text) {
				self.renameNode(d, text);
			}
		});
		
		node.transition().attr("opacity", "1")
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x + ")";
		})
		.select("text")
		.text(function(d) { return d.name; });
		node.exit().remove();
		
		var link = this.visualization.selectAll("path.link")
		.data(MindMapEditor.treeLayout.links(nodes), function(d) {
			return d.target.key; 
		});
		link.enter().insert("svg:path", "g")
		.attr("class", "link")
		.attr("opacity", "0")
		.attr("d", host.MindMapEditor.diagonalGenerator)
		.on('click', function(l) {
			self.deleteNode(l.source, l.target);
		});
		link.transition()
		.attr("d", host.MindMapEditor.diagonalGenerator)
		.attr("opacity", "1");
		link.exit().remove();
		
	};
	console.log("The global mind map editor factory constructor function 'MindMapEditor' is now available for creation of mind map editor instances.");
	return MindMapEditor;
}(this))