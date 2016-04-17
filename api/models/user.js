import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  auth: [{
    authType: String,
    value: String
  }]
});

userSchema.methods.getAuth = function getAuth(type) {
  for (const authIndex in this.auth) {
    if (this.auth.hasOwnProperty(authIndex)) {
      const auth = this.auth[authIndex];
      if (auth.authType === type) {
        return auth.value;
      }
    }
  }
  return null;
};

export const User = mongoose.model('User', userSchema);
