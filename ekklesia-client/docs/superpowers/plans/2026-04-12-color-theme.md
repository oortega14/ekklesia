# Color Theme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all-dark dashboard with dark navy sidebar + white content area, matching the logo's two-tone color scheme.

**Architecture:** Fix CSS variables to neutral white; migrate 3 shared dashboard components (StatsCard, ChartCard, DataTable) from dark-glass to white-card styles; flip Header to white; batch-replace dark page wrappers and glass card backgrounds in all 17 route files; fix inline text colors in route files.

**Tech Stack:** React, Tailwind CSS v4, shadcn/ui, oklch CSS color space, Recharts

---

### Task 1: Fix CSS color variables

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Replace `:root` block — strip blue chroma from neutral tokens**

In `src/styles/globals.css`, replace the entire `:root { ... }` block with:

```css
:root {
  /* Church Platform - Dark Sidebar + White Content */
  --background: oklch(0.976 0 0);
  --foreground: oklch(0.13 0.04 240);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.04 240);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.04 240);
  --primary: oklch(0.25 0.09 240);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.94 0 0);
  --secondary-foreground: oklch(0.13 0.04 240);
  --muted: oklch(0.94 0 0);
  --muted-foreground: oklch(0.55 0 0);
  --accent: oklch(0.94 0 0);
  --accent-foreground: oklch(0.13 0.04 240);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.9 0 0);
  --input: oklch(0.94 0 0);
  --ring: oklch(0.45 0.12 240);
  --chart-1: oklch(0.55 0.18 220);
  --chart-2: oklch(0.45 0.15 240);
  --chart-3: oklch(0.65 0.12 200);
  --chart-4: oklch(0.35 0.1 260);
  --chart-5: oklch(0.75 0.08 180);
  --radius: 0.75rem;
  --sidebar: oklch(0.15 0.05 240);
  --sidebar-foreground: oklch(0.95 0.01 240);
  --sidebar-primary: oklch(0.55 0.15 220);
  --sidebar-primary-foreground: oklch(0.98 0.005 240);
  --sidebar-accent: oklch(0.25 0.06 240);
  --sidebar-accent-foreground: oklch(0.95 0.01 240);
  --sidebar-border: oklch(0.25 0.04 240);
  --sidebar-ring: oklch(0.55 0.15 220);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
git add src/styles/globals.css
git commit -m "style: strip blue chroma from CSS neutral variables"
```

---

### Task 2: Flip Header to white

**Files:**
- Modify: `src/components/dashboard/header.tsx`

- [ ] **Step 1: Header container — dark navy → white**

Replace:
```tsx
className="h-16 bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40"
```
With:
```tsx
className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40"
```

- [ ] **Step 2: Title text — white → dark navy**

Replace:
```tsx
className="text-lg font-semibold text-white"
```
With:
```tsx
className="text-lg font-semibold text-[#0a1628]"
```

- [ ] **Step 3: Mobile menu button**

Replace:
```tsx
className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-blue-300/70 hover:text-white transition-colors"
```
With:
```tsx
className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
```

- [ ] **Step 4: Search icon**

Replace:
```tsx
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
```
With:
```tsx
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
```

- [ ] **Step 5: Search input**

Replace:
```tsx
className="w-full pl-10 pr-4 py-2 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-blue-300/40 focus:border-blue-500/50 focus:bg-white/10 transition-all"
```
With:
```tsx
className="w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-white transition-all"
```

- [ ] **Step 6: Bell button**

Replace:
```tsx
className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-300/70 hover:text-white transition-colors"
```
With:
```tsx
className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
```

- [ ] **Step 7: Profile button container**

Replace:
```tsx
className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
```
With:
```tsx
className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
```

- [ ] **Step 8: Profile button text**

Replace:
```tsx
<p className="text-sm font-medium text-white">{userName}</p>
<p className="text-xs text-blue-300/60">{userRole}</p>
<ChevronDown className="w-4 h-4 text-blue-300/60 hidden sm:block" />
```
With:
```tsx
<p className="text-sm font-medium text-[#0a1628]">{userName}</p>
<p className="text-xs text-slate-500">{userRole}</p>
<ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
```

- [ ] **Step 9: Commit**

```bash
git add src/components/dashboard/header.tsx
git commit -m "style: flip dashboard header from dark navy to white"
```

