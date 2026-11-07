# Add California STC Approval to SOMS Site

## Context
SOMS got California **STC** (Standards and Training for Corrections, run by the BSCC) approval as a conference. It needs to appear in the Accreditation section (03) alongside Oklahoma CLEET and Missouri DPS POST.

Facts from the user (use exactly as given):
- Approved as a **conference**
- Certification **#03644171**
- Valid **November 6, 2026 – November 6, 2028** (covers Fall 2027)
- **32 hours**

Right now the section is titled "POST Certified & Accredited", the seal says "POST CERTIFIED", and the intro mentions only "state-run POST organizations". STC is not POST, so that wording has to widen to stay accurate.

## Scope & Non-Goals
- In scope: a new California STC card, plus wording updates to the section title, intro and seal so they cover both POST and STC.
- Out of scope: hero or pricing mentions, new images, renumbering sections (03 stays 03).

## Implementation Plan

### 1. `index.html`: Accreditation section (~lines 304–368)
- **Title:** `POST Certified & Accredited` → `POST & STC Certified`
- **Intro:** replace "approved for mandatory continuing education credit through state-run POST organizations" with "approved for continuing education credit through state POST and corrections training-standards bodies (in Oklahoma, Missouri and California), including dedicated mental-health training hours."
- **Seal:** `POST<br/>CERTIFIED` → `POST · STC<br/>CERTIFIED`
- **New card, first in `.accred__cards`** (newest and largest state, with a "NEW" ribbon):
  ```html
  <article class="accred__card accred__card--new reveal">
    <div class="accred__ribbon mono">NEW · Approved</div>
    <div class="accred__state mono">California · STC</div>
    <h3>Board of State &amp; Community Corrections — Standards and Training for Corrections</h3>
    <div class="accred__meta">
      <span class="chip">Certification #03644171</span>
      <span class="chip">32 Hours</span>
      <span class="chip chip--accent">Approved Conference</span>
    </div>
    <ul class="accred__hours">
      <li><span class="mono">Valid From</span><span class="accred__num">11.06.26</span></li>
      <li><span class="mono">Valid Through</span><span class="accred__num">11.06.28</span></li>
    </ul>
    <p class="accred__fine">Approved as a conference through November 6, 2028, covering the Fall 2027 symposium.</p>
  </article>
  ```
- Move the existing CLEET card's `data-delay` to `1` and Missouri's to `2` so the reveal stagger stays in order.
- Keep the "MORE STATES IN PROGRESS" banner.

### 2. `styles.css`: right after the `.accred__num` block (~line 597)
Reuse the look of the existing `.cmod__ribbon` (styles.css:434):
```css
.accred__card { position: relative; }
.accred__card--new { border-top-color: var(--amber); }
.accred__ribbon {
  position: absolute; top: 14px; right: 14px;
  font-size: 0.66rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--amber-bri); border: 1px solid var(--amber);
  padding: 4px 10px; border-radius: 40px; background: rgba(255,140,26,0.08);
}
```
Check that the long h3 doesn't run under the ribbon at narrow widths. If it does, add `padding-right` to the h3 or let the ribbon sit inline under 680px.

### 3. Publish
`git add -A && git commit -m "Add California STC approval (#03644171) to accreditation" && git push`

## Verification
- Serve locally with `start.bat`, open `/#certified` and check: 3 cards in order CA → OK → MO, the ribbon doesn't overlap the title, and the layout works at 980px and 680px.
- Grep for `03644171` and check it appears exactly once.
- After pushing, run `curl -s https://somsymposium.com/ | findstr 03644171` once Pages has rebuilt.

## Pre-existing issue (not fixing here unless approved)
Both pricing cards (index.html ~lines 764 and 776) say "Free software: V.I.P.E.R. + Oversight". That contradicts the licensing model (Hindsight for everyone, plus a choice of V.I.P.E.R. *or* Oversight). Suggested line: "Hindsight + choice of V.I.P.E.R. or Oversight".
