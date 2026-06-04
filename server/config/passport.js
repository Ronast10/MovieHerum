import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production"
        ? "https://movieherum.onrender.com/api/auth/google/callback"
        : "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          username:
            profile.displayName.replace(/\s+/g, "").toLowerCase() +
            Math.floor(Math.random() * 999),
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-12),
          avatar: profile.photos[0]?.value || "",
          isVerified: true,
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;