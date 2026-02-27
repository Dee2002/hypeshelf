/**
 * Convex Auth Config – wires Clerk as the identity provider.
 *
 * The `domain` value must match the Clerk frontend-API URL for your
 * Clerk application.  At runtime Convex will validate the JWT `iss`
 * claim against this value.
 *
 * Security note: the domain is derived from the Clerk publishable key
 * and is NOT a secret.  For production deployments, consider moving
 * this to a Convex environment variable via the dashboard.
 */

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "https://driven-stud-65.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
