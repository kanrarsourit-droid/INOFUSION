const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret || clientID.startsWith('google_placeholder')) {
    console.warn('⚠️ Google Client ID/Secret placeholder detected. Passport Google OAuth will run in simulated fallback state.');
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID || 'dummy_id.apps.googleusercontent.com',
        clientSecret: clientSecret || 'dummy_secret',
        callbackURL: '/api/auth/google/callback',
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          
          if (!email) {
            return done(new Error('Google Account does not expose email address.'), null);
          }

          // 1. Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. Check if user exists with the same email address
          user = await User.findOne({ email });
          if (user) {
            // Link Google ID to existing account
            user.googleId = profile.id;
            user.isEmailVerified = true;
            await user.save();
            return done(null, user);
          }

          // 3. Create a new patient user
          user = await User.create({
            name: profile.displayName || profile.name.givenName || 'Google User',
            email: email,
            googleId: profile.id,
            role: 'patient',
            isEmailVerified: true
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = configurePassport;
