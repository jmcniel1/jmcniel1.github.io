# Jamie McNiel — Personal Site

A single-page resume + portfolio site for Jamie McNiel — Creative Director at
[Nudge Security](https://www.nudgesecurity.com), Long Beach, CA.

Hand-built in HTML and CSS, with a small slice of vanilla JS for the animated
hero noun cycle and the dark/light hero inversion on scroll.

## Stack

- Static HTML + CSS, no build step
- Vanilla JS (no framework)
- Google Fonts: Inter, Space Grotesk, Cormorant
- All imagery in `assets/`

## Local preview

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

## Files

- `index.html` — markup
- `styles.css` — all styles
- `assets/` — case-study screenshots, brand logos
- `assets/logos/` — small bottom-left logo marks per project

## Sections

1. Hero — 100vh dark intro with animated noun cycle ("brands · interfaces · systems · …")
2. About — short bio + Material skills list
3. Experience — 8 roles, 2002–present
4. Skills & Tools
5. Feedback — pull-quotes
6. Selected Work — 6 case-study cards with hover-reveal blurred backdrops, with the Reductive studio archive linked at the bottom
7. Contact

© Jamie McNiel
