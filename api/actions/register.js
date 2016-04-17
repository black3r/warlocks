import { User } from '../models/user';
import { hash } from '../utils/password';

export function register(username, email, password) {
  return hash(password).then((passhash) => {
    const auth = {
      authType: 'local',
      value: passhash
    };

    return User.findOne({
      username: username
    }).exec().then((result) => {
      if (result) {
        // User exists, return error.
        return {
          response: 'error',
          msg: 'username already used'
        }
      } else {
        // Check if user with email exists....

        return User.findOne({
          email: email
        }).exec().then((result) => {
          if (result) {
            return {
              response: 'error',
              msg: 'email already used'
            }
          }
          // Register the user and login.
          const user = new User({username: username, email: email, auth: [auth]});
          return user.save().then((data) => {
            return {
              response: 'success',
              msg: data
            }
          });
        });
      }
    });
  });
}
