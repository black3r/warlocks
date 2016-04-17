import mongoose from 'mongoose';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

const { should, expect } = chai;
chai.should();

import { register } from '../actions/register';
import { login } from '../actions/login';
import { User } from '../models/user';

describe('login backend', () => {
  before(() => mongoose.connect("mongodb://localhost/warlocks"));
  after(() => mongoose.disconnect());

  beforeEach(() =>
    User.find({
      username: /tester/
    }).remove().exec()
  );

  afterEach(() =>
    User.find({
      username: /tester/
    }).remove().exec()
  );

  it("shouldn't be able to login with non-existent user", () =>
    login('tester', 'password').then((data) => {
      data.should.have.property('error', 'Incorrect username')
    })
  );

  it("shouldn't be able to login with invalid password", () =>
    register('tester', 'tester@example.com', 'validpassword')
      .then(() => login('tester', 'invalidpassword'))
      .then((data) => {
        data.should.have.property('error', 'Incorrect password!');
      })
  );

  it("shouldn't be able to login into password-less account", () => {
    const user = new User({
      username: 'tester',
      email: 'tester@example.com',
      auth: []
    });
    return user.save().then(() => login('tester', 'password')).then((data) => {
      data.should.have.property('error', 'This user account does not support password-based login');
    });
  });

  it("should be able to login with existent user", () =>
    register('tester', 'tester@example.com', 'validpassword')
      .then(() => login('tester', 'validpassword'))
      .then((data) => {
        data.should.not.have.property('error');
        data.should.have.property('result');
        data.result.should.have.property('username', 'tester');
        data.result.should.have.property('email', 'tester@example.com');
      })
  );

});

