var _ = require('underscore');

var Repository = require('../lib/model/repository.js');

var subclass = function(_super, _class) {
	_class.prototype = Object.create(_super.prototype);
	_class.prototype.constructor = _class;
	
	return _class;
};

describe("The Repository", function() {
	var repo = new Repository({
		include:/^.*$/,
		exclude:/(node_modules|imdone|target)\/|\.(git|svn)|\~$|\.(jpg|png|gif|swp)$/,
		marked : {
			gfm: true,
			pedantic: false,
			sanitize: true
		}
	});
	var projectPath = "/tmp/files";
	var files = {
		path: "/tmp/files",
		files: [
			{
				name: "foo.md",
				src: "-[This is a task in foo](#doing:30)"
			},
			{
				name: "bar.md",
				src: "-[This is a task in bar](#doing:50)"
			}
		]
	}

	beforeEach(function() {
		//Create the files
	});

	afterEach(function() {
		//remove the files
	})

	it("should allow me to use static variables", function() {
		expect(repo.getType()).toBe("FILE");

		console.log(JSON.stringify(repo.getFiles("test/files"), null, 3));
	});

	it("it should allow me to subclass", function() {
		var MyRepository = subclass(Repository,
			function() { 
				Repository.apply(this, arguments);
			}
		);

		/*
		var MyRepository = function(config) {
			Repository.call(this, config);
		};
		
		MyRepository.prototype = Object.create(Repository.prototype);
		MyRepository.prototype.constructor = MyRepository;
		*/
		var repo = new MyRepository();

		expect(repo._type).toBe("FILE");
		expect(repo.getType()).toBe("FILE");

		expect(repo instanceof MyRepository).toBe(true);
		expect(repo instanceof Repository).toBe(true);
	});
});