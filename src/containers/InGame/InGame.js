import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as lobbyActions from 'redux/modules/lobby';
import { Grid, Row, Col, Table, Button } from 'react-bootstrap';

@connect(
  state => ({
    user: state.auth.user,
    selectedLobby: state.lobby.selected,
    game: state.game.game,
  }), lobbyActions
)
export default class InGame extends Component {
  static propTypes = {
    user: PropTypes.object,
    selectedLobby: PropTypes.object,
    game: PropTypes.object,
    selectLobby: PropTypes.func.isRequired,
  };

  player = null;
  players = [];
  moving = [];
  target = [0, 0];
  targets = [];
  bullets = [];

  componentDidMount() {
    const Phaser = window.Phaser;
    const that = this;

    function preload() {
      game.load.baseURL = 'http://examples.phaser.io/assets/';
      game.load.crossOrigin = 'anonymous';

      game.load.image('phaser', 'sprites/phaser-dude.png');
      game.load.image('bullet', 'sprites/purple_ball.png');
    }

    var fireRate = 400;
    var nextFire = 0;

    function collisionHandler(player, bullet) {
      bullet.kill();
      // destroy the bullet when it hit someone..
      // the information where to move the player will come from server.
      if (that.player === player) {
        const angle = game.physics.arcade.angleBetween(player, bullet);
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        console.log(x, y);
        player.x -= x * 50;
        player.y -= y * 50;

        socket.emit('got hit', {
          user: that.props.user.username,
          vector: [x, y],
        });
      }
    }

    function create() {
      game.stage.disableVisibilityChange = true;
      var graphics = game.add.graphics();
      game.stage.backgroundColor = '#ff0000';
      graphics.beginFill(0x222222);
      graphics.drawCircle(400, 300, 580);

      that.bullets = game.add.group();
      that.bullets.enableBody = true;
      that.bullets.physicsBodyType = Phaser.Physics.ARCADE;

      that.bullets.createMultiple(50, 'bullet');
      that.bullets.setAll('checkWorldBounds', true);
      that.bullets.setAll('outOfBoundsKill', true);
      that.bullets.setAll('anchor.x', 0.5);
      that.bullets.setAll('anchor.y', 0.5);

      for (let i = 0; i < that.props.game.players.length; i++) {
        const [x, y] = [200*Math.sin(i*Math.PI/4) + 400, 200*Math.cos(i*Math.PI/4) + 300];
        const tempPlayer = game.add.sprite(x, y, 'phaser');
        game.physics.enable(tempPlayer, Phaser.Physics.ARCADE);
        tempPlayer.anchor.setTo(0.5);
        that.players.push(tempPlayer);
        if (that.props.game.players[i] === that.props.user.username) {
          console.log("My player has id: ", i);
          that.player = tempPlayer;
        }
        that.targets.push([x, y]);
        that.moving.push(false);
      }
      game.canvas.oncontextmenu = function (e) { e.preventDefault(); return false; }
    }

    function fire() {
      if (game.time.now > nextFire && that.bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;
        const vector = [game.input.activePointer.x - that.player.x, game.input.activePointer.y - that.player.y];
        const veclen = Math.sqrt(vector[0]*vector[0] + vector[1]*vector[1]);
        vector[0] /= veclen;
        vector[1] /= veclen;
        vector[0] *= 30;
        vector[1] *= 30;
        if (socket) {
          socket.emit('fired a shot', {
            user: that.props.user.username,
            // player: [that.player.x + vector[0], that.player.y + vector[1]],
            player: [0, 0], // temporary when testing collision detection
            target: [game.input.activePointer.x, game.input.activePointer.y],
          });
        }

      }
    }

    function update() {
      for (var i = 0; i < that.players.length; i++) {
        const player = that.players[i];
        game.physics.arcade.overlap(that.bullets, player, collisionHandler, null, this);
      }

      if (game.input.activePointer.leftButton.isDown) {
        if (socket) {
          socket.emit('moved', {
            user: that.props.user.username,
            player: [that.player.x, that.player.y],
            target: [game.input.activePointer.x, game.input.activePointer.y],
          });
        }
      }

      if (game.input.activePointer.rightButton.isDown) {
        fire();
      }

      for (let i = 0; i < that.targets.length; i++) {
        const dist = game.physics.arcade.distanceToXY(that.players[i], that.targets[i][0], that.targets[i][1]);
        if (that.moving[i] && dist < 5) {
          that.moving[i] = false;
          that.players[i].body.velocity.setTo(0, 0);
        }
        if (that.moving[i]) {
          game.physics.arcade.moveToXY(that.players[i], that.targets[i][0], that.targets[i][1], 200);
        }
      }
    }

    const game = new Phaser.Game(800, 600, Phaser.AUTO, 'ingame_screen', {
      preload: preload,
      create: create,
      update: update
    });

    if (socket) {
      console.log("Setting up listener");
      socket.on('player moved', (data) => {
        console.log("Received pid: ", data.pid);
        this.players[data.pid].x = data.player[0];
        this.players[data.pid].y = data.player[1];
        this.targets[data.pid] = data.target;
        this.moving[data.pid] = true;
      });

      socket.on('player fired', (data) => {
        var bullet = this.bullets.getFirstDead();
        bullet.reset(data.player[0], data.player[1]);
        game.physics.arcade.moveToXY(bullet, data.target[0], data.target[1]);
      });

      socket.on('player got hit', (data) => {
        for (let i = 0; i < 10; i++) {
          const distance = (10 - i) * 1.5;
          const delay = (i + 1) * 100;
          setTimeout(() => {
            this.players[data.pid].x -= data.vector[0] * distance;
            this.players[data.pid].y -= data.vector[1] * distance;
          }, delay)
        }
      })
    }
  }

  componentWillUnmount() {
    // posle sa disconnect message
  }

  render() {
    // TODO: store pre hru
    return (
      <Grid>
        <Row>
          <h1>Game: #ID</h1>
          <div id="ingame_screen" />
        </Row>
      </Grid>
    );
  }
}
