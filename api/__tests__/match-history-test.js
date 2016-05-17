import mongoose from 'mongoose';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
chai.should();

import { getMatchHistory } from '../actions/getMatchHistory';
import { Game } from '../models/game';

describe("match history backend", () => {
  before(() => mongoose.connect("mongodb://localhost/warlocks"));
  after(() => mongoose.disconnect());

  beforeEach(() => Game.find({}).remove().exec().then(() => {
    const game = new Game({
      players: ["tester1", "tester2"],
      rounds: [{
        players: ["tester1", "tester2"],
        moves: []
      }],
      roundCount: 1,
      status: "loading",
      scores: []
    });

    return game.save().then(() => {
      const game = new Game({
        players: ["tester1", "tester2"],
        rounds: [{
          players: ["tester1", "tester2"],
          moves: []
        }],
        roundCount: 1,
        status: "finished",
        scores: []
      });
      return game.save().then(() => {
        const game = new Game({
          players: ["tester3", "tester2"],
          rounds: [{
            players: ["tester3", "tester2"],
            moves: []
          }],
          roundCount: 1,
          status: "finished",
          scores: []
        });
        return game.save();
      });
    })
  }));

  afterEach(() => Game.find({}).remove().exec());

  it("should find one game in match history", () => getMatchHistory("tester1").then((games) => {
    games.should.be.an('array');
    games.should.have.lengthOf(1);
    games[0].should.be.an('object');
    games[0].should.have.ownProperty('_id');
  }));
});
