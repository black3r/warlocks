import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './models/user';
import { Lobby } from './models/lobby';
import { Game } from './models/game';
import { login } from './actions/login';
import { register } from './actions/register';
import { getLobbyList } from './actions/getLobbyList';
import { getLobby } from './actions/getLobby';
import { createLobby } from './actions/createLobby';
import { startLobby } from "./actions/startLobby";
import { gameOver } from "./actions/gameOver";
import { getMatchHistory } from "./actions/getMatchHistory";

const pretty = new PrettyError();
const app = express();
const MongoStore = require('connect-mongo')(session);

const server = new http.Server(app);

const io = new SocketIo(server);
io.path('/ws');

mongoose.connect("mongodb://localhost/warlocks");
const db = mongoose.connection;
db.on('error', () => console.error('Database connection error!'));

// don't do anything until connected to database.
db.once('open', () => {
  app.use(session({
    secret: 'SH0TjzEdtlcoZ7j6mJKNvs1GEc6uAcqCgdIpEfcdVLDKCoZFR2Rc48suaNnh',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
    store: new MongoStore({
      mongooseConnection: db,
    }),
  }));
  app.use(bodyParser.json());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((user, done) => User.findOne({_id: user}).exec().then((result) => done(null, result)).catch((err) => done(err)));

  passport.use(new LocalStrategy((username, password, done) => {
    login(username, password).then((response) => done(response.error, response.result, null));
  }));

  app.post('/auth/login/', (req, res, next) => passport.authenticate('local', (dbErr, user) => {
    if (dbErr) {
      res.json({
        result: null,
        error: dbErr,
      });
    } else {
      req.logIn(user, (loginErr) => {
        res.json({
          result: {
            username: user.username,
            email: user.email
          },
          error: loginErr
        });
      });
    }
  })(req, res, next));

  app.get('/loadAuth/', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        username: req.user.username,
        email: req.user.email,
      });
    } else {
      res.json(null);
    }
  });

  app.post('/auth/register/', (req, res) => {
    const {username, email, password} = req.body;
    register(username, email, password).then(data => res.json(data));
  });

  app.post('/auth/logout/', (req, res) => {
    req.logout();
    res.json({});
  });

  app.get('/lobby/list/', (req, res) => {
    getLobbyList().then((data) => res.json(data));
  });

  app.get('/match/list/', (req, res) => {
    if (req.isAuthenticated()) {
      const username = req.user.username;
      getMatchHistory(username).then((data) => res.json(data));
    } else return [];
  });

  app.post('/lobby/get/', (req, res) => {
    const {id} = req.body;
    getLobby(id).then((data) => res.json(data));
  });

  app.post('/lobby/create/', (req, res) => {
    const {name} = req.body;
    createLobby(name).then((data) => res.json(data));
  });

  const bufferSize = 100;
  const messageBuffer = new Array(bufferSize);
  let messageIndex = 0;

  if (config.apiPort) {
    const runnable = app.listen(config.apiPort, (err) => {
      if (err) {
        console.error(err);
      }
      console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
      console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
    });

    const userSocketMap = {};
    const userLobbyMap = {};
    const userGameMap = {};
    const userPlayersMap = {};
    const gameMoveMap = {};
    const gameStartMap = {};

    io.on('connection', (socket) => {
      socket.emit('news', {msg: `'Hello World!' from server`});

      socket.on('joined lobby', (data) => {
        // TODO: handle if user joins twice (don't allow it, throw error into GUI)
        const { user, lobby } = data;
        userSocketMap[user] = socket;
        userLobbyMap[user] = lobby;
        Lobby.findOne({
          _id: lobby
        }).exec().then((obj) => {
          obj.players.push(user);
          obj.save();
        });
      });

      socket.on('lobby start', (data) => {
        const { user, lobby } = data;
        console.log('lobby start', lobby);
        startLobby(lobby, user).then((game) => {
          // send the game info to every player in the game.. the players
          // should now switch to in-game screen
          const players = game.msg.players;
          console.log("lobby started");
          for (let pid = 0; pid < players.length; pid++) {
            console.log("handling player ", pid);
            const player = players[pid];
            userGameMap[player] = game.msg._id; // we reuse lobby map as game map
            gameMoveMap[game.msg._id] = [];
            gameStartMap[game.msg._id] = +(new Date());
            userPlayersMap[player] = players;
            console.log("emitting");
            userSocketMap[player].emit('game started', {
              game: game
            });
            console.log("emitted");
          }
        });
      });

      socket.on('fired a shot', (data) => {
        const { user, player, target } = data;
        const game = userGameMap[user];
        gameMoveMap[game].push({
          player: user,
          moveType: 'fired a shot',
          coordinates: player,
          vector: target,
          time: +(new Date()) - gameStartMap[game],
          attackType: '',
        });
        const players = userPlayersMap[user];

        let playingPid = null;
        for (let pid = 0; pid < players.length; pid++) {
          if (players[pid] === user) {
            playingPid = pid;
          }
        }
        for (let pid = 0; pid < players.length; pid++) {
          const playerName = players[pid];
          userSocketMap[playerName].emit('player fired', {
            ...data,
            pid: playingPid
          });
        }
      });

      socket.on('moved', (data) => {
        const { user, player, target } = data;
        const game = userGameMap[user];

        gameMoveMap[game].push({
          player: user,
          moveType: 'moved',
          coordinates: player,
          vector: target,
          time: +(new Date()) - gameStartMap[game],
          attackType: '',
        });

        const players = userPlayersMap[user];
        let playingPid = null;
        for (let pid = 0; pid < players.length; pid++) {
          if (players[pid] === user) {
            playingPid = pid;
          }
        }
        for (let pid = 0; pid < players.length; pid++) {
          const playerName = players[pid];
          userSocketMap[playerName].emit('player moved', {
            ...data,
            pid: playingPid
          });
        }
      });

      socket.on('got hit', (data) => {
        const { user, vector } = data;
        const players = userPlayersMap[user];
        let playingPid = null;
        for (let pid = 0; pid < players.length; pid++) {
          if (players[pid] === user) {
            playingPid = pid;
          }
        }

        const game = userGameMap[user];
        gameMoveMap[game].push({
          player: user,
          moveType: 'got hit',
          coordinates: [],
          vector: vector,
          time: +(new Date()) - gameStartMap[game],
          attackType: '',
        });

        for (let pid = 0; pid < players.length; pid++) {
          const playerName = players[pid];
          userSocketMap[playerName].emit('player got hit', {
            ...data,
            pid: playingPid
          });
        }
      });

      socket.on('dmg', (data) => {
        const { user } = data;

        const players = userPlayersMap[user];
        let playingPid = null;
        for (let pid = 0; pid < players.length; pid++) {
          if (players[pid] === user) {
            playingPid = pid;
          }
        }

        const game = userGameMap[user];
        gameMoveMap[game].push({
          player: user,
          moveType: 'dmg',
          coordinates: [],
          vector: [],
          time: +(new Date()) - gameStartMap[game],
          attackType: '',
        });

        for (let pid = 0; pid < players.length; pid++) {
          const playerName = players[pid];
          userSocketMap[playerName].emit('got dmg', {
            ...data,
            pid: playingPid
          });
        }
      });

      socket.on('died', (data) => {
        const { user } = data;

        const players = userPlayersMap[user];
        let playingPid = null;
        for (let pid = 0; pid < players.length; pid++) {
          if (players[pid] === user) {
            playingPid = pid;
          }
        }

        const game = userGameMap[user];
        gameMoveMap[game].push({
          player: user,
          moveType: 'died',
          coordinates: [],
          vector: [],
          time: +(new Date()) - gameStartMap[game],
          attackType: '',
        });

        for (let pid = 0; pid < players.length; pid++) {
          const playerName = players[pid];
          userSocketMap[playerName].emit('player died', {
            ...data,
            pid: playingPid
          });
        }
      });

      socket.on('won', (data) => {
        const { user } = data;

        const game = userGameMap[user];

        // No need to notify players, they already know
        // Just update the info in database
        gameOver(game, gameMoveMap[game], user).then(() => {
          players = userPlayersMap[user];
          for (let pid = 0; pid < players.length; pid++) {
            if (players[pid] !== user) {
              delete userGameMap[players[pid]];
              delete userPlayersMap[players[pid]];
            }
          }
          delete userGameMap[user];
          delete userPlayersMap[user];
          delete gameMoveMap[game];
          delete gameStartMap[game];
        });
      });

      const clearUser = (user, lobby) => {
        delete userLobbyMap[user];
        Lobby.findOne({
          _id: lobby
        }).exec().then((obj) => {
          const index = obj.players.indexOf(user);
          if (index !== -1) {
            obj.players.splice(index, 1);
            obj.save();
          }
        });
      };

      socket.on('removed from lobby', (data) => {
        const { user, lobby } = data;
        clearUser(user, lobby);
      });

      socket.on('leave', (data) => {
        const { user } = data;
        if (userGameMap.hasOwnProperty(user)) {
          const players = userPlayersMap[user];

          let playingPid = null;
          for (let pid = 0; pid < players.length; pid++) {
            if (players[pid] === user) {
              playingPid = pid;
            }
          }

          for (let pid = 0; pid < players.length; pid++) {
            const playerName = players[pid];
            userSocketMap[playerName].emit('player died', {
              pid: playingPid
            });
          }
        }
      });

      socket.on('disconnect', () => {
        const keys = Object.keys(userSocketMap).filter(key => userSocketMap[key] === socket);
        if (keys.length) {
          const user = keys[0];
          const lobby = userLobbyMap[user];
          clearUser(user, lobby);
          if (userGameMap.hasOwnProperty(user)) {
            const players = userPlayersMap[user];

            let playingPid = null;
            for (let pid = 0; pid < players.length; pid++) {
              if (players[pid] === user) {
                playingPid = pid;
              }
            }

            for (let pid = 0; pid < players.length; pid++) {
              const playerName = players[pid];
              userSocketMap[playerName].emit('player died', {
                pid: playingPid
              });
            }
          }
        }
      });

      socket.on('history', () => {
        for (let index = 0; index < bufferSize; index++) {
          const msgNo = (messageIndex + index) % bufferSize;
          const msg = messageBuffer[msgNo];
          if (msg) {
            socket.emit('msg', msg);
          }
        }
      });

      socket.on('msg', (data) => {
        data.id = messageIndex;
        messageBuffer[messageIndex % bufferSize] = data;
        messageIndex++;
        io.emit('msg', data);
      });
    });
    io.listen(runnable);
  } else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
  }
});
