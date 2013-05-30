var Repository = require('../lib/model/repository.js'); 

describe("The Repository", function() {
	it("should allow me to use static variables", function() {
		expect(Repository.GITHUB).not.toBeUndefined();
	});
});