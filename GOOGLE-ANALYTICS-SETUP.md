# Google Analytics 4 — Setup & Tracking Playbook

**Site:** Wil's Martini Lounge — https://wilsmartinilounge.com
**Goal:** Measure the actions that matter for a neighborhood bar — reservations,
menu interest, and direct contact (email / phone / directions) — and hand a
clean, conversion-ready GA4 property to the client.

The website code is already fully instrumented (see *"What's already wired"*
below), and the GA4 property + web stream are already created and connected.

---

## ✅ Current status (as of setup)

| Item | Value / State |
|---|---|
| GA4 Account | **PaGuire Marketing and Sales** (335032247) |
| GA4 Property | **Wil's Martini Lounge** (property ID `545905212`) |
| Web data stream | **Wil's Martini Lounge — Web** → `https://wilsmartinilounge.com` (stream ID `15270346188`) |
| **Measurement ID** | **`G-9Y0SW377G2`** — already pasted into both HTML files ✅ |
| Time zone / Currency | America/Chicago · USD ✅ |
| Enhanced Measurement | ON (page_view, scroll, outbound click, site search, video, downloads) ✅ |
| Business objectives | Generate leads + Understand web traffic ✅ |
| Data flowing? | Not yet — starts the moment the tagged site is deployed to production |

**Still to do (best done *after* the site is deployed and a few events arrive —
see the note in Steps 3–5):** register custom dimensions, mark Key Events, and
build the Explorations. GA lists your events/params automatically once data
flows, which makes each of these a one- or two-click job instead of typing
parameter names by hand.

---

## 0. Code change to go live — DONE

Both pages load GA from a **single Measurement ID slot**, already set:

- `index.html` — `window.WILS_GA_ID = "G-9Y0SW377G2";`
- `moon-lounge.html` — same line, same ID

Just **deploy** the current files to production. The loader stays silent only if
the ID is a placeholder; with the real ID present it initializes gtag on load.

---

## 1. Create the property + web data stream

1. Go to **analytics.google.com → Admin** (gear, bottom-left).
2. If there's no account yet: **Create Account** → name it `Wil's Martini Lounge`
   → accept the data-sharing/terms screen.
3. **Create Property**:
   - Property name: `Wil's Martini Lounge`
   - Time zone: **United States → (GMT-06:00) Chicago**
   - Currency: **US Dollar ($)**
4. Business details: Industry `Food & Drink`, size `Small`.
5. Business objectives: pick **Generate leads** and **Examine user behavior**.
6. **Create a Web data stream**:
   - Website URL: `https://wilsmartinilounge.com`
   - Stream name: `Wil's Martini Lounge — Web`
7. Copy the **Measurement ID** (`G-XXXXXXXXXX`) → paste into both HTML files
   (Step 0) → deploy.

### Enhanced Measurement (leave ON, with one addition)
In the stream, open **Enhanced measurement** and keep all toggles on. This gives
you *for free*: `page_view`, `scroll` (90% depth), `outbound click` (press/review
links), `site_search`, `video_engagement`, and `file_download`. Our custom events
sit **on top** of these.

---

## 2. What's already wired in the code

Custom events fire from `src/analytics.js` (loaded on both pages) plus a
`generate_lead` call in the Moon Lounge form. Every event carries a
`link_location` param (`nav` / `hero` / `visit` / `footer` / `reservation_form` /
`menu_tabs`) so you can see **which CTA** drove the action.

| Event | Fires when | Key params | Make it a Key Event? |
|---|---|---|---|
| `reservation_start` | Click any link to the Moon Lounge reservation page | `link_location`, `link_text` | ✅ **Yes** |
| `generate_lead` | Moon Lounge reservation **form submitted successfully** | `value` (500/800), `currency`, `party_size`, `lead_type` | ✅ **Yes** |
| `contact_email` | Click a `mailto:` link | `email_address`, `link_location` | ✅ **Yes** |
| `contact_phone` | Click the phone/SMS link | `contact_method` (`sms`/`call`), `link_location` | ✅ **Yes** |
| `get_directions` | Click the Google Maps directions link | `destination`, `link_location` | ✅ **Yes** |
| `view_menu` | Menu opened — click, direct `#menuSection` link, or scrolled into view (once/session) | `link_location` | Optional (micro-conversion) |
| `view_menu_category` | A menu category tab is selected | `menu_category` | ❌ Engagement only |
| `social_click` | Click an Instagram/social link | `social_network`, `link_location` | ❌ Engagement only |

> `generate_lead`'s `value` is the reservation fee ($800 Fri/Sat, $500 otherwise),
> so GA4's revenue/value columns become meaningful. No personal data (names,
> emails typed into the form) is ever sent to GA.

**Verified:** all events above were tested end-to-end in a browser before handoff —
correct event names, params, and `link_location`, with `view_menu` de-duped so it
counts once per session.

