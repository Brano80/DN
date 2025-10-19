import passport from "passport";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";

export interface User {
  id: string;
  name: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

export function setupPassport() {
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  const oidcIssuer = process.env.OIDC_ISSUER_URL;
  const oidcClientId = process.env.OIDC_CLIENT_ID;
  const oidcClientSecret = process.env.OIDC_CLIENT_SECRET;
  const oidcRedirectUri = process.env.OIDC_REDIRECT_URI;

  if (
    oidcIssuer &&
    oidcClientId &&
    oidcClientSecret &&
    oidcRedirectUri &&
    oidcIssuer !== "test"
  ) {
    passport.use(
      "oidc",
      new OpenIDConnectStrategy(
        {
          issuer: oidcIssuer,
          authorizationURL: `${oidcIssuer}/authorize`,
          tokenURL: `${oidcIssuer}/token`,
          userInfoURL: `${oidcIssuer}/userinfo`,
          clientID: oidcClientId,
          clientSecret: oidcClientSecret,
          callbackURL: oidcRedirectUri,
          scope: "openid profile",
        },
        (
          issuer: string,
          profile: any,
          done: (error: any, user?: any) => void
        ) => {
          const user: User = {
            id: profile.id || profile._json?.sub || "unknown",
            name: profile.displayName || profile._json?.name || "Unknown User",
            email: profile._json?.email || "",
            givenName: profile._json?.given_name,
            familyName: profile._json?.family_name,
          };

          return done(null, user);
        }
      )
    );
    console.log("[AUTH] OIDC strategy configured");
  } else {
    console.log(
      "[AUTH] OIDC credentials not configured, only mock login available"
    );
  }
}
