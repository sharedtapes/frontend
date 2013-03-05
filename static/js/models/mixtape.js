// This is a Mixtape, the playlist/mixtape collection of songs
var Mixtape = Backbone.Model.extend({
	defaults: {
		title: 'untitled',
		author: 'anonymous',
		created: new Date(),
		similarArtists: []
	},
	parse: function(response){
		// this is called when stuff is coming from the server
		// since we have a collection inside of a model and the
		// server has no knowledge of this, we have to do it manually
		response.songs = new SongCollection(response.songs);
		response.similarArtists = response.similar_artists;
		delete response.similar_artists;
		return response;
	},
	urlRoot: '/api/v1/tapes'
});