---

## 3. Register custom dimensions (do this first — or reports show "(not set)")

Admin → **Custom definitions → Create custom dimension**. Scope = **Event** for
all. Create these (Dimension name → Event parameter):

| Dimension name | Parameter |
|---|---|
| CTA Location | `link_location` |
| Link Text | `link_text` |
| Contact Method | `contact_method` |
| Menu Category | `menu_category` |
| Lead Type | `lead_type` |
| Party Size | `party_size` |
| Social Network | `social_network` |

Add one **custom metric** (scope Event): **Party Size** → `party_size` (unit:
Standard) if you want to average party size in reports.

> Custom dimensions only start collecting from the moment they're created —
> set them up on day one.

---

## 4. Mark Key Events (conversions)

Admin → **Key events** (formerly "Conversions"). After each event has fired at
least once (see Step 6), toggle these ON as key events:

- `reservation_start`
- `generate_lead`
- `contact_email`
- `contact_phone`
- `get_directions`

You can pre-create them by name via **"New key event"** without waiting. Leave
`view_menu`, `view_menu_category`, and `social_click` as regular events.

---

## 5. Custom reports & Explorations (optimized for this business)

Build these under **Explore** (free-form / funnel). Definitions:

### A. "Conversions by CTA Location" — Free-form (table)
Answers *which button drives reservations & contacts.*
- **Rows:** `CTA Location` (custom dim), then `Event name`
- **Values:** `Event count`, `Key events`
- **Filter:** Event name matches regex `reservation_start|contact_email|contact_phone|get_directions`
- Read it to decide which CTAs to keep, move, or emphasize.

### B. "Reservation Funnel" — Funnel exploration
Answers *where guests drop off on the path to a booked party.*
Steps (open/closed funnel, "closed" recommended):
1. `page_view`
2. `view_menu`
3. `reservation_start`
4. `generate_lead`
- **Breakdown:** `Session default channel group` (or `CTA Location`) to see which
  sources/CTAs convert best.

### C. "Lead Value & Party Size" — Free-form
Answers *how much booking demand and how big the parties are.*
- **Rows:** `Date` (or `Lead Type`)
- **Values:** `Key events` (filtered to `generate_lead`), `Event value`, `Party Size` (avg)
- **Filter:** Event name = `generate_lead`

### D. "Contact Actions" — Free-form (donut/bar)
Answers *how people reach out.*
- **Dimension:** `Event name` filtered to `contact_email|contact_phone|get_directions`
- Secondary: `Contact Method` and `CTA Location`
- **Value:** `Event count`

### E. "Menu Engagement" — Free-form
- **Rows:** `Menu Category`
- **Values:** `Event count` (event = `view_menu_category`)
- Plus a scorecard: `view_menu` total vs `reservation_start` (menu → reserve rate).

> Save each Exploration and, for the client, also build a **Reports → Library**
> collection ("Wil's — Marketing") with an overview card pinned to
> `reservation_start` + `generate_lead` so it shows on the GA home for non-analysts.

---

## 6. Validate before you trust the data

1. Deploy with the real ID (or test on a staging URL).
2. GA4 → Admin → **DebugView**. In the browser console run
   `window.gtag('set', 'debug_mode', true)` or install the *GA Debugger* extension.
3. Click each CTA (menu, reserve, email, phone, directions) and submit a test
   Moon Lounge request → watch the events land in DebugView with the right params.
4. GA4 → **Realtime** should show active users + events within ~30s.

---

## 7. SEO / lead-gen add-ons (high value, 10 minutes)

- **Link Google Search Console** (Admin → Product links → Search Console) so
  organic queries and landing pages appear inside GA4. Verify the domain in
  Search Console first — the `google9d398e55ee125918.html` verification file is
  already in the repo.
- **Google Business Profile:** the biggest lead source for a local bar is Maps/GBP.
  Keep the profile's website link pointed at the homepage; the `get_directions`
  event captures on-site directions clicks, and GBP Insights captures the rest.
- **Google Ads link** (only if/when running ads): Admin → Product links → Google
  Ads, then import `reservation_start` + `generate_lead` as conversions.

---

## 8. Handoff to the client

When ready to transfer ownership:
- **Add the client as a user:** Admin → Property Access Management → add their
  Google account as **Administrator** (or **Editor** if you keep admin).
- To move it out of your account entirely, put the property under an account the
  client owns (create a new Account for them and re-create the property there, or
  add them as account-level Admin and remove yourself last).
- Reservation-form leads still arrive by email via Netlify Forms — GA only
  *measures* the lead; it doesn't replace the notification.

---

*Prepared for Wil's Martini Lounge. Code instrumentation lives in
`src/analytics.js` and the gtag loader in each page's `<head>`.*
