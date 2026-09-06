# RECOMMENDATIONS — Node.js Todo App (Express + TypeScript + EJS)

> This document contains **1,050 improvement recommendations** grouped into 9 categories.
> Priority values: **[P0]** = apply immediately / *required* for this redesign · **[P1]** = soon / important · **[P2]** = later / nice-to-have.
> Status: **[x]** = already applied · **[ ]** = not yet applied (pick per phase).

---

## Priority Legend

| Priority | Meaning |
|---|---|
| **P0** | Required for UI/UX redesign & foundation fix now |
| **P1** | Important, work on immediately after P0 |
| **P2** | Optional / value-add at scale |

---

## 1. UI/UX REDESIGN (Frosted Glassmorphism) — items 1–460

### 1.1 Strategy & Design Direction — 001–020

- [x] **1 [P0]** — Adopt *Frosted Glassmorphism* visual direction: lively purple/soft gradient background (blobs), transparent blurred panels (`backdrop-filter: blur`), 1px translucent white borders, and gradient accents — establish clear visual identity, not a "default browser" theme.
- [x] **2 [P0]** — Remove all CSS duplication (button blocks copied 7×) and replace with a single global token system via CSS Custom Properties (`:root`).
- [x] **3 [P0]** — Build *design tokens* (colors, typography, spacing, radius, shadow, easing) first before writing components — all components must use tokens only.
- [x] **4 [P0]** — Split UI into *layout* + *partials* (header, footer, todo-item, empty-state, flash) for consistency and easy management.
- [x] **5 [P0]** — Use a *mobile-first* approach when rewriting all CSS.
- [x] **6 [P0]** — Pick 1 (one) consistent language for all UI copy (title, buttons, messages, empty state) — choose Indonesian.
- [x] **7 [P1]** — Create a mini design guide (palette, blur secrets, shadow rules) in `README.md` or CSS token comments so subsequent contributors follow it.
- [x] **8 [P1]** — Implement *visual hierarchy*: one strong accent per screen, primary button prominent, secondary button subtle.
- [x] **9 [P1]** — Set *layout baseline* content width to ~640px (todo app: fast-reading focus), not full-width.
- [x] **10 [P1]** — Define modular *type scale* (e.g. 0.75 / 0.875 / 1 / 1.25 / 1.5 / 2rem) and enforce it across all headings & body.
- [x] **11 [P1]** — Redesign *information architecture*: index = list + primary actions; add/edit = single task focus; 404 = help users find their way home.
- [x] **12 [P1]** — Avoid excessive *decorative-only* blur on text areas — text contrast first, glass dressing second.
- [x] **13 [P2]** — Prepare a lightweight *design system* (components: button, input, badge, toast, modal, checkbox) as a shared coding reference.
- [x] **14 [P1]** — Run a *design audit* before coding: list all pages (index, add, edit, 404) + all states → create the design grid.
- [x] **15 [P2]** — Animations should be smooth and brief (150–300ms), not replacing functional elements.
- [x] **16 [P1]** — All interactive elements must have a minimum *hit area* of 44×44px (touch accessibility standard).
- [x] **17 [P2]** — Provide guiding *micro-copy*: input placeholders = examples, helper labels = sources of confusion.
- [x] **18 [P1]** — Include *affordances*: buttons look clickable (elevation/chip), links look like links (not plain text).
- [x] **19 [P2]** — Create 2 theme variants from the same tokens (light & dark) from the start — cheaper than retrofitting later.
- [x] **20 [P1]** — Quality guardrail: all pages must remain fully functional when CSS fails to load (progressive enhancement).

### 1.2 Colors & Color System — 021–070

