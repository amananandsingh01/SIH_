import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import {
  Shield, AlertTriangle, Activity, Search, Database, TrendingUp, Zap,
  Check, X, ChevronDown, ChevronRight, Radio, Server, Wifi, Monitor,
  RefreshCw, Filter, Clock, Eye, EyeOff, Layers, Crosshair,
  Link2, Settings, WifiOff, Plug, Sun, Moon
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ── Dark theme (default) ── */
:root, [data-theme="dark"] {
  --ink-0: #060810;
  --ink-1: #0D1117;
  --ink-2: #161B22;
  --ink-3: #21262D;
  --ink-4: #2D333B;
  --hairline: #30363D;
  --hairline-soft: #21262D;
  --text-hi: #F0F6FC;
  --text-mid: #8B949E;
  --text-lo: #484F58;
  --signal: #58A6FF;
  --signal-dim: #1F3A5F;
  --signal-glow: rgba(88,166,255,0.12);
  --baseline: #3FB950;
  --baseline-dim: #0D2516;
  --tier-green: #3FB950;
  --tier-green-bg: #0D2516;
  --tier-green-glow: rgba(63,185,80,0.08);
  --tier-amber: #D29922;
  --tier-amber-bg: #272115;
  --tier-amber-glow: rgba(210,153,34,0.08);
  --tier-red: #F85149;
  --tier-red-bg: #2D1117;
  --tier-red-glow: rgba(248,81,73,0.08);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);
  --topbar-bg: rgba(6,8,16,0.85);
}

/* ── Light theme ── */
[data-theme="light"] {
  --ink-0: #F6F8FA;
  --ink-1: #FFFFFF;
  --ink-2: #F0F2F5;
  --ink-3: #E4E8EE;
  --ink-4: #D5DAE3;
  --hairline: #D0D7DE;
  --hairline-soft: #E4E8EE;
  --text-hi: #0D1117;
  --text-mid: #4B5563;
  --text-lo: #9CA3AF;
  --signal: #0969DA;
  --signal-dim: #DDF4FF;
  --signal-glow: rgba(9,105,218,0.08);
  --baseline: #1A7F37;
  --baseline-dim: #DCFFE4;
  --tier-green: #1A7F37;
  --tier-green-bg: #DCFFE4;
  --tier-green-glow: rgba(26,127,55,0.06);
  --tier-amber: #9A6700;
  --tier-amber-bg: #FFF8C5;
  --tier-amber-glow: rgba(154,103,0,0.06);
  --tier-red: #CF222E;
  --tier-red-bg: #FFEBE9;
  --tier-red-glow: rgba(207,34,46,0.06);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
  --topbar-bg: rgba(246,248,250,0.9);
}

/* ── Fonts ── */
:root {
  --font-display: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
}

.ng-root * { box-sizing: border-box; }
.ng-root {
  font-family: var(--font-body);
  background: var(--ink-0);
  color: var(--text-hi);
  min-height: 100vh;
  display: flex;
  position: relative;
  isolation: isolate;
  transition: background 0.2s ease, color 0.2s ease;
}
.ng-root ::selection { background: var(--signal-dim); color: var(--text-hi); }
.ng-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.ng-display { font-family: var(--font-display); letter-spacing: -0.02em; }

/* ── Sidebar ── */
.ng-sidebar {
  width: 228px;
  flex: 0 0 auto;
  background: var(--ink-1);
  border-right: 1px solid var(--hairline-soft);
  display: flex;
  flex-direction: column;
  padding: 18px 12px;
  gap: 2px;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: background 0.2s ease;
}

/* ── Brand / Logo ── */
.ng-brand {
  display: flex; align-items: center; gap: 11px;
  padding: 6px 8px 20px 8px;
  border-bottom: 1px solid var(--hairline-soft);
  margin-bottom: 12px;
}
.ng-brand-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(145deg, #1565C0 0%, #0D47A1 50%, #0A2472 100%);
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  box-shadow: 0 0 0 1px rgba(88,166,255,0.2), var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.ng-brand-mark::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  border-radius: inherit;
}
.ng-brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.ng-brand-name {
  font-family: var(--font-display); font-size: 15px; font-weight: 700;
  letter-spacing: -0.02em; color: var(--text-hi);
}
.ng-brand-sub {
  font-size: 10px; color: var(--text-lo); letter-spacing: 0.06em;
  text-transform: uppercase; font-weight: 500; margin-top: 1px;
}

/* ── Nav items ── */
.ng-navitem {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px;
  font-size: 13px; font-weight: 500; color: var(--text-mid); cursor: pointer;
  border: none; transition: all 0.12s ease;
  background: transparent; width: 100%; text-align: left;
  position: relative;
}
.ng-navitem:hover { background: var(--ink-2); color: var(--text-hi); }
.ng-navitem.active {
  background: var(--signal-glow);
  color: var(--signal);
  font-weight: 600;
}
.ng-navitem.active::before {
  content: '';
  position: absolute; left: 0; top: 25%; bottom: 25%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: var(--signal);
  margin-left: -12px;
}
.ng-navitem .ng-navcount {
  margin-left: auto; font-family: var(--font-mono); font-size: 10.5px;
  color: var(--tier-red); background: var(--tier-red-bg);
  border-radius: 5px; padding: 1px 6px; font-weight: 600;
}

.ng-sidebar-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid var(--hairline-soft); }
.ng-pulse-row { display: flex; align-items: center; gap: 8px; padding: 8px; font-size: 11px; color: var(--text-lo); }
.ng-pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--tier-green); flex: 0 0 auto; }
.ng-pulse-dot.sim { background: var(--tier-amber); animation: pulse-amber 1.5s infinite; }
.ng-pulse-dot.live { background: var(--signal); animation: pulse-blue 1.5s infinite; }
.ng-pulse-dot.off { background: var(--text-lo); }
@keyframes pulse-amber { 0%,100%{box-shadow:0 0 0 0 rgba(210,153,34,0.4)} 50%{box-shadow:0 0 0 5px rgba(210,153,34,0)} }
@keyframes pulse-blue  { 0%,100%{box-shadow:0 0 0 0 rgba(88,166,255,0.4)}  50%{box-shadow:0 0 0 5px rgba(88,166,255,0)}  }

.ng-conn-panel { padding: 8px; display: flex; flex-direction: column; gap: 7px; }
.ng-conn-label { font-size: 10px; color: var(--text-lo); text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px; font-weight: 600; }
.ng-conn-input-row { display: flex; gap: 6px; }
.ng-conn-input {
  flex: 1 1 auto; min-width: 0; background: var(--ink-0); border: 1px solid var(--hairline);
  color: var(--text-hi); font-family: var(--font-mono); font-size: 10.5px; border-radius: 6px;
  padding: 6px 8px; outline: none; transition: border-color 0.12s;
}
.ng-conn-input:focus { border-color: var(--signal); box-shadow: 0 0 0 3px var(--signal-glow); }
.ng-conn-go {
  flex: 0 0 auto; background: var(--ink-2); border: 1px solid var(--hairline); border-radius: 6px;
  color: var(--text-mid); width: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.12s;
}
.ng-conn-go:hover { border-color: var(--signal); color: var(--signal); }
.ng-conn-err { font-size: 10px; color: var(--tier-red); line-height: 1.4; }

/* ── Main column ── */
.ng-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.ng-topbar {
  position: sticky; top: 0; z-index: 5;
  background: var(--topbar-bg); backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--hairline-soft);
  padding: 14px 28px;
  transition: background 0.2s ease;
}
.ng-topbar-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.ng-page-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
.ng-page-sub { font-size: 12px; color: var(--text-lo); margin-top: 2px; font-weight: 400; }

