function multiMain() {
  if(!window.parent.__multiPlayer__) return;
  window.onload = function() {
    var game = new Phaser.Game(800, 512, Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var warnText = "No socket detected. The game must be played through a socket.io server to function properly.";
    var gameGoing, scoreText, host, enemy, enemyPaused, paused, bombs, stars, eScoreText;
    var score = 5000;
    var eScore = 5000;
    var gameSpeed = 6;
    var easiness = 0.5;
    var bombArr = [];
    var starArr = [];
    var socket = window.parent.socket;
    //emit the request for a game start
    socket.emit('requestArrow');
    //set host if car is blue (the player who sent the challenge)
    if(window.parent.__car__ === 'blue') host = true;

    //depending on whether host is true, the following vars will be set giving client (default) settings
    var players = [
      { x: 300, y: 10, car: 'bluecar', leftbounds: 20, rightbounds: 360, scorex: 20, scorey: 460, bounce: -500 },
      { x: 600, y: 10, car: 'redcar', leftbounds: 355, rightbounds: 680, scorex: 400, scorey: 460, bounce: 500 }
    ]
    var playerPos = host? players[0] : players[1];
    var enemyPos = host? players[1] : players[0];

    //if there is no socket an error will be shown.
    if(!socket) document.getElementById('notify').innerText = warnText;
    //scroll down automatically to see full game.
    window.parent.scrollTo(0, window.parent.document.body.scrollHeight);

    //socket reactions-arrowResponse is game start
    socket.on('arrowResponse', function(data) {
      gameGoing = true;
    });
    //enemy player has updated coods
    socket.on('enemyPos', function(data) {
      if(enemy) {
        enemy.x = data;
      }
    });
    //enemy player has updated score
    socket.on('enemyScore', function(data) {
      eScore = data;
      if(eScoreText) eScoreText.text = 'Enemy Distance Remaining: ' + data;
    });
    //update enemy objects as they appear
    socket.on('enemyObj', function(data) {
      if(bombs && stars && document.hasFocus()) {
        if(data.type === 'stars') {
          var star = stars.create(data.obj.x, data.obj.y, 'star');
          starArr.push(star);
        } else if(data.type === 'bombs') {
          var bomb = bombs.create(data.obj.x, data.obj.y, 'bomb');
          bombArr.push(bomb);
        }
      }
    });
    //a winner has been selected
    socket.on('winnerResponse', function(data) {
      document.getElementById('notify').innerText = '';
      if(data.winner !== window.parent.__userName__) {
        eScore = 0;
        socket.emit('playerScore', { score: score, room: window.parent.__gameRoom__ });
      }
    })

    function preload() {
      game.stage.disableVisibilityChange = true;
      game.load.image('redcar', '../resources/redcar.png');
      game.load.image('bluecar', '../resources/bluecar.png');
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
      player = game.add.sprite(playerPos.x, playerPos.y, playerPos.car);
      game.physics.arcade.enable(player);
      player.body.collideWorldBounds = true;
      //enemy
      enemy = game.add.sprite(enemyPos.x, enemyPos.y, enemyPos.car);
      game.physics.arcade.enable(enemy);
      enemy.body.collideWorldBounds = true;
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
      scoreText = game.add.text(playerPos.scorex, playerPos.scorey, 'Distance Remaining: ' + score, { fontSize: '20px', fill: '#000' });
      //enemy score
      eScoreText = game.add.text(enemyPos.scorex, enemyPos.scorey, 'Enemy Distance Remaining: ' + eScore, { fontSize: '20px', fill: '#000' });
      //start the random bombs/stars
      var timeout = getRandomInt(600, 800);
      game.time.events.loop(timeout, createRandomLine, this);
    }

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function hitBomb(person, bomb, adjScore) {
      //Removes the bomb
      bomb.destroy();
      particleBurst(bomb, bombEmitter);
      if(adjScore) {
        score += 300;
        socket.emit('playerScore', { score: score, room: window.parent.__gameRoom__ });
      } else {
        eScore += 300;
      }
    }

    function hitStar(person, star, adjScore) {
      //Removes the star
      star.destroy();
      particleBurst(star, starEmitter);
      if(adjScore) {
        if(score > 301) score -= 300;
        else score = 1;
        socket.emit('playerScore', { score: score, room: window.parent.__gameRoom__ });
      } else {
        if(eScore > 301) eScore -= 300;
        else eScore = 1;
      }
    }

    function checkOverlap(spriteA, spriteB) {
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();
      return Phaser.Rectangle.intersects(boundsA, boundsB);
    }

    function createRandomLine() {
      if(gameGoing && !window.parent.__winner__ && document.hasFocus()) {
        var diceRoll = Math.random();
        if(diceRoll > easiness) {
          var bomb = bombs.create(getRandomInt(playerPos.leftbounds, playerPos.rightbounds), 400, 'bomb');
          bombArr.push(bomb);
          emitObject({ x: bomb.x, y: bomb.y }, 'bombs');

        } else {
          var star = stars.create(getRandomInt(playerPos.leftbounds, playerPos.rightbounds), 400, 'star');
          starArr.push(star);
          emitObject({ x: star.x, y: star.y }, 'stars');
        }
      }
    }

    function emitObject(obj, type) {
      socket.emit('playerObj', { obj: obj, type: type, room: window.parent.__gameRoom__ });
    }

    function checkArr(arr, func, person, adjScore) {
      arr.forEach(function(thing, ind, arr) {
        if(thing.body) {
          thing.body.y -= gameSpeed;
          if(checkOverlap(person, thing)) {
            func(player, thing, adjScore);
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
      //check car collision
      if(checkOverlap(player, enemy)) {
        player.body.velocity.x = playerPos.bounce;
        enemy.body.velocity.x = enemyPos.bounce;
        setTimeout(function() {
          player.body.velocity.x = 0;
          enemy.body.velocity.x = 0;
        }, 100);
      }
      //check focus
      if(!document.hasFocus() && !document.getElementById('notify').innerText && !window.parent.__winner__) {
        document.getElementById('notify').innerText = 'You lost focus. Click on the game to continue.';
      } else if(document.hasFocus() && document.getElementById('notify').innerText) {
        document.getElementById('notify').innerText = '';
      }

      if(score > 0 && gameGoing && !window.parent.__winner__ && document.hasFocus()) {
        //check bomb collision
        checkArr(bombArr, hitBomb, player, true);
        checkArr(bombArr, hitBomb, enemy, false);
        //check star collision
        checkArr(starArr, hitStar, player, true);
        checkArr(starArr, hitStar, enemy, false);
        //decrement score
        score -= 1;
        scoreText.text = 'Distance Remaining: ' + score;
        socket.emit('playerScore', { score: score, room: window.parent.__gameRoom__ });
        //scroll bg
        road.tilePosition.y -= gameSpeed;

        //left and right movement
        if (cursors.left.isDown && player.x > playerPos.leftbounds && !checkOverlap(player, enemy)) {
          player.body.x -= 20;
          //emit pos
          socket.emit('playerPos', {
            x: player.x,
            room: window.parent.__gameRoom__
          });
        } else if (cursors.right.isDown && player.x < playerPos.rightbounds && !checkOverlap(player, enemy)) {
          player.body.x += 20;
          socket.emit('playerPos', {
            x: player.x,
            room: window.parent.__gameRoom__
          });
        }
      } else if(score <= 0 && !window.parent.__winner__) {
        socket.emit('requestWinner', { winner: window.parent.__userName__, room: window.parent.__gameRoom__ });
      }
    }
  };
}

multiMain();