var _ = require('underscore');

var search = require('../lib/search.js');
var Project = require('../lib/imdone.js').Project;

describe("Search", function() {

  it("Should throw a MissingQueryError error if a call is made without a query", function() {
    expect(function() {
      search.newSearch();
    }).toThrow(new search.errors.MissingQueryError());
  });

  it("Should throw a MissingPathError error if a call is made without a query", function() {
    expect(function() {
      search.newSearch({query:"ha"});
    }).toThrow(new search.errors.MissingProjectError());
  });

  it("Should only return the ammount specified by limit", function() {
    var project = new Project(process.cwd());
    project.init();
    var s = search.newSearch({project:project, query:"var", limit:200});
    var result = s.execute();
    expect(s.hits).toBe(200);
  })

});
