import mongoose from 'mongoose';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

const { should, expect } = chai;
chai.should();

import { register } from '../actions/register';
import { User } from '../models/user';

describe('register backend', () => {
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

  it("shouldn't be able to register an email or username twice", () =>
    register('tester', 'tester@example.com', 'password').then(() =>
      register('tester2', 'tester@example.com', 'password')
    ).then((data) => {
      data.should.have.property('response', 'error');
      data.should.have.property('msg', 'email already used');
    })
  );

  it("shouldn't be able to register an username twice", () =>
    register('tester', 'tester@example.com', 'password').then(() =>
      register('tester', 'tester@example.com', 'password')
    ).then((data) => {
      data.should.have.property('response', 'error');
      data.should.have.property('msg', 'username already used');
    })
  );

  it("should be able to register", () => {
    register('tester', 'tester@example.com', 'password').then((data) => {
      data.should.have.property('response', 'success');
      data.should.have.property('msg');
      data.msg.username.should.be.equal('tester');
      data.msg.email.should.be.equal('tester@example.com');
    })
  });
});