---

### Task 3: Fix StatsCard component

**Files:**
- Modify: `src/components/dashboard/stats-card.tsx`

- [ ] **Step 1: Card container — glass → white card**

Replace:
```tsx
className={cn(
  "relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 p-6 backdrop-blur-sm group",
  className
)}
```
With:
```tsx
className={cn(
  "relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 group",
  className
)}
```

- [ ] **Step 2: Title text**

Replace:
```tsx
<p className="text-sm text-blue-200/60 font-medium">{title}</p>
```
With:
```tsx
<p className="text-sm text-slate-500 font-medium">{title}</p>
```

- [ ] **Step 3: Value text**

Replace:
```tsx
className="text-3xl font-bold text-white"
```
With:
```tsx
className="text-3xl font-bold text-[#0a1628]"
```

- [ ] **Step 4: Trend comparison text**

Replace:
```tsx
<span className="text-blue-300/40">vs mes anterior</span>
```
With:
```tsx
<span className="text-slate-400">vs mes anterior</span>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/stats-card.tsx
git commit -m "style: flip StatsCard to white card with dark text"
```

---

### Task 4: Fix ChartCard component

**Files:**
- Modify: `src/components/dashboard/chart-card.tsx`

- [ ] **Step 1: Card container**

Replace:
```tsx
className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
```
With:
```tsx
className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
```

- [ ] **Step 2: Title and subtitle**

Replace:
```tsx
<h3 className="text-lg font-semibold text-white">{title}</h3>
{subtitle && <p className="text-sm text-blue-300/60 mt-1">{subtitle}</p>}
```
With:
```tsx
<h3 className="text-lg font-semibold text-[#0a1628]">{title}</h3>
{subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
```

- [ ] **Step 3: AreaChart — axis strokes and tooltip**

Replace the entire AreaChart block:
```tsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colors[0]} stopOpacity={0.4} />
      <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
  <XAxis 
    dataKey={xAxisKey} 
    stroke="rgba(255,255,255,0.3)" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <YAxis 
    stroke="rgba(255,255,255,0.3)" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: "#0f2035",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    }}
    labelStyle={{ color: "#fff" }}
    itemStyle={{ color: colors[0] }}
  />
  <Area
    type="monotone"
    dataKey={dataKey}
    stroke={colors[0]}
    strokeWidth={2}
    fill="url(#colorGradient)"
  />
</AreaChart>
```
With:
```tsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={colors[0]} stopOpacity={0.2} />
      <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  <XAxis 
    dataKey={xAxisKey} 
    stroke="#94a3b8" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <YAxis 
    stroke="#94a3b8" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    }}
    labelStyle={{ color: "#0a1628" }}
    itemStyle={{ color: colors[0] }}
  />
  <Area
    type="monotone"
    dataKey={dataKey}
    stroke={colors[0]}
    strokeWidth={2}
    fill="url(#colorGradient)"
  />
</AreaChart>
```

- [ ] **Step 4: BarChart — axis strokes and tooltip**

Replace the entire BarChart block:
```tsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
  <XAxis 
    dataKey={xAxisKey} 
    stroke="rgba(255,255,255,0.3)" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <YAxis 
    stroke="rgba(255,255,255,0.3)" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: "#0f2035",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
    }}
    labelStyle={{ color: "#fff" }}
  />
  <Bar 
    dataKey={dataKey} 
    fill={colors[0]}
    radius={[4, 4, 0, 0]}
  />
</BarChart>
```
With:
```tsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  <XAxis 
    dataKey={xAxisKey} 
    stroke="#94a3b8" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <YAxis 
    stroke="#94a3b8" 
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
  <Tooltip
    contentStyle={{
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    }}
    labelStyle={{ color: "#0a1628" }}
  />
  <Bar 
    dataKey={dataKey} 
    fill={colors[0]}
    radius={[4, 4, 0, 0]}
  />
</BarChart>
```

- [ ] **Step 5: PieChart tooltip**

Replace:
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "#0f2035",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
  }}
  labelStyle={{ color: "#fff" }}
/>
```
With:
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  }}
  labelStyle={{ color: "#0a1628" }}
/>
```

- [ ] **Step 6: Pie legend text**

