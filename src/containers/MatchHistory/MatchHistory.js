import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as matchHistoryActions from 'redux/modules/match';
import { Grid, Row, Table, Button } from 'react-bootstrap';

@connect(
  state => ({
    user: state.auth.user,
    matchHistory: state.match.list,
    openMatch: state.match.openMatch,
  }), matchHistoryActions
)
export default class MatchHistory extends Component {
  static propTypes = {
    user: PropTypes.object,
    matchHistory: PropTypes.array,
    openMatch: PropTypes.string,
    selectMatch: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.load();
  }

  openDetails = (matchId) => () => this.props.selectMatch(matchId);

  render() {
    const style = require('./MatchHistory.scss');
    return (
      <Grid className={style.list}>
        <Row>
          <h1>Match history</h1>
        </Row>
        <Row>
          <Table bordered>
            <thead>
              <tr>
                <th>Match</th>
                <th>Winner</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
            { this.props.user && this.props.matchHistory && this.props.matchHistory.map((match) => (
              [<tr key={match._id}>
                <td>{match._id}</td>
                <td>{match.winner}</td>
                <td><Button bsStyle="primary" onClick={this.openDetails(match._id)}>
                  details <span className="caret" />
                </Button></td>
              </tr>, this.props.openMatch === match._id ?
                <tr>
                  <td colSpan={3}>
                    { match.scores.map((obj) =>
                      <div>
                        {obj.player} died in {obj.value / 1000} seconds.
                      </div>
                    )}
                  </td>
                </tr>
                : null ]
            ))}
            { this.props.user && this.props.matchHistory !== null && !this.props.matchHistory.length &&
              <tr>
                <td colSpan={3}>
                  No matches played yet, go play some!
                </td>
              </tr>
            }
            </tbody>
          </Table>
        </Row>
      </Grid>
    );
  }
}
