# Roles (single shop)

## Data model

- Table: `profiles` in [convex/schema.ts](../convex/schema.ts)
- `authUserId` matches Better Auth’s user id (`user._id` from `auth.getAuthUser`).
- `role`: `admin` | `courier` | `client`

## Default behavior

- `ensureMyProfile` creates a row with `role: "client"` for new signups.
- Elevation to `admin` or `courier` is done by an existing **admin** via `adminSetRole`, or by inserting/updating a row in the Convex dashboard during setup.

## First admin (development)

1. Sign up once, then run `ensureMyProfile` (the profile page does this automatically).
2. In the Convex dashboard, open the `profiles` table and change your document’s `role` to `admin`, **or** call `profiles.adminSetRole` from a temporary script after you have a second admin (not possible for the first user without dashboard).

Simplest path: edit the `role` field in the dashboard for your user’s `profiles` row.

## Server checks

- Use `requireRole` from [convex/lib/authHelpers.ts](../convex/lib/authHelpers.ts) in mutations/queries that must be restricted.
- After `bunx convex dev`, consider switching `filter` lookups in `authHelpers` / `listProfilesByRole` to `withIndex` for better performance at scale.
