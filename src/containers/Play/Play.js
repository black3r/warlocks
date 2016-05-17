import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as lobbyActions from 'redux/modules/lobby';
import { Grid, Row, Table, Button, Input } from 'react-bootstrap';
import { routeActions } from 'react-router-redux';

@connect(
  state => ({
    user: state.auth.user,
    lobbyList: state.lobby.list,
    selectedLobby: state.lobby.selected,
  }), {
    ...lobbyActions,
    pushState: routeActions.push
  }
)
export default class Chat extends Component {
  static propTypes = {
    user: PropTypes.object,
    lobbyList: PropTypes.array,
    selectedLobby: PropTypes.object,
    selectLobby: PropTypes.func.isRequired,
    createLobby: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
  };

  state = {
    inputValue: '',
  };

  componentDidMount() {
    this.timeout = setInterval(() => {
      this.props.load();
    }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedLobby !== nextProps.selectedLobby) {
      this.props.pushState('/lobby');
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  timeout = null;

  handleLobbyNameChange = (event) =>
    this.setState({
      inputValue: event.target.value,
    });

  handleCreateLobby = () => this.props.createLobby(this.state.inputValue);
  handleJoinLobby = (lobbyId) => () => this.props.selectLobby(lobbyId);

  render() {
    const style = require('./Play.scss');
    const {user, lobbyList} = this.props;

    return (
      <Grid className={style.chat}>
        <Row>
          <h1>Room list</h1>
        </Row>
        <Row>
          <Table striped bordered>
            <thead>
              <tr>
                <th>
                  Room name
                </th>
                <th>
                  Players
                </th>
                <th>

                </th>
             </tr>
            </thead>
            <tbody>
            {user && lobbyList.map((room) => (
              <tr key={room._id}>
                <td>{room.name}</td>
                <td>{room.players.length}</td>
                <td><Button bsStyle="primary" onClick={this.handleJoinLobby(room._id)}>
                  join
                </Button></td>
              </tr>
            ))}
            </tbody>
          </Table>
        </Row>
        <Row>
          <Input className={style.lobbyinput} type="text" onChange={this.handleLobbyNameChange} value={this.state.inputValue} />
          <Button onClick={this.handleCreateLobby}>
            Create Lobby
          </Button>
        </Row>
      </Grid>
    );
  }
}
