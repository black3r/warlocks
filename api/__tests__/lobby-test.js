import mongoose from 'mongoose';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
chai.should();

import { createLobby } from '../actions/createLobby';
import { getLobby } from '../actions/getLobby';
import { getLobbyList } from '../actions/getLobbyList';
import { startLobby } from '../actions/startLobby';
import { Lobby } from '../models/lobby';

describe('lobby backend', () => {
  before(() => mongoose.connect("mongodb://localhost/warlocks"));
  after(() => mongoose.disconnect());

  beforeEach(() =>
    Lobby.find({}).remove().exec()
  );

  afterEach(() =>
    Lobby.find({}).remove().exec()
  );

  it("should create a lobby", () =>
    createLobby("testing").then((lobby) => {
      lobby.should.be.ok;
      lobby.should.have.property('response', 'success');
      lobby.should.have.property('msg');
      lobby.msg.should.have.property('_id');
      lobby.msg.should.have.property('name', 'testing');
    })
  );

  it("should get lobby list", () =>
    createLobby("test1").then(() => createLobby("test2")).then(() => getLobbyList()).then((lobbyList) => {
      lobbyList.should.be.ok;
      lobbyList.should.have.property('response', 'success');
      lobbyList.should.have.property('msg');
      lobbyList.msg.should.be.an('array');
      lobbyList.msg.should.not.be.empty;
      lobbyList.msg.should.have.lengthOf(2);
    })
  );

  it("should start lobby", () =>
    startLobby("lobby").should.eventually.be.ok
  );

  it("should get lobby", () =>
    createLobby("test1").then((data) => getLobby(data.msg._id).then((lobby) => {
      lobby.should.be.ok;
      lobby.should.have.property('response', 'success');
      lobby.should.have.property('msg');
      lobby.msg.should.eql(data.msg);
    }))
  );
});
