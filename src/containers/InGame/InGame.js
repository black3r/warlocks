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
        const tempPlayer = game.add.sprite(0, 0, 'phaser');
        game.physics.enable(tempPlayer, Phaser.Physics.ARCADE);
        that.players.push(tempPlayer);
        if (that.props.game.players[i] === that.props.user.username) {
          console.log("My player has id: ", i);
          that.player = tempPlayer;
        }
        that.targets.push([0, 0]);
      }
      game.canvas.oncontextmenu = function (e) { e.preventDefault(); return false; }

      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;

      bullets.createMultiple(50, 'bullet');
      bullets.setAll('checkWorldBounds', true);
      bullets.setAll('outOfBoundsKill', true);
    }

    var bullets = [];

    function fire() {
      if (game.time.now > nextFire && bullets.countDead() > 0) {
        nextFire = game.time.now + fireRate;
        if (socket) {
          socket.emit('fired a shot', {
            user: that.props.user.username,
            player: [that.player.x, that.player.y],
            target: [game.input.activePointer.x, game.input.activePointer.y],
          });
        }
        // var bullet = bullets.getFirstDead();
        // bullet.reset(player.x, player.y);
        // game.physics.arcade.moveToXY(bullet, game.input.activePointer.x, game.input.activePointer.y);
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
