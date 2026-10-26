# KidQuest — Marketing Improvements

Audience: parents who want to motivate children to take responsibility and help with chores.  
Goal: turn the existing functional app into a product parents confidently recommend to other parents.

---

## Priority 1 — Czech localization (quick wins, high impact)

The app is clearly designed for Czech families yet several views are still in English. Every parent who opens the app sees "Tasks", "Add Task", "All / Unassigned / Assigned", "Award", "Rewards Progress", "Reach 1,000 points to claim the top reward", "No children found. Add children from the dashboard first." This creates immediate credibility damage.

**Files to update:**
- `Tasks.jsx` — header "Tasks", "Add Task", button "Z katalogu" (already Czech), filter tabs (All → Vše, Unassigned → Nepřiřazeno, Assigned → Přiřazeno, etc.), "Award" → "Odměnit", confirm dialog in English.
- `RewardsProgress.jsx` — title "Rewards Progress" → "Cesta odměn", subtitle, empty state message.
- `Children.jsx` — status labels in `STATUS_LABEL` (Unassigned, Assigned, Pending, Done, Rejected → Czech equivalents already exist in Tasks.jsx).
- `Sidebar.jsx` — nav labels (check if English anywhere).
- Error messages in API calls — "Your account is not linked to a family." → Czech.
- `Modal` titles and `ConfirmDialog` messages where English slips through.

---

## Priority 2 — Onboarding wizard

**Problem:** A new parent logs in and sees an empty dashboard with no children, no tasks, no context. Nothing explains what to do first or why this app is worth setting up.

**Proposed flow (3 steps, dismissible):**
1. **Přidej dítě** — name, age, theme choice (Unicorn / Frozen / Minecraft). Icon grid, live preview of the avatar.
2. **Vyber první úkoly** — a curated pick-list from the catalog (5–8 popular chores). One tap = added.
3. **Nastav první odměnu** — a quick reward form with suggested names ("Hodina obrazovky", "Výlet do kina", "Hračka"). Sets the first target the child will see.

Each step has a skip button. After step 3, redirect to the parent Dashboard with a "Hotovo! Sdílej odkaz s dítětem." CTA.

**Files to create:** `frontend/src/components/OnboardingWizard.jsx`, `OnboardingWizard.module.css`  
**Files to modify:** `App.jsx` or `Dashboard.jsx` — show wizard when `children.length === 0`.

---

## Priority 3 — Fix RewardsProgress track positions

**Problem:** `getTrackKey()` in `RewardsProgress.jsx` matches children by hard-coded name substrings ("sara", "rebeka", "samuel"). Any family that doesn't have exactly those names gets avatars stacked at position 0 on the track. The page is broken for everyone outside this one family.

**Fix:** Replace name-based track assignment with dynamic row allocation.
- Assign each child a track row by their index in the children array (up to 3 visible rows; add horizontal scroll or a tabs pattern if more than 3 children).
- Remove `TRACK_DEFS` keyed by name; compute `y` positions evenly from image height.
- Or replace the static SVG/PNG background with a proper CSS layout that scales to any number of children.

This is a prerequisite for marketing the app to any family.

---

## Priority 4 — Streak joker visibility in kid view

**Problem:** The docs spec a "joker" that prevents streak loss after one missed day. Kids don't see this anywhere in `KidView.jsx`. If a child misses a day and their streak resets, it feels punishing and unfair — especially since the joker was supposed to protect them.

**Fix:** Show joker count in the morning routine band or the streak badge.
```
🔥 12 dní v řadě!  🃏 1 joker
```
Source from `progress.jokerCount` (if available from API) or `progress.streakJokerUsed`.

---

## Priority 5 — Empty states with clear CTAs

Every empty state currently shows a plain sentence. These are missed motivation moments.

| Page | Current | Better |
|------|---------|--------|
| Dashboard — pending tasks | "No pending tasks" | "Zatím nic nečeká na schválení 🎉" + "Přidat nový úkol" button |
| Tasks — empty filter | "No tasks match the current filter." | "Žádné úkoly v tomto filtru. Přidat nový?" with inline add button |
| KidView — no tasks | "Žádné úkoly na dnes. Skvělá práce! 🎉" ✓ Good | Keep |
| KidView — no rewards | "Žádné odměny zatím nevytvořil rodič." | "Rodiče ještě nevytvořili žádné odměny. Řekni jim, co chceš! 🎁" |
| RewardsProgress — no children | "No children found. Add children from the dashboard first." | Czech + button linking to Children page |

