var _ = require('underscore');

var search = require('../lib/search.js');

describe("Search", function() {

  it("Should throw a MissingQueryError error if a call is made without a query", function() {
    expect(function() {
      search.newSearch();
    }).toThrow(new search.errors.MissingQueryError());
  });

  it("Should throw a MissingPathError error if a call is made without a query", function() {
    expect(function() {
      search.newSearch({query:"ha"});
    }).toThrow(new search.errors.MissingPathError());
  });

  it("Should only return the ammount specified by limit", function() {
    var s = search.newSearch({path:process.cwd(), query:"var", limit:200});
    var result = s.execute();
    expect(s.total).toBe(200);
  })

});