Replace:
```tsx
<span className="text-sm text-blue-200/70">{String(item[xAxisKey])}</span>
```
With:
```tsx
<span className="text-sm text-slate-600">{String(item[xAxisKey])}</span>
```

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/chart-card.tsx
git commit -m "style: flip ChartCard to white card with light-mode chart axes"
```

---

### Task 5: Fix DataTable component

**Files:**
- Modify: `src/components/dashboard/data-table.tsx`

- [ ] **Step 1: Container**

Replace:
```tsx
className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
```
With:
```tsx
className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
```

- [ ] **Step 2: Title section border and text**

Replace:
```tsx
<div className="px-6 py-4 border-b border-white/10">
  <h3 className="text-lg font-semibold text-white">{title}</h3>
</div>
```
With:
```tsx
<div className="px-6 py-4 border-b border-slate-200">
  <h3 className="text-lg font-semibold text-[#0a1628]">{title}</h3>
</div>
```

- [ ] **Step 3: Table header row border and text**

Replace:
```tsx
<tr className="border-b border-white/10">
```
With:
```tsx
<tr className="border-b border-slate-200">
```

Replace (both occurrences of column header `th`):
```tsx
className="px-6 py-4 text-left text-xs font-semibold text-blue-300/70 uppercase tracking-wider"
```
With:
```tsx
className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
```

- [ ] **Step 4: Table body divider and row hover**

Replace:
```tsx
<tbody className="divide-y divide-white/5">
```
With:
```tsx
<tbody className="divide-y divide-slate-100">
```

Replace:
```tsx
className="hover:bg-white/5 transition-colors group"
```
With:
```tsx
className="hover:bg-slate-50 transition-colors group"
```

- [ ] **Step 5: Cell text**

Replace:
```tsx
className="px-6 py-4 text-sm text-white/80"
```
With:
```tsx
className="px-6 py-4 text-sm text-slate-700"
```

- [ ] **Step 6: Actions menu button**

Replace:
```tsx
className="p-2 rounded-lg hover:bg-white/10 text-blue-300/60 hover:text-white transition-colors"
```
With:
```tsx
className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
```

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/data-table.tsx
git commit -m "style: flip DataTable to white card with light-mode text and borders"
```

---

### Task 6: Replace dark page wrappers in all route files

The outer `<div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">` must become `<div className="min-h-screen bg-slate-50">` in all 17 route files.

**Files affected:**
`src/routes/superadmin/index.tsx`, `churches.tsx`, `users.tsx`, `reports.tsx`, `statistics.tsx`
`src/routes/lead-pastor/index.tsx`, `churches.tsx`, `pastors.tsx`, `services.tsx`, `statistics.tsx`
`src/routes/pastor/index.tsx`, `assistants.tsx`, `attendance.tsx`, `reports.tsx`, `statistics.tsx`
`src/routes/assistant/index.tsx`, `reports.tsx`

- [ ] **Step 1: Batch-replace outer wrapper**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
find src/routes -name "*.tsx" | xargs sed -i '' \
  's/min-h-screen bg-gradient-to-br from-\[#0a1628\] via-\[#0f2035\] to-\[#0a1628\]/min-h-screen bg-slate-50/g'
