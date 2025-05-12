import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Google Strategy for Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            email: profile.emails[0].value,
            firstName: profile.name.givenName || '',
            lastName: profile.name.familyName || '',
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Generate random password
            image: profile.photos[0]?.value || '', // Store Google profile image URL directly
          });
        } else if (!user.image && profile.photos && profile.photos[0]) {
          
          user.image = profile.photos[0].value;
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
