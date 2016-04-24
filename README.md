# warlocks

Project for school class "Creating internet applications". 

## Project state

- [x] Database design and specification
- [x] Database implementation
- [x] Login implementation
- [x] Lobby implementation
- [ ] Deployment (in progress)
- [ ] Game implementation (in progress)
- [ ] Finalizing

## Specification

Specification in Slovak language is available in docs/ folder inside this repository in word & pdf format.

## Implementation details

- Implementation is based on react-redux-universal-hot-example (TODO add link to github)
- Tests are written using mocha+chai and currently share the developer's database
- Technologies used:
  - React
  - Redux
  - ES6 transpiled by Babel on both server and client
  - Mocha/Chai for testing
  - socket.io for asynchronous two-way communication between server and clients
  - Express.JS for serving API
  - Passport.JS for authentication purposes
  - MongoDB as database + Mongoose.JS as database driver
  - Webpack as minifier and packager of the client-side code.  
