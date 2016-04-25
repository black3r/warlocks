import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as lobbyActions from 'redux/modules/lobby';
import { Grid, Row, Col, Table, Button } from 'react-bootstrap';

@connect(
  state => ({
    user: state.auth.user,
    selectedLobby: state.lobby.selected,
  }), lobbyActions
)
export default class InGame extends Component {
  static propTypes = {
    user: PropTypes.object,
    selectedLobby: PropTypes.object,
    selectLobby: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const Phaser = window.Phaser;

    function preload() {
      game.load.image('sky', 'assets/sky.png');
    }

    function create() {

    }

    function update() {

    }

    const game = new Phaser.Game(800, 600, Phaser.AUTO, 'ingame_screen', {
      preload: preload,
      create: create,
      update: update
    });
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
