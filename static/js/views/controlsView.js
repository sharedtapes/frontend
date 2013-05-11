var ControlsView = Backbone.Marionette.ItemView.extend({
	template: "#controls-template",
	events: {
		'click #controls-prev': "prev",
		'click #controls-next': "next",
		'click #controls-playpause': "playpause"
	},
	initialize: function(){
		// do stuff
	}, prev: function(e){
		this.options.vent.trigger("controls:prev");
	}, next: function(e){
		this.options.vent.trigger("controls:next");
	}, playpause: function(e){
		// Check to see if the user clicked a play or pause button
		if ($(e.target).hasClass('icon-play')){
			this.options.vent.trigger("controls:play");
			$(e.target).removeClass('icon-play');
			$(e.target).addClass('icon-pause');
		}
		else if ($(e.target).hasClass('icon-pause')){
			this.options.vent.trigger("controls:pause");
			$(e.target).removeClass('icon-pause');
			$(e.target).addClass('icon-play');
		}
	}
});