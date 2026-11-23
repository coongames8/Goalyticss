# Project memory

## Product intent & audience

- Vite + React app with Firebase/Firestore backend (auth + data).
- App surfaces betting/sports tips, winning history, and user lists; users can get a VIP subscription.
- Audience: end users seeking fast tips and subscription access.

## Brand personality & voice

- Performance-oriented: user prioritizes fast data fetching and responsiveness.
- UI-conservative: explicit instruction not to touch existing UI/visuals.

## Visual design & UX direction

- Desktop navbar look must be preserved; responsiveness added via mobile dropdown panel.
- Nav links include Home, About, Get VIP (subscription), My Profile (when signed in), and Log In / Logout.
- Mobile/tablet: links collapse into a menu button with a slide-down panel; selecting a link or logging out closes it.
- Theme colors live in global styles (referenced when styling navbar additions).
- No jQuery/Bootstrap; app uses its own styling. Keep external unused scripts out of `index.html`.

## Decisions, constraints & rationale

- Data caching: tips, winning history, and user lists cached locally for 5 minutes for instant repeat loads; background refresh keeps data fresh.
- Cache invalidation required when tips are added or updated to avoid stale data.
- Removed artificial delays: no forced 2-second loading timers (Home/Tips), no 5-retry user lookup with 500ms waits on sign-in.
- Removed unused jQuery files and Bootstrap from HTML shell for faster page load.
- Added Firestore connection pre-warming so first fetch starts sooner.
- Firebase auth setup is stable and left untouched; do not modify auth approach without need.
- UI must remain visually unchanged unless responsiveness is being added.

## Open questions & assumptions

- VIP subscription page route referenced as "Pay"/"Get VIP"; assumed the subscription page exists.
- Cache TTL of 5 minutes assumed acceptable; no user-provided freshness requirement.
- Exact theme color tokens not stored here; read from global styles when needed.
- No `.bolt/prompt` authoritative instructions exist yet.