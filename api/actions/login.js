import { User } from '../models/user';
import { verify } from '../utils/password';

export function login(username, password) {
  return User.findOne({
    username: username
  }).exec().then((user) => {
    if (!user) {
      return {
        result: null,
        error: "Incorrect username"
      };
    }

    const passHash = user.getAuth('local');
    if (!passHash) {
      return {
        result: null,
        error: "This user account does not support password-based login"
      };
    }

    return verify(password, passHash).then((res) => {
      if (!res) {
        return {
          result: null,
          error: "Incorrect password!"
        };
      }
      return {
        result: user
      };
    });
  });
}
