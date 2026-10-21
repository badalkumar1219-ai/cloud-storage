// ============================================
// Passport.js – Google OAuth 2.0 Configuration
// ============================================

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Store user information in the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Retrieve user information from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google OAuth only when credentials are available
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,

        // Use the callback URL configured in Render
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (_accessToken, _refreshToken, profile, done) => {
        // Extract the required information from Google's profile
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || "",
          avatar: profile.photos?.[0]?.value || "",
        };

        return done(null, user);
      }
    )
  );

  console.log("Google OAuth strategy configured");
} else {
  console.log(
    "Google OAuth credentials or callback URL missing"
  );
}

module.exports = passport;