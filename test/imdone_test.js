/*
var _ = require("underscore");

describe("The model module", function() {
    var model = require('../lib/mongojs-model.js'); 

	var Person = model.extend({
		_collection:"Person",
		name:"Person",
		getName:function() {
			return this.name;
		}
	});

	var defaultUser = new Person();

	afterEach(function() {
		model.db.collection(defaultUser._collection).remove({});
	});

	it("should add collections dynamically", function() {
		expect(_.contains(model.collections, Person._collection)).toBe(true);
	});

	it("should allow me to create new instances", function() {
		expect(defaultUser.getName()).toBe("Person");
	});

	it("should allow me to save instances", function(done) {
		defaultUser.save(function(err, user) {
			expect(user._id).toBeDefined();
			done();
		});
	});

	it("should allow me to remove instances", function(done) {
		var mom = new Person("Mom");
		mom.save(function(err, mom) {
			expect(mom._id).toBeDefined();
			mom.remove(function(err, person) {
				expect(person).toBeDefined();
			});
			done();
		});
	})

});
*/