/* ── Buttons ── */
.ng-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-body); font-size: 12.5px; font-weight: 500;
  padding: 7px 13px; border-radius: 7px; cursor: pointer;
  border: 1px solid var(--hairline); background: var(--ink-2); color: var(--text-hi);
  transition: all 0.12s ease; white-space: nowrap;
}
.ng-btn:hover { border-color: var(--signal); background: var(--ink-3); box-shadow: 0 0 0 3px var(--signal-glow); }
.ng-btn:active { transform: scale(0.97); }
.ng-btn-primary {
  background: var(--signal); border-color: var(--signal); color: #fff; font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.ng-btn-primary:hover { filter: brightness(1.1); border-color: var(--signal); }
.ng-btn-ghost { background: transparent; border-color: var(--hairline); }
.ng-btn-ghost:hover { background: var(--ink-2); }
.ng-btn-sm { padding: 5px 10px; font-size: 11.5px; border-radius: 6px; }
.ng-btn-confirm { border-color: rgba(248,81,73,0.3); color: var(--tier-red); background: var(--tier-red-bg); }
.ng-btn-confirm:hover { border-color: var(--tier-red); box-shadow: 0 0 0 3px var(--tier-red-glow); }
.ng-btn-dismiss { border-color: var(--hairline); color: var(--text-mid); }
.ng-btn-dismiss:hover { border-color: var(--hairline); color: var(--text-hi); background: var(--ink-3); }

/* ── Theme toggle ── */
.ng-theme-toggle {
  width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
  border: 1px solid var(--hairline); background: var(--ink-2); color: var(--text-mid);
  display: flex; align-items: center; justify-content: center; transition: all 0.12s;
  flex: 0 0 auto;
}
.ng-theme-toggle:hover { border-color: var(--signal); color: var(--signal); background: var(--signal-glow); }

.ng-content { padding: 22px 28px 60px 28px; flex: 1 1 auto; }

/* ── Stat strip ── */
.ng-stats { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-bottom: 24px; }
.ng-stat {
  background: var(--ink-1); border: 1px solid var(--hairline-soft); border-radius: 12px;
  padding: 16px 18px; box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s, border-color 0.15s;
  position: relative; overflow: hidden;
}
.ng-stat::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--signal) 0%, transparent 100%);
  opacity: 0.6;
}
.ng-stat-label { font-size: 10.5px; color: var(--text-lo); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; font-weight: 600; }
.ng-stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
.ng-stat-value.green { color: var(--tier-green); }
.ng-stat-value.amber { color: var(--tier-amber); }
.ng-stat-value.red { color: var(--tier-red); }

/* ── Filter bar ── */
.ng-filterbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.ng-chip {
  font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 999px; cursor: pointer;
  border: 1px solid var(--hairline); color: var(--text-mid); background: var(--ink-1);
  display: inline-flex; align-items: center; gap: 6px; transition: all 0.12s;
}
.ng-chip:hover { border-color: var(--signal); color: var(--text-hi); }
.ng-chip.active { border-color: var(--signal); color: var(--signal); background: var(--signal-glow); font-weight: 600; }
.ng-search {
  display: flex; align-items: center; gap: 7px;
  border: 1px solid var(--hairline); background: var(--ink-1); border-radius: 8px;
  padding: 7px 11px; flex: 1 1 200px; max-width: 320px;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.ng-search:focus-within { border-color: var(--signal); box-shadow: 0 0 0 3px var(--signal-glow); }
.ng-search input { background: transparent; border: none; outline: none; color: var(--text-hi); font-size: 13px; width: 100%; font-family: var(--font-body); }
.ng-search input::placeholder { color: var(--text-lo); }
.ng-select {
  border: 1px solid var(--hairline); background: var(--ink-1); color: var(--text-mid);
  border-radius: 8px; padding: 7px 10px; font-size: 12.5px; font-family: var(--font-body); outline: none;
  transition: border-color 0.12s;
}
.ng-select:focus { border-color: var(--signal); }

/* ── Alert cards ── */
.ng-alertgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
.ng-card {
  background: var(--ink-1); border: 1px solid var(--hairline-soft); border-radius: 12px;
  padding: 16px 17px; display: flex; flex-direction: column; gap: 12px;
  border-left: 3px solid var(--hairline);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
}
.ng-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.ng-card.tier-green { border-left-color: var(--tier-green); }
.ng-card.tier-green:hover { box-shadow: var(--shadow-md), 0 0 0 1px var(--tier-green-glow); }
.ng-card.tier-amber { border-left-color: var(--tier-amber); }
.ng-card.tier-amber:hover { box-shadow: var(--shadow-md), 0 0 0 1px var(--tier-amber-glow); }
.ng-card.tier-red { border-left-color: var(--tier-red); }
.ng-card.tier-red:hover { box-shadow: var(--shadow-md), 0 0 0 1px var(--tier-red-glow); }

.ng-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ng-entity-id { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text-hi); }
.ng-entity-type { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-lo); margin-top: 3px; font-weight: 500; }

.ng-risk-badge {
  font-family: var(--font-mono); font-size: 12.5px; font-weight: 700;
  padding: 3px 9px; border-radius: 6px; flex: 0 0 auto; letter-spacing: 0.02em;
}
.ng-risk-badge.tier-green { color: var(--tier-green); background: var(--tier-green-bg); }
.ng-risk-badge.tier-amber { color: var(--tier-amber); background: var(--tier-amber-bg); }
.ng-risk-badge.tier-red { color: var(--tier-red); background: var(--tier-red-bg); }

.ng-threat-row { display: flex; align-items: center; gap: 8px; }
.ng-threat-tag {
  font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 3px 8px; border-radius: 5px; background: var(--ink-3); color: var(--text-mid);
}
.ng-incident-count { font-size: 11px; color: var(--text-lo); font-family: var(--font-mono); }

.ng-detect-source { font-size: 12px; color: var(--text-mid); display: flex; align-items: center; gap: 6px; font-weight: 500; }
.ng-score-bars { display: flex; flex-direction: column; gap: 6px; }
.ng-score-bar-row { display: flex; align-items: center; gap: 8px; }
.ng-score-bar-label { font-size: 10px; color: var(--text-lo); width: 52px; flex: 0 0 auto; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; }
.ng-score-bar-track { flex: 1 1 auto; height: 4px; background: var(--ink-3); border-radius: 4px; overflow: hidden; }
.ng-score-bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }

.ng-card-actions { display: flex; gap: 8px; margin-top: 2px; }
.ng-card-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-lo); }
.ng-status-pill {
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  padding: 2px 7px; border-radius: 5px; border: 1px solid var(--hairline);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.ng-status-pill.confirmed { color: var(--tier-red); border-color: var(--tier-red-bg); background: var(--tier-red-bg); }
.ng-status-pill.false_positive { color: var(--text-lo); }
.ng-status-pill.open { color: var(--signal); border-color: var(--signal-dim); }
.ng-status-pill.secure { color: var(--tier-green); border-color: var(--tier-green-bg); background: var(--tier-green-bg); }

.ng-expand-btn { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--signal); cursor: pointer; user-select: none; font-weight: 500; }
.ng-expand-btn:hover { opacity: 0.8; }
.ng-detail-panel { border-top: 1px solid var(--hairline-soft); padding-top: 10px; margin-top: 2px; }

.ng-empty { text-align: center; padding: 60px 20px; color: var(--text-lo); }
.ng-empty svg { margin-bottom: 12px; opacity: 0.35; }

