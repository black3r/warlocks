import React, {Component, PropTypes} from 'react';

import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import * as authActions from 'redux/modules/auth';

@connect(
  state => ({
    user: state.auth.user,
    registerError: state.auth.registerError
  }),
  authActions)
export default class Register extends Component {
  static propTypes = {
    user: PropTypes.object,
    register: PropTypes.func,
    registerError: PropTypes.string,
    login: PropTypes.func,
    logout: PropTypes.func
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const input = this.refs.username;
    const emailInput = this.refs.email;
    const passwordInput = this.refs.password;
    this.props.register(input.value, emailInput.value, passwordInput.value);
    input.value = '';
    emailInput.value = '';
    passwordInput.value = '';
  };

  render() {
    const {user, logout} = this.props;
    const styles = require('./Register.scss');
    return (
      <div className={styles.loginPage + ' container'}>
        <Helmet title="Register"/>
        <h1>Register</h1>
        {!user &&
        <div>
          <form className="login-form col-lg-4 col-md-6 col-sm-12" onSubmit={this.handleSubmit}>
            <h3>Register an account</h3>
            { this.props.registerError &&
              <div className="alert alert-danger">
                {this.props.registerError || null}
              </div>
            }
            <div className="form-group">
              <input type="text" ref="username" placeholder="Enter a username" className="form-control"/>
            </div>
            <div className="form-group">
              <input type="email" ref="email" placeholder="Enter an email" className="form-control"/>
            </div>
            <div className="form-group">
              <input type="password" ref="password" placeholder="Password" className="form-control"/>
            </div>
            <div className="form-group">
              <button className="btn btn-success" onClick={this.handleSubmit}><i className="fa fa-sign-in"/>
                {' '}Register
              </button>
            </div>
          </form>
        </div>
        }
        {user &&
        <div>
          <p>You are currently logged in as {user.name}.</p>

          <div>
            <button className="btn btn-danger" onClick={logout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
      </div>
    );
  }
}
