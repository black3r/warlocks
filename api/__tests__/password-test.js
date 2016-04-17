import { hash, verify } from '../utils/password';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
chai.should();

describe('password hasher', () => {
  it('should be able to verify previously hashed value', () =>
    hash('password').then((passhash) => verify('password', passhash).should.eventually.equal(true))
  );
});
