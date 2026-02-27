/**
 * Convex Auth Config – wires Clerk as the identity provider.
 *
 * The `domain` value must match the Clerk frontend-API URL for your
 * Clerk application.  At runtime Convex will validate the JWT `iss`
 * claim against this value.
 *
 * Security note: the actual Clerk Publishable Key and JWT issuer URL
 * are read from env vars set in the Convex dashboard – never hard-coded.
 */

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
