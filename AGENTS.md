<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Rendering strategy

Prefer Server Components for route/page structure and data fetching. Use Client Components only
for interactivity, browser APIs, local UI state, or high-frequency UX interactions.

For dashboard-style pages, split independent data sections into async Server Components and wrap
them in `Suspense` boundaries. Keep focused client islands for interactions such as modals,
forms, quick actions, and calendar navigation.

When a simple independent component is the only consumer of some data, colocate that fetch with
the component instead of lifting it into the parent page. For example, an admin-only sidebar link
should fetch/check the current user's role inside an `AdminNavLink` server component rather than
making dashboard or onboarding pages fetch admin status for the whole view. Prefer this pattern
throughout the app when it does not compromise UX.
