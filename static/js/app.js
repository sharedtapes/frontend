(function ($) {

    // This must be executed after models/, collections/ and views/ have been loaded.

    // @todo: modularize with require.js and AMD.


    // @todo: use Marionette, replace 'app' with Marionette.app

    var app = {};

    // SETUP STUFF
    //
    //
    //


    // Setup the HTML5+flash audio player
    window.audioPlayer = new AudioPlayer();

    // Setup the music player view
    // @todo: rename this
    window.player = new PlayerView();

    // This is where the bootstrapping/publish/subscribe/event assignment happens.
    // I know it's gnarly, I'm in the process of breaking out the monolithic
    // 'bootstrapMixtape' function but it's difficult to full seperate everything.
    // Some things have to happen on root access, other things have to happen only
    // on hitting a specific mixtape.  Working on it.

    // @todo: replace this all with Marionette's event handler abstraction layer,
    // so that views can just publish/subscribe data to each other

    app.bootstrap = function(){
        app.bootstrapPlayer();
        app.bootstrapMixtape();
        app.boostrapRealtime();
    };

    // @todo: remove the window. from all of these, it was for testing.
    // assign them to the app object instead (once the Marionette transition
    // is complete)

    app.bootstrapPlayer = function(){
        window.audioPlayer.on('updateCurrentTime', function(time){
            window.player.updateCurrentTime(time);
        });
    };

    app.bootstrapControls = function(){
        app.controlsBootstrapped = true;
        // Player events
        window.player.on('playClick', function(){
            if (window.mixtapeView.mixtape.get('songs').length > 0){
                window.mixtapeView.play();
                // window.player.showPause();
            }
        });
        window.player.on('pauseClick', function(){
            window.mixtapeView.pause();
            // window.player.showPlay();
        });
        window.player.on('nextClick', function(){
            window.mixtapeView.next();
        });
        window.player.on('backClick', function(){
            window.mixtapeView.previous();
        });
    };


    app.bootstrapMixtape = function(){
        // @todo: replace all of these with a nice publish/subscribe layer
        // SearchView events
        window.searchView.on('addSong', function(opts){
            window.mixtapeView.addSong(window.searchView.songs.get(opts.id));
        });
        window.searchView.on('playPreview', function(data){

            var song = window.searchView.songs.get(data.id);

            // if the mixtape is currently playing, don't do anything.
            // might change this in the future though.
            if (window.mixtapeView.playing && !window.mixtapeView.paused){
                $("#preview-play-" + data.id).attr('src', '/static/images/search/no_25.png');
                // $("#preview-unable-" + data.id).show();
                setTimeout(function(){
                    // $("#preview-unable-" + data.id).hide();
                    $("#preview-play-" + data.id).attr('src', '/static/images/search/play_25.png');
                }, 500);
                return;
            }

            // if the mixtape is paused, we're going to interrupt it to preview.
            if (window.mixtapeView.paused){
                window.audioPlayer.stop();
                window.audioPlayer.remove();
                window.mixtapeView.paused = false;
                window.mixtapeView.playing = false;
            }

            // if we're currently previewing another song, stop it and update the UI.
            if (window.searchView.previewPlaying){
                $("#preview-play-" + window.searchView.nowPlaying).attr('src', '/static/images/search/play_25.png');
                window.audioPlayer.stop();
                window.audioPlayer.remove();
                window.searchView.previewPlaying = false;
            }

            // if we're not currently paused or playing, load the data for playing
            if (!window.searchView.previewPlaying){
                window.audioPlayer.stop();
                window.audioPlayer.remove();
                window.audioPlayer.load(song.get('url'));
                window.audioPlayer.onFinish(function(){
                    $("#preview-play-" + window.searchView.nowPlaying).attr('src', '/static/images/search/play_25.png');
                    window.audioPlayer.stop();
                    window.audioPlayer.remove();
                    window.searchView.previewPlaying = false;
                });
                window.audioPlayer.render();
                window.searchView.nowPlaying = song.get('id');
                window.searchView.previewPlaying = true;
                window.audioPlayer.play();

                $("#preview-play-" + data.id).attr('src', '/static/images/search/pause_25.png');
            }

        });
        window.searchView.on('pausePreview', function(data){
            window.audioPlayer.stop();
            $("#preview-play-" + data.id).attr('src', '/static/images/search/play_25.png');
            window.searchView.previewPlaying = false;
        });
        window.searchView.on('stopPreview', function(data){
            window.audioPlayer.stop();
            window.audioPlayer.remove();
            window.searchView.previewPlaying = false;
            $("#preview-play-" + data.id).attr('src', '/static/images/search/play_25.png');
        });
        window.searchView.on('loading', function(){
            window.player.startLoading();
        });
        window.searchView.on('loadingComplete', function(){
            window.player.stopLoading();
        });
        window.searchView.on('playing', function(){
            window.player.showPlay();
        });

        // MixtapeView events
        window.mixtapeView.on('set-title', function(newTitle){
            $("#title-text").text(newTitle);
        });
        window.mixtapeView.on('loading', function(){
            window.player.startLoading();
        });
        window.mixtapeView.on('loadingComplete', function(){
            window.player.stopLoading();
        });
        window.mixtapeView.on('loadAudio', function(data){
            window.audioPlayer.load(data.url);
            window.audioPlayer.onFinish(function(){
                if (window.mixtapeView.hasNext()){
                    window.mixtapeView.next();
                }
                else {
                    window.mixtapeView.stop();
                    window.mixtapeView.setCurrentSong(0);
                    window.audioPlayer.render();
                }
            });
            window.audioPlayer.render();

        });
        window.mixtapeView.on('playAudio', function(){
            // check if you're currently previewing something
            if (window.searchView.previewPlaying){
                window.searchView.stopPreview();
                // window.audioPlayer.remove();
                window.mixtapeView.load();
            }
            window.audioPlayer.play();
            window.player.showPause();
        });
        window.mixtapeView.on('stopAudio', function(){
            window.audioPlayer.stop();
            window.player.showPlay();
        });
        window.mixtapeView.on('removeAudio', function(){
            window.audioPlayer.remove();
        });
        window.mixtapeView.on('emitAvailable', function(available){
            window.player.setHasPrevious(available.hasPrev);
            window.player.setHasNext(available.hasNext);
            window.player.setCanPlay(available.canPlay);
        }.bind(this));

        window.mixtapeView.on('recommendations', function(recommendations){
            window.searchView.addRecommendations(recommendations);
        });
        window.mixtapeView.on('emptyRecommendations', function(){
            window.searchView.emptyRecommendations();
        });

        // set up the editable title
        // @todo: this doesn't style the form field
        $('#title-text').editable(function(value, settings) {
            window.mixtapeView.setTitle(value);
            return(value);
        }, {
            'cssclass': 'title-editable'
        });
    };

    // Set up to listen for and send WebSocket messages
    // This makes the app collaborative, with all of the changes
    // made proliterating in real-time between clients viewing a mixtape
    app.boostrapRealtime = function(){
        window.socket = io.connect('ws://' + document.domain);
        window.socket.on('data', function(data){
            // put in a check here on currently playing songs
            // in case it has been removed...
            // do something...
            // @todo: handle this case
            console.log('new data...');
            var mixtape = new Mixtape(data);
            mixtape.set('songs', new SongCollection(mixtape.get('songs')));
            window.mixtapeView.mixtape = mixtape;
            // @todo: this renders twice, and it shouldn't.
            window.mixtapeView.render();
        });
        window.socket.on('listeners', function(listeners){
            if (listeners === 1){
                $("#listeners").text(listeners + ' viewer');
            }
            else {
                $("#listeners").text(listeners + ' viewers');
            }
        });
        window.mixtapeView.on('subscribe', function(sub){
            window.socket.emit('subscribe', {
                'id': sub.id
            });
        });
        window.mixtapeView.on('publish', function(mixtapeData){
            console.log('publishing data');
            window.socket.emit('publish', JSON.stringify(mixtapeData));
        });
    };

    // view manager @todo
    // this is the makeshift view manager until i get organized
    // and use Marionette
    app.changeContentView = function(view, options){
        if (view === 'search'){
            if (window.helpView !== undefined){
                window.helpView.close();
            }
            if (window.browseView !== undefined){
                window.browseView.close();
            }
            if (window.searchView === undefined) {
                window.searchView = new SearchView();
            }
            window.searchView.open();
            window.searchView.render();
            $("#content-title").text('search');
            return;
        }
        if (view === 'help'){
            // if the searchview exists and is open, close it.
            // if an existing helpview exists, open it
            // otherwise, create a new helpview and attach it.
            // render
            if (window.searchView !== undefined){
                window.searchView.close();
            }
            if (window.browseView !== undefined){
                window.browseView.close();
            }
            if (window.helpView === undefined) {
                window.helpView = new HelpView();
            }
            window.helpView.open();
            window.helpView.render();
            $("#content-title").text('help');
            return;
        }
        if (view === 'browse'){
            // if the searchview exists and is open, close it.
            // if an existing helpview exists, open it
            // otherwise, create a new helpview and attach it.
            // render
            if (window.searchView !== undefined){
                window.searchView.close();
            }
            if (window.helpView !== undefined){
                window.helpView.close();
            }
            if (window.browseView === undefined) {
                window.browseView = new BrowseView();
            }
            window.browseView.open();
            window.browseView.render();
            $("#content-title").text('browse');
        }
    };


    // stuff that happens last, set up the front end click events
    // again, this is not code I'm proud of, it'll all be a lot cleaner
    // with Marionette
    app.done = function(){
        // the header navigation stuff
        $("#click-help").click(function(e){
            e.preventDefault();
            $(".nav-item").removeClass("active");
            $(e.target).parent().addClass("active");
            app.changeContentView('help');
            if (window.mixtapeView.mixtape.id !== undefined){
                window.router.navigate(window.mixtapeView.mixtape.id +'#help');
            }
            else {
                window.router.navigate('/#help');
            }
        });
        $("#click-browse").click(function(e){
            e.preventDefault();
            $(".nav-item").removeClass("active");
            $(e.target).parent().addClass("active");
            app.changeContentView('browse');
            if (window.mixtapeView.mixtape.id !== undefined){
                window.router.navigate(window.mixtapeView.mixtape.id +'#browse');
            }
            else {
                window.router.navigate('/#browse');
            }
        });
        $("#click-search").click(function(e){
            e.preventDefault();
            $(".nav-item").removeClass("active");
            $(e.target).parent().addClass("active");
            app.changeContentView('search');
            if (window.mixtapeView.mixtape.id !== undefined){
                window.router.navigate(window.mixtapeView.mixtape.id);
            }
            else {
                window.router.navigate('');
            }

        });
        // @todo: make this AJAXy
        $("#click-new").click(function(){
            window.location = '/';
        });


        $("#wrapper").show();
    };

    // @todo fix the routing, as it's a little hacky right now
    // and doesn't seem to work in Internet Explorer (at all).
    // I'd like to be using just the History API, but it's not very backwards
    // compatible.  Falling back to hashes doesn't appear to be working right now,
    // so... I should fix that.
    var Router = Backbone.Router.extend({
        routes: {
            '': 'root',
            'help': 'help',
            'browse': 'browse',
            ':id': 'mixtape'
        },
        root: function(){
            // Define the Backbone views
            console.log('root');
            // Again, the window should be replaced with app,
            // or something different all together.
            window.mixtapeView = new MixtapeView();
            window.mixtapeView.render();
            app.changeContentView('search');
            app.bootstrap();
            app.bootstrapControls();
            this.navigate('');
            $("#status-text").text('add some songs');
            window.mixtapeView.on('save_new', function(data){
                console.log('navigating');
                this.navigate(data.id);
            }.bind(this));
        },
        help: function(){
            console.log('help');
            if (window.mixtapeView === undefined){
                window.mixtapeView = new MixtapeView();
            }
            if (window.searchView === undefined){
                window.searchView = new SearchView();
            }
            app.changeContentView('help');
            app.bootstrap();
            if (!app.controlsBootstrapped){
                app.bootstrapControls();
            }
            this.navigate('help');
        },
        browse: function(){
            console.log('browse');
            if (window.mixtapeView === undefined){
                window.mixtapeView = new MixtapeView();
            }
            if (window.searchView === undefined){
                window.searchView = new SearchView();
            }
            app.changeContentView('browse');
            app.bootstrap();
            if (!app.controlsBootstrapped){
                app.bootstrapControls();
            }
            this.navigate('browse');
        },
        mixtape: function(id){
            console.log(this);
            // Define the Backbone views
            console.log(id);
            if (window.mixtapeView === undefined){
                window.mixtapeView = new MixtapeView({
                    'id': id
                });
            }
            $("#status-text").text('you can edit');

            // this seems to be necessary to strip out the
            // # if you navigate to, say, /c3po#browse
            if (window.location.hash.length){
                this.navigate('');
            }
            this.navigate(id);
            app.changeContentView('search');
            app.bootstrap();
            if (!app.controlsBootstrapped){
                app.bootstrapControls();
            }
        }
    });
    window.router = new Router();
    Backbone.history.start({pushState: true, hashChange: false, root: '/'});

    window.app = app;

    app.done();

})(jQuery);

