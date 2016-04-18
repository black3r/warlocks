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
export default class Lobby extends Component {
  static propTypes = {
    user: PropTypes.object,
    selectedLobby: PropTypes.object,
  };

  componentDidMount() {
    // Load lobby information
    // subscribe to the lobby
    if (socket) {
      socket.emit('joined lobby', {
        user: this.props.user.username,
        lobby: this.props.selectedLobby._id,
      });
    }
  }

  componentWillUnmount() {
    // unsubscribe from the lobby
    if (socket) {
      socket.emit('removed from lobby', {
        user: this.props.user.username,
        lobby: this.props.selectedLobby._id,
      });
    }
  }

  // TODO: iba prvy hrac (Vlastnik lobby) moze zacat hru
  render() {
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
          <Button bsStyle="primary">
            Start game
          </Button>
        </Row>
      </Grid>
    );
  }
}
