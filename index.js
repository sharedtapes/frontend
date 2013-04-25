var express = require('express'),
	when = require('when'),
	fs = require('fs');

var static = express.static(__dirname + '/static');

// not actually any templating happening here now.
// @todo: inject the data into the template, rather than having Backbone pull
// the data on page load (save some time and an XHR)
var template = function(templateName, vars){
	var d = when.defer();
	fs.readFile(__dirname + '/templates/' + templateName, 'UTF-8', function(err, data){
        d.resolve(data);
    });
    return d.promise;
};

module.exports = {
	'static': static,
	'template': template
};