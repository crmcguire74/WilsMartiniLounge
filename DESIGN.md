# Design

## Theme

Dark, candlelit lounge. Near-black ground with deep emerald washes and warm amber/brass accents. Full-bleed background videos with dark scrims carry atmosphere.

## Color

- `--black: #070908` page ground (green-tinted near-black, never pure #000)
- `--emerald: #0A2F28`, `--emerald-deep: #06201B` section gradients and card fills
- `--amber: #E8A34C` primary accent: links, prices, active states, solid CTAs
- `--brass: #B98A44` secondary accent: eyebrows, hairline borders (usually at .18–.4 alpha)
- `--cream: #F4EFE6` body text; `--muted: rgba(244,239,230,.72)` secondary text
- `--white: #FFFFFF` headings only

Strategy: Committed dark ground with amber/brass carrying warmth; accents stay under ~10% of any surface.

## Typography

- Display/serif: 'Playfair Display' (headings, prices, italic taglines and pull quotes)
- Sans: 'Inter' 300/400/500 (body at 17px/1.65, weight 300)
- Eyebrows: 12px Inter, .35em letter-spacing, uppercase, brass
- Headings clamp between 2rem and 4.6rem; hierarchy via serif scale + weight

## Components

- `.btn`: 1px brass border, uppercase 13px letterspaced; hover fills amber with black text. `.btn-solid` inverts.
- `.card`, `.review`: hairline brass-alpha borders on translucent emerald/black fills; hover raises border to amber. No rounded corners anywhere; everything is square-edged.
- `.eyebrow` + serif heading + body is the standard section head pattern.
- `.mask` image reveal: image starts at scale(1.12), settles to 1 over 1.4s.

## Motion

- Reveals: opacity + 36px translate, .9s cubic-bezier(.22,.61,.36,1), staggered .12s.
- Scroll drift/parallax on desktop only, small amplitudes, disabled for reduced motion.
- Reviews marquee: 46s linear loop, pauses on hover, desktop only.

## Layout

- Max width 1200px, 24px gutters. Alternating full-bleed video sections and gradient sections.
- Asymmetric image grids with slight vertical staggers (margin offsets), 4/5 and 3/4 image ratios.
