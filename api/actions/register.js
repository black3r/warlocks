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
    }).exec().then((usernameFindResult) => {
      if (usernameFindResult) {
        // User exists, return error.
        return {
          response: 'error',
          msg: 'username already used'
        };
      }
      // Check if user with email exists....

      return User.findOne({
        email: email
      }).exec().then((emailFindResult) => {
        if (emailFindResult) {
          return {
            response: 'error',
            msg: 'email already used'
          };
        }
        // Register the user and login.
        const user = new User({username: username, email: email, auth: [auth]});
        return user.save().then((data) => {
          return {
            response: 'success',
            msg: data
          };
        });
      });
    });
  });
}
