var player = {};

player.canvas = $("#loadingCanvas")[0];
player.context = player.canvas.getContext('2d');
player.loadingImage = new Image();
player.counter = 0;
player.TO_RADIANS = Math.PI/180;
player.rotateTimer;

player.loadingImage.src = '/static/images/player/load_75.png';
player.loadingImage.onload = function(){
    player.context.clearRect(0,0,player.canvas.width, player.canvas.height);
    player.drawRotatedImage(player.loadingImage,player.canvas.width/2,player.canvas.height/2,0); 
}

player.startLoading = function(){
    $("#loading").show();
    player.rotateTimer = setInterval(player.animate, 1000/60);
}

player.stopLoading = function(){
    $("#loading").hide();
    clearInterval(player.rotateTimer);
}

player.animate = function(){
    player.context.clearRect(0,0,player.canvas.width, player.canvas.height); 
    player.drawRotatedImage(player.loadingImage, 
        player.canvas.width/2, 
        player.canvas.height/2,
        player.counter); 
    player.counter+=5; 
}

player.drawRotatedImage = function(image, x, y, angle) { 
    player.context.save(); 
    player.context.translate(x, y);
    player.context.rotate(angle * player.TO_RADIANS);
    player.context.drawImage(image, -(image.width/2), -(image.height/2));
    player.context.restore(); 
}

player.pause = function(){
    $("#playImage").hide();
    $("#pauseImage").show();
};

player.play = function(){
    $("#pauseImage").hide();
    $("#playImage").show();
};