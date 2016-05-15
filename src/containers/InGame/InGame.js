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

    function create() {
      game.stage.disableVisibilityChange = true;
      var graphics = game.add.graphics();
      game.stage.backgroundColor = '#ff0000';
      graphics.beginFill(0x222222);
      graphics.drawCircle(400, 300, 580);

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
      }
      game.canvas.oncontextmenu = function (e) { e.preventDefault(); return false; }

      that.bullets = game.add.group();
      that.bullets.enableBody = true;
      that.bullets.physicsBodyType = Phaser.Physics.ARCADE;

      that.bullets.createMultiple(50, 'bullet');
      that.bullets.setAll('checkWorldBounds', true);
      that.bullets.setAll('outOfBoundsKill', true);
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
            player: [that.player.x + vector[0], that.player.y + vector[1]],
            target: [game.input.activePointer.x, game.input.activePointer.y],
          });
        }

      }
    }

    function update() {
      if (game.input.activePointer.leftButton.isDown) {
        if (socket) {
          socket.emit('moved', {
            user: that.props.user.username,
            player: [that.player.x, that.player.y],
            target: [game.input.activePointer.x, game.input.activePointer.y],
          });
        }
        // target[0] = game.input.activePointer.x;
        // target[1] = game.input.activePointer.y;
      }

      if (game.input.activePointer.rightButton.isDown) {
        fire();
      }

      for (let i = 0; i < that.targets.length; i++) {
        game.physics.arcade.moveToXY(that.players[i], that.targets[i][0], that.targets[i][1], 200);
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
      });

      socket.on('player fired', (data) => {
        var bullet = this.bullets.getFirstDead();
        bullet.anchor.setTo(0.5, 0.5);
        bullet.reset(data.player[0], data.player[1]);
        game.physics.arcade.moveToXY(bullet, data.target[0], data.target[1]);
      });
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