/* ── Telemetry table ── */
.ng-table-wrap { border: 1px solid var(--hairline-soft); border-radius: 12px; overflow: hidden; background: var(--ink-1); box-shadow: var(--shadow-sm); }
.ng-table-scroll { overflow-x: auto; }
table.ng-table { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 780px; }
table.ng-table th {
  text-align: left; font-weight: 600; color: var(--text-lo); text-transform: uppercase;
  letter-spacing: 0.05em; font-size: 10px; padding: 10px 16px; border-bottom: 1px solid var(--hairline-soft);
  background: var(--ink-2); position: sticky; top: 0;
}
table.ng-table td { padding: 10px 16px; border-bottom: 1px solid var(--hairline-soft); font-family: var(--font-mono); color: var(--text-mid); font-size: 12px; }
table.ng-table tr:last-child td { border-bottom: none; }
table.ng-table tr:hover td { background: var(--ink-2); color: var(--text-hi); }
.ng-flag-fail { color: var(--tier-red) !important; }

/* ── Baseline viewer ── */
.ng-entity-picker { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.ng-entity-chip {
  display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 10px;
  border: 1px solid var(--hairline); background: var(--ink-1); cursor: pointer; font-size: 12.5px;
  transition: all 0.12s; font-weight: 500;
}
.ng-entity-chip:hover { border-color: var(--signal); }
.ng-entity-chip.active { border-color: var(--signal); background: var(--signal-glow); color: var(--signal); }
.ng-entity-chip .ng-mono { color: var(--text-hi); }

.ng-two-col { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.6fr); gap: 16px; }
.ng-panel { background: var(--ink-1); border: 1px solid var(--hairline-soft); border-radius: 12px; padding: 18px; box-shadow: var(--shadow-sm); }
.ng-panel-title { font-size: 10.5px; color: var(--text-lo); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 14px; font-weight: 700; }
.ng-kv-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--hairline-soft); font-size: 13px; }
.ng-kv-row:last-child { border-bottom: none; }
.ng-kv-row span:first-child { color: var(--text-lo); font-weight: 500; }
.ng-kv-row span:last-child { font-family: var(--font-mono); color: var(--text-hi); font-size: 12px; }

.ng-legend { display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap; }
.ng-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-lo); font-weight: 500; }
.ng-legend-swatch { width: 10px; height: 10px; border-radius: 3px; }

