function singleMain() {
  if(!window.parent.__singlePlayer__) return;
  window.onload = function() {
    var game = new Phaser.Game(800, 512, Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var warnText = "No socket detected. The game must be played through a socket.io server to function properly.";
    var gameGoing, scoreText;
    var score = 5000;
    var bombArr = [];
    var starArr = [];
    var socket = window.parent.socket;
    //emit the request for a game start
    socket.emit('requestArrow');

    if(!socket) document.getElementById('notify').innerText = warnText;
    window.parent.scrollTo(0, window.parent.document.body.scrollHeight);
    socket.on('arrowResponse', function(data) {
      gameGoing = true;
    });

    function preload() {
      game.load.image('yellowcar', '../resources/yellowcar.png');
      game.load.image('road', '../resources/road.png');
      game.load.image('bomb', '../resources/bomb.png');
      game.load.image('star', '../resources/star.png');
      game.load.image('hud', '../resources/hud.png');
      game.load.image('diamond', '../resources/diamond.png');
      game.load.image('goodDiamond', '../resources/goodDiamond.png');
    }

    function create() {
      //physics
      game.physics.startSystem(Phaser.Physics.ARCADE);
      //The scrolling road bg
      road = game.add.tileSprite(0, 0, 800, 600, 'road');
      //player
      player = game.add.sprite(300, 10, 'yellowcar');
      game.physics.arcade.enable(player);
      player.body.collideWorldBounds = true;
      //movement keys
      cursors = game.input.keyboard.createCursorKeys();
      //bombs
      bombs = game.add.group();
      bombs.enableBody = true;
      //stars
      stars = game.add.group();
      stars.enableBody = true;
      //emitter
      bombEmitter = game.add.emitter(0, 0, 100);
      bombEmitter.makeParticles('diamond');
      starEmitter = game.add.emitter(0, 0, 100);
      starEmitter.makeParticles('goodDiamond');
      //hud
      game.add.tileSprite(0, 450, 800, 100, 'hud');
      //score
      scoreText = game.add.text(20, 460, 'Distance Remaining: ' + score, { fontSize: '20px', fill: '#000' });
      //start the random bombs/stars
      var timeout = getRandomInt(600, 800);
      game.time.events.loop(timeout, createRandomLine, this);
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function hitBomb (player, bomb) {
      //Removes the bomb
      bomb.destroy();
      particleBurst(bomb, bombEmitter);
      score += 300;
    }

    function hitStar (player, star) {
      //Removes the star
      star.destroy();
      particleBurst(star, starEmitter);
      if(score > 301) score -= 300;
      else score = 1;
    }

    function checkOverlap(spriteA, spriteB) {
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();
      return Phaser.Rectangle.intersects(boundsA, boundsB);
    }

    function createRandomLine() {
      if(gameGoing && !window.parent.__winner__) {
        var diceRoll = Math.random();
        if(diceRoll > 0.3) {
          var bomb = bombs.create(getRandomInt(30, 720/2), 400, 'bomb');
          bombArr.push(bomb);
        } else {
          var star = stars.create(getRandomInt(30, 720/2), 400, 'star');
          starArr.push(star);
        }
      }
    }

    function checkArr(arr, func) {
      arr.forEach(function(thing, ind, arr) {
        if(thing.body) {
          thing.body.y -= 7;
          if(checkOverlap(player, thing)) {
            func(player, thing);
          } else if(thing.body.y < -50) {
            arr.splice(ind, 1);
            thing.destroy();
          }
        } else {
          arr.splice(ind, 1);
          thing.destroy();
        }
      });
    }

    function particleBurst(thing, emitter) {
      //  Position the emitter where the thign
      emitter.x = thing.x;
      emitter.y = thing.y;
      //  The first parameter sets the effect to "explode" which means all particles are emitted at once
      //  The second gives each particle a ms lifespan
      //  The third is ignored when using burst/explode mode
      //  The final parameter (10) is how many particles will be emitted in this single burst
      emitter.start(true, 500, null, 10);
    }

    function update() {
      if(score > 0 && gameGoing) {
        //check bomb collision
        checkArr(bombArr, hitBomb);
        //check star collision
        checkArr(starArr, hitStar);
        //decrement score
        score -= 1;
        scoreText.text = 'Distance Remaining: ' + score;

        //scroll bg
        road.tilePosition.y -= 7;

        //left and right movement
        if (cursors.left.isDown && player.x > 20) {
          player.body.x -= 20;
        } else if (cursors.right.isDown && player.x < 320) {
          player.body.x += 20;
        }
      } else if(score <= 0) {
        socket.emit('requestWinner', { winner: window.parent.__userName__, room: window.parent.__gameRoom__ });
      }
    }
  };
}

singleMain();