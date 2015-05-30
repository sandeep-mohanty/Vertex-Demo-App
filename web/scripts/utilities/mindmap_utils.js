
/*    
## Defining all the utility functions that will be used in the application that can be used in both client and server side code ##    
*/

//Utility function definition to find a node by its key

if (typeof exports === "undefined") {

	exports = this;
}


 exports.findNodeByKey = function (root, key) {
	if (root.key === key) {
	
		return root;
		
	} else if (root.children) {
	
		for (var i = 0; i < root.children.length; i += 1) {
		
			var match = exports.findNodeByKey(root.children[i], key);
			
			if (match) {
			
				return match;
				
			}
		}
	}
};