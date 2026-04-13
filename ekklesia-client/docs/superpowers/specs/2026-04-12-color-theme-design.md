# Color Theme Redesign — Dark Sidebar + White Content

**Date:** 2026-04-12  
**Status:** Approved

## Summary

Replace the current all-dark-navy dashboard theme with a two-tone scheme: dark navy sidebar + white content area. The login page stays unchanged. The goal is to use the logo's two colors (dark blue and white) clearly and intentionally.

## Design Decisions

- **Direction chosen:** A — Dark sidebar, white content, white header
- **Sidebar:** Keep existing dark navy gradient (`#0a1628` → `#0f2035`)
- **Header:** Change from dark navy to white with a gray bottom border; all text/icon colors flip to dark
- **Main content background:** `#f8fafc` (very light neutral gray — no blue tint)
- **Cards:** Pure white (`#ffffff`) with subtle shadow — pop against the light gray background
- **Login page:** Untouched — already perfect
- **Dropdowns (notifications, profile):** Keep dark — float well over the white header

## Files to Change

### 1. `src/styles/globals.css` — CSS variables
- `--background`: remove blue chroma → neutral near-white
- `--muted`: remove blue chroma → neutral light gray
- `--border`: remove blue chroma → neutral gray
- `--input`: remove blue chroma → neutral gray
- All other vars: keep (foreground, primary, sidebar already correct)

### 2. `src/components/dashboard/header.tsx`
- Container: `bg-[#0a1628]/80 backdrop-blur-xl border-white/10` → `bg-white border-slate-200`
- Title: `text-white` → `text-[#0a1628]`
- Menu button: dark styles → `text-slate-500 hover:text-slate-700 hover:bg-slate-100`
- Search input: dark styles → light styles (`bg-slate-50 border-slate-200 text-slate-900`)
- Bell/notification button: dark styles → light styles
- Profile button: dark styles → light styles (name text dark, role text gray)

### 3. Route page wrappers (4 files)
Remove dark gradient from the outer `<div>` wrapper in each role's dashboard/layout:
- `src/routes/superadmin/index.tsx` — `bg-gradient-to-br from-[#0a1628]...` → `bg-background`
- `src/routes/lead-pastor/lead-pastor.tsx`
- `src/routes/pastor/pastor.tsx`
- `src/routes/assistant/assistant.tsx`

## Out of Scope
- Dashboard component internals (stats-card, chart-card, data-table) — their white/glass styles already work on a light background
- Login page
- Sidebar
