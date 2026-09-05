# Afya Drop — Premium Website Redesign

Rebuild the Afya Drop frontend from a bare-bones MVP into a **super-clean, mission-driven website** inspired by [raisingthevillage.org](https://www.raisingthevillage.org). Remove all "sign up" language — the only entry point for users is **Register**. The website should feel premium, trustworthy, and purpose-built for Ugandan clinicians.

## User Review Required

> [!IMPORTANT]
> **"Sign up" feature removed entirely.** Users will only see "Register" as the call-to-action throughout the site. The login page remains for returning users, but the primary flow is Registration.

> [!IMPORTANT]
> **Design direction inspired by Raising The Village:**
> - Deep teal primary (`#00282C`) + sage green accent (`#D3ECB2`) + warm cream background (`#FFF9EC`)
> - Bold, large typography (IBM Plex Sans + Cabin)
> - Generous whitespace, full-width hero sections, big impact numbers
> - Subtle hover animations, rounded cards, clean forms
> - Mobile-first responsive design
>
> This replaces the entire existing CSS and page structure.

## Open Questions

> [!IMPORTANT]
> **Logo / Brand assets**: Do you have an Afya Drop logo (SVG preferred)? The current site just uses text. I can create a clean text-based logo mark for now — or integrate a real logo if you provide one.

> [!NOTE]
> **Hero imagery**: Raising The Village uses full-width photos of communities. Do you want me to use placeholder images of Ugandan healthcare workers / clinics, or keep the hero purely typographic (text + gradient)?

## Proposed Changes

The redesign touches every file in `web/frontend/`. No backend or database changes are needed.

---

### Design System & Global Styles

#### [NEW] [tailwind.config.ts](file:///g:/AFYA%20DROP/web/frontend/tailwind.config.ts)
Add Tailwind CSS with a custom theme inspired by Raising The Village:
- **Colors**: Deep teal (`#00282C`), sage green (`#D3ECB2`), warm cream (`#FFF9EC`), ivory card (`#F6F0E2`)
- **Fonts**: IBM Plex Sans (body) + Cabin (headings) via Google Fonts
- **Border radius**: Smooth, large radii for cards and buttons
- **Spacing**: Generous section padding (80px–120px vertical)

#### [NEW] [postcss.config.js](file:///g:/AFYA%20DROP/web/frontend/postcss.config.js)
Standard PostCSS config for Tailwind.

#### [MODIFY] [globals.css](file:///g:/AFYA%20DROP/web/frontend/app/globals.css)
Replace all existing CSS with:
- Tailwind directives (`@tailwind base/components/utilities`)
- CSS custom properties for the RTV-inspired palette
- Anti-aliased font smoothing
- Custom component classes (buttons, inputs, cards) using `@apply`
- Smooth scroll, focus-visible outlines

#### [MODIFY] [package.json](file:///g:/AFYA%20DROP/web/frontend/package.json)
Add dependencies:
- `tailwindcss`, `postcss`, `autoprefixer` (dev deps)
- `@fontsource/ibm-plex-sans`, `@fontsource/cabin` (or use Google Fonts CDN in layout)
- `clsx` (utility for conditional class names)
- `framer-motion` (subtle entrance animations like RTV)

---

### Shared Components

#### [NEW] [components/Navbar.tsx](file:///g:/AFYA%20DROP/web/frontend/components/Navbar.tsx)
Clean sticky navigation bar:
- Afya Drop text logo (deep teal)
- Nav links: Home, How It Works, Register
- Mobile hamburger menu with smooth slide-down
- "Register" CTA button (sage green) on the right — no "Sign Up" anywhere

#### [NEW] [components/Footer.tsx](file:///g:/AFYA%20DROP/web/frontend/components/Footer.tsx)
Minimal footer:
- Afya Drop logo + tagline
- Quick links (Register, Login, Dashboard)
- "Clinical decision-support for Ugandan medical professionals" disclaimer
- © 2026 Afya Drop

#### [NEW] [components/Button.tsx](file:///g:/AFYA%20DROP/web/frontend/components/Button.tsx)
Reusable button component with variants:
- `primary` — sage green bg, dark teal text
- `secondary` — outlined, dark teal border
- `ghost` — text-only with underline hover
- Arrow icon option (like RTV's "→" buttons)
- Loading spinner state

#### [NEW] [components/Input.tsx](file:///g:/AFYA%20DROP/web/frontend/components/Input.tsx)
Styled form input/select with label, hint text, and error state. Clean borders, generous padding, focus ring in sage green.

#### [NEW] [components/Card.tsx](file:///g:/AFYA%20DROP/web/frontend/components/Card.tsx)
Reusable card with warm ivory background, subtle border, large border-radius (16px).

#### [NEW] [components/StatCard.tsx](file:///g:/AFYA%20DROP/web/frontend/components/StatCard.tsx)
Big-number stat display (like RTV's "2.4M", "19X", "229%") — used on the landing page for impact metrics like credit cost, response time, etc.

#### [NEW] [components/SectionHeading.tsx](file:///g:/AFYA%20DROP/web/frontend/components/SectionHeading.tsx)
Tagline + heading pair (like RTV's "Why it matters" + "Without opportunity, poverty persists.").

---

### Pages

#### [MODIFY] [layout.tsx](file:///g:/AFYA%20DROP/web/frontend/app/layout.tsx)
- Load Google Fonts (IBM Plex Sans + Cabin)
- Wrap children with Navbar + Footer
- Update metadata: title "Afya Drop — Clinical Decision Support for Uganda", proper OG description
- Add structured data (Organization schema) like RTV

#### [MODIFY] [page.tsx](file:///g:/AFYA%20DROP/web/frontend/app/page.tsx) (Landing / Home)
Complete redesign into a mission-driven landing page with these sections:

1. **Hero Section** — Full-width, deep teal background
   - Bold headline: *"Clinical answers you can trust. Instantly."*
   - Subtext: *"AI-powered decision support grounded in the Uganda Clinical Guidelines. Ask over WhatsApp. Get answers in seconds."*
   - CTA: "Register Now" button (sage green) — NO "sign up"
   - Optional: Full-width image of healthcare workers

2. **Impact Stats** — Cream background, 3–4 stat cards
   - "100 UGX" per question
   - "Seconds" average response time
   - "UCG-Grounded" every answer sourced from official guidelines
   - "WhatsApp" no app to download

3. **How It Works** — 3-step visual flow
   - Step 1: Register with your medical credentials
   - Step 2: Buy credits via mobile money (PesaPal)
   - Step 3: WhatsApp any clinical question, get a UCG answer

4. **Why Afya Drop** — Two-column layout (text + visual)
   - Trusted source (UCG only, no hallucinations)
   - Built for Uganda (UGX pricing, local qualifications)
   - Decision support disclaimer built in

5. **CTA Banner** — Full-width sage green
   - "Ready to get started?" + Register button

#### [MODIFY] [register/page.tsx](file:///g:/AFYA%20DROP/web/frontend/app/register/page.tsx)
Redesign the registration form:
- Clean two-column layout on desktop (form left, value prop right)
- On mobile: stacked, form first
- Use the new Input, Button, Card components
- Step indicator for form → OTP flow
- Heading: "Create your account" (unchanged)
- Remove all "sign up" text — use "Register" button label
- Success state with confetti/checkmark animation

#### [MODIFY] [login/page.tsx](file:///g:/AFYA%20DROP/web/frontend/app/login/page.tsx)
Clean, minimal login:
- Centered card on cream background
- "Welcome back" heading
- Single input (User ID for MVP)
- Link to Register page: "Don't have an account? Register"
- No "sign up" anywhere

#### [MODIFY] [dashboard/page.tsx](file:///g:/AFYA%20DROP/web/frontend/app/dashboard/page.tsx)
Cleaner dashboard:
- Sidebar-less single-column layout
- Large balance display (big number, sage green, like RTV stats)
- Credit bundles as visual cards instead of a dropdown
- Clean PesaPal checkout flow

#### [MODIFY] [admin/page.tsx](file:///g:/AFYA%20DROP/web/frontend/app/admin/page.tsx)
Light visual polish:
- Use shared components (Card, Button, Input)
- Better file upload area (drag & drop zone)
- Document list as a clean table with status badges

---

### API Layer

#### [MODIFY] [lib/api.ts](file:///g:/AFYA%20DROP/web/frontend/lib/api.ts)
No functional changes — only update the `RegisterInput` interface comment to say "Register" instead of any "sign up" language.

---

## Verification Plan

### Automated Tests
```bash
# Build check — ensures no TypeScript or Next.js errors
cd "g:\AFYA DROP" && npm run build -w web/frontend

# Dev server smoke test
cd "g:\AFYA DROP" && npm run dev:web
```

### Manual Verification
- Open every page (`/`, `/register`, `/login`, `/dashboard`, `/admin`) in a browser
- Verify responsive design on mobile (375px), tablet (768px), and desktop (1440px)
- Confirm "sign up" text appears NOWHERE on the site
- Check that "Register" is the consistent CTA
- Verify all forms still submit correctly to the backend API
- Test keyboard navigation and focus states
- Verify Google Fonts load correctly
