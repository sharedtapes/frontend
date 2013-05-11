var ControlsView = Backbone.Marionette.ItemView.extend({
	template: "#controls-template",
	events: {
		'click #controls-prev': "prev",
		'click #controls-next': "next",
		'click #controls-playpause': "playpause"
	},
	playpauseSelector: "#controls-playpause",
	sound: null,
	initialize: function(){
		soundManager.setup({
			'preferFlash': false,
			'url': '/static/js/soundmanager2/swf',
			onready: function(){
				this.options.vent.trigger("controls:ready");
			}.bind(this)
		});

		this.options.vent.on("mixtape:load", function(data){
			this.load(data.url);
		}.bind(this));

		this.options.vent.on("mixtape:play", function(){
			this.play();
		}.bind(this));

		this.options.vent.on("mixtape:pause", function(){
			this.pause();
		}.bind(this));

		// this.options.vent.on("progress:seek", function(data){
		// 	console.log('yep');
		// 	this.sound.setPosition(data.percent*this.sound.duration);
		// }.bind(this));
	},
	prev: function(e){
		this.options.vent.trigger("controls:prev");
	},
	next: function(e){
		this.options.vent.trigger("controls:next");
	},
	playpause: function(e){
		// Check to see if the user clicked a play or pause button
		if ($(e.target).hasClass('icon-play')){
			this.options.vent.trigger("controls:play");
			// this.play();
		}
		else if ($(e.target).hasClass('icon-pause')){
			this.options.vent.trigger("controls:pause");
			// this.pause();
		}
	},
	play: function(){
		// Check to see if a song has been loaded yet
		if (this.sound === null){
			return;
		}

		// Play the song
		this.sound.play();

		// Update the UI
		clearInterval(this.updater);
		this.updater = setInterval(function(){
			this.options.vent.trigger("controls:timeUpdate", {
				'percent': (this.sound.position/this.sound.duration)*100
			});
		}.bind(this), 500);

		// Set up the ending case
		this.sound.options.onfinish = function(){
			this.options.vent.trigger("controls:finish");
		};

		// Change the Controls UI
		$(this.playpauseSelector).removeClass('icon-play');
		$(this.playpauseSelector).addClass('icon-pause');

	},
	pause: function(){
		// Check to see if a song has been loaded yet
		if (this.sound === null){
			return;
		}

		this.sound.pause();
		clearInterval(this.updater);

		$(this.playpauseSelector).removeClass('icon-pause');
		$(this.playpauseSelector).addClass('icon-play');
	},
	load: function(url){
		// If there's a current song playing
		if (this.sound !== null){
			this.sound.pause();
			this.sound.destruct();
		}

		this.sound = soundManager.createSound({
			'id': 'audioPlayer',
			'url': url
		});
	}
});

// // This isn't really a model persay.  This is the wrapper
// // around SoundManager2, the HTML5+flash audio player
// var AudioPlayer = Backbone.Model.extend({
// 	initialize: function(){
// 		this.ready = false;
// 		soundManager.setup({
// 			'preferFlash': false,
// 			'url': '/static/js/soundmanager2/swf',
// 			onready: function(){
// 				this.ready = true;
// 			}.bind(this)
// 		});
// 	},
// 	play: function(){
// 		if (!this.ready || this.a === undefined){
// 			return;
// 		}
// 		this.a.play();
// 		this.render();
// 		this.timeUpdate = setInterval(function(){
// 			this.render();
// 		}.bind(this), 500);
// 	},
// 	load: function(url){
// 		if (!this.ready){
// 			return;
// 		}
// 		this.a = soundManager.createSound({
// 			'id': 'mixtapesAudioPlayer',
// 			'url': url
// 		});
// 	},
// 	stop: function(){
// 		if (!this.ready || this.a === undefined){
// 			return;
// 		}
// 		clearInterval(this.timeUpdate);
// 		this.a.pause();
// 	},
// 	remove: function(){
// 		if (!this.ready || this.a === undefined){
// 			return;
// 		}
// 		this.a.destruct();
// 		this.clearCurrentTime();
// 	},
// 	render: function(){
// 		if (!this.ready){
// 			return;
// 		}
// 		this.trigger('updateCurrentTime', util.toMinSec(this.a.position) +
// 			' / ' + util.toMinSec(this.a.durationEstimate));
// 	},
// 	clearCurrentTime: function(){
// 		this.trigger('updateCurrentTime', '0:00 / 0:00');
// 	},
// 	onFinish: function(cb){
// 		this.a.options.onfinish = cb;
// 	}
// });