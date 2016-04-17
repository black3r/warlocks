import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as lobbyActions from 'redux/modules/lobby';
import { Grid, Row, Table, Button } from 'react-bootstrap';

@connect(
  state => ({
    user: state.auth.user,
    lobbyList: state.lobby.list,
    selectedLobby: state.lobby.selected,
  }), lobbyActions
)
export default class Chat extends Component {
  static propTypes = {
    user: PropTypes.object,
    lobbyList: PropTypes.array,
    selectedLobby: PropTypes.string
  };

  state = {
    message: '',
    messages: []
  };

  componentDidMount() {
    if (socket) {
      socket.on('msg', this.onMessageReceived);
      setTimeout(() => {
        socket.emit('history', {offset: 0, length: 100});
      }, 100);
    }
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('msg', this.onMessageReceived);
    }
  }

  // TODO: This is kept here as an example of socket communication,
  // This will be reused in in-lobby screen.
  onMessageReceived = (data) => {
    const messages = this.state.messages;
    messages.push(data);
    this.setState({messages});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const msg = this.state.message;

    this.setState({message: ''});

    socket.emit('msg', {
      from: this.props.user.name,
      text: msg
    });
  }


  handleCreateLobby = (event) => {

  }

  handleJoinLobby = (event) => {

  }

  render() {
    const style = require('./Play.scss');
    const {user, lobbyList} = this.props;

    return (
      <Grid className={style.chat}>
        <Row>
          <h1>Room list</h1>
        </Row>
        <Row>
          <Table stripped bordered>
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
                <td><Button bsStyle="primary">
                  join
                </Button></td>
              </tr>
            ))}
            </tbody>
          </Table>
        </Row>
      </Grid>
    );
  }
}