```

- [ ] **Step 2: Verify — check no old pattern remains**

```bash
grep -r "from-\[#0a1628\] via-\[#0f2035\]" src/routes/
```
Expected: no output (empty).

- [ ] **Step 3: Commit**

```bash
git add src/routes/
git commit -m "style: replace all dark page wrappers with slate-50 background"
```

---

### Task 7: Replace inline glass cards in route files

Glass card pattern `bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10` becomes invisible on the new white/slate background. Replace with white cards.

**Note:** Dark modals (`bg-gradient-to-br from-[#0f2035] to-[#0a1628]`) are NOT touched — they stay dark and look great as overlays on the white page.

- [ ] **Step 1: Batch-replace glass card background**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
find src/routes -name "*.tsx" | xargs sed -i '' \
  's/bg-gradient-to-br from-white\/\[0\.08\] to-white\/\[0\.03\] border border-white\/10/bg-white border border-slate-200 shadow-sm/g'
```

- [ ] **Step 2: Verify — check no glass card remains**

```bash
grep -r "from-white/\[0.08\]" src/routes/
```
Expected: no output.

- [ ] **Step 3: Replace muted blue text (card labels/subtitles) across all routes**

These patterns are card-specific label colors — not used inside dark modals:

```bash
find src/routes -name "*.tsx" | xargs sed -i '' \
  's/text-blue-200\/60/text-slate-500/g; s/text-blue-300\/60/text-slate-500/g; s/text-blue-200\/70/text-slate-500/g; s/text-blue-300\/70/text-slate-400/g; s/text-blue-300\/40/text-slate-400/g; s/text-blue-200\/80/text-slate-600/g'
```

- [ ] **Step 4: Fix inline section borders**

```bash
find src/routes -name "*.tsx" | xargs sed -i '' \
  's/border-white\/10/border-slate-200/g; s/border-white\/5/border-slate-100/g; s/divide-white\/5/divide-slate-100/g'
```

**⚠ Important:** After this step, verify that dark modal borders didn't break. Dark modals use `bg-gradient-to-br from-[#0f2035]` — their `border-white/10` becomes `border-slate-200`, which is fine visually (light border on dark bg still shows slightly, not critical).

- [ ] **Step 5: Fix hover states in route inline content**

```bash
find src/routes -name "*.tsx" | xargs sed -i '' \
  's/hover:bg-white\/5/hover:bg-slate-50/g; s/hover:bg-white\/10/hover:bg-slate-100/g'
```

- [ ] **Step 6: Fix text-white inside converted inline cards in superadmin/index.tsx**

In `src/routes/superadmin/index.tsx`, fix the Recent Activity section (the only inline section with text-white):

Replace:
```tsx
className="mt-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
```
(already replaced by step 1 sed — just the text inside needs fixing)

Replace:
```tsx
<h3 className="text-lg font-semibold text-white mb-4">{t('superadminDashboard.recentActivity')}</h3>
```
With:
```tsx
<h3 className="text-lg font-semibold text-[#0a1628] mb-4">{t('superadminDashboard.recentActivity')}</h3>
```

Replace:
```tsx
<p className="text-sm font-medium text-white">{activity.action}</p>
```
With:
```tsx
<p className="text-sm font-medium text-[#0a1628]">{activity.action}</p>
```

Also fix the outline Quick Action buttons (dark styles don't work on white bg):

Replace:
```tsx
<Button variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
  <Filter className="w-4 h-4" />
  {t('superadminDashboard.filter')}
</Button>
<Button variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
  <Download className="w-4 h-4" />
  {t('superadminDashboard.export')}
</Button>
```
With:
```tsx
<Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
  <Filter className="w-4 h-4" />
  {t('superadminDashboard.filter')}
</Button>
<Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
  <Download className="w-4 h-4" />
  {t('superadminDashboard.export')}
</Button>
```

- [ ] **Step 7: Fix text-white in remaining route inline cards**

Search for remaining text-white instances that are inside converted white cards (not modals) across all route files:

```bash
grep -n "text-white" src/routes/superadmin/*.tsx src/routes/lead-pastor/*.tsx src/routes/pastor/*.tsx src/routes/assistant/*.tsx
```

For each result that is inside a `bg-white` card section (not inside `from-[#0f2035]` modals), change `text-white` to `text-[#0a1628]`. Dark modal text-white is fine as-is.

Key distinction:
- `text-white` inside `bg-gradient-to-br from-[#0f2035]...` → **leave as-is** (dark modal)
- `text-white` inside `bg-white` or section headings on the page → **change to `text-[#0a1628]`**

- [ ] **Step 8: Commit**

```bash
git add src/routes/
git commit -m "style: replace glass cards with white cards, fix text colors in route files"
```

---

### Task 8: Verify in browser

- [ ] **Step 1: Start dev server**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
pnpm dev
```

- [ ] **Step 2: Check these pages visually**

- `/` — Login page: should look **unchanged** (dark navy gradient)
- `/superadmin` — Dashboard: sidebar dark navy, header white, content on slate-50, stat cards white
- Any sub-page (`/superadmin/churches`, etc.) — same layout treatment

- [ ] **Step 3: Check for any remaining invisible text**

If any text is invisible (white on white), find it in the grep output from Task 7 Step 7 and change it to `text-[#0a1628]`.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "style: complete dark-sidebar + white-content theme migration"
```
