/* Create a new Search
    var search = new Search({id:"project id", query:"search string"});
*/
define([
  'underscore',
  'jquery',
  'backbone',
], function(_, $, Backbone) {
  var SearchModel = Backbone.Model.extend({
    urlRoot: "/api/search",
    defaults: {
      id:     undefined, // The project id
      offset: 0,
      limit:  50,
      query:  ""
    },

    initialize : function() {
      // Strip the leading slash from project id
      if (this.id) this.id = decodeURI(this.id).replace(/^\//g,'');
    },

    fetch: function(options) {
      var self = this;
      options || (options = {});
      options.data = _.extend({
        offset: self.get("offset"),
        limit:  self.get("limit"),
        query:  self.get("query")
      }, options.data);

      return Backbone.Model.prototype.fetch.call(this, options);
    },
    
    getResults: function() {
      return this.get("result");
    },

    getOpts: function() {
      return this.get("opts");
    }

  });

  return SearchModel;
});