/* ── Toast ── */
.ng-toast-wrap { position: fixed; bottom: 20px; right: 20px; z-index: 40; display: flex; flex-direction: column; gap: 8px; }
.ng-toast {
  background: var(--ink-2); border: 1px solid var(--hairline); border-radius: 10px;
  padding: 11px 15px; font-size: 12.5px; color: var(--text-hi); display: flex; align-items: center; gap: 9px;
  box-shadow: var(--shadow-md); min-width: 220px; max-width: 360px; font-weight: 500;
  animation: ng-toast-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes ng-toast-in { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* ── Bottom nav (mobile) ── */
.ng-bottomnav { display: none; }

/* ── Scrollbars ── */
.ng-root ::-webkit-scrollbar { height: 6px; width: 6px; }
.ng-root ::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 4px; }
.ng-root ::-webkit-scrollbar-track { background: transparent; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ng-two-col { grid-template-columns: 1fr; }
  .ng-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 720px) {
  .ng-sidebar { display: none; }
  .ng-content { padding: 16px 14px 84px 14px; }
  .ng-topbar { padding: 14px 14px; }
  .ng-stats { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
  .ng-alertgrid { grid-template-columns: 1fr; }
  .ng-bottomnav {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 30;
    background: var(--ink-1); border-top: 1px solid var(--hairline-soft);
    padding: 8px 6px calc(8px + env(safe-area-inset-bottom, 0px)) 6px; justify-content: space-around;
  }
  .ng-bottomnav button {
    background: none; border: none; color: var(--text-lo); display: flex; flex-direction: column;
    align-items: center; gap: 3px; font-size: 9.5px; padding: 5px 8px; border-radius: 8px;
  }
  .ng-bottomnav button.active { color: var(--signal); }
}
`;

/* ============================== CONSTANTS ============================== */
const RESTRICTED_PORTS = [22, 23, 3389, 445, 1433, 3306];
const INTERNAL_PORTS = [80, 443, 8080, 8443, 21, 53];

const ENTITY_ICON = { lab_pc: Monitor, wifi_client: Wifi, admin_server: Server };

const TIER = (pct) => (pct >= 75 ? "red" : pct >= 40 ? "amber" : "green");
const TIER_LABEL = { green: "Secure", amber: "Elevated risk", red: "Critical alert" };
const TIER_COLOR = { green: "var(--tier-green)", amber: "var(--tier-amber)", red: "var(--tier-red)" };

const THREAT_LABEL = {
  exfiltration: "Data exfiltration",
  brute_force: "Brute-force login",
  lateral_move: "Lateral movement",
  anomaly: "Behavioral anomaly",
};

/* ============================== SEED / SIM ENGINE ============================== */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);

const ENTITIES = [
  { entity_id: "lab_pc_014", entity_type: "lab_pc", mu_bytes: 5_000_000, sigma_bytes: 1_100_000 },
  { entity_id: "lab_pc_027", entity_type: "lab_pc", mu_bytes: 4_400_000, sigma_bytes: 900_000 },
  { entity_id: "stu_1023", entity_type: "wifi_client", mu_bytes: 2_000_000, sigma_bytes: 480_000 },
  { entity_id: "wifi_0552", entity_type: "wifi_client", mu_bytes: 1_750_000, sigma_bytes: 420_000 },
  { entity_id: "adm_srv_02", entity_type: "admin_server", mu_bytes: 48_000_000, sigma_bytes: 7_500_000 },
];

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function hourUTC(iso) { return new Date(iso).getUTCHours(); }

function computeFeatures(ev) {
  const hour = hourUTC(ev.timestamp_utc);
  const time_bucket = hour >= 0 && hour < 5 ? 1 : 0;
  const effective_logins = Math.max(0, ev.raw_login_failures - 3);
  const total = ev.bytes_up + ev.bytes_down;
  const upload_ratio = total > 0 ? ev.bytes_up / total : 0;
  let port_risk_level = 0;
  if (RESTRICTED_PORTS.includes(ev.dest_port)) port_risk_level = 2;
  else if (INTERNAL_PORTS.includes(ev.dest_port)) port_risk_level = 1;
  return { time_bucket, effective_logins, upload_ratio, port_risk_level };
}

function scoreEvent(ev, baseline) {
  const f = computeFeatures(ev);
  let ml = 0;
  ml += f.time_bucket * 0.22;
  ml += Math.min(f.effective_logins / 18, 1) * 0.42;
  ml += Math.max(0, f.upload_ratio - 0.55) * 1.1;
  ml += f.port_risk_level * 0.14;
  const s_ml_norm = Math.min(1, Math.max(0, ml));

  const z = baseline.sigma_bytes > 0 ? (ev.bytes_up - baseline.mu_bytes) / baseline.sigma_bytes : 0;
  const s_stat_norm = sigmoid(z - 2.3);

  // Rule fires for: restricted port on non-admin, OR massive external upload (exfiltration rule)
  const isExternalDest = !ev.dest_ip?.startsWith("10.") && !ev.dest_ip?.startsWith("192.168.");
  const exfilRule = isExternalDest && ev.bytes_up > baseline.mu_bytes * 3;
  const rule_override_flag = (f.port_risk_level === 2 && ev.entity_type !== "admin_server") || exfilRule ? 1 : 0;

  let fused = 1 - (1 - s_ml_norm) * (1 - s_stat_norm);
  if (rule_override_flag) fused = Math.max(fused, 0.88); // rule floors risk at 88%
  const final_risk_pct = Math.round(fused * 1000) / 10;

  let threat_classification = "anomaly";
  if (f.effective_logins >= 5) threat_classification = "brute_force";
  else if (exfilRule) threat_classification = "exfiltration";
  else if (rule_override_flag) threat_classification = "lateral_move";
  else if (f.upload_ratio > 0.72 && z > 2) threat_classification = "exfiltration";

  return { s_ml_norm, s_stat_norm, rule_override_flag, final_risk_pct, threat_classification, z };
}

function isoMinusMinutes(base, mins) {
  return new Date(base.getTime() - mins * 60000).toISOString();
}

function genBaselineTelemetry(entity, base, count) {
  const rows = [];
  for (let i = count; i >= 0; i--) {
    const jitter = (rand() - 0.5) * 2 * entity.sigma_bytes * 0.6;
    const bytes_up = Math.max(50000, Math.round(entity.mu_bytes + jitter));
    const bytes_down = Math.round(bytes_up * (0.3 + rand() * 0.4));
    rows.push({
      timestamp_utc: isoMinusMinutes(base, i * 27),
      entity_id: entity.entity_id,
      entity_type: entity.entity_type,
      src_ip: `10.0.${entity.entity_type === "admin_server" ? 9 : 4}.${10 + (i % 40)}`,
      dest_ip: `10.0.9.${100 + (i % 50)}`,
      dest_port: [80, 443, 443, 8080][i % 4],
      bytes_up, bytes_down,
      raw_login_failures: rand() < 0.05 ? Math.round(rand() * 3) : 0,
      login_status: "success",
    });
  }
  return rows;
}

function seedData() {
  const now = new Date();
  let telemetry = [];
  let alerts = [];
  let alertSeq = 1;

  ENTITIES.forEach((ent) => {
    telemetry = telemetry.concat(genBaselineTelemetry(ent, now, 34));
  });

  // seed a handful of historical incidents woven into the timeline
  const incidents = [
    { entity_id: "lab_pc_014", minsAgo: 210, kind: "exfil" },
    { entity_id: "stu_1023", minsAgo: 640, kind: "brute" },
    { entity_id: "wifi_0552", minsAgo: 95, kind: "restricted" },
    { entity_id: "adm_srv_02", minsAgo: 1200, kind: "exfil" },
    { entity_id: "lab_pc_027", minsAgo: 40, kind: "brute" },
  ];

  incidents.forEach((inc) => {
    const ent = ENTITIES.find((e) => e.entity_id === inc.entity_id);
    const ts = isoMinusMinutes(now, inc.minsAgo);
    let evs = [];
    if (inc.kind === "exfil") {
      evs = [{
        timestamp_utc: ts, entity_id: ent.entity_id, entity_type: ent.entity_type,
        src_ip: "10.0.4.12", dest_ip: "198.51.100.44", dest_port: 443,
        bytes_up: Math.round(ent.mu_bytes * 9 + ent.sigma_bytes * 4), bytes_down: 8000,
        raw_login_failures: 0, login_status: "success",
      }];
    } else if (inc.kind === "restricted") {
      evs = [{
        timestamp_utc: ts, entity_id: ent.entity_id, entity_type: ent.entity_type,
        src_ip: "10.0.4.20", dest_ip: "10.0.1.5", dest_port: 3389,
        bytes_up: ent.mu_bytes, bytes_down: ent.mu_bytes * 0.4,
        raw_login_failures: 0, login_status: "success",
      }];
    } else if (inc.kind === "brute") {
      const n = 6 + Math.floor(rand() * 5);
      for (let i = 0; i < n; i++) {
        evs.push({
          timestamp_utc: isoMinusMinutes(new Date(ts), -i * 0.3), entity_id: ent.entity_id, entity_type: ent.entity_type,
          src_ip: "10.0.4.77", dest_ip: "10.0.1.2", dest_port: 22,
          bytes_up: 3000, bytes_down: 1200,
          raw_login_failures: 8 + Math.floor(rand() * 6), login_status: "fail",
        });
      }
    }
    evs.forEach((ev) => {
      telemetry.push(ev);
      const s = scoreEvent(ev, ent);
      if (s.final_risk_pct >= 40) {
        alerts.push({
          alert_id: alertSeq++,
          entity_id: ent.entity_id,
          entity_type: ent.entity_type,
          timestamp_utc: ev.timestamp_utc,
          final_risk_pct: s.final_risk_pct,
          threat_classification: s.threat_classification,
          status: rand() < 0.3 ? (rand() < 0.5 ? "acknowledged" : "false_positive") : "open",
          debug_scores: { s_ml: s.s_ml_norm, s_stat: s.s_stat_norm, rule_override: s.rule_override_flag },
        });
      }
    });
  });

  telemetry.sort((a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));
  alerts.sort((a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));

  const baselines = {};
  ENTITIES.forEach((e) => {
    baselines[e.entity_id] = { ...e, last_updated: isoMinusMinutes(now, 12) };
  });

  return { telemetry, alerts, baselines, alertSeq };
}

/* ============================== BACKEND API LAYER ==============================
   Matches the endpoints from the design doc:
   GET /alerts?status=open · GET /telemetry?entity_id=&limit= · GET /baselines/{entity_id}
   POST /alerts/{id}/status · POST /ingest · POST /model/retrain
================================================================================= */
function trimSlash(url) { return url.replace(/\/+$/, ""); }

async function fetchJSON(url, opts = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timer);
  }
}

function mapDebugScores(raw) {
  let d = raw;
  if (typeof d === "string") {
    try { d = JSON.parse(d); } catch { d = {}; }
  }
  d = d || {};
  return {
    s_ml: d.s_ml ?? d.s_ml_norm ?? 0,
    s_stat: d.s_stat ?? d.s_stat_norm ?? 0,
    rule_override: d.rule_override ?? d.rule_override_flag ?? 0,
  };
}
function mapAlertRow(r) {
  return {
    alert_id: r.alert_id,
    entity_id: r.entity_id,
    entity_type: r.entity_type || null,
    timestamp_utc: r.timestamp_utc,
    final_risk_pct: r.final_risk_pct,
    threat_classification: r.threat_classification,
    status: r.status || "open",
    debug_scores: mapDebugScores(r.debug_scores),
  };
}
function mapBaselineRow(r) {
  return {
    entity_id: r.entity_id,
    entity_type: r.entity_type,
    mu_bytes: r.mu_bytes,
    sigma_bytes: r.sigma_bytes,
    last_updated: r.last_updated,
  };
}

/* ============================== HELPERS ============================== */
function fmtBytes(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " MB";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + " KB";
  return n + " B";
}
function fmtRel(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function fmtClock(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function detectionSourceLabel(debug) {
  if (debug.rule_override) return "Flagged by static rule violation";
  if (debug.s_ml >= debug.s_stat) return "Flagged by ML structural anomaly";
  return "Flagged by statistical deviation (z-score)";
}
function groupAlerts(alerts) {
  const sorted = [...alerts].sort((a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));
  const used = new Set();
  const groups = [];
  for (const a of sorted) {
    if (used.has(a.alert_id)) continue;
    const group = [a];
    used.add(a.alert_id);
    for (const b of sorted) {
      if (used.has(b.alert_id)) continue;
      if (
        b.entity_id === a.entity_id &&
        b.threat_classification === a.threat_classification &&
        Math.abs(new Date(b.timestamp_utc) - new Date(a.timestamp_utc)) <= 5 * 60000
      ) {
        group.push(b);
        used.add(b.alert_id);
      }
    }
    groups.push(group);
  }
  return groups;
}


/* ============================== BASELINE CHART ============================== */
function BaselineChart({ entity, events, height = 220 }) {
  const data = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.timestamp_utc) - new Date(b.timestamp_utc));
    const low = Math.max(0, entity.mu_bytes - 2 * entity.sigma_bytes);
    const high = entity.mu_bytes + 2 * entity.sigma_bytes;
    return sorted.map((e) => ({
      label: fmtClock(e.timestamp_utc),
      bytes_up: e.bytes_up,
      low,
      bandWidth: high - low,
    }));
  }, [events, entity]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "var(--text-lo)", fontSize: 10.5 }} axisLine={{ stroke: "var(--hairline)" }} tickLine={false} minTickGap={30} />
        <YAxis tickFormatter={(v) => fmtBytes(v)} tick={{ fill: "var(--text-lo)", fontSize: 10.5 }} axisLine={false} tickLine={false} width={64} />
        <Tooltip
          contentStyle={{ background: "var(--ink-2)", border: "1px solid var(--hairline)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "var(--text-mid)" }}
          formatter={(v, name) => (name === "bytes_up" ? [fmtBytes(v), "Traffic"] : [null, null])}
        />
        <Area dataKey="low" stackId="band" stroke="none" fill="transparent" />
        <Area dataKey="bandWidth" stackId="band" stroke="none" fill="var(--baseline)" fillOpacity={0.14} />
        <ReferenceLine y={entity.mu_bytes} stroke="var(--baseline)" strokeDasharray="4 3" strokeWidth={1} />
        <Line type="monotone" dataKey="bytes_up" stroke="var(--tier-red)" strokeWidth={2} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ============================== ALERT CARD ============================== */
function AlertCard({ group, onConfirm, onDismiss, telemetryByEntity, baselines }) {
  const [expanded, setExpanded] = useState(false);
  const primary = group[0];
  const tier = TIER(Math.max(...group.map((g) => g.final_risk_pct)));
  const isGrouped = group.length > 1;
  const entity = baselines[primary.entity_id];
  const entityType = primary.entity_type || entity?.entity_type || "unknown";
  const Icon = ENTITY_ICON[entityType] || Monitor;
  const worst = group.reduce((m, g) => (g.final_risk_pct > m.final_risk_pct ? g : m), group[0]);
  const entEvents = (telemetryByEntity[primary.entity_id] || []).slice(0, 24);
  const actionable = primary.status === "open";

  return (
    <div className={`ng-card tier-${tier}`}>
      <div className="ng-card-top">
        <div>
          <div className="ng-entity-id">{primary.entity_id}</div>
          <div className="ng-entity-type"><Icon size={12} /> {entityType.replace("_", " ")}</div>
        </div>
        <div className={`ng-risk-badge tier-${tier}`}>{worst.final_risk_pct.toFixed(1)}%</div>
      </div>

      <div className="ng-threat-row">
        <span className="ng-threat-tag">{THREAT_LABEL[primary.threat_classification] || primary.threat_classification}</span>
        {isGrouped && <span className="ng-incident-count">grouped incident &middot; {group.length} events</span>}
      </div>

      <div className="ng-detect-source">
        <Crosshair size={13} style={{ color: TIER_COLOR[tier], flex: "0 0 auto" }} />
        {detectionSourceLabel(worst.debug_scores)}
      </div>

      <div className="ng-score-bars">
        <div className="ng-score-bar-row">
          <span className="ng-score-bar-label">ML score</span>
          <div className="ng-score-bar-track"><div className="ng-score-bar-fill" style={{ width: `${worst.debug_scores.s_ml * 100}%`, background: "var(--signal)" }} /></div>
        </div>
        <div className="ng-score-bar-row">
          <span className="ng-score-bar-label">Stat score</span>
          <div className="ng-score-bar-track"><div className="ng-score-bar-fill" style={{ width: `${worst.debug_scores.s_stat * 100}%`, background: "var(--baseline)" }} /></div>
        </div>
        {worst.debug_scores.rule_override === 1 && (
          <div className="ng-score-bar-row">
            <span className="ng-score-bar-label">Rule flag</span>
            <div className="ng-score-bar-track"><div className="ng-score-bar-fill" style={{ width: "100%", background: "var(--tier-red)" }} /></div>
          </div>
        )}
      </div>

      <div className="ng-card-meta">
        <span>{fmtRel(primary.timestamp_utc)} &middot; {fmtClock(primary.timestamp_utc)}</span>
        <span className={`ng-status-pill ${primary.status}`}>{primary.status.replace("_", " ")}</span>
      </div>

      <div className="ng-expand-btn" onClick={() => setExpanded((v) => !v)}>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {expanded ? "Hide baseline comparison" : "View baseline comparison"}
      </div>

      {expanded && entity && (
        <div className="ng-detail-panel">
          <BaselineChart entity={entity} events={entEvents} height={170} />
        </div>
      )}

      {actionable && (
        <div className="ng-card-actions">
          <button className="ng-btn ng-btn-sm ng-btn-dismiss" onClick={() => onDismiss(group)}>
            <X size={13} /> Dismiss (false positive)
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================== LIVE FEED VIEW ============================== */
function LiveFeedView({ alerts, telemetry, onConfirm, onDismiss, baselines }) {
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSecure, setShowSecure] = useState(true);

  const telemetryByEntity = useMemo(() => {
    const map = {};
    telemetry.forEach((t) => {
      if (!map[t.entity_id]) map[t.entity_id] = [];
      map[t.entity_id].push(t);
    });
    return map;
  }, [telemetry]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      // hide dismissed alerts unless the user explicitly filters for them
      if (a.status === "false_positive" && statusFilter !== "false_positive") return false;
      const tier = TIER(a.final_risk_pct);
      if (!showSecure && tier === "green") return false;
      if (tierFilter !== "all" && tier !== tierFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, tierFilter, statusFilter, showSecure]);

  const groups = useMemo(() => groupAlerts(filtered), [filtered]);

  return (
    <>
      <div className="ng-filterbar">
        {["all", "red", "amber", "green"].map((t) => (
          <button key={t} className={`ng-chip ${tierFilter === t ? "active" : ""}`} onClick={() => setTierFilter(t)}>
            {t !== "all" && <span className="ng-legend-swatch" style={{ background: TIER_COLOR[t] }} />}
            {t === "all" ? "All tiers" : TIER_LABEL[t]}
          </button>
        ))}
        <select className="ng-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="secure">Secure</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="confirmed">Confirmed</option>
          <option value="false_positive">False positive</option>
        </select>
        <button className="ng-chip" onClick={() => setShowSecure((v) => !v)} style={{ marginLeft: "auto" }}>
          {showSecure ? <Eye size={12} /> : <EyeOff size={12} />}
          {showSecure ? "Secure events visible" : "Secure events hidden"}
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="ng-empty">
          <Shield size={34} />
          <div>No alerts match this filter. The network is quiet.</div>
        </div>
      ) : (
        <div className="ng-alertgrid">
          {groups.map((g) => (
            <AlertCard
              key={g[0].alert_id}
              group={g}
              onConfirm={onConfirm}
              onDismiss={onDismiss}
              telemetryByEntity={telemetryByEntity}
              baselines={baselines}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ============================== TELEMETRY EXPLORER ============================== */
function TelemetryView({ telemetry }) {
  const [query, setQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const entityOptions = useMemo(
    () => Array.from(new Set(telemetry.map((t) => t.entity_id))).sort(),
    [telemetry]
  );

  const filtered = useMemo(() => {
    return telemetry.filter((t) => {
      if (entityFilter !== "all" && t.entity_id !== entityFilter) return false;
      if (query && !t.entity_id.toLowerCase().includes(query.toLowerCase()) && !t.dest_ip.includes(query)) return false;
      return true;
    }).slice(0, 200);
  }, [telemetry, query, entityFilter]);

  return (
    <>
      <div className="ng-filterbar">
        <div className="ng-search">
          <Search size={14} color="var(--text-lo)" />
          <input placeholder="Search entity ID or destination IP" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="ng-select" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
          <option value="all">All entities</option>
          {entityOptions.map((id) => <option key={id} value={id}>{id}</option>)}
        </select>
        <span style={{ fontSize: 11.5, color: "var(--text-lo)", marginLeft: "auto" }}>{filtered.length} rows</span>
      </div>
      <div className="ng-table-wrap">
        <div className="ng-table-scroll">
          <table className="ng-table">
            <thead>
              <tr>
                <th>Time</th><th>Entity</th><th>Type</th><th>Src IP</th><th>Dest IP</th>
                <th>Port</th><th>Up</th><th>Down</th><th>Login fails</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i}>
                  <td>{fmtClock(t.timestamp_utc)}</td>
                  <td>{t.entity_id}</td>
                  <td>{t.entity_type}</td>
                  <td>{t.src_ip}</td>
                  <td>{t.dest_ip}</td>
                  <td className={RESTRICTED_PORTS.includes(t.dest_port) ? "ng-flag-fail" : ""}>{t.dest_port}</td>
                  <td>{fmtBytes(t.bytes_up)}</td>
                  <td>{fmtBytes(t.bytes_down)}</td>
                  <td className={t.raw_login_failures >= 5 ? "ng-flag-fail" : ""}>{t.raw_login_failures}</td>
                  <td className={t.login_status === "fail" ? "ng-flag-fail" : ""}>{t.login_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ============================== BASELINE VIEWER ============================== */
function BaselinesView({ baselines, telemetry }) {
  const entityList = useMemo(() => Object.values(baselines), [baselines]);
  const [selected, setSelected] = useState(entityList[0]?.entity_id);
  useEffect(() => {
    if (!baselines[selected] && entityList.length) setSelected(entityList[0].entity_id);
  }, [baselines, entityList, selected]);

  const entity = baselines[selected];
  const events = useMemo(
    () => telemetry.filter((t) => t.entity_id === selected).slice(0, 30),
    [telemetry, selected]
  );
  const latest = events[0];
  if (!entity) {
    return <div className="ng-empty"><Database size={30} /><div>No baseline data yet.</div></div>;
  }
  const z = latest && entity.sigma_bytes > 0 ? (latest.bytes_up - entity.mu_bytes) / entity.sigma_bytes : 0;

  return (
    <>
      <div className="ng-entity-picker">
        {entityList.map((e) => {
          const Icon = ENTITY_ICON[e.entity_type] || Monitor;
          return (
            <div key={e.entity_id} className={`ng-entity-chip ${selected === e.entity_id ? "active" : ""}`} onClick={() => setSelected(e.entity_id)}>
              <Icon size={14} color="var(--text-mid)" />
              <span className="ng-mono">{e.entity_id}</span>
            </div>
          );
        })}
      </div>
      <div className="ng-two-col">
        <div className="ng-panel">
          <div className="ng-panel-title">Learned baseline</div>
          <div className="ng-kv-row"><span>Entity type</span><span>{entity.entity_type}</span></div>
          <div className="ng-kv-row"><span>Mean (&mu;)</span><span>{fmtBytes(entity.mu_bytes)}</span></div>
          <div className="ng-kv-row"><span>Std dev (&sigma;)</span><span>{fmtBytes(entity.sigma_bytes)}</span></div>
          <div className="ng-kv-row"><span>Last updated</span><span>{fmtRel(entity.last_updated)}</span></div>
          <div className="ng-kv-row"><span>Latest reading</span><span>{latest ? fmtBytes(latest.bytes_up) : "—"}</span></div>
          <div className="ng-kv-row"><span>Current z-score</span><span style={{ color: Math.abs(z) > 2 ? "var(--tier-red)" : "var(--text-hi)" }}>{z.toFixed(2)}&sigma;</span></div>
        </div>
        <div className="ng-panel">
          <div className="ng-panel-title">Recent traffic vs. baseline band</div>
          <BaselineChart entity={entity} events={events} height={230} />
          <div className="ng-legend">
            <div className="ng-legend-item"><span className="ng-legend-swatch" style={{ background: "var(--baseline)" }} />&mu; &plusmn; 2&sigma; band</div>
            <div className="ng-legend-item"><span className="ng-legend-swatch" style={{ background: "var(--tier-red)" }} />Observed traffic</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== TRENDS VIEW ============================== */
function TrendsView({ alerts }) {
  const data = useMemo(() => {
    return [...alerts]
      .sort((a, b) => new Date(a.timestamp_utc) - new Date(b.timestamp_utc))
      .map((a) => ({
        t: new Date(a.timestamp_utc).getTime(),
        label: fmtClock(a.timestamp_utc),
        risk: a.final_risk_pct,
        tier: TIER(a.final_risk_pct),
        entity: a.entity_id,
      }));
  }, [alerts]);

  return (
    <div className="ng-panel">
      <div className="ng-panel-title">Fused risk score over time, all entities</div>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft)" />
          <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} tick={{ fill: "var(--text-lo)", fontSize: 10.5 }} axisLine={{ stroke: "var(--hairline)" }} tickLine={false} />
          <YAxis dataKey="risk" domain={[0, 100]} tick={{ fill: "var(--text-lo)", fontSize: 10.5 }} axisLine={false} tickLine={false} width={36} />
          <ReferenceLine y={40} stroke="var(--tier-amber)" strokeDasharray="4 3" strokeOpacity={0.5} />
          <ReferenceLine y={75} stroke="var(--tier-red)" strokeDasharray="4 3" strokeOpacity={0.5} />
          <Tooltip
            contentStyle={{ background: "var(--ink-2)", border: "1px solid var(--hairline)", borderRadius: 8, fontSize: 12 }}
            formatter={(v, n, p) => [`${v.toFixed(1)}%`, p.payload.entity]}
            labelFormatter={(v) => new Date(v).toLocaleString()}
          />
          <Scatter data={data} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={TIER_COLOR[d.tier]} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="ng-legend">
        <div className="ng-legend-item"><span className="ng-legend-swatch" style={{ background: "var(--tier-green)" }} />Secure (&lt;40%)</div>
        <div className="ng-legend-item"><span className="ng-legend-swatch" style={{ background: "var(--tier-amber)" }} />Elevated (40&ndash;74%)</div>
        <div className="ng-legend-item"><span className="ng-legend-swatch" style={{ background: "var(--tier-red)" }} />Critical (75&ndash;100%)</div>
      </div>
    </div>
  );
}

/* ============================== ROOT APP ============================== */
export default function App() {
  const seedRef = useRef(null);
  if (!seedRef.current) seedRef.current = seedData();

  // ---- persistent storage helpers ----
  const LS_KEYS = { alerts: "ng_alerts", telemetry: "ng_telemetry", baselines: "ng_baselines", alertSeq: "ng_alert_seq" };

  const loadLS = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return fallback;
  };

  const [telemetry, setTelemetry] = useState(() =>
    loadLS(LS_KEYS.telemetry, seedRef.current.telemetry)
  );
  const [alerts, setAlerts] = useState(() =>
    loadLS(LS_KEYS.alerts, seedRef.current.alerts)
  );
  const [baselines, setBaselines] = useState(() =>
    loadLS(LS_KEYS.baselines, seedRef.current.baselines)
  );
  const alertSeqRef = useRef(
    loadLS(LS_KEYS.alertSeq, seedRef.current.alertSeq)
  );

  // Sync state → localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.alerts, JSON.stringify(alerts)); } catch (_) {}
  }, [alerts]);
  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.telemetry, JSON.stringify(telemetry)); } catch (_) {}
  }, [telemetry]);
  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.baselines, JSON.stringify(baselines)); } catch (_) {}
  }, [baselines]);
  // alertSeqRef is a ref — patch it after every simulation push in runSimulation

  const [tab, setTab] = useState("feed");
  const [toasts, setToasts] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("ng_theme");
      if (stored !== null) return stored === "dark";
    } catch (_) {}
    return false; // default: light theme
  });

  useEffect(() => {
    try { localStorage.setItem("ng_theme", darkMode ? "dark" : "light"); } catch (_) {}
  }, [darkMode]);

  // ---- backend connection ----
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:8000");
  const [draftUrl, setDraftUrl] = useState("http://localhost:8000");
  const [connStatus, setConnStatus] = useState("demo"); // demo | connecting | live | error
  const [connError, setConnError] = useState("");

  const pushToast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  const refreshFromBackend = useCallback(async (base, { silent } = {}) => {
    const root = trimSlash(base);
    const [alertRows, telemetryRows] = await Promise.all([
      fetchJSON(`${root}/alerts?status=open`),
      fetchJSON(`${root}/telemetry?limit=200`),
    ]);
    const telemetryArr = Array.isArray(telemetryRows) ? telemetryRows : [];
    const alertArr = Array.isArray(alertRows) ? alertRows : [];
    const entityIds = Array.from(new Set([
      ...telemetryArr.map((t) => t.entity_id),
      ...alertArr.map((a) => a.entity_id),
    ]));
    const baselineRows = await Promise.all(
      entityIds.map((id) => fetchJSON(`${root}/baselines/${encodeURIComponent(id)}`).catch(() => null))
    );
    const baselineMap = {};
    baselineRows.filter(Boolean).forEach((b) => { baselineMap[b.entity_id] = mapBaselineRow(b); });

    const telem = telemetryArr.map((r) => ({ ...r }));
    const alertsMapped = alertArr.map((r) => {
      const mapped = mapAlertRow(r);
      if (!mapped.entity_type) {
        mapped.entity_type = baselineMap[mapped.entity_id]?.entity_type
          || telem.find((t) => t.entity_id === mapped.entity_id)?.entity_type
          || null;
      }
      return mapped;
    });

    setTelemetry(telem);
    setAlerts(alertsMapped);
    if (Object.keys(baselineMap).length) setBaselines(baselineMap);
    if (!silent) pushToast(`Connected to backend — ${alertsMapped.length} open alert${alertsMapped.length === 1 ? "" : "s"} loaded.`);
    return { alertsMapped, telem };
  }, [pushToast]);

  const tryConnect = useCallback(async () => {
    setConnStatus("connecting");
    setConnError("");
    setApiBaseUrl(draftUrl);
    try {
      await refreshFromBackend(draftUrl);
      setConnStatus("live");
    } catch (e) {
      setConnStatus("error");
      setConnError(e.name === "AbortError" ? "Timed out reaching the server." : (e.message || "Connection failed"));
      pushToast("Couldn't reach the backend — showing simulated data instead.");
    }
  }, [draftUrl, refreshFromBackend, pushToast]);

  const handleConfirm = useCallback((group) => {
    const ids = new Set(group.map((g) => g.alert_id));
    setAlerts((prev) => prev.map((a) => (ids.has(a.alert_id) ? { ...a, status: "confirmed" } : a)));
    pushToast(`Confirmed threat on ${group[0].entity_id} — isolation triggered.`);
    if (connStatus === "live") {
      const root = trimSlash(apiBaseUrl);
      group.forEach((g) => {
        fetchJSON(`${root}/alerts/${g.alert_id}/status`, {
          method: "POST",
          body: JSON.stringify({ status: "confirmed" }),
        }).catch(() => pushToast(`Backend didn't accept the update for alert ${g.alert_id}.`));
      });
    }
  }, [pushToast, connStatus, apiBaseUrl]);

  const handleDismiss = useCallback((group) => {
    const ids = new Set(group.map((g) => g.alert_id));
    setAlerts((prev) => prev.map((a) => (ids.has(a.alert_id) ? { ...a, status: "false_positive" } : a)));
    pushToast(`Marked false positive — feedback sent to retrain the ML model.`);
    if (connStatus === "live") {
      const root = trimSlash(apiBaseUrl);
      group.forEach((g) => {
        fetchJSON(`${root}/alerts/${g.alert_id}/status`, {
          method: "POST",
          body: JSON.stringify({ status: "false_positive" }),
        }).catch(() => pushToast(`Backend didn't accept the update for alert ${g.alert_id}.`));
      });
      fetchJSON(`${root}/model/retrain`, { method: "POST" }).catch(() => {});
    }
  }, [pushToast, connStatus, apiBaseUrl]);

  const buildScenarioEvents = useCallback((scenario, ent, now) => {
    let newEvents = [];
    if (scenario === "exfiltration") {
      newEvents = [{
        timestamp_utc: now.toISOString(), entity_id: ent.entity_id, entity_type: ent.entity_type,
        src_ip: "10.0.4.12", dest_ip: "203.0.113.77", dest_port: 443,
        bytes_up: Math.round(ent.mu_bytes * 8 + ent.sigma_bytes * 5), bytes_down: 6000,
        raw_login_failures: 0, login_status: "success",
      }];
    } else if (scenario === "brute_force") {
      const n = 8 + Math.floor(rand() * 6);
      for (let i = 0; i < n; i++) {
        newEvents.push({
          timestamp_utc: isoMinusMinutes(now, -i * 0.2), entity_id: ent.entity_id, entity_type: ent.entity_type,
          src_ip: "10.0.4.90", dest_ip: "10.0.1.2", dest_port: 22,
          bytes_up: 2800, bytes_down: 900,
          raw_login_failures: 7 + Math.floor(rand() * 6), login_status: "fail",
        });
      }
    } else if (scenario === "secure_traffic") {
      // Generate several normal, low-volume events well within baseline — will score green
      const n = 3 + Math.floor(rand() * 4);
      for (let i = 0; i < n; i++) {
        newEvents.push({
          timestamp_utc: isoMinusMinutes(now, -i * 1.5), entity_id: ent.entity_id, entity_type: ent.entity_type,
          src_ip: `10.0.1.${10 + i}`, dest_ip: "10.0.0.1", dest_port: [80, 443, 8080][i % 3],
          bytes_up: Math.round(ent.mu_bytes * (0.4 + rand() * 0.4)),
          bytes_down: Math.round(ent.mu_bytes * (0.3 + rand() * 0.3)),
          raw_login_failures: 0, login_status: "success",
        });
      }
    } else {
      newEvents = [{
        timestamp_utc: now.toISOString(), entity_id: ent.entity_id, entity_type: ent.entity_type,
        src_ip: "10.0.4.30", dest_ip: "10.0.1.9", dest_port: 3389,
        bytes_up: ent.mu_bytes * 1.1, bytes_down: ent.mu_bytes * 0.3,
        raw_login_failures: 0, login_status: "success",
      }];
    }
    return newEvents;
  }, []);

  const runSimulation = useCallback(async (scenario) => {
    setSimulating(true);
    const now = new Date();
    const pool = Object.keys(baselines).length ? Object.values(baselines) : ENTITIES;
    const ent = pool[Math.floor(rand() * pool.length)];
    const newEvents = buildScenarioEvents(scenario, ent, now);

    if (connStatus === "live") {
      const root = trimSlash(apiBaseUrl);
      try {
        for (const ev of newEvents) {
          await fetchJSON(`${root}/ingest`, { method: "POST", body: JSON.stringify(ev) });
        }
        const { alertsMapped } = await refreshFromBackend(apiBaseUrl, { silent: true });
        setSimulating(false);
        pushToast(`Sent ${newEvents.length} simulated event${newEvents.length > 1 ? "s" : ""} for ${ent.entity_id} to /ingest.`);
        setTab("feed");
        return;
      } catch (e) {
        setSimulating(false);
        pushToast("The backend rejected the simulated ingest — check /ingest is running.");
        return;
      }
    }

    // demo mode: score locally with the same pipeline the backend documents
    const newAlerts = [];
    newEvents.forEach((ev) => {
      const s = scoreEvent(ev, ent);
      const tier = TIER(s.final_risk_pct);
      // Always push — threats (amber/red) as "open", secure traffic (green) as "secure"
      newAlerts.push({
        alert_id: alertSeqRef.current++,
        entity_id: ent.entity_id, entity_type: ent.entity_type,
        timestamp_utc: ev.timestamp_utc, final_risk_pct: s.final_risk_pct,
        threat_classification: tier === "green" ? "NORMAL_TRAFFIC" : s.threat_classification,
        status: tier === "green" ? "secure" : "open",
        debug_scores: { s_ml: s.s_ml_norm, s_stat: s.s_stat_norm, rule_override: s.rule_override_flag },
      });
    });

    setTimeout(() => {
      setTelemetry((prev) => [...newEvents, ...prev]);
      setAlerts((prev) => [...newAlerts, ...prev]);
      // persist the latest alert sequence number so IDs stay unique across reloads
      try { localStorage.setItem("ng_alert_seq", JSON.stringify(alertSeqRef.current)); } catch (_) {}
      setSimulating(false);
      const threats = newAlerts.filter((a) => a.status === "open").length;
      const secure = newAlerts.filter((a) => a.status === "secure").length;
      if (secure > 0 && threats === 0) {
        pushToast(`Simulated secure traffic on ${ent.entity_id} — ${secure} secure event${secure > 1 ? "s" : ""} logged.`);
      } else if (threats > 0) {
        pushToast(`Simulated ${scenario.replace("_", " ")} on ${ent.entity_id} — ${threats} threat alert${threats > 1 ? "s" : ""} raised.`);
      } else {
        pushToast("Simulated event stayed under the alert threshold.");
      }
      setTab("feed");
    }, 550);
  }, [connStatus, apiBaseUrl, baselines, buildScenarioEvents, refreshFromBackend, pushToast]);

  const stats = useMemo(() => {
    const open = alerts.filter((a) => a.status === "open");
    const critical = open.filter((a) => TIER(a.final_risk_pct) === "red").length;
    const elevated = open.filter((a) => TIER(a.final_risk_pct) === "amber").length;
    return { open: open.length, critical, elevated };
  }, [alerts]);

  const NAV = [
    { id: "feed", label: "Live alert feed", icon: Radio, count: stats.open },
    { id: "telemetry", label: "Telemetry explorer", icon: Database },
    { id: "baselines", label: "Baseline viewer", icon: Activity },
    { id: "trends", label: "Historical trends", icon: TrendingUp },
  ];

  const pageMeta = {
    feed: { title: "Live alert feed", sub: "Fused ML + statistical detections across campus entities" },
    telemetry: { title: "Raw telemetry explorer", sub: "Searchable event stream for forensics and investigation" },
    baselines: { title: "Entity baseline viewer", sub: "Learned normal-behavior profile per entity" },
    trends: { title: "Historical trend chart", sub: "Fused risk score across all alerts over time" },
  }[tab];

  return (
    <div className="ng-root" data-theme={darkMode ? "dark" : "light"}>
      <style>{STYLE}</style>

      <nav className="ng-sidebar">
        <div className="ng-brand">
          <div className="ng-brand-mark">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 5V10C3 13.87 6.13 17.5 10 18.5C13.87 17.5 17 13.87 17 10V5L10 2Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
              <circle cx="10" cy="10" r="3" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
              <circle cx="10" cy="10" r="5.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
              <line x1="10" y1="10" x2="13.5" y2="6.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="1" fill="white"/>
            </svg>
          </div>
          <div className="ng-brand-text">
            <span className="ng-brand-name">NetGuard</span>
            <span className="ng-brand-sub">Campus IDS · PS17</span>
          </div>
        </div>
        {NAV.map((n) => (
          <button key={n.id} className={`ng-navitem ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
            <n.icon size={15} />
            {n.label}
            {typeof n.count === "number" && <span className="ng-navcount">{n.count}</span>}
          </button>
        ))}
        <div className="ng-sidebar-foot">
          <div className="ng-conn-panel">
            <div className="ng-conn-label"><Plug size={12} /> Backend connection</div>
            <div className="ng-conn-input-row">
              <input
                className="ng-conn-input"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder="http://localhost:8000"
                spellCheck={false}
              />
              <button className="ng-conn-go" onClick={tryConnect} title="Connect">
                {connStatus === "connecting" ? <RefreshCw size={13} /> : <Link2 size={13} />}
              </button>
            </div>
            <div className="ng-pulse-row" style={{ padding: "2px 0" }}>
              <span className={`ng-pulse-dot ${simulating ? "sim" : connStatus === "live" ? "live" : connStatus === "connecting" ? "sim" : "off"}`} />
              {simulating
                ? "Ingesting simulated event…"
                : connStatus === "live" ? "Live — reading campus_ids.db"
                : connStatus === "connecting" ? "Connecting…"
                : connStatus === "error" ? "Offline — using simulated data"
                : "Simulated data mode"}
            </div>
            {connStatus === "error" && connError && <div className="ng-conn-err"><WifiOff size={11} style={{ verticalAlign: "-1px", marginRight: 4 }} />{connError}</div>}
          </div>
          <button
            className="ng-btn ng-btn-ghost ng-btn-sm"
            style={{ width: "100%", marginTop: 8, color: "var(--text-lo)", fontSize: 11 }}
            onClick={() => {
              if (!window.confirm("Clear all stored logs and reset to fresh seed data?")) return;
              ["ng_alerts", "ng_telemetry", "ng_baselines", "ng_alert_seq"].forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }}
          >
            <X size={11} /> Clear all logs
          </button>
        </div>
      </nav>

      <div className="ng-main">
        <div className="ng-topbar">
          <div className="ng-topbar-row">
            <div>
              <div className="ng-page-title ng-display">{pageMeta.title}</div>
              <div className="ng-page-sub">{pageMeta.sub}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button className="ng-theme-toggle" onClick={() => setDarkMode(v => !v)} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button className="ng-btn ng-btn-ghost ng-btn-sm" onClick={() => runSimulation("secure_traffic")} disabled={simulating}>
                <Shield size={13} /> Simulate secure traffic
              </button>
              <button className="ng-btn ng-btn-ghost ng-btn-sm" onClick={() => runSimulation("brute_force")} disabled={simulating}>
                <Zap size={13} /> Simulate brute force
              </button>
              <button className="ng-btn ng-btn-ghost ng-btn-sm" onClick={() => runSimulation("exfiltration")} disabled={simulating}>
                <Zap size={13} /> Simulate exfiltration
              </button>
              <button className="ng-btn ng-btn-primary" onClick={() => runSimulation(rand() < 0.5 ? "restricted_port" : "exfiltration")} disabled={simulating}>
                <RefreshCw size={13} className={simulating ? "" : ""} /> {simulating ? "Simulating…" : "Simulate attack"}
              </button>
            </div>
          </div>
        </div>

        <div className="ng-content">
          <div className="ng-stats">
            <div className="ng-stat"><div className="ng-stat-label">Open alerts</div><div className="ng-stat-value">{stats.open}</div></div>
            <div className="ng-stat"><div className="ng-stat-label">Critical</div><div className="ng-stat-value red">{stats.critical}</div></div>
            <div className="ng-stat"><div className="ng-stat-label">Elevated</div><div className="ng-stat-value amber">{stats.elevated}</div></div>
          </div>

          {tab === "feed" && <LiveFeedView alerts={alerts} telemetry={telemetry} onConfirm={handleConfirm} onDismiss={handleDismiss} baselines={baselines} />}
          {tab === "telemetry" && <TelemetryView telemetry={telemetry} />}
          {tab === "baselines" && <BaselinesView baselines={baselines} telemetry={telemetry} />}
          {tab === "trends" && <TrendsView alerts={alerts} />}
        </div>
      </div>

      <div className="ng-bottomnav">
        {NAV.map((n) => (
          <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => setTab(n.id)}>
            <n.icon size={17} />
            {n.label.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="ng-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="ng-toast"><Check size={14} color="var(--tier-green)" />{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