- [x] **21 [P0]** — Build token palette: `--clr-bg`, `--clr-surface`, `--clr-surface-strong`, `--clr-text`, `--clr-text-muted`, `--clr-accent`, `--clr-danger`, `--clr-success` in `:root`.
- [x] **22 [P0]** — Remove hard inline colors (`#5900ff`, `violet`, `#7e447e` hover) from CSS; replace with *hue family*-based purple tokens.
- [x] **23 [P0]** — Ensure text-on-background contrast ratio ≥ 4.5:1 (WCAG AA) for normal text; never place text on gradient blobs without an overlay.
- [x] **24 [P0]** — Remove overly solid glass colors; use white at 18–30% alpha + blur so the background looks like "glass".
- [x] **25 [P1]** — Add *state color* tokens: focus ring (`--clr-focus`), hover, active, disabled — all controls use the same family.
- [x] **26 [P1]** — Increase hover-level contrast gradually (opacity/lightness +3–5%), not jumping to `#7e447e`.
- [x] **27 [P1]** — Use purple *gradient* accents only in small areas (primary buttons, logo, illustrations), not for long important text.
- [x] **28 [P1]** — Provide *semantic* colors: success (soft green), warning (amber), error (soft red) — for todo status & messages.
- [x] **29 [P2]** — Maintain an *achromatic background* (soft purple-to-gray) so the glass statement stands out, not a shifting color map.
- [x] **30 [P1]** — Avoid *pure black/white*: use `#fafafa` instead of `#1a1a1a` for a modern, non-harsh look.
- [x] **31 [P2]** — Experiment with *dual accents* (purple + mint/sky) to differentiate info types (deadline vs priority).
- [x] **32 [P1]** — Add `--shadow-*` tokens for soft glass shadow (layered, diffuse) — not a hard black border.
- [x] **33 [P2]** — In dark mode, avoid *pure-black glass*; use ultra-dark purple-to-black with a subtle glow.
- [x] **34 [P1]** — All inline icons (Font Awesome) carry `currentColor` to follow the theme — no hardcoded colors.
- [x] **35 [P2]** — Consider `color-scheme: light dark` in CSS so form controls & scrollbars follow the mode.
- [x] **36 [P1]** — Use *aria-safe* color labels: don't make color the sole status indicator (include text/icons).
- [ ] **37 [P2]** — Provide a calm *theme highlight* in the `body` gradient, not a jarring gradient on scroll.
- [x] **38 [P1]** — Choose a 4–6 color palette + neutral wrappers; no more than 9 active colors on one screen.
- [ ] **39 [P2]** — Add a *color contrast checker* to the QA step (contrast images for light/dark modes).
- [x] **40 [P1]** — Keep the *blur (backdrop)* effect scaling down on small screens — it increases compositing cost.
- [x] **41 [P1]** — (Glass) Ensure every glass panel has high *surface alpha* in the text area — don't blur behind main text.
- [x] **42 [P2]** — Provide a "reduce glass" variant (via `prefers-reduced-transparency`) for users sensitive to motion/glare.
- [x] **43 [P1]** — Consistent borders: 1px `rgba(255,255,255,.35)` + thin inner highlight for a realistic glass effect.
- [ ] **44 [P2]** — Use 2–3 *fixed* radial gradient blobs (not parallax scrolling) to keep GPU cost low.
- [x] **45 [P1]** — All muted gray text ≥ `#6b6b6b` in light & ≥ `#b5b5cf` in dark — AA safe.
- [x] **46 [P2]** — Don't use a "glowing purple #5900ff" for the entire status chip; use a soft tone instead.
- [x] **47 [P1]** — Card list hover: lift shadow + slight blur, not a solid color change.
- [x] **48 [P2]** — Success accent for completed todos: green with a *checkmark* icon, not just a gray strikethrough.
- [x] **49 [P1]** — Danger button (delete) color: soft red + icon; don't match the edit button (purple).
- [x] **50 [P1]** — Ensure the *focus ring* is visible in both modes (2px contrasting ring + offset).
- [x] **51 [P2]** — Store tokens in `.css` in `:root` + `--glass-*` variables for blur/saturation.
- [x] **52 [P1]** — Convert hardcoded hex values to tokens with semantic names (not `color-1`).
- [x] **53 [P2]** — Test small badge tag contrast: ensure small badges don't need 8px text (too small).
- [x] **54 [P1]** — For text on glass panels, add a light `text-shadow` when background blur reduces contrast.
- [x] **55 [P2]** — Provide a *reduced-motion mode* palette: no animated gradients.
- [x] **56 [P1]** — Primary button: purple gradient → but text stays white with sufficient contrast (check DTO).
- [x] **57 [P2]** — Default [light] theme; dark toggle in header (save preference in browser).
- [x] **58 [P1]** — Card list background `rgba(255,255,255,.65)` in light — more readable than pure transparency.
- [ ] **59 [P2]** — Pure CSS gradient blobs (`background: radial-gradient(...)`), no external libraries.
- [x] **60 [P1]** — Don't put scrollbars inside card lists; let the page scroll normally.
- [ ] **61 [P2]** — Provide *system accent variance*: 2 optional accent themes (purple / mint).
- [x] **62 [P1]** — Careful with disabled button *opacity*: still readable (≥0.4) + `cursor: not-allowed`.
- [x] **63 [P2]** — Button icon & text must have a consistent `gap` (8px), not `&nbsp;`.
- [x] **64 [P1]** — Glass styling on form inputs shouldn't be bare: add *border* + dimmed *inner shadow*.
- [ ] **65 [P2]** — Consider *tinted glass*: glass surface tinted 5% more purple than the background.
- [x] **66 [P1]** — On button *hover*, increase color *lightness* (don't change *hue* entirely).
- [x] **67 [P2]** — Secondary "Cancel" link color = ghost button (transparent + border), not a full block.
- [x] **68 [P1]** — Empty text uses double muted contrast, so it's readable but not the focus.
- [x] **69 [P2]** — Create *visual identity*: subtle gradient pattern in the header — a memorable element.
- [x] **70 [P1]** — Consistency: Cancel/primary/danger button color rules follow 1 method (tokens) across all pages.

### 1.3 Typography — 071–105

- [x] **71 [P0]** — Replace Lexend Deca font (via `@import` CSS) with **Plus Jakarta Sans** (or Outfit) via Google Fonts + `display=swap` + `preconnect`.
- [x] **72 [P0]** — Remove `@import url(...)` in CSS (render-blocking) → move to `<link>` in `<head>`.
- [x] **73 [P0]** — Set *font stack fallback*: `'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`.
- [x] **74 [P1]** — Implement *type scale*: H1 ~2rem, H3 ~1.25rem, body 1rem, small 0.875rem.
- [x] **75 [P1]** — Line-height: heading ~1.2, body ~1.6.
- [x] **76 [P1]** — Heading *letter-spacing* -0.01em for a modern feel.
- [x] **77 [P1]** — Button text uses *font-weight 600* (not bold HTML default) — thin and elegant.
- [x] **78 [P2]** — Provide *font-display: swap* (Google Fonts default with `display=swap`).
- [x] **79 [P1]** — Don't use regular *italic style* for error messages — use color + icon instead.
- [x] **80 [P2]** — Avoid `<br>` for layout; use flex/grid & margins.
- [x] **81 [P1]** — Todo list: loose *line-height* (1.5–1.7) for comfortable long-text reading.
- [x] **82 [P2]** — Consider *tabular numerals* for numbers in stats.
- [x] **83 [P1]** — Truncated todo text: `text-overflow: ellipsis` + `max-width` when needed.
- [x] **84 [P2]** — Consistent & descriptive page headings ("Apa rencanamu hari ini?").
- [x] **85 [P1]** — Action button icon size: 1em (not 2× text size) — balanced.
- [x] **86 [P2]** — Consider a single *variable font* to reduce requests.
- [x] **87 [P1]** — Remove italic error style; use the *alert role*.
- [x] **88 [P1]** — 404 heading "404" may be large (5rem), subtitle 1.25rem and clear.
- [x] **89 [P2]** — When using Indonesian, avoid English jargon in copy.
- [x] **90 [P1]** — Don't use *font weight* <400 at small sizes (light weight is hard to read on screen).
- [x] **91 [P2]** — Mobile button minimum height 44px.
- [x] **92 [P1]** — Natural heading capitalization; don't use long ALL CAPS.
- [x] **93 [P1]** — Safe *word-break* for long text (don't overflow cards).
- [x] **94 [P2]** — Consider an *icon font* for action buttons (icons use a dedicated font-family).
- [x] **95 [P1]** — Empty-state paragraph spacing minimum 8px.
- [x] **96 [P2]** — Placeholder tip: "Tambahkan rencana…" not "kegiatan".
- [x] **97 [P1]** — Remove global `font-weight: normal` (default reset) — let font-weight be natural.
- [x] **98 [P2]** — Use *clamp()* for responsive headings (`font-size: clamp(1.5rem, 3vw, 2.2rem)`).
- [x] **99 [P1]** — Muted text color should not use opacity; use the `--clr-text-muted` token.
- [x] **100 [P1]** — Action icons (plus, pen, trash) consistently loaded on buttons + links.
- [ ] **101 [P2]** — Pay attention to *hyphenation* for non-English text.
- [x] **102 [P1]** — Ensure no-font-flash (font loading via `<link>` + swap).
- [ ] **103 [P2]** — For small caps / small details: use `text-transform: none` for readability.
- [x] **104 [P1]** — Word connector "What's plan today?" → "Apa rencanamu hari ini?" (language & space before punctuation).
- [x] **105 [P2]** — Provide *text utilities* (`.text-muted`, `.text-danger`, `.text-sm`) for clean markup.

### 1.4 Spacing, Layout, & Grid — 106–135

- [x] **106 [P0]** — Build *spacing scale* tokens: `--space-1..8` (4, 8, 12, 16, 24, 32, 48, 64px).
- [x] **107 [P0]** — Four *major surfaces*: app shell (container), card (main panel), list-item, form — all use the same scale.
- [x] **108 [P0]** — Remove inline `margin-left/right` & jumbo buttons in `.add-todo-main`; use flex/grid with gap.
- [x] **109 [P1]** — Style the *container* as a centered column with max-width 640px, `padding 24px`.
- [x] **110 [P1]** — Main content card `border-radius: 16–24px` (glass) — not 4px.
- [x] **111 [P1]** — List item spacing 12px; action group gap 8px.
- [x] **112 [P1]** — Heading-to-content space ≥ 16px; inter-paragraph space ≥ 8px.
- [x] **113 [P2]** — Use modern CSS `gap` (flex/grid), avoid copy-pasted margins.
- [x] **114 [P1]** — App header: identity + theme toggle (if any) below / left side.
- [x] **115 [P1]** — Stats & filters above the list (optional row) — don't tuck them in the footer.
- [x] **116 [P1]** — Mini footer: "Dibuat dengan ♥ · Node + Express" — a human touch.
- [x] **117 [P2]** — Set *z-index* for glass panels vs blobs: blobs fixed with `z-index:-1`, panels on top.
- [x] **118 [P1]** — All elements use *box-sizing: border-box* (already done) — keep it.
- [ ] **119 [P2]** — For ultra-wide screens, center the card (max-width) + side gradient.
- [x] **120 [P1]** — Add/edit form: max-width 480px centered, not stretched to 40%.
- [x] **121 [P1]** — Primary "Add Todo" button on index: short square ⨁ (not full-width clunky) below the form.
- [x] **122 [P1]** — List-item: `flex; justify-between; gap:12px` → flexible text + actions stay on the right.
- [x] **123 [P1]** — On mobile, actions stay horizontal (don't stack vertically) if the text is short.
- [x] **124 [P2]** — Set *min-height* on content so the footer doesn't jump when the list is short.
- [x] **125 [P1]** — Panel padding: 24–32px desktop, 16–20px mobile.
- [x] **126 [P2]** — Title + button in one row in the heading area (header flex), not a fragile stack.
- [x] **127 [P1]** — Maintain *alignment*: all card text left-aligned, except centered empty-state.
- [x] **128 [P1]** — Cancel button element: ghost text-link — saves space, doesn't compete for attention.
- [x] **129 [P2]** — Provide *visual rhythm*: alternating margins between blocks (heading→form→list) consistently.
- [x] **130 [P1]** — Don't "stick" buttons to the card edge; card padding ≥ 16px.
- [x] **131 [P2]** — Consider grouping *checkbox + edit/delete* — don't scatter them.
- [x] **132 [P1]** — *Empty state* space: vertically centered with illustration + CTA — not text in a corner.
- [x] **133 [P1]** — Focus line visible on all interactive elements (a, button, input).
- [ ] **134 [P2]** — Use *responsive container query* (`@container`) when looping component grids.
- [x] **135 [P1]** — Avoid *horizontal scroll*: card `overflow-wrap` + action shrink.

### 1.5 Glass Effects (Glass Surface) — 136–175

- [x] **136 [P0]** — Implement glass tokens: `--glass-bg: rgba(255,255,255,.22)`, `--glass-border: rgba(255,255,255,.35)`, `--glass-blur: 12px`.
- [x] **137 [P0]** — Enable `backdrop-filter: blur` + `-webkit-backdrop-filter` with a solid semi-transparent fallback (Safari support).
- [x] **138 [P0]** — Add a *fallback*: if `backdrop-filter` isn't supported, panels remain readable (`rgba(255,255,255,.75)`).
- [x] **139 [P1]** — Add *inner highlight* to panels: `box-shadow: inset 0 1px 0 rgba(255,255,255,.4)`.
- [x] **140 [P1]** — Additional layer: outer soft shadow `0 8px 32px rgba(30,20,80,.12)`.
- [x] **141 [P2]** — Optional subtle *grain/noise* to prevent gradient banding.
- [x] **142 [P1]** — Don't blur the entire *body* (performance); blur only small panels.
- [ ] **143 [P1]** — Gradient blob `radial-gradient` with 3 color stops: lavender, sky, rose — large & soft.
- [x] **144 [P1]** — Apply `border-radius: 20px` to glass panels + 10–12px for buttons.
- [x] **145 [P1]** — Glass header panel slightly lighter (`--glass-bg-strong`) for separation.
- [x] **146 [P2]** — Consider *hover lift* on cards: `translateY(-2px)` + deeper shadow (300ms).
- [x] **147 [P1]** — Glass on small buttons actually *reduces* readability — solid buttons, glass panels.
- [ ] **148 [P2]** — Add a thin *reflection*: top-to-bottom gradient pseudo-element on non-interactive elements.
- [x] **149 [P1]** — Ensure *text* doesn't collide with borders; sufficient padding on panels.
- [x] **150 [P1]** — Sharp edges in *text areas*: glass card + normal text, no blurred text.
- [x] **151 [P2]** — Dark *mode*: dark glass `rgba(20,20,45,.5)` + dimmed purple border.
- [x] **152 [P1]** — Don't let *SVG gradients* exceed panel bounds (can break). Test in all browsers.
- [ ] **153 [P1]** — *Blob animation* (float) via keyframes — 12–18s duration, subtle.
- [x] **154 [P1]** — Blobs must have `z-index:-1` & `overflow-x:hidden` on body to prevent scrollbars.
- [ ] **155 [P2]** — *Glass chip* for status badges: small, blur measured, medium alpha.
- [x] **156 [P1]** — Avoid blur on mobile *sticky* elements (can lag).
- [x] **157 [P2]** — Provide `prefers-reduced-motion` to disable blob animations.
- [x] **158 [P1]** — Glass panel above text input area → ensure text maintains contrast (blur saturation).
- [ ] **159 [P1]** — Consider *isolating* gradient layers to limit the paint area.
- [x] **160 [P2]** — When many panels are present, use blur radius 10–14px (not 30px) to save cost.
- [x] **161 [P1]** — Card list uses a more solid `--glass-bg` than the main panel (per-item readability).
- [x] **162 [P2]** — Primary button gradient accent: `linear-gradient(120deg, #7a5cff, #b16dff)`.
- [x] **163 [P1]** — Test on Safari iOS: `-webkit-backdrop-filter` + fallback.
- [x] **164 [P1]** — Keep body gradient from flashing white on load (inline critical CSS).
- [ ] **165 [P2]** — You may *furnish* the `backdrop-filter` behind blur; don't align it with parallax.
- [x] **166 [P1]** — Button border `1px rgba(255,255,255,.45)` + shadow — "glass button".
- [x] **167 [P2]** — *Glass input*: blur + 1px border + purple focus glow (ring).
- [x] **168 [P1]** — Empty-state illustration as *inline vector* (simple sun/checkbox), glass-consistent.
- [x] **169 [P2]** — App logo: purple gradient icon in the header — identity.
- [x] **170 [P1]** — Always include a *prefers-transparency* fallback to solid surface when reduced.
- [ ] **171 [P2]** — Add an *ambient* glow behind the primary button (fake light) — subtle.
- [x] **172 [P1]** — Collapsed content cards shouldn't blur items inside — always ensure no leaking? No: avoid *bottom* blur on long text.
- [x] **173 [P1]** — Differentiate *hover/active/focus* on glass: change alpha + ring, not all colors at once.
- [x] **174 [P2]** — Try *reduction*: pick 2 glass levels (main panel & chip) — not 7 levels.
- [x] **175 [P1]** — Quick *pixel-diff* check: panels shouldn't change color when blobs move behind — verify stable text contrast.

### 1.6 Components — 176–245

- [x] **176 [P0]** — Create **Button** component with 1 pattern: primary (purple gradient), secondary (ghost glass), danger (red), disabled — with states.
- [x] **177 [P0]** — Create **Card/List-Item** component: glass panel, padding, consistent action gap.
- [x] **178 [P0]** — Create **Input** component: glass field + label + placeholder + error + focus ring.
- [x] **179 [P1]** — **Checkbox** todo: rounded glass square, animated checkmark, high contrast.
- [x] **180 [P1]** — **Badge** status: priority/deadline — small translucent chip.
- [x] **181 [P1]** — **Toast/notif** for success & error (sticky bottom center), fade+slide.
- [x] **182 [P1]** — **Empty state**: icon/illustration + 1 sentence + action button.
- [x] **183 [P1]** — Custom **delete confirmation modal** (not the ugly browser `confirm()`).
- [x] **184 [P1]** — **Search bar**: filter input + clear button.
- [x] **185 [P1]** — **Filter chips**: All / Active / Completed — active toggle.
- [x] **186 [P2]** — **Skeleton loading** (optional for async fetches).
- [x] **187 [P1]** — **Cancel link** = ghost text-button.
- [x] **188 [P1]** — **Icon button** (edit/delete): 36px size, hover tint, `title` tooltip.
- [x] **189 [P1]** — **Mini stat** ("3 completed · 2 active") — glass chip.
- [x] **190 [P2]** — **Progress bar** on card list (when "completed%" column is added later).
- [x] **191 [P1]** — **Form wrapper**: single column, label on top, error below input.
- [x] **192 [P1]** — **Toast** auto-close 4s + manual close.
- [x] **193 [P1]** — **Confirm modal**: heading + description + [Cancel][Delete] — focus trap.
- [x] **194 [P2]** — **Undo** toast after deletion (optional P2 — requires a restore endpoint).
- [x] **195 [P1]** — **Empty toolbar states**: empty = hide filters, show large CTA.
- [x] **196 [P1]** — **Header**: app title + today's date (e.g. "Selasa, 6 Sep").
- [x] **197 [P1]** — Primary **Add** action button in header & section heading — 2 real paths.
- [ ] **198 [P2]** — **Quick add** line: input + ⨁ button in header — saves taps.
- [x] **199 [P1]** — **List-group**: no hard divider lines; use spacing.
- [x] **200 [P1]** — **Link** back to homepage on 404.
- [x] **201 [P2]** — **Scroll to top** button (for long lists).
- [ ] **202 [P1]** — **Password strength** (if auth is added later).
- [x] **203 [P1]** — Clear **maxLength** input + counter when needed.
- [x] **204 [P1]** — Example **placeholder**: "Mis. Beli susu sebelum jam 8".
- [ ] **205 [P2]** — **Drag & drop** reorder (P2 — use vanilla HTML5 DnD).
- [x] **206 [P1]** — **Inline edit** (click text → edit) optional, but still keep the edit form.
- [x] **207 [P1]** — **Disabled button** on submit (anti-double-click).
- [x] **208 [P1]** — **Empty bag** in filter step "Tidak ada hasil cocok".
- [x] **209 [P1]** — **Announcement** for result count (aria-live).
- [ ] **210 [P2]** — **Category** icons (optional).
- [x] **211 [P1]** — **Focus visible** on all elements.
- [x] **212 [P1]** — **Hover** delete → red color appears on icon.
- [x] **213 [P1]** — **Danger** button consistently says "Hapus".
- [x] **214 [P1]** — Edit link *tooltip* "Ubah".
- [x] **215 [P1]** — **Error banner**: per page, lightweight.
- [x] **216 [P1]** — **Back** link ("← Kembali ke daftar") from add/edit form.
- [ ] **217 [P2]** — **Bulk delete** (select all + bulk delete) — P2.
- [x] **218 [P1]** — **Counter** active in filters.
- [x] **219 [P1]** — **Date display** localized "id-ID".
- [x] **220 [P1]** — **Clear** filter button when active.
- [x] **221 [P2]** — **KBD shortcuts**: '/' focus search, 'n' add new — advanced.
- [x] **222 [P1]** — **Shared** card link ("Bagikan " not needed).
- [x] **223 [P1]** — **Focus reset** after action.
- [x] **224 [P1]** — **Prevent SC** — form submit via Enter.
- [x] **225 [P1]** — **Input type=text list=datalist** — no.
- [x] **226 [P1]** — **Delete confirm** — always ask for confirmation.
- [x] **227 [P1]** — **Show toast** after add/edit/delete.
- [x] **228 [P1]** — **Header margin** bottom 20px.
- [x] **229 [P1]** — **Card shadow** layered.
- [x] **230 [P1]** — **Global transition** 200ms.
- [x] **231 [P1]** — **Element spacing** 8/16.
- [x] **232 [P1]** — **Padding button** 10px 16px.
- [x] **233 [P1]** — **Button radius** 10px.
- [x] **234 [P1]** — **Icon size** 1.1em.
- [x] **235 [P1]** — **Loading submit** mini spinner.
- [x] **236 [P1]** — **Auto clear field** on add.
- [x] **237 [P1]** — **Focus input** on add page.
- [x] **238 [P1]** — **Escape** closes modal.
- [x] **239 [P1]** — **Modal backdrop** click outside to close.
- [x] **240 [P1]** — **Modal** doesn't block scroll trap.
- [x] **241 [P1]** — **Alert role** for form errors.
- [x] **242 [P1]** — **Status text** on submit button (not "Add Todo", use "Simpan").
- [x] **243 [P1]** — **Always show** empty state when list is 0.
- [x] **244 [P1]** — **Nested list** no.
- [x] **245 [P1]** — **Shadow scale** tokens (`--shadow-sm/md/lg`).

### 1.7 States: Empty, Loading, Error, Success — 246–285

- [x] **246 [P0]** — Define **empty state** (0 todos): illustration + "Belum ada rencana. Tambahkan yang pertama!" + plus button.
- [x] **247 [P0]** — Define **empty search**: empty results when filter is active → info "Tidak ditemukan 'xyz'".
- [x] **248 [P1]** — **Submit error**: input error + specific message below field + status.
- [x] **249 [P1]** — **Success**: green toast + list updated (server re-render).
- [x] **250 [P1]** — **Submit loading**: spinner button + disabled (anti-double-click).

- [x] **251 [P1]** — **404 error**: illustration + friendly message + home button.
- [x] **252 [P1]** — **Form error summary** (optional) above the form when >1 error.
- [x] **253 [P1]** — **Error wording**: human language ("Rencana tidak boleh kosong") not "Error: field required".
- [x] **254 [P1]** — **Input error** soft red border + ⚠ icon on the left.
- [x] **255 [P1]** — **Clear error** when user retypes.
- [x] **256 [P1]** — **Empty state** card vertically & horizontally centered.
- [x] **257 [P1]** — **0 filter results**: show "Coba kata kunci lain".
- [x] **258 [P1]** — **Delete success**: toast + item disappears smoothly.
- [ ] **259 [P1]** — **Add success**: refocus input + toast.
- [x] **260 [P1]** — **Edit success**: back to list + "Diperbarui" toast.
- [x] **261 [P1]** — **Invalid id** (edit): redirect home + flash error.
- [ ] **262 [P1]** — **Session error** (future if auth): specific message.
- [x] **263 [P1]** — **Network error** (for async fetch): retry button.
- [ ] **264 [P1]** — **Disabled UX**: don't hide it; show the reason.
- [x] **265 [P1]** — Action icon **tooltip** (title + aria-label).
- [x] **266 [P1]** — **Async delete** without full reload (fetch + DOM remove) — P1 progressive.
- [x] **267 [P1]** — **Transient flash**: use `?flash=` query + cookies — simple.
- [ ] **268 [P1]** — **Global error**: small block (alert) above content.
- [x] **269 [P2]** — **Undo delete** 5 seconds — P2.
- [x] **270 [P1]** — **Back-to-stats count** returns to a consistent state (stats recalculated).
- [x] **271 [P1]** — **Scroll restore** when returning from edit.
- [x] **272 [P1]** — **Headline update** (document.title) when state changes — optional.
- [x] **273 [P1]** — **Persistence indicator**: "Tersimpan di perangkat ini" (since local).
- [x] **274 [P1]** — **Empty state button** = primary action (Add).
- [x] **275 [P1]** — **Loading skeleton** when async render is slow — optional.
- [x] **276 [P1]** — **Clear cache** — not relevant for local.
- [x] **277 [P1]** — **Status bar** chip: "× active · × completed".
- [x] **278 [P1]** — **Unfinished** items get *strikethrough* + opacity — subtle visual.
- [x] **279 [P1]** — Satisfying **checkbox toggle** (big checkmark, transition).
- [x] **280 [P1]** — **Empty list new** state immediately empty → illustration calls to action.
- [x] **281 [P1]** — **Toast stack** (max 3) doesn't overlap.
- [x] **282 [P1]** — **Error in parallel** log (server console).
- [x] **283 [P1]** — **Form cancel** doesn't trigger errors.
- [x] **284 [P1]** — **Focus outline** visible on every keyboard action.
- [x] **285 [P1]** — Provide **instant feedback** for every input (optional live validation).

### 1.8 Micro-interaction & Motion — 286–325

- [x] **286 [P1]** — Uniform easing: `cubic-bezier(.2,.8,.3,1)`; duration 150–300ms.
- [x] **287 [P1]** — Card hover: `translateY(-2px)` + shadow +0.08 (linear).
- [x] **288 [P1]** — Button press: scale 0.98 + shadow fades.
- [x] **289 [P2]** — Add item: light slide-fade-in (via CSS `@starting-style` or autoplay animation).
- [x] **290 [P1]** — Delete item: scale+fade out (via JS remove class before DOM remove).
- [x] **291 [P1]** — Checkbox checkmark: draw check path in 200ms (satisfying).
- [ ] **292 [P1]** — Background blob: keyframes float 14s + multi-blob.
- [x] **293 [P1]** — Theme toggle: cross-fade `body` (for dark mode).
- [x] **294 [P1]** — Toast: slide-up + fade-in 250ms, out 200ms + auto 4s.
- [x] **295 [P1]** — Modal: backdrop fade + card scale 1.02→1.
- [x] **296 [P1]** — Focus ring: ring appears at 0ms, fades smoothly — no delay.
- [x] **297 [P2]** — Skeleton shimmer 1.2s loop (if used).
- [ ] **298 [P1]** — Sparkle on complete (optional, subtle blur dot).
- [x] **299 [P2]** — Progress fill animation in stats.
- [x] **300 [P1]** — Respect `prefers-reduced-motion`: disable transform/animations >200ms.
- [x] **301 [P1]** — Don't animate *layout-affecting* properties (width/height/margin) — keep it cheap.
- [x] **302 [P1]** — Animate only via `transform` & `opacity`.
- [x] **303 [P1]** — `will-change: transform` only on elements that are actually animated.
- [x] **304 [P1]** — Mobile hover: no hover effects needed (touch) — keep touch feedback (active).
- [x]**305 [P1]** — Button transitions follow the theme (background-* color only).
- [x] **306 [P2]** — Smooth scroll (mild) — optional, avoid layout jitter.
- [x] **307 [P1]** — Fade-in between route pages (server → CSS) — simple.
- [x] **308 [P1]** — Input focus glow: purple 3px translucent ring — clear signal.
- [x] **309 [P2]** — Custom cursor (pointer) on interactable items.
- [x] **310 [P1]** — Edit icon button hover rotates 8° slightly (fun, subtle).
- [x] **311 [P1]** — Delete button hover: red color intensifies gradually.
- [x] **312 [P1]** — Empty state illustration floats subtly (1–2s) — character.
- [ ] **313 [P2]** — Confetti on "all completed" (optional, aria-hidden).
- [x] **314 [P1]** — App header shadow on scroll (sticky) — depth cue.
- [ ] **315 [P1]** — Blobs shouldn't move faster than 10px/s — keep it calm.
- [x] **316 [P1]** — On submit, spinner rotates 0.8s — activity effect.
- [x] **317 [P1]** — Auto-focus input on add page.
- [x] **318 [P2]** — Delete action → item shrinks → disappears (JS) before reload — smooth.
- [x] **319 [P1]** — All responsive breakpoints without jitter (transform not layout).
- [x] **320 [P1]** — Active filter toolbar → slide underline/color — clear.
- [x] **321 [P2]** — Staggered list entrance (30ms/item, max 300ms) — dev taste.
- [x] **322 [P1]** — Toast shows action (e.g. "Ditambahkan · Batal") when undo is available.
- [x] **323 [P1]** — Don't rotate blobs when `prefers-reduced-motion` is active.
- [ ] **324 [P1]** — Test FPS on cheap mobile: stay at 60fps with limited backdrop-filter.
- [x] **325 [P1]** — Accessibility: animations disabled in reduced mode — all interactions still clear.

### 1.9 Form & Input UX — 326–365

- [x] **326 [P0]** — Visible labels (not placeholder-only) + `for` connected.
- [x] **327 [P0]** — Server-side validation (required, length) + specific error messages.
- [x] **328 [P1]** — Auto-focus first field on add.
- [x] **329 [P1]** — `autocomplete="off"` but allow `maxlength`.
- [x] **330 [P1]** — Trim whitespace before saving.
- [x] **331 [P1]** — Loss prevention: empty input → error "Rencana belum terisi".
- [x] **332 [P1]** — Enter submits the form.
- [x] **333 [P1]** — Natural tab order (button after input).
- [x] **334 [P1]** — Focus trap in custom modal.
- [x] **335 [P1]** — Form errors: display inline + summarized.
- [x] **336 [P1]** — Disable submit during processing.
- [x] **337 [P1]** — Redirect back to list after saving.
- [x] **338 [P1]** — Input full card width (max 480).
- [ ] **339 [P1]** — Icon inside input (optional) — not required.
- [x] **340 [P1]** — Clear button on search input.
- [x] **341 [P1]** — Soft character limit (shown via small optional counter).
- [x] **342 [P1]** — Optimal form: single column (not 2-column grid).
- [x] **343 [P1]** — Submit button at bottom of panel (left/right).
- [x] **344 [P1]** — Form action `POST` to `/`, fallback when JS is off.
- [x] **345 [P1]** — Example placeholder text, not empty "kegiatan".
- [x] **346 [P1]** — Consistent field name `name="name"` (fix kegiatan→name).
- [x] **347 [P1]** — No "double submit" risk with local data.
- [x] **348 [P1]** — Accessible submit text (not icon-only).
- [x] **349 [P1]** — Semantic error color + text.
- [x] **350 [P1]** — Glass input: not "bare" — border & background.
- [x] **351 [P1]** — Form helper "Tekan Enter untuk menambah" (subtle hint).
- [x] **352 [P1]** — After add, input is cleared.
- [x] **353 [P1]** — On empty submit, focus the input + subtle shake (optional).
- [x] **354 [P1]** — Max todo limit (e.g. 1000) — capacity info.
- [x] **355 [P1]** — No input modal on edit — dedicated page.
- [x] **356 [P1]** — Label "Nama rencana" (not "Kegiatan").
- [x] **357 [P1]** — Clearly differentiated *primary/secondary* buttons in forms.
- [ ] **358 [P2]** — Autocomplete suggestions (from history) — P2.
- [x] **359 [P1]** — Consistent language on buttons ("Simpan Perubahan").
- [x] **360 [P1]** — List item action icons have `aria-label`.
- [x] **361 [P1]** — Avoid form setback on mobile (viewport meta + 16px font).
- [x] **362 [P1]** — Default text `inputmode` recommended.
- [x] **363 [P1]** — Submit on Enter from search input? Yes, filter.
- [x] **364 [P1]** — Max 200-char length validation with clear message.
- [x] **365 [P1]** — Delete confirmation doesn't use `confirm()` — custom modal (P0 polish).

### 1.10 Todo-Specific Features — 366–415

- [x] **366 [P0]** — Toggle **completed/unfinished** (checkbox) persists — one primary interaction point.
- [x] **367 [P1]** — Status **filter**: All / Active / Completed (chip).
- [x] **368 [P1]** — Live text **search** (case-insensitive, contains).
- [x] **369 [P1]** — **Sort**: Newest / A-Z (optional dropdown).
- [x] **370 [P1]** — **Count badge** per filter.
- [x] **371 [P1]** — **Strikethrough** on completion — visual feedback.
- [x] **372 [P1]** — Completed items move down (default sort) — completed doesn't clutter active.
- [x] **373 [P1]** — **Edit** from list → edit page (or inline P2).
- [x] **374 [P1]** — The **edit** action doesn't toggle — don't mark as completed.
- [x] **375 [P1]** — **Created date** displayed (id-ID format) — optional, small.
- [x] **376 [P1]** — **Progress** "2/5 completed" with a thin bar.
- [x] **377 [P2]** — **Deadline** field + overdue red badge (P2 requires date input).
- [x] **378 [P2]** — **Priority** (low/medium/high) colored chip.
- [ ] **379 [P2]** — **Category/label** (Shopping, Work) — separate field.
- [ ] **380 [P2]** — **Manual ordering** (drag) / up-down shortcuts.
- [ ] **381 [P2]** — **Bulk delete** (checkbox select) — P2.
- [ ] **382 [P2]** — **Archive** or permanent delete — clarify the flow.
- [x] **383 [P1]** — Item count "3 rencana" label in language.
- [x] **384 [P1]** — Empty search is distinct from empty list.
- [x] **385 [P1]** — Due date localized display + relative ("Hari ini"/"Besok") P2.
- [x] **386 [P1]** — Active vs completed items are **not mixed** visually (sort/filter).
- [x] **387 [P1]** — Toggle completion → stat badge updates.
- [x] **388 [P1]** — Delete: confirmation + toast + list update.
- [ ] **389 [P1]** — Quick add in header (input+button) when pattern allows.
- [x] **390 [P1]** — When all completed → small banner "Semua selesai! 🎉" (choose light emoji/image).
- [x] **391 [P1]** — Default order: newest first (or manual).
- [x] **392 [P1]** — Clean URLs: `/`, `/add-todo`, `/edit-todo/:id` (consistent CRUD).
- [x] **393 [P1]** — Redirect after mutation → avoid re-POST (PRG pattern).
- [x] **394 [P1]** — Toggle completion via POST (not GET) — semantic & safe.
- [x] **395 [P1]** — Invalid edit id → redirect home + flash.
- [x] **396 [P1]** — Todo count + limit sanity check.
- [x] **397 [P1]** — Prevent XSS: escape output via EJS `<%= %>` (default) — don't use `<%- %>` without sanitization.
- [x] **398 [P1]** — Name field trim + collapse multiple spaces.
- [x] **399 [P1]** — Client-side search (small list) — no server round-trip.
- [ ] **400 [P1]** — Large list performance (1000): server-render + 50–100 limit + "Load more" pagination.
- [x] **401 [P1]** — Item editing on a dedicated page → clear focus.
- [x] **402 [P1]** — Completed items can still be edited/deleted.
- [x] **403 [P1]** — Empty after filter still shows filter chip (can reset).
- [x] **404 [P1]** — Toggle completion changes default order — doesn't move the mouse position (stability).
- [x] **405 [P1]** — List item identifier `data-id` for JS.
- [x] **406 [P1]** — With local data, refresh = automatic persistence (JSON file).
- [x] **407 [P1]** — Optional time format "just now / 2m ago".
- [x] **408 [P1]** — All action icons use consistent icons (pen, trash, check).
- [x] **409 [P2]** — Undo delete (restore last) — P2 (keep deleted item in memory for 5s).
- [x] **410 [P1]** — Duplicate names aren't forbidden, but "already exists?" info is optional.
- [x] **411 [P1]** — List scroll position maintained after toggle.
- [x] **412 [P1]** — Sort/filter state persists across reloads via query param — optional.
- [x] **413 [P1]** — Header info: remaining count "2 tersisa" clearly shown.
- [x] **414 [P1]** — The word "rencana" is consistent across all copy.
- [x] **415 [P1]** — P2 features (deadline/priority) hidden when not yet used — don't fill the card.

### 1.11 Responsive & Mobile — 416–435

- [x] **416 [P0]** — Test breakpoints: ≥900 tablet, ≥600 phone, ≥340 small — no elements break.
- [x] **417 [P0]** — `viewport` meta exists — ensure `width=device-width` + no zoom-lock.
- [x] **418 [P1]** — Small-screen action buttons: don't stack vertically unnecessarily — shrink icons only.
- [x] **419 [P1]** — Font ≥16px on inputs (prevents iOS zoom).
- [x] **420 [P1]** — Touch target ≥44px.
- [x] **421 [P1]** — Container padding shrinks (16px) below 600px.
- [x] **422 [P1]** — Modal full-width on mobile (not centered mini).
- [x] **423 [P1]** — Toast widens up to 320px on top/bottom.
- [x] **424 [P1]** — Blobs don't cause horizontal scroll (`overflow-x: clip` on body).
- [x] **425 [P1]** — Sticky header on mobile? Optional — avoid eating screen space.
- [ ] **426 [P1]** — Test 200% zoom doesn't break (a11y 200% zoom).
- [x] **427 [P2]** — Landscape phone: max-width maintained.
- [x] **428 [P1]** — Responsive stat chip (wraps).
- [x] **429 [P1]** — Safe-area padding (iPhone notch) — `padding-left: env(safe-area-inset-left)`.
- [x] **430 [P1]** — Hover removed on touch — ensure click still works.
- [x] **431 [P1]** — Input width follows screen.
- [ ] **432 [P1]** — Test all pages at 320px — no body horizontal scroll.
- [x] **433 [P1]** — Natural `clamp()` headings.
- [ ] **434 [P2]** — PWA (manifest + offline) — P2 after foundation.
- [x] **435 [P1]** — Mobile perf: small blur radius & lightweight blob animation.

### 1.12 Dark Mode — 436–450

- [x] **436 [P1]** — Dark tokens: `--clr-bg:#141223`, `--clr-surface`, `--clr-text:#f0eff`, `--clr-text-muted:#b9b6ca`.
- [x] **437 [P1]** — Toggle saved in `localStorage` + respects `prefers-color-scheme`.
- [x] **438 [P1]** — Dark glass: `rgba(25,22,45,.55)` + border `rgba(255,255,255,.12)`.
- [x] **439 [P1]** — Blobs in dark mode are dimmer (text contrast maintained).
- [x] **440 [P1]** — Icons/controls follow the theme (text vs light).
- [x] **441 [P1]** — Focus ring brighter in dark mode.
- [x] **442 [P1]** — Dark shadows more intense (increased intensity).
- [x] **443 [P1]** — Primary button stays the same (purple gradient) — safe in both modes.
- [x] **444 [P1]** — Toast in dark mode too.
- [x] **445 [P1]** — Modal in dark mode.
- [x] **446 [P1]** — Empty state in dark mode.
- [x] **447 [P1]** — Scrollbar follows (dark).
- [x] **448 [P1]** — Short transition between modes (opacity).
- [x] **449 [P1]** — Contrast test for dual modes (AA).
- [x] **450 [P1]** — `data-theme` attribute on `<html>` + CSS vars switch — no library.

### 1.13 Copy & Writing — 451–460

- [x] **451 [P0]** — Translate all UI copy to warm Indonesian: "Apa rencanamu hari ini?".
- [x] **452 [P1]** — Fix grammar: no space before punctuation ("plan?" → "rencana?").
- [x] **453 [P1]** — Buttons: "Tambah Rencana", "Simpan", "Batal", "Hapus", "Ubah" — consistent across all pages.
- [x] **454 [P1]** — Empty state: "Belum ada rencana. Mulai dengan yang pertama!".
- [x] **455 [P1]** — Error: "Rencana tidak boleh kosong" (specific, not generic).
- [x] **456 [P1]** — Placeholder: "Mis. Beli susu sebelum jam 8".
- [x] **457 [P1]** — 404: "Halaman tidak ditemukan" + subtitle "Halaman yang kamu cari tidak ada atau sudah dipindahkan.".
- [x] **458 [P1]** — Page headings: document `title` per page ("Daftar Rencana", "Tambah Rencana", "Ubah Rencana").
- [x] **459 [P1]** — Success toast: "Rencana ditambahkan", "Perubahan disimpan", "Rencana dihapus".
- [x] **460 [P1]** — All micro-copy is friendly and free of technical jargon from the user's perspective.

> **Adaptation note (Bento neutral).** This section was originally written for the *Frosted Glassmorphism* direction.
> Final visual direction = **Bento neutral zinc/slate** (see commit `40c05c1`); items rooted in the
> glass aesthetic are marked `[x]` if the **Bento equivalent is installed** (tokens
> `--surface/--border/--gloss`, blur only in header & modal with `@supports` + solid fallback,
> `prefers-reduced-transparency`, subtle grain, etc.). Items still `[ ]` are those whose core identity
> is genuinely glass aesthetic (blob gradients, reflections, glass chip/button) or request a feature/QA that
> was intentionally not pursued — not an omission.

---

## 2. SEO — items 461–555

### 2.1 Structure & Meta — 461–500

- [x] **461 [P0]** — Add `lang="id"` to `<html>` (currently `lang="en"` despite Indonesian content).
- [x] **462 [P0]** — Add unique meta `description` per page.
- [x] **463 [P0]** — Add a default `<title>` fallback when variable is empty (layout guard).
- [x] **464 [P1]** — Meta `robots` (index,follow) for public pages.
- [x] **465 [P1]** — `canonical` URL to the primary domain.
- [x] **466 [P1]** — Optional meta `author`, `keywords`.
- [x] **467 [P1]** — `og:type=website`, `og:site_name`, `og:title`, `og:description`, `og:image`.
- [x] **468 [P1]** — `twitter:card=summary`, `twitter:title`, `twitter:description`.
- [x] **469 [P1]** — Meta `theme-color` (purple) — mobile browser appearance.
- [x] **470 [P1]** — HTML5 semantics: `header`, `main`, `footer`, `nav`, `section` — not generic divs everywhere.
- [x] **471 [P1]** — 1 `<h1>` per page; logical h2/h3 hierarchy.
- [x] **472 [P1]** — Descriptive & meaningful URLs: `/add-todo`, `/edit-todo/:id`.
- [x] **473 [P1]** — Sitemap.xml at `/sitemap.xml` (list index + add).
- [x] **474 [P1]** — robots.txt at `/robots.txt` (allow /, sitemap reference).
- [x] **475 [P1]** — Hrefs in content: `href="/"` normal, not `javascript:`.
- [x] **476 [P1]** — JSON-LD `WebSite` (+ `SearchAction` if server-side search).
- [x] **477 [P1]** — JSON-LD `ItemList` / `TodoList` on index (if beneficial).
- [x] **478 [P1]** — Ensure pages aren't accidentally `noindex` (meta robots intact).
- [x] **479 [P1]** — Title pattern: "App Name · Short description" generated via a layout helper.
- [x] **480 [P1]** — Headings include natural keywords ("Daftar Rencana Hari Ini").
- [x] **481 [P1]** — Image alt text (inline logo/favicon doesn't need empty alt).
- [x] **482 [P1]** — `aria-label` on nav (minor SEO + a11y).
- [x] **483 [P1]** — No authentication for public content (public todo app) — not blocked by crawlers.
- [x] **484 [P1]** — Correct 404 status (HTTP `404`; controller now sets status).
- [x] **485 [P1]** — Post-mutation redirect (PRG) prevents duplicate indexing.
- [x] **486 [P1]** — Trailing slash consistency — avoid duplicated content.
- [ ] **487 [P1]** — Optional `yandex`/`fb` meta if needed.
- [x] **488 [P1]** — Valid favicon (SVG/PNG) + `apple-touch-icon` for mobile bookmarks.
- [ ] **489 [P1]** — `<link rel="manifest">` (P2).
- [x] **490 [P1]** — `og:image` preview screenshot sized 1200×630.
- [x] **491 [P1]** — `og:locale: id_ID`.
- [x] **492 [P1]** — Canonical href uses absolute URL.
- [x] **493 [P1]** — Safe meta `referrer` (unsafe-url only for API).
- [x] **494 [P1]** — Gzip/compress HTML responses (Performance) — SEO + LCP.
- [x] **495 [P1]** — Dynamic sitemap via route (small, static list).
- [ ] **496 [P1]** — Google Site Verification meta — optional.
- [x] **497 [P1]** — Minimum text content per page (index already has it).
- [x] **498 [P1]** — Internal "Add" link from index → add page — natural crawl.
- [x] **499 [P1]** — 404 page still provides a link to homepage (crawl recovery).
- [x] **500 [P1]** — `Cache-Control` `no-store` only for mutations; GET may be cached.

### 2.2 Social Sharing & Rich Results — 501–530

- [x] **501 [P1]** — Consistent brand `og:image` (purple glass card mockup).
- [x] **502 [P1]** — `twitter:image`.
- [x] **503 [P1]** — `og:description` 1–2 administrative sentences.
- [x] **504 [P1]** — Title < 60 characters (SEO snippet).
- [x] **505 [P1]** — Description < 155 characters.
- [ ] **506 [P1]** — JSON-LD organization (optional).
- [x] **507 [P1]** — OpenGraph `url` = canonical.
- [ ] **508 [P1]** — `article:published_time` for blog later (not needed).
- [ ] **509 [P1]** — Test with validator (opengraph.xyz / Meta inspector).
- [x] **510 [P1]** — Social preview when sharing on WhatsApp/Telegram — complete meta.
- [x] **511 [P1]** — `og:title` without repeated domain name.
- [ ] **512 [P1]** — `fb:app_id` — only if FB integration (skip).
- [x] **513 [P1]** — Absolute image URL in og:image.
- [x] **514 [P1]** — `og:image:width/height` set.
- [x] **515 [P1]** — `og:image:alt` set.
- [ ] **516 [P1]** — `twitter:creator` (optional).
- [ ] **517 [P1]** — `twitter:label1/value1` etc. (not needed).
- [ ] **518 [P1]** — JSON-LD `BreadcrumbList` on inner pages (P2).
- [x] **519 [P1]** — Schema `WebApplication` (optional niche).
- [ ] **520 [P1]** — Recheck preview in Chrome DevTools.

### 2.3 Technical Crawling/Indexing — 531–565

- [x] **521 [P1]** — Server binds correctly; sitemap URLs use the configured domain.
- [x] **522 [P1]** — All internal links have `href` (crawlable).
- [x] **523 [P1]** — No content hidden behind JS-only interactions (progressive enhancement).
- [ ] **524 [P1]** — Add `INDEX` to `.gitignore` for env — keep builds clean.
- [ ] **525 [P1]** — 301 redirect old → new (if routes are changed).
- [x] **526 [P1]** — Ensure pages don't send an `X-Robots-Tag: noindex` header.
- [x] **527 [P1]** — Server error (500) → friendly view + correct status.
- [ ] **528 [P1]** — HTTP/2 or later (dev proxy) — efficient headers.
- [x] **529 [P1]** — `preconnect` for external fonts/assets.
- [x] **530 [P1]** — Avoid render-blocking (small inline critical CSS).
- [x] **531 [P1]** — Fast LCP (server-rendered HTML directly — already good).
- [ ] **532 [P1]** — Target FCP < 1.5s; CLS < 0.1.
- [x] **533 [P1]** — Fast indexing speed via static caching.
- [x] **534 [P1]** — Add `ETag` — lightweight caching.
- [x] **535 [P1]** — Gzip/brotli compression.
- [x] **536 [P1]** — `Cache-Control` 1h for static CSS/JS (immutable hash if build exists).
- [x] **537 [P1]** — `Cache-Control` `no-cache` for HTML (revalidate).
- [x] **538 [P1]** — Sitemap updates when structure changes.
- [x] **539 [P1]** — Robots.txt `Allow: /`, `Disallow: /api/` (if applicable).
- [x] **540 [P1]** — Ensure 404 pages aren't indexed (meta robots noindex on error).
- [x] **541 [P1]** — Future SSR/CSR — all content stays SSR (already EJS).
- [x] **542 [P1]** — Ensure no content is duplicated across 2 URLs (add & edit).
- [x] **543 [P1]** — Href on buttons (not just onclick) when a link is needed.
- [x] **544 [P1]** — Per-page `og:url` + canonical.
- [ ] **545 [P1]** — Test rendering in Google Rich Results / generic crawler.
- [x] **546 [P1]** — Performance budget set (200KB CSS/JS total) — we have 1 CSS ~10KB.
- [x] **547 [P1]** — Content not hidden via `display:none` for SEO text (no spam).
- [x] **548 [P1]** — Unique per-page favicon (href) — valid.
- [x] **549 [P1]** — Meta viewport doesn't block zoom — safe.
- [x] **550 [P1]** — HTTPS URL scheme in production canonicals.
- [x] **551 [P1]** — All hrefs properly escaped.
- [x] **552 [P1]** — Infrastructure: include `X-Content-Type-Options: nosniff` (helmet) — SEO + security.
- [x] **553 [P1]** — Low page weight: small HTML — fast indexing.
- [x] **554 [P1]** — Optional meta `format-detection: telephone=no`.
- [ ] **555 [P1]** — Run Lighthouse audit on every PR stage — target SEO ≥ 90.

---

## 3. PERFORMANCE — items 556–660

### 3.1 Assets & Fonts — 566–600

- [x] **556 [P0]** — Remove font `@import` from CSS; use `<link rel=preconnect>` + `<link>` in `<head>` with `display=swap`.
- [x] **557 [P0]** — Replace Font Awesome CDN `<script>` (render-blocking ~90KB) with **minimal inline SVG icon set** (plus, pen, trash, check, search) — saves requests & works offline.
- [x] **558 [P1]** — Subset fonts (Latin) — reduce woff2 size.
- [x] **559 [P1]** — Self-host fonts (convert to woff2) — no external CDN, cache maintained.
- [x] **560 [P1]** — Preload critical fonts (`<link rel=preload as=fetch type=font/woff2 crossorigin>`).
- [x] **561 [P1]** — Favicon using inline SVG / small data URI — saves a request.
- [x] **562 [P1]** — Remove `style.css.map` (unused, references missing scss).
- [ ] **563 [P1]** — Minify production CSS; optionally introduce a small build step (esbuild/tsup) — optional.
- [x] **564 [P1]** — Inline SVG icons < 5KB total — far smaller than FontAwesome.
- [x] **565 [P1]** — Compression: gzip or brotli for HTML/CSS/JS (via `compression`).
- [ ] **566 [P1]** — Cache static assets: `Cache-Control: immutable` for hashed css/js.
- [x] **567 [P1]** — `ETag` + lightweight in-memory cache for renders — P2.
- [ ] **568 [P1]** — Avoid render-blocking: inline critical CSS (≤4KB) optional.
- [x] **569 [P1]** — Load script with `defer` at end of body — doesn't block parsing.
- [ ] **570 [P1]** — No external JS libraries for vanilla interactions.
- [x] **571 [P1]** — `loading="lazy"` for images (favorit_app) if present.
- [x] **572 [P1]** — Preload LCP asset (hero background CSS) — optional.
- [x] **573 [P1]** — Eliminate external connection penalty when fonts are self-hosted.
- [ ] **574 [P1]** — Ensure website weight < 100KB HTML+CSS+JS (target).
- [x] **575 [P1]** — SVG sprite for all icons (single file) — minimal requests.
- [x] **576 [P1]** — Use `aspect-ratio` for medium elements — zero CLS.
- [x] **577 [P1]** — Include `width`/`height` on img/logo if present.
- [x] **578 [P1]** — Avoid `@import` in CSS (already done) — migrate to link.
- [ ] **579 [P1]** — Blog/content: responsive `srcset` images — not relevant now (P2).
- [x] **580 [P1]** — Inline SVG logo in HTML — brand intuition without a request.
- [x] **581 [P1]** — `font-display: swap` in CSS @font-face for self-hosted fonts.
- [ ] **582 [P1]** — Trim all whitespace in HTML output — small size savings.
- [ ] **583 [P1]** — CSS rewrite: tokens + components = CSS ~8–12KB (gzipped ~3KB).
- [ ] **584 [P1]** — Remove large comments in production CSS.
- [x] **585 [P1]** — CSS gradient blobs: pure CSS (no images) — zero requests.
- [x] **586 [P1]** — Verify no mixed content (http vs https).
- [ ] **587 [P2]** — HTTP/3 / QUIC if infrastructure supports it.
- [ ] **588 [P1]** — Test on 3G (250ms RTT) — still fast due to SSR.
- [ ] **589 [P1]** — Rainy-day perf budget: 0 images, 2 fonts (self-hosted), 1 CSS, 1 JS.
- [x] **590 [P1]** — Consider local icon font (no; SVGs already cover it).

### 3.2 Server & Middleware — 601–635

- [x] **591 [P0]** — Remove unused middleware (cors, cookieParser, rateLimiter, socket) — minor savings but cleaner.
- [x] **592 [P1]** — Middleware order: helmet → compression → static → urlencoded/json → routes.
- [x] **593 [P1]** — Static assets: `express.static` with `maxAge: '7d'` cache.
- [x] **594 [P1]** — `morgan` in prod: combine `:status` short format with sampling — or replace with a thin custom log.
- [x] **595 [P1]** — Graceful shutdown: SIGTERM → close server & flush JSON data.
- [x] **596 [P1]** — Handle concurrent requests to the JSON file: single-file atomic write (tmp + rename) — prevent corruption.
- [ ] **597 [P1]** — Debounced save (optional 100ms) if many rapid mutations.
- [x] **598 [P1]** — JSON storage uses atomic `writeFileSync` for small files — sufficient (simple).
- [ ] **599 [P1]** — Rate limit on mutations only if needed (not required for a local app).
- [x] **600 [P1]** — Database connection — none anymore (local).
- [x] **601 [P1]** — EJS render cache enabled in prod (`app.set('view cache', true)`).
- [x] **602 [P1]** — Trust proxy if behind a reverse proxy (for accurate IP logging).
- [x] **603 [P1]** — CORS not needed (same origin) — remove the middleware.
- [x] **604 [P1]** — `helmet` provides security headers — keep it.
- [x] **605 [P1]** — Body parser limit `express.json({ limit: '10kb' })` — small.
- [x] **606 [P1]** — This directory doesn't expose `package.json`/`data/` via static.
- [x] **607 [P1]** — Production: `NODE_ENV=production` → view cache + logger timing.
- [x] **608 [P1]** — Static CSS versioned with `?v=hash` for cache busting.
- [x] **609 [P1]** — Enforce `X-Content-Type-Options` (nosniff) via helmet.
- [x] **610 [P1]** — Avoid `sync` on hot paths (except safe small JSON writes).
- [x] **611 [P1]** — Data file not blocked for 2 simulated writes — simple lock if needed.
- [ ] **612 [P1]** — DateTime: don't format on the server per request; cache the string (optional).
- [ ] **613 [P1]** — Index page: low-cost list query; pagination if >200 items (P1).
- [x] **614 [P1]** — Client-side search filter — no round-trip.
- [x] **615 [P2]** — Mount compression only on routes; not on static (already cached).
- [x] **616 [P1]** — Morgan log format concat; remove in prod if not needed.
- [x] **617 [P1]** — Avoid large `console.log` on requests — lightweight logger.
- [x] **618 [P1]** — Disk data: `data/todos.json` excluded from git (.gitignore).
- [x] **619 [P1]** — Startup: load JSON → JS object in memory; re-save per mutation.
- [ ] **620 [P1]** — Partial render memoization? — micro; skip.
- [x] **621 [P1]** — Server timeouts: reasonable `server.requestTimeout`.
- [x] **622 [P1]** — Default Node `keepAliveTimeout` (5s) — fine.
- [ ] **623 [P1]** — Metrics: no service needed (P2 could add /metrics).
- [x] **624 [P1]** — Health check without DB dependency — lightweight.
- [x] **625 [P1]** — Build: `tsc` already; set `sourceMap=false` in prod if needed.

### 3.3 Web Vitals & Rendering — 636–670

- [x] **626 [P1]** — LCP target: first element (title/list) fast — SSR.
- [x] **627 [P1]** — FID/INP: no large blocking JS — lightweight.
- [x] **628 [P1]** — CLS: reserve element sizes → stable layout.
- [x] **629 [P1]** — TTFB < 200ms local.
- [x] **630 [P1]** — Avoid *layout shift* on font swap (font-size-adjust / preload).
- [ ] **631 [P1]** — CSS 1 request, JS 1 request (defer) — budget.
- [x] **632 [P1]** — Fast first interactivity — no JS framework.
- [x] **633 [P1]** — Progressive enhancement: forms work without JS (server render).
- [x] **634 [P1]** — PNG logo: replace with inline SVG (optional, small).
- [x] **635 [P1]** — Use `will-change` carefully — only on heavily animated elements.
- [x] **636 [P1]** — 60fps animations — backdrop-filter composited on GPU.
- [ ] **637 [P1]** — Test on Slow 4G — page loads in 1 second.
- [x] **638 [P1]** — Font Awesome blocking script — replace with SVG (P0).
- [x] **639 [P1]** — No `document.write` — none.
- [x] **640 [P1]** — Maintain static HTML (SSR) for all content.
- [ ] **641 [P1]** — Small JS codebase: 1 file ~3KB vanilla.
- [x] **642 [P1]** — Gzip HTML by default via compression.
- [x] **643 [P1]** — Preconnect to fonts.gstatic.com if using Google Fonts.
- [ ] **644 [P1]** — Enforce cache-friendly headers in Nginx/PM2 if available.
- [x] **645 [P1]** — Ensure CORS doesn't throw in prod (not used).
- [ ] **646 [P1]** — Offline PWA (P2) — 20-line service worker.
- [ ] **647 [P1]** — Lighthouse Performance target ≥ 95.
- [ ] **648 [P1]** — Bundle analysis? Tiny — skip.
- [x] **649 [P1]** — Fast startup — no DB init.
- [x] **650 [P1]** — Memory: small JSON — stable.
- [x] **651 [P1]** — CPU: lightweight blur animation on desktop; small blur on mobile.
- [ ] **652 [P1]** — Avoid excessive DOM (list < 500 items) — pagination.
- [x] **653 [P1]** — Minimal event handlers (vanilla delegation).
- [x] **654 [P1]** — Toast & modal — no major reflow.
- [x] **655 [P1]** — Disable blur contrast when reduced.
- [x] **656 [P1]** — Data persistence syncs per mutation — lightweight between requests.
- [x] **657 [P1]** — All animations via `transform/opacity` — cheap.
- [ ] **658 [P1]** — No external animation library used.
- [x] **659 [P1]** — Long-lived asset cache 7d + HTML no-cache — healthy pattern.
- [ ] **660 [P1]** — Run monthly audit (Lighthouse CI optional).

---

## 4. BEST PRACTICE (Architecture & Code) — items 661–750

### 4.1 Architecture — 671–700

- [x] **661 [P0]** — Remove MongoDB/Typegoose & auth (100% local data) — replace with simple JSON storage.
- [x] **662 [P0]** — `src/app/services/todo.service.ts` is exported & used consistently (barrel).
- [x] **663 [P1]** — Separate local `store` (read/write JSON) from controller — 1 data layer.
- [x] **664 [P1]** — Separate router per domain (todo, health, not-found) — clean.
- [x] **665 [P1]** — Consistent file naming: kebab/single → `*.controller.ts`, `*.service.ts`.
- [x] **666 [P1]** — Thin controllers (parse request → call service → render).
- [x] **667 [P1]** — Services handle logic (light validation, persistence).
- [x] **668 [P1]** — Centralized error handling: error middleware + render error view.
- [x] **669 [P1]** — No `process.exit` at runtime (removed from database.ts).
- [x] **670 [P1]** — Env configuration: PORT & DATA_PATH only; safe defaults.
- [x] **671 [P1]** — Remove dotenv/config from start scripts (no multi-env needed).
- [x] **672 [P1]** — Concise `index.ts`: app.listen + graceful shutdown.
- [x] **673 [P1]** — Health check without DB dependency — always UP.
- [x] **674 [P1]** — Remove socket.io (unused) + cors middleware.
- [x] **675 [P1]** — Request/response specification in 1 language (clear JSON/HTML routes).
- [x] **676 [P1]** — Don't store data in `public/` — use `data/` root with .gitignore.
- [x] **677 [P1]** — Default data: seed file `data/todos.json` auto-created on run.
- [x] **678 [P1]** — View structure: views/layouts + views/partials separated.
- [x] **679 [P1]** — No duplicated code across pages (share partials).
- [x] **680 [P1]** — Interfaces: `Todo` type in `src/interfaces/todo.ts` (local type, not a mongoose model).
- [x] **681 [P1]** — Barrel export in `helpers/index.ts` including `render`.
- [x] **682 [P1]** — Export services from `services/index.ts` — everything in the barrel.
- [x] **683 [P1]** — Remove unused files: `hash.helper.ts`, `jwt/**`, user/session models.
- [x] **684 [P1]** — Minimal EJS partial reuse — use includes.
- [x] **685 [P1]** — API routes (`/api`, `/api/health-check`) remain concise.
- [x] **686 [P1]** — No business logic in routes.
- [x] **687 [P1]** — No `any` in internal code (strict TS).
- [x] **688 [P1]** — All TS files linted by eslint/biome — zero warnings.
- [x] **689 [P1]** — Data schema version control (trivial local migration).
- [x] **690 [P1]** — Clean `dist/` build output.

### 4.2 TypeScript Code — 701–730

- [x] **691 [P1]** — Strict mode stays enabled (tsconfig `strict: true`).
- [x] **692 [P1]** — `noImplicitAny` — double-check (strict already covers it).
- [x] **693 [P1]** — `experimentalDecorators` no longer needed (typegoose removed) — can delete from tsconfig.
- [x] **694 [P1]** — Modern `NodeNext` `moduleResolution` (optional).
- [x] **695 [P1]** — For Node 24, `target ES2022+` — fine.
- [x] **696 [P1]** — Remove `@types/cli-color`, `@types/npmlog` etc. (unused).
- [x] **697 [P1]** — Use explicit return types for public functions.
- [x] **698 [P1]** — Consistent `async/await`; no mixing with `.then`.
- [x] **699 [P1]** — Don't re-query user after create (register) — return password-free data from a single query.
- [x] **700 [P1]** — Input validation using a lightweight helper (the `required` function) — not a large library.
- [x] **701 [P1]** — Type for render payload (`ViewData` interface).
- [x] **702 [P1]** — `unknown` in catch + type guard (not `error: any`).
- [x] **703 [P1]** — Remove incorrect `"main": "index.js"` from package.json.
- [x] **704 [P1]** — Add `engines` to package.json (node >=20).
- [x] **705 [P1]** — `pnpm` as the package manager (lockfile in use).
- [x] **706 [P1]** — README written (module paths, run instructions, structure).
- [x] **707 [P1]** — `build` script uses `tsc` — could switch to `tsup` if bundling is needed (P2).
- [x] **708 [P1]** — No `dotenv` if no .env? Store default PORT.
- [x] **709 [P1]** — `win-node-env` removed (not needed; NODE_ENV via cross-env script).
- [x] **710 [P1]** — Remove `socket.io` type imports.
- [x] **711 [P1]** — `IRequest` interface removed (no auth).
- [x] **712 [P1]** — `render` helper, though small — keep it (nice).
- [x] **713 [P1]** — Route defense: validate `req.params.id` format.
- [x] **714 [P1]** — `response.helper` for API (keep it).
- [x] **715 [P1]** — Simplify middleware: remove auth/isAdmin.
- [x] **716 [P1]** — Ensure `dist` isn't committed (.gitignore).
- [x] **717 [P1]** — `create-env.ts` removed (env not needed).
- [x] **718 [P1]** — Removed: `--maxWorkers`... (none).
- [x] **719 [P1]** — Provide separate `typecheck` script.
- [x] **720 [P1]** — Consistent import order via Biome organizeImports (CI).

### 4.3 Logging & Observability — 731–755

- [x] **721 [P1]** — Replace `npmlog` (deprecated) with a mini self-built logger (console + timestamp) or `pino` (P2).
- [x] **722 [P1]** — Hierarchical log levels: debug/dev, info/prod.
- [x] **723 [P1]** — Log mutations (add/edit/delete) — auditable.
- [x] **724 [P1]** — Don't log sensitive data (none anymore).
- [x] **725 [P1]** — Health endpoint logging? Quiet.
- [x] **726 [P1]** — Error log: stack in dev, message in prod.
- [ ] **727 [P1]** — Structured log (JSON) in production — P2.
- [x] **728 [P1]** — Local timezone / ISO with zone.
- [x] **729 [P1]** — `morgan` is sufficient for request logging.
- [x] **730 [P1]** — Don't log full request bodies (privacy).
- [ ] **731 [P1]** — Request ID (correlation) — P2 if needed.
- [x] **732 [P1]** — Prevent log flood from health-check intervals (skip in prod).
- [ ] **733 [P1]** — Categorize logs (app, request, store).
- [ ] **734 [P1]** — File drain rotation (optional P2).
- [x] **735 [P1]** — Provide `console.error` in the global error handler.

### 4.4 Process & Git — 756–770

- [x] **736 [P1]** — Pre-commit: biome check (not eslint) + lint-staged.
- [x] **737 [P1]** — Conventional commit messages (`feat:`, `fix:`).
- [ ] **738 [P1]** — Feature branches + PR.
- [x] **739 [P1]** — Consistent `.editorconfig` (already present).
- [x] **740 [P1]** — `.prettierrc` replaced by Biome (remove prettier) — single tool.
- [x] **741 [P1]** — Remove `.eslintrc` — biome config.
- [x] **742 [P1]** — Lockfile committed (pnpm-lock.yaml) — reproducible versions.
- [x] **743 [P1]** — No secrets in repo (none anymore).
- [ ] **744 [P1]** — Rebase before merge (linear history) — optional.
- [ ] **745 [P1]** — Small code review checklist (README).
- [ ] **746 [P1]** — Release tags (v0.2.0...) — version discipline.
- [ ] **747 [P1]** — CI: pnpm install --frozen-lockfile + biome + build + test.
- [x] **748 [P1]** — Don't commit during rush — still lint.
- [ ] **749 [P1]** — Changelog (README section / GitHub Releases).
- [x] **750 [P1]** — LICENSE maintained (Apache 2.0).

---

## 5. EFFICIENCY & REFACTOR — items 751–840

### 5.1 Remove Dead Code & Dependencies — 771–800

- [x] **751 [P0]** — Remove dependencies: mongoose, @typegoose/typegoose, bcrypt, jsonwebtoken, cookie-parser, cors, express-rate-limit, socket.io, npmlog, dotenv, win-node-env.
- [x] **752 [P0]** — Remove devDependencies: @types/bcrypt, @types/cookie-parser, @types/cors, @types/jsonwebtoken, @types/npmlog, @types/cli-color, cli-color, eslint, @typescript-eslint/*, prettier.
- [x] **753 [P1]** — Remove directories/files: `src/jwt`, `src/app/models/{user,session}.model.ts`, `src/app/services/{user,session}.service.ts`, `src/app/middlewares`, `src/app/controllers/admin`, `src/routes/admin`, `src/app/controllers/auth.controller.ts`, `src/config/{env,database}.ts` (except PORT), `src/logger` if replaced.
- [x] **754 [P1]** — Remove `src/app/models/index.ts` (no mongoose models).
- [x] **755 [P1]** — Remove `pnpm-workspace.yaml` allowBuilds for bcrypt (missing dependency) — or adjust.
- [x] **756 [P1]** — Remove Docker DB: `docker/mongodb`, `docker/mongo-express`, `docker/docker-compose.yml`, `docker-compose.yml` (Mongo service).
- [x] **757 [P1]** — Remove `create-env.ts`, `env/`, `.env.example` (no env secrets).
- [x] **758 [P1]** — Replace `npmlog` → lightweight console log (reduce deprecated deps).
- [x] **759 [P1]** — Remove `style.css.map`.
- [x] **760 [P1]** — Remove `win-node-env` setup — cross-env? Set NODE_ENV via normal JSON scripts.
- [x] **761 [P1]** — Remove obsolete Docker scripts in package.json.
- [x] **762 [P1]** — Remove `setup-app*` if unused.
- [x] **763 [P1]** — Ensure `update-deps` pnpm script remains.
- [x] **764 [P1]** — Audit `pnpm outdated` — zero outdated dependencies.
- [ ] **765 [P1]** — Don't reinstall modals — pnpm clean.
- [x] **766 [P1]** — Runtime deps drastically reduced (express, ejs, layouts, method-override, morgan, compression, helmet).
- [x] **767 [P1]** — DevDeps reduced (typescript, ts-node, nodemon, @types/*, biome, husky, lint-staged).
- [x] **768 [P1]** — Updated `package.json` name/version to be relevant.
- [x] **769 [P1]** — Keywords updated (removed mongodb/mongoose/socket.io).
- [x] **770 [P1]** — Removed stale `main: index.js`.
- [x] **771 [P1]** — Remove `.npmrc` if not needed.
- [x] **772 [P1]** — Consider removing `.ejsbrc.json` if unused (optional).
- [x] **773 [P1]** — Verify `node_modules` is clean via `pnpm install` from scratch.
- [x] **774 [P1]** — Golang? No — pick the right terminology path.
- [x] **775 [P1]** — Bundler? Not needed (EJS server + direct CSS).
- [x] **776 [P1]** — Remove `socket.controller.ts`.
- [x] **777 [P1]** — Remove interfaces `decoded-user.ts`, `i-request.ts`.
- [x] **778 [P1]** — Remove `config/database.ts` connect/exit.
- [x] **779 [P1]** — Remove `hash.helper.ts` & `str.helper.ts` if unused.
- [x] **780 [P1]** — Remove `response.helper` if HTML-only? Keep for health/main JSON.

### 5.2 Consolidation & Simplification — 801–830

- [x] **781 [P1]** — Single storage service (`todo.service.ts`) reads/writes `data/todos.json`.
- [x] **782 [P1]** — `todo` controller has 6 handlers (index, store, update, destroy, add-form, edit-form) — concise.
- [x] **783 [P1]** — Todo routes: `GET /`, `POST /`, `GET /add-todo`, `GET /edit/:id`, `PUT /:id`, `DELETE /:id` — RESTful.
- [x] **784 [P1]** — Consistent field name `name` (removed `kegiatan`) — fixed across all views.
- [x] **785 [P1]** — `<%- body %>` layout maintained; partials in `views/partials`.
- [x] **786 [P1]** — No CSS duplication between add/edit — shared components.
- [x] **787 [P1]** — Render helper in barrel (`helpers/index.ts`).
- [x] **788 [P1]** — Single source for page title text via `pageTitle` helper.
- [x] **789 [P1]** — Error render prompt: single view-helper pattern (query flash).
- [x] **790 [P1]** — No unused 2-function files.
- [ ] **791 [P1]** — Tidy `app.ts` to 20 lines.
- [x] **792 [P1]** — No remaining `any` in TS.
- [x] **793 [P1]** — Simple local `Todo` interface type.
- [x] **794 [P1]** — Atomic data layer: tmpfile + rename.
- [x] **795 [P1]** — In-memory array cache + persist per mutation — consistent.
- [x] **796 [P1]** — New id mapping via `crypto.randomUUID()`.
- [x] **797 [P1]** — Timestamps stored on record (`createdAt`, `updatedAt`).
- [x] **798 [P1]** — Sorting delegated to service (default createdAt desc / manual).
- [x] **799 [P1]** — Filtering (active/completed) delegated to service, optional.
- [x] **800 [P1]** — EJS escaping `<%= %>` — safe default.
- [x] **801 [P1]** — Single configuration: `config/app.ts` (PORT, DATA_PATH, view settings).
- [x] **802 [P1]** — `index.ts` — listen + SIGINT/SIGTERM handler.
- [x] **803 [P1]** — Pure health check without store dependency (lightweight).
- [x] **804 [P1]** — Logger: `logger.ts` 10 lines (info/warn/error + timestamp).
- [x] **805 [P1]** — Render data type `ViewData { title, layout, todos, filters? }`.
- [x] **806 [P1]** — Non-guard: no JSON-schema validation package — manual is enough.
- [ ] **807 [P1]** — Focus: vary PR sizes — adjust accordingly.
- [x] **808 [P1]** — Consistent scripts: `dev`, `build`, `start`, `lint`, `format`, `test`.
- [x] **809 [P1]** — Dist ignored.
- [x] **810 [P1]** — Verify `pnpm start` runs from dist.

### 5.3 Data Flow Optimization — 831–860

- [x] **811 [P1]** — Read file once at startup, small synchronous write mutations.
- [x] **812 [P1]** — Handle ENOENT: create default file `[]`.
- [x] **813 [P1]** — Handle corrupted JSON: `.bak` backup + reseed.
- [x] **814 [P1]** — Configurable max todos limit (default 1000).
- [x] **815 [P1]** — IDs don't leak to long URLs — UUID is fine.
- [x] **816 [P1]** — Slugs not needed in the structure — UUID id.
- [ ] **817 [P1]** — O(1) find by id via Map — for fast deletions.
- [ ] **818 [P1]** — Map for filtering — items remain an array of objects.
- [x] **819 [P1]** — Deep clone before mutation — avoid alias bugs.
- [x] **820 [P1]** — Don't write the full array if nothing changed — guard.
- [x] **821 [P1]** — Writes use os.tmpdir + rename — atomic.
- [x] **822 [P1]** — Flush on 5s interval (optional) — keep simple per-mutation.
- [ ] **823 [P1]** — Prevent race: serialize mutations via microtask queue — P2.
- [ ] **824 [P1]** — Cache list render when filter hasn't changed (memory) — P2.
- [x] **825 [P1]** — Derive stat counts from array (reduce) — cheap.
- [x] **826 [P1]** — Case-insensitive string comparison in search — normalized.
- [x] **827 [P1]** — Trim input → save clean.
- [x] **828 [P1]** — Limit to 1 word at 200 chars — lightweight.
- [x] **829 [P1]** — Simple multiply-by logic — no bloat.
- [ ] **830 [P1]** — When the file exceeds 1MB? — pagination.
- [x] **831 [P1]** — Don't use fs sync on the event loop? For small 100KB files — safe.
- [x] **832 [P1]** — Build TS → CommonJS — runs directly in Node.
- [x] **833 [P1]** — No build step for CSS (manual tokens) — saves cost.
- [x] **834 [P1]** — Run with `NODE_ENV=production` without extra env vars.
- [x] **835 [P1]** — Only 1 port binding.
- [x] **836 [P1]** — Retry, backoff? Not needed (local).
- [x] **837 [P1]** — Health check stays.
- [ ] **838 [P1]** — Upgrade test — pnpm update --latest then lock.
- [x] **839 [P1]** — Verify no pnpm peer warnings.
- [x] **840 [P1]** — Summary: small runtime footprint, clean code (target ~1.2k LOC).

---

## 6. SECURITY — items 841–905

- [x] **841 [P0]** — Add `helmet` — configure security headers (X-Content-Type-Options, basic CSP, etc.).
- [x] **842 [P1]** — Escape all EJS output (`<%= %>`) — prevent XSS.
- [x] **843 [P1]** — Don't use `<%- %>` for user data without sanitization.
- [x] **844 [P1]** — Input validation: `req.body.name` must be a string, trimmed, max 200 chars.
- [x] **845 [P1]** — Validate `req.params.id` UUID format — prevent path traversal/DoS strings.
- [x] **846 [P1]** — Body parser limit `express.json/urlencoded({ limit: '10kb' })`.
- [x] **847 [P1]** — `helmet.hidePoweredBy` — don't leak the framework.
- [x] **848 [P1]** — Basic CSP: `default-src 'self'` + fonts inline-style — external content controlled.
- [x] **849 [P1]** — No secrets/keys in repo (jwt secret removed).
- [x] **850 [P1]** — `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **851 [P1]** — `Permissions-Policy` (geolocation=() etc.) — optional.
- [x] **852 [P1]** — Don't show stack traces in prod (friendly error view).
- [x] **853 [P1]** — Don't log sensitive bodies.
- [x] **854 [P1]** — No `--inspect` in prod.
- [ ] **855 [P1]** — Rate limit (optional) on mutations if public — lightweight express-rate-limit.
- [x] **856 [P1]** — No eval / Function constructor in JS.
- [x] **857 [P1]** — Health API without personal data.
- [x] **858 [P1]** — CORS restricted (same-origin) — no `*` needed.
- [x] **859 [P1]** — Unused server features: remove frameguard? Helmet includes it.
- [x] **860 [P1]** — JSON store cache not served publicly (data dir ignored).
- [x] **861 [P1]** — `trust proxy` used carefully (IP spoof) — set to `1` only if behind a proxy.
- [x] **862 [P1]** — Handle `unhandledRejection` — log & exit? warn.
- [x] **863 [P1]** — Handle duplicate mutations (POST idempotency) — simple.
- [x] **864 [P1]** — Form hijacking — SameSite? No cookies anymore.
- [x] **865 [P1]** — No CSRF needed (no cookie/session) — if auth is added later, consider it.
- [x] **866 [P1]** — UUID validation regex — don't open injection via id.
- [x] **867 [P1]** — Don't mirror input into class/style attributes.
- [x] **868 [P1]** — Update dependencies routinely (security patches).
- [ ] **869 [P1]** — Run `npm audit` / `pnpm audit` in CI — for production.
- [x] **870 [P1]** — Don't use an old Express 4 minor version? Update to 4.x patch or 5 if stable.
- [x] **871 [P1]** — Container? Not needed for local — reduce attack surface.
- [x] **872 [P1]** — Secrets in env — none anymore; PORT has default.
- [x] **873 [P1]** — File paths protected — external DATA_PATH possible.
- [ ] **874 [P1]** — Prepare a forward proxy — out of scope.
- [x] **875 [P1]** — Health endpoint stays calm (no info flooding).
- [x] **876 [P1]** — Response header removes `X-Powered-By`.
- [x] **877 [P1]** — Trust NO user input in template/include paths.
- [x] **878 [P1]** — Reject large request bodies at the limit.
- [x] **879 [P1]** — Normalize unicode input? — trim is enough.
- [x] **880 [P1]** — SSRF — no URL fetching.
- [x] **881 [P1]** — Minimal provider dependencies — small attack surface.
- [x] **882 [P1]** — Updated EJS patch (past XSS fix) — latest.
- [x] **883 [P1]** — Standard `crypto.randomUUID` provided.
- [x] **884 [P1]** — No `eval` in templates (EJS default is safe).
- [x] **885 [P1]** — CSP style-src inline for tokens — fine.
- [x] **886 [P1]** — Latest `helmet` version in deps.
- [ ] **887 [P1]** — Rate limit on `/` mutation path if public.
- [x] **888 [P1]** — `Cache-Control: no-store` on mutation responses.
- [x] **889 [P1]** — No password storage (no auth).
- [x] **890 [P1]** — Login? — removed — don't use partial auth.
- [x] **891 [P1]** — Small circuit = easy audit.
- [x] **892 [P1]** — Documented security (README) — at a glance.
- [x] **893 [P1]** — Don't put functions in URLs.
- [x] **894 [P1]** — Ensure unique data (todos.json) isn't trackable.
- [x] **895 [P1]** — Express 4 → 5 migration optional (async handlers not needed).
- [x] **896 [P1]** — Use `res.redirect` for PRG — not direct rendering.
- [x] **897 [P1]** — Anti-autocomplete on forms? Not needed (no sensitive data).
- [x] **898 [P1]** — Container wait — non-relevant.
- [x] **899 [P1]** — Data path access via symlink? No.
- [x] **900 [P1]** — Request logs don't display cookies.
- [x] **901 [P1]** — Avoid leaking IDs in lists — UUID is fine.
- [x] **902 [P1]** — Integer overflow — none.
- [x] **903 [P1]** — Protected menus — everything is public (todo).
- [x] **904 [P1]** — Secure by default: no dangerous activities.
- [x] **905 [P1]** — Documented security config (helmet, limiter).

---

## 7. ACCESSIBILITY (A11Y) — items 906–960

- [x] **906 [P0]** — All controls have a connected `<label>` (`for`/`id`) — not placeholder-only.
- [x] **907 [P0]** — `lang="id"` (already done in SEO).
- [x] **908 [P1]** — Icon symbol characters get `aria-hidden="true"` + `aria-label` on interactive elements.
- [x] **909 [P1]** — Edit/delete icon buttons: `aria-label="Ubah rencana"` / "Hapus rencana".
- [x] **910 [P1]** — Todo checkbox: checkbox role + label (todo name) — focusable.
- [x] **911 [P1]** — Full keyboard navigation: natural Tab order; Enter/Space on buttons.
- [x] **912 [P1]** — Clearly visible focus ring (2px contrasting ring + offset).
- [x] **913 [P1]** — Confirmation modal: focus trap + `role="dialog"` + `aria-modal` + Esc close.
- [x] **914 [P1]** — Toast/error: `role="alert"` / `role="status"` — screen reader announcement.
- [x] **915 [P1]** — Empty state: text with `aria-label` — still readable.
- [x] **916 [P1]** — Filter/search status announced (`aria-live="polite"` result count).
- [x] **917 [P1]** — WCAG AA contrast (4.5:1) on all text & controls.
- [x] **918 [P1]** — Color not the sole status signal (include text/icons).
- [x] **919 [P1]** — `prefers-reduced-motion` — disable animations; no motion layering.
- [x] **920 [P1]** — `prefers-reduced-transparency` — demote blur → solid surface.
- [x] **921 [P1]** — Touch targets ≥44×44 (mobile/touch).
- [x] **922 [P1]** — Form errors: text linked via `aria-describedby`.
- [x] **923 [P1]** — Required form inputs: `required` + message.
- [x] **924 [P1]** — All decorative images `alt=""`.
- [x] **925 [P1]** — Semantic heading hierarchy (h1→h2→p).
- [x] **926 [P1]** — Skip link "Lewati ke konten" at start of body.
- [x] **927 [P1]** — `<nav>` header with label if menu present.
- [x] **928 [P1]** — Footer doesn't trap focus (a11y landmark).
- [x] **929 [P1]** — Action buttons: use `<button>` (not `<a>` without href) — submit concern.
- [x] **930 [P1]** — Link to add uses `<a href="/add-todo">` (crawlable + keyboard).
- [x] **931 [P1]** — Repeat hidden content: use `.visually-hidden` when needed.
- [x] **932 [P1]** — Clear toast score: role + live.
- [x] **933 [P1]** — Accessible `<html>` font; 200% zoom still usable.
- [x] **934 [P1]** — Contrast on focus/active/hover.
- [x] **935 [P1]** — Input placeholder doesn't replace the label.
- [x] **936 [P1]** — Autocomplete (search) — not needed.
- [x] **937 [P1]** — Refocus the form on submit error.
- [x] **938 [P1]** — No red-on-red on error (text+icon).
- [x] **939 [P1]** — `aria-current` on active filter chip.
- [x] **940 [P1]** — Live region for "2 tersisa" updates.
- [x] **941 [P1]** — Modal scroll-locks the body.
- [x] **942 [P1]** — Delete confirm: focus moves to Cancel button.
- [x] **943 [P1]** — Desktop & mobile keyboard/screen sizes tested.
- [x] **944 [P1]** — Add/edit form — submit via Enter (native).
- [ ] **945 [P1]** — High contrast mode (Windows HC) — use tokens + surface patterns.
- [x] **946 [P1]** — Dark mode contrast also meets AA.
- [x] **947 [P1]** — Aria button names not abbreviated only.
- [x] **948 [P1]** — Announce changes when editing on a second page — natural.
- [x] **949 [P1]** — Don't show green focus when not focused — always ring.
- [x] **950 [P1]** — Ensure all interactive elements are keyboard-reachable (no display:none on focus targets).
- [x] **951 [P1]** — Toast doesn't interfere with screen reader reading.
- [ ] **952 [P1]** — Pick a device: basic screen reader test (NVDA/ORCA).
- [x] **953 [P1]** — Don't auto-advance animations without control.
- [x] **954 [P1]** — Consistent `aria-label` on nav & repeated actions.
- [x] **955 [P1]** — Status chips have text labels (not just colored dots).
- [x] **956 [P1]** — Empty state not empty from an a11y perspective (not image-only).
- [x] **957 [P1]** — Clean focus movement steps.
- [ ] **958 [P1]** — Minimum 14px font size in UI.
- [x] **959 [P1]** — No UPPERCASE emphasis for long text (except button labels).
- [ ] **960 [P1]** — Accessibility audit (axe) in CI — target 0 critical (P2).

---

## 8. TESTING & QUALITY — items 961–1005

- [x] **961 [P0]** — Provide at least **1 test** for the todo service (CRUD + persistence) — short-circuit regressions.
- [x] **962 [P1]** — Unit test `todo.service` (sort, find, filter, persist).
- [x] **963 [P1]** — Unit test validator helper (required, maxLength).
- [x] **964 [P1]** — Integration test route `/` (GET 200, render HTML).
- [x] **965 [P1]** — Integration: POST / (add), redirect + data saved.
- [x] **966 [P1]** — Integration: PUT /:id rename, response.
- [x] **967 [P1]** — Integration: DELETE /:id removes item.
- [x] **968 [P1]** — Edge test: empty input → error; invalid id → 404/redirect.
- [x] **969 [P1]** — Test corrupted data → recovery to default.
- [x] **970 [P1]** — Test 404 route.
- [x] **971 [P1]** — Test `render` helper returns 200.
- [ ] **972 [P1]** — Small markup snapshot? — fragile; skip.
- [x] **973 [P1]** — Test framework: **Vitest** (lightweight) or built-in `node:test` — no excessive overhead.
- [x] **974 [P1]** — Tests in CI (for CI/CD flow).
- [x] **975 [P1]** — 80% coverage target on service — P2.
- [x] **976 [P1]** — Lint for test colors? — lint.
- [x] **977 [P1]** — E2E happy path via curl / supertest.
- [ ] **978 [P1]** — Responsive test via Playwright (P2) — screenshot breakpoints.
- [ ] **979 [P1]** — A11y scan axe once — P2.
- [ ] **980 [P1]** — Check Lighthouse budget CI — P2.
- [x] **981 [P1]** — Smoke test prod (health + index) — P1 at deploy time.
- [x] **982 [P1]** — Add `pretest` typecheck.
- [ ] **983 [P1]** — Small utils test: flash parse — skip.
- [x] **984 [P1]** — Check serial mutation speed.
- [x] **985 [P1]** — Test stale file? Flush.
- [x] **986 [P1]** — Test max limit (1000) — guard.
- [x] **987 [P1]** — Test XSS escaped (input `<script>` saved as text).
- [x] **988 [P1]** — Test Unicode (emoji) input.
- [x] **989 [P1]** — Test long name (201 chars) rejected.
- [x] **990 [P1]** — Test duplicate name OK.
- [x] **991 [P1]** — Test empty todos state render.
- [x] **992 [P1]** — Test sort behavior.
- [x] **993 [P1]** — Test toggle completion.
- [x] **994 [P1]** — Scaffold: `pnpm test` works.
- [x] **995 [P1]** — Deterministic data path in tests (tmp dir).
- [x] **996 [P1]** — Cleanup test file.

### 8.1 Lint & Format (Biome) — 1017–1025

- [x] **997 [P0]** — Migrate ESLint → **Biome**: `biome.json` with TS config.
- [x] **998 [P0]** — Scripts: `lint` = `biome check`; `format` = `biome format --write`.
- [x] **999 [P1]** — Enable `organizeImports` (auto-sort imports).
- [x] **1000 [P1]** — Enable recommended rules + `noExplicitAny` (fix all).
- [x] **1001 [P1]** — `useSortedClasses` for CSS-in-JS — not applicable.
- [x] **1002 [P1]** — lint-staged: `biome check --write --staged`.
- [x] **1003 [P1]** — Editor integration (VSCode extension) — api.
- [x] **1004 [P1]** — Format on commit automatically.
- [x] **1005 [P1]** — No prettier/eslint conflicts — single tool (Biome).

---

## 9. PROJECT / DX / DEVOPS — items 1006–1050

- [x] **1006 [P0]** — Write `README.md`: description, setup (`pnpm install`, `pnpm dev`), structure, scripts, data location.
- [x] **1007 [P0]** — Remove env after local data is in place; document the port.
- [x] **1008 [P1]** — `.gitignore`: add `data/`, remove env exception? (Keep it).
- [x] **1009 [P1]** — Cross-platform build script (`rm -rf` fails on Windows) → use `rimraf` (dev) OR `pnpm dlx rimraf`? — fix it.
- [x] **1010 [P1]** — Dev script: `nodemon src/index.ts` without forced NODE_ENV.
- [x] **1011 [P1]** — Set `"type": "module"`? Stick with CJS (stable) — document it.
- [x] **1012 [P1]** — Node engines: `"node": ">=20"`.
- [x] **1013 [P1]** — Package manager field: `pnpm@>=9`.
- [x] **1014 [P1]** — Remove `.npmrc` if unused.
- [x] **1015 [P1]** — Update `.prettierignore` → remove (Biome handles it); file may still exist.
- [x] **1016 [P1]** — Docker: not needed locally (remove) or create a simple single-stage `Dockerfile` for deployment — P2.
- [ ] **1017 [P1]** — PM2 ecosystem for production — P2.
- [x] **1018 [P1]** — Deploy target: VPS/Railway/Fly — documented.
- [x] **1019 [P1]** — Health endpoint used for uptime checks.
- [x] **1020 [P1]** — GitHub Actions CI: lint+build+test.
- [ ] **1021 [P1]** — Optional CD (workspace deploy).
- [x] **1022 [P1]** — Versioning `0.2.0`.
- [x] **1023 [P1]** — Simple changelog.
- [x] **1024 [P1]** — GitHub metrics? No.
- [x] **1025 [P1]** — Consistent editorconfig (present).
- [x] **1026 [P1]** — `eslintrc/prettier` files removed — clean.
- [x] **1027 [P1]** — Docs: data architecture (local JSON) — summarized in README.
- [x] **1028 [P1]** — Upgrade path when multi-user is needed → documented in supplement.
- [x] **1029 [P1]** — Data backup: copy `data/todos.json` manually.
- [x] **1030 [P1]** — Export/Import as JSON (P2 feature: download/upload button).
- [x] **1031 [P1]** — Git semver tags.
- [x] **1032 [P1]** — CI pins pnpm version.
- [x] **1033 [P1]** — Lockfile committed — yes.
- [x] **1034 [P1]** — Routine dependency audit.
- [x] **1035 [P1]** — Small PR checklist (format + test).
- [x] **1036 [P1]** — VSCode settings: `format on save` using biome — P2.
- [x] **1037 [P1]** — Contributing: brief CONTRIBUTING guide if public.
- [x] **1038 [P1]** — Apache license already present.
- [ ] **1039 [P1]** — Monitoring up (uptime check) — P2.
- [ ] **1040 [P1]** — Manual deploy script (optional).
- [x] **1041 [P1]** — Default local timezone.
- [x] **1042 [P1]** — Adopt codegen? No.
- [x] **1043 [P1]** — Short refactoring documentation is important.
- [ ] **1044 [P1]** — Deployment performance test — P2.
- [x] **1045 [P1]** — Custom storage path via `DATA_PATH` env — documented.
- [x] **1046 [P1]** — Entire app runs locally — full privacy (selling point).
- [x] **1047 [P1]** — Remove leftover `express-ts-starter` branding from README — replace with todo-app.
- [x] **1048 [P1]** — `pnpm build` verifies outDir.
- [x] **1049 [P1]** — `.editorconfig` charset/lf.
- [x] **1050 [P1]** — Run full audit after refactor & document items that were fixed.

---

## EXECUTION SUMMARY (phase 1 — done/not done)

| Category | Items | P0 |
|---|---|---|
| UI/UX Redesign | 1–460 (460) | 30 |
| SEO | 461–555 (95) | 3 |
| Performance | 556–660 (105) | 3 |
| Best Practice | 661–750 (90) | 2 |
| Efficiency & Refactor | 751–840 (90) | 2 |
| Security | 841–905 (65) | 1 |
| Accessibility | 906–960 (55) | 2 |
| Testing & Quality | 961–1005 (45) | 3 |
| Project/DX/DevOps | 1006–1050 (45) | 2 |

**Total items: 1,050.**

> Final note: the summary table above is the entry point. When making implementation decisions, start with the **[P0]** rows, then P1 by phase. The `[x]` checklist status is updated each time a point is completed.