---

## Priority 6 — Stronger branding in parent views

The parent views (Dashboard, Tasks, Rewards, Children) use a plain white admin aesthetic with no KidQuest identity. The kid view has strong theming; the parent view has none.

**Quick improvements:**
- Add the KidQuest wordmark (text logo) to the Sidebar top instead of just a nav list.
- Use a consistent accent color (`#667eea` already used in forms) across all parent pages for primary buttons and active states.
- Dashboard header: replace plain "Parent Dashboard" + subtitle with a warmer greeting: "Dobrý den! Jak se daří vaší rodině?" with today's date.
- Family name displayed prominently in the sidebar or dashboard header.

---

## Priority 7 — Kid view UX polish

Small changes with outsized emotional impact:

**a) Task icon by kind**  
All tasks show `📋`. Use the same icons defined in TaskForm's `TYPE_OPTIONS` to differentiate tasks visually (🍽️ for TABLE, 🧺 for LAUNDRY, 🛏️ for ROOM, 📚 for HOMEWORK, etc.).

**b) Homework guidance text**  
`KidView.jsx:538` shows a hint "Udělej ho včas, zkontroluj a oprav sám." The text is small and color `var(--kdim)`. Make it a styled tip chip with the bonus breakdown visible: "📚 Včas: 20b · 🔍 Sám opravíš: +5b · 🏆 Bez připomínání: +3b".

**c) Diary entry labels**  
`KidView.jsx:1038` shows `tx.reason ?? tx.type` but the `txLabel()` helper at line 159 already does proper formatting. Replace `tx.reason ?? tx.type` with `txLabel(tx)`.

**d) Level-up overlay**  
The overlay is great. Add the new landscape thumbnail so the child sees the new world they've unlocked, not just the text.

---

## Priority 8 — Mobile responsiveness for parent views

KidView is optimized for mobile (100vh, sidebar, scroll area). The parent views use a `Sidebar + main` layout that may not work well on phone widths. Parents often check pending approvals on mobile.

**Check / fix:** Dashboard, Tasks, Rewards pages at 375px width:
- Sidebar should collapse to a bottom tab bar or hamburger at < 640px.
- Pending approval table should become cards on mobile.
- Task list cards should stack cleanly.

---

## Priority 9 — Parent notification summary email / push

Parents miss pending approval requests until they open the app. A daily digest ("Máte 3 úkoly čekající na schválení") drives engagement and prevents kid frustration.

**Phase 1 (simple):** Daily summary email at 18:00 if there are pending tasks. Spring Boot scheduled task + simple email template.  
**Phase 2:** Browser push notification (PWA manifest + service worker). The app already has a Vite build — add `vite-plugin-pwa`.

---

## Priority 10 — Landing page / marketing page

The app has no public-facing page explaining what it is. Parents who hear about it via word-of-mouth have nothing to share.

**Proposed sections:**
1. Hero — "Pomož svým dětem stát se zodpovědnými, aniž bys musel/a neustále připomínat."
2. How it works — 3 steps: přidat úkoly → dítě plní a odesílá → schválit a udělit body.
3. Kid themes showcase — animated preview of Unicorn / Frozen / Minecraft views.
4. Features — Streaks, odznaky, odměny, rutiny.
5. CTA — "Vyzkoušet zdarma" → register form.

---

## Summary table

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Czech localization | Low | High |
| 2 | Onboarding wizard | Medium | High |
| 3 | Fix RewardsProgress tracks | Medium | High (app-breaking bug for any real family) |
| 4 | Streak joker visibility | Low | Medium |
| 5 | Empty states + CTAs | Low | Medium |
| 6 | Parent view branding | Low | Medium |
| 7 | Kid view UX polish | Low | Medium |
| 8 | Mobile parent views | Medium | Medium |
| 9 | Notifications | High | High |
| 10 | Landing page | High | High |
