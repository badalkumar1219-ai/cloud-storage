// ============================================
// Passport.js – Google OAuth 2.0 Configuration
// ============================================
// Sets up the Google authentication strategy.
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
// in your .env file.
// ============================================

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Store user info in the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Retrieve user info from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Only set up Google strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5173/api/auth/google/callback",
      },
      (_accessToken, _refreshToken, profile, done) => {
        // Extract only the info we need from Google's profile
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

  console.log("✅ Google OAuth strategy configured");
} else {
  console.log(
    "⚠️  Google OAuth credentials not found – running in demo mode"
  );
}

module.exports = passport;
