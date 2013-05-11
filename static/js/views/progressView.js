var ProgressView = Backbone.Marionette.ItemView.extend({
    template: "#progress-template",
    selector: "#progress",
    initialize: function(){
        // $(this.selector).click(function(e){
        //     var left = Math.round($(e.target).position().left);
        //     var width = e.target.offsetWidth;
        //     var position = e.pageX - left;
        //     this.model.set('percent', Math.round((position/width)*100));
        //     this.render();
        //     this.options.vent.trigger('progress:seek', {
        //         percent: this.model.get('percent')
        //     });
        // }.bind(this));
        this.options.vent.on('controls:timeUpdate', function(data){
            if (!isNaN(data.percent)){
                this.model.set('percent', data.percent);
                this.render();
            }
        }.bind(this));
    }
});