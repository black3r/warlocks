import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as lobbyActions from 'redux/modules/lobby';
import { Grid, Row, Col, Table, Button } from 'react-bootstrap';
import { routeActions } from 'react-router-redux';

@connect(
  state => ({
    user: state.auth.user,
    selectedLobby: state.lobby.selected,
  }), {
    ...lobbyActions,
    pushState: routeActions.push
  }
)
export default class Lobby extends Component {
  static propTypes = {
    user: PropTypes.object,
    selectedLobby: PropTypes.object,
    selectLobby: PropTypes.func.isRequired,
    startLobby: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
  };

  componentDidMount() {
    // Load lobby information
    // subscribe to the lobby
    if (socket) {
      socket.emit('joined lobby', {
        user: this.props.user.username,
        lobby: this.props.selectedLobby._id,
      });

      socket.on('game started', (data) => {
        const game = data.game;
        this.props.startLobby(game.msg);
        // TODO: pushnut do storu game, a potom na willReceiveProps redirectnut na /game
      });
    }
    this.timeout = setInterval(() => {
      if (this.props.selectedLobby) {
        this.props.selectLobby(this.props.selectedLobby._id);
      }
    }, 1000);
  }

  componentWillUnmount() {
    // unsubscribe from the lobby
    if (socket) {
      socket.emit('removed from lobby', {
        user: this.props.user.username,
        lobby: this.props.selectedLobby._id,
      });
    }
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  startGame = () => {
    if (socket) {
      socket.emit('lobby start', {
        user: this.props.user.username,
        lobby: this.props.selectedLobby._id,
      });
    }
  };

  timeout = null;

  // TODO: iba prvy hrac (Vlastnik lobby) moze zacat hru
  render() {
    if (!this.props.selectedLobby) {
      return <Grid />;
    }
    const enabled = this.props.selectedLobby.players.length && this.props.selectedLobby.players[0] === this.props.user.username;

    return (
      <Grid>
        <Row>
          <h1>Room lobby</h1>
        </Row>
        <Row>
          <h3>Players</h3>
        </Row>
        <Row>
          <Col md={4}>
            <Table striped bordered>
              <thead>
              <tr>
                <th>Player name</th>
              </tr>
              </thead>
              <tbody>
              { this.props.selectedLobby && this.props.selectedLobby.players.map((player) => <tr><td>{player}</td></tr>) }
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Button
            bsStyle="primary"
            disabled={ !enabled }
            onClick={ this.startGame }
          >
            Start game
          </Button>
        </Row>
      </Grid>
    );
  }
}
