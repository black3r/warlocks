import crypto from 'crypto';

const config = {
  iterations: 24000,
  method: 'pbkdf2_sha256'
};

export function hash(password, presetSalt = null, presetIterations = null) {
  return new Promise((res, rej) => {
    crypto.randomBytes(64, (randomErr, genSalt) => {
      if (randomErr) {
        rej(randomErr);
      }
      const salt = presetSalt ? new Buffer(presetSalt, 'hex') : genSalt;
      const iterations = presetIterations || config.iterations;

      crypto.pbkdf2(password, salt, iterations, 64, 'sha256', (pbkdfErr, key) => {
        if (pbkdfErr) {
          rej(pbkdfErr);
        }
        res([config.method, config.iterations, salt.toString('hex'), key.toString('hex')].join('$'));
      });
    });
  });
}

export function verify(password, passhash) {
  return new Promise((res, rej) => {
    try {
      const [method, iterations, salt] = passhash.split('$');

      if (method !== config.method) {
        rej("Unknown hash method.");
      }

      hash(password, salt, +iterations).then((correctKey) => {
        res(correctKey === passhash);
      });
    } catch (err) {
      rej("Unable to decode password hash!");
    }
  });
}
