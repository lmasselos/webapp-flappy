// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var player;
var pipes = [];
var score = 0;
var labelScore;
var width = 1000;
var height = 750;
var gameGravity = 500;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'game', stateActions);

var gapSize = 250;
var gapMargin = 100;
var blockHeight = 50;

//Global variables to store the bonuses
var balloons = [];
var weights = [];



/*
 * Loads all resources for the game and gives them names.
 */



jQuery("#greeting-form").on("submit", function(event_details){
   var greeting = "Hello ";
    var name = jQuery("#fullName ").val();
    var greeting_message = greeting + name;
   jQuery("#greeting-form").hide();
    jQuery("#greeting").append("<p>" + greeting_message + " (" + jQuery("#email").val() + "): " +
    jQuery("#score").val() + "</p>");
});

$.get("/score", function(scores){
    scores.sort(function (scoreA, scoreB){
        var difference = scoreB.score - scoreA.score;
        return difference;
    });
    for (var i = 0; i < scores.length; i++) {
        $("#scoreBoard").append(
            "<li>" +
            scores[i].name + ": " + scores[i].score +
            "</li>");
    }
});

function preload() {
    game.load.image("playerImg", "../assets/parachuter.png");
    game.load.audio("score", "../assets/point.ogg");
    game.load.image("pipe", "../assets/pipe.png");
    game.load.image("sky", "../assets/sky-18.jpg");
    game.load.image("balloons", "../assets/balloons.png");
    game.load.image("weights", "../assets/weight.png");
}

/*
 * Initialises the game. This function is only called once.
 */
function create() {

    //color scheme
    game.add.image(0, 0, "sky");
    game.add.text(645, 130, "Up,", {font: "30px Brush Script Std", fill: "#FFFFFF"});
    game.add.text(700, 100, "up,", {font: "30px Brush Script Std", fill: "#FFFFFF"});
    game.add.text(750, 70, "up,", {font: "30px Brush Script Std", fill: "#FFFFFF"});
    game.add.text(800, 40, "and", {font: "30px Brush Script Std", fill: "#FFFFFF"});
    game.add.text(850, 10, "away!", {font: "30px Brush Script Std", fill: "#FFFFFF"});

    player = game.add.sprite(400, 300, "playerImg");
    player.anchor.setTo(0.5, 0.5);



    game.input
        .onDown
        .add(clickHandler);


game.input
    .keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    .onDown.add(spaceHandler);


    labelScore = game.add.text(20, 20, "0");

    game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
        .onDown.add(moveRight);

    game.input.keyboard.addKey(Phaser.Keyboard.UP)
        .onDown.add(moveUp);

    game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
        .onDown.add(moveLeft);

    game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        .onDown.add(moveDown);

    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(playerJump);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.enable(player);

    player.body.velocity.x = 0;
    player.body.velocity.y = 100;



    pipeInterval = 2;
    game.time.events
        .loop(pipeInterval * Phaser.Timer.SECOND,
        generate);

}



function addPipeBlock(x, y) {
    var pipeBlock = game.add.sprite(x,y,"pipe");
    pipes.push(pipeBlock);
    game.physics.arcade.enable(pipeBlock);
    pipeBlock.body.velocity.x = -400;
}


function generate() {
    var diceRoll = game.rnd.integerInRange(1, 8);
    if(diceRoll==1) {
        generateBalloons();
    } else if(diceRoll==2) {
        generateWeights();
    } else {
        generatePipe();
    }
}


function generatePipe() {
    var gapStart = game.rnd.integerInRange(gapMargin, height - gapSize - gapMargin);

   for(var y=gapStart - 75; y > -50 ; y -= blockHeight){
        addPipeBlock(width, y);
    }

    for(var y = gapStart + gapSize + 25; y < height; y += blockHeight) {
        addPipeBlock(width, y);
    }

    changeScore();
}




function clickHandler(event) {
    game.add.sprite(event.x, event.y, "playerImg");
}
function spaceHandler() {
    game.sound.play("score");
}

function changeScore(){
    score = score + 1;
    labelScore.setText(score.toString());

}





function moveRight(){
    player.x = player.x + 10
}

function moveLeft(){
    player.x = player.x - 10
}

function moveUp(){
    player.y = player.y - 100
}

function moveDown(){
    player.y = player.y + 100
}

function playerJump() {
    player.body.velocity.y = -250;
    player.body.velocity.x = 0;
    player.body.gravity.y = gameGravity;
}



/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {

    for (var index = 0; index < pipes.length; index++) {
        game.physics.arcade
            .overlap(player, pipes[index], gameOver);
    }

    if(player.body.y < 0 || player.body.y > 750) {
        gameOver();
    }


    // Check if the player gets a bonus
    checkBonus(balloons, -50);
    checkBonus(weights, 50);
}

function checkBonus(bonusArray, bonusEffect) {
    // Step backwards in the array to avoid index errors from splice
    for(var i=bonusArray.length - 1; i>=0; i--){
        game.physics.arcade.overlap(player,bonusArray[i], function(){
            // destroy sprite
            bonusArray[i].destroy();
            // remove element from array
            bonusArray.splice(i,1);
            // apply the bonus effect
            changeGravity(bonusEffect);
        });
    }
}


function gameOver() {
    game.destroy();
    $("#score").val(score);
    $("#greeting").show();
    gameGravity = 200;
}

function changeGravity(g) {
    gameGravity += g;
    player.body.gravity.y = gameGravity;
}

function generateBalloons(){
    var bonus = game.add.sprite(width, height, "balloons");
    balloons.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = -400;
    bonus.body.velocity.y = - game.rnd.integerInRange(60,100);
}

function generateWeights() {
    var bonus = game.add.sprite(width, 0, "weights");
    weights.push(bonus);
    game.physics.arcade.enable(bonus);
    bonus.body.velocity.x = -400;
    bonus.body.velocity.y = game.rnd.integerInRange(60,100);
}


game.physics.arcade.overlap(player, pipes, gameOver);