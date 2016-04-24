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
import { Game } from '../models/game';

describe('lobby backend', () => {
  before(() => mongoose.connect("mongodb://localhost/warlocks"));
  after(() => mongoose.disconnect());

  beforeEach(() =>
    Lobby.find({}).remove().exec().then(() => Game.find({}).remove().exec())
  );

  afterEach(() =>
    Lobby.find({}).remove().exec().then(() => Game.find({}).remove().exec())
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
    createLobby("test1").then((response) =>
      Lobby.findOne({
        _id: response.msg._id
      })
    ).then((lobby) => {
      lobby.players.push("tester1");
      return lobby.save().then(() => lobby);
    }).then((lobby) => startLobby(lobby._id, "tester1")).then((data) => {
      data.should.have.property('response', 'success');
      data.should.have.property('msg');
      data.msg.should.be.ok;
      data.msg.should.have.property('_id');
      data.msg.should.have.property('players');
      data.msg.players.should.be.an('array');
      data.msg.players.should.not.be.empty;
      data.msg.players.should.have.lengthOf(1);
      data.msg.should.have.property("rounds");
      data.msg.should.have.property("roundCount");
      data.msg.should.have.property("scores");
      data.msg.should.have.property("status", "loading");
      return Lobby.findOne({name: "test1"}).exec().should.eventually.equal(null);
    })
  );

  it("should not start lobby by unauthorized player", () =>
    createLobby("test1").then((response) =>
      Lobby.findOne({
        _id: response.msg._id
      })
    )
    .then((lobby) => {
      lobby.players.push("tester1");
      return lobby.save().then(() => lobby);
    }).then((lobby) => startLobby(lobby._id, "tester2")).then((data) => {
      data.should.have.property('msg', 'only the lobby owner can start a game');
      data.should.have.property('response', 'error');
    })
  );

  it("should not start empty lobby", () =>
    createLobby("test1").then((lobby) => startLobby(lobby.msg._id, "tester1")).then((data) => {
      data.should.have.property('msg', 'can\'t start an empty lobby');
      data.should.have.property('response', 'error');
    })
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
