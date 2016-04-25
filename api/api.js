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
import { login } from './actions/login';
import { register } from './actions/register';
import { getLobbyList } from './actions/getLobbyList';
import { getLobby } from './actions/getLobby';
import { createLobby } from './actions/createLobby';
import { startLobby } from "./actions/startLobby";

const pretty = new PrettyError();
const app = express();

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
    cookie: { maxAge: 60000 }
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
        console.log("Starting game");
        startLobby(lobby, user).then((game) => {
          // send the game info to every player in the game.. the players
          // should now switch to in-game screen
          console.log("Dostal som hru: ", game);
          const players = game.msg.players;
          for (const pid in players) {
            const player = players[pid];
            userLobbyMap[player] = game._id; // we reuse lobby map as game map
            console.log("Idem logovat");
            userSocketMap[player].emit('game started', {
              game: game
            });
          }
        })
      });

      const clearUser = (user, lobby) => {
        delete userSocketMap[user];
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

      socket.on('disconnect', () => {
        const keys = Object.keys(userSocketMap).filter(key => userSocketMap[key] === socket);
        if (keys.length) {
          const user = keys[0];
          const lobby = userLobbyMap[user];
          clearUser(user, lobby);
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
