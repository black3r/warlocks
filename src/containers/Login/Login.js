import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import * as authActions from 'redux/modules/auth';

@connect(
  state => ({
    user: state.auth.user,
    loginError: state.auth.loginError
  }),
  authActions)
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    loginError: PropTypes.string,
    login: PropTypes.func,
    logout: PropTypes.func
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const input = this.refs.username;
    const passwordInput = this.refs.password;
    this.props.login(input.value, passwordInput.value);
    input.value = '';
    passwordInput.value = '';
  };

  render() {
    const {user, logout} = this.props;
    const styles = require('./Login.scss');
    return (
      <div className={styles.loginPage + ' container'}>
        <Helmet title="Login"/>
        <h1>Login</h1>
        {!user &&
        <div>
          <form className="login-form form-inline" onSubmit={this.handleSubmit}>
            <h3>Login with a password</h3>
            { this.props.loginError &&
              <div className="alert alert-danger">
                {this.props.loginError || null}
              </div>
            }
            <div className="form-group">
              <input type="text" ref="username" placeholder="Enter a username" className="form-control"/>
              <input type="password" ref="password" placeholder="Password" className="form-control"/>
            </div>
            <button className="btn btn-success" onClick={this.handleSubmit}><i className="fa fa-sign-in"/>{' '}Log In
            </button>
            <p className="register-p">
              Don't have an account? You can register one <Link to="/register/">here</Link>!
            </p>
            <h3>Login with social account</h3>
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
