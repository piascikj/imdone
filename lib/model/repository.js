/*
 * imdone
 * https://github.com/piascikj/imdone
 *
 * Copyright (c) 2012 Jesse Piascik
 * Licensed under the MIT license.
 */
//[Implement base repository functionality with [declare.js](https://npmjs.org/package/declare.js)](#doing:0) 
var declare = require('declare.js');

/*
Repository = module.exports = {
	name:"", //The repository name e.g. github
	getSource:function(project, path) {
		//Get the file source for the given path
	},
	getFiles:function(project) {
		//Get the files
	},
	getKanban:function(project) {
		//Get the project kanban
	}
}
*/

var Repository = module.exports = declare({
	//define your instance methods and properties
	instance : {

		//will be called whenever a new instance is created
		constructor: function(options) {
			options = options || {};
			this._super(arguments);
		},

		getSource:function(project, path) {
			//Get the file source for the given path
		},
		getFiles:function(project) {
			//Get the files
		},
		getKanban:function(project) {
			//Get the project kanban
		},

		//Define your getters
		getters : {

			//can be accessed by using the get method. (repository.get("type"))
			type : function() {
				return this._type;
			}
		},

		//Define your setters
		setters : {

			//can be accessed by using the set method. (repository.set("type", "github"))
			type : function(t) {
				this._type = t;
			}
		}
	},

	//Define your static methods
	static : {
		GITHUB: 1,
		//Mammal.soundOff(); //"Im a mammal!!"
		soundOff : function() {
			return "Im a mammal!!";
		}
	}
});