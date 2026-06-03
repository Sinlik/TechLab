// ─────────────────────────────────────────────────────────────────────────────
// config.js  —  All static game data: level definitions, grid constants, hints
// ─────────────────────────────────────────────────────────────────────────────

// ── Canvas / UI layout constants ─────────────────────────────────────────────

/** Height reserved at the top of the canvas for the HUD (points, timer, etc.) */
const TOP_UI_HEIGHT = 100;

/** Extra vertical padding between the HUD and the tile grid */
const GRID_MARGIN = 20;

/** Total number of playable levels */
const LEVEL_COUNT = 20;

/** Each tile is rendered as a 50×50 px square */
const TILE_SIZE = 50;

/** Horizontal gap between tile centres */
const SPACING_X = 80;

/** Vertical gap between tile centres */
const SPACING_Y = 80;

/** Maximum number of hearts the player starts with */
const MAX_HEALTH = 3;

// ── Per-level configuration ───────────────────────────────────────────────────
//
// Each entry defines:
//   rows     – number of tile rows in the grid
//   columns  – number of tile columns
//   ops      – which operators can appear in questions
//   nums     – pool of numbers used when building questions
//
const LEVEL_CONFIG = {
    1:  { rows: 1, columns: 2, ops: ['+', '-'],        nums: [1,2,3,4,5] },
    2:  { rows: 2, columns: 2, ops: ['+', '-'],        nums: [1,2,3,4,5] },
    3:  { rows: 2, columns: 2, ops: ['+', '-'],        nums: [1,2,3,4,5,6,7,8] },
    4:  { rows: 2, columns: 2, ops: ['+', '-'],        nums: [1,2,3,4,5,6,7,8,9,10] },
    5:  { rows: 2, columns: 3, ops: ['+', '-'],        nums: [1,2,3,4,5,6,7,8,9,10] },
    6:  { rows: 2, columns: 3, ops: ['+', '-'],        nums: [2,3,4,5,6,7,8,9,10,11,12] },
    7:  { rows: 3, columns: 3, ops: ['+', '-'],        nums: [2,3,4,5,6,7,8,9,10,11,12] },
    8:  { rows: 3, columns: 3, ops: ['+', '-', '*'],   nums: [1,2,3,4,5,6,7,8,9,10] },
    9:  { rows: 3, columns: 3, ops: ['+', '-', '*'],   nums: [1,2,3,4,5,6,7,8,9,10,11,12] },
    10: { rows: 3, columns: 3, ops: ['+', '-', '*'],   nums: [2,3,4,5,6,7,8,9,10,11,12] },
    11: { rows: 3, columns: 4, ops: ['+', '-', '*'],   nums: [2,3,4,5,6,7,8,9,10,11,12] },
    12: { rows: 3, columns: 4, ops: ['+', '-', '*'],   nums: [3,4,5,6,7,8,9,10,11,12,15] },
    13: { rows: 4, columns: 4, ops: ['+', '-', '*'],   nums: [3,4,5,6,7,8,9,10,11,12,15] },
    14: { rows: 4, columns: 4, ops: ['+', '-', '*'],   nums: [4,5,6,7,8,9,10,11,12,15,20] },
    15: { rows: 4, columns: 5, ops: ['+', '-', '*'],   nums: [5,10,15,20,25,30] },
    16: { rows: 4, columns: 5, ops: ['+', '-', '*'],   nums: [5,10,15,20,25,30,50] },
    17: { rows: 5, columns: 5, ops: ['+', '-', '*'],   nums: [5,10,15,20,25,30,50] },
    18: { rows: 5, columns: 5, ops: ['+', '-', '*'],   nums: [10,15,20,25,30,50,100] },
    19: { rows: 5, columns: 5, ops: ['+', '-', '*'],   nums: [10,20,25,30,50,75,100] },
    20: { rows: 5, columns: 5, ops: ['+', '-', '*'],   nums: [12,15,20,25,50,75,100] },
};

// ── Level intro messages shown at the start of each level ─────────────────────
const LEVEL_HOWTO = {
    1:  "2 tiles · Add or subtract numbers up to 5.",
    2:  "4 tiles · Same rules, a bit more to solve!",
    3:  "4 tiles · Numbers go up to 8 now.",
    4:  "4 tiles · Full 1–10 range unlocked.",
    5:  "6 tiles · Grid gets wider. Stay sharp!",
    6:  "6 tiles · Numbers up to 12 introduced.",
    7:  "9 tiles · Bigger grid. Addition & subtraction.",
    8:  "9 tiles · MULTIPLICATION unlocked! ×2 to ×5.",
    9:  "9 tiles · Times tables up to ×12.",
    10: "9 tiles · No small numbers — stay focused.",
    11: "12 tiles · Grid grows. All three operators.",
    12: "12 tiles · Numbers up to 15 appear.",
    13: "16 tiles · 4×4 grid. It's getting serious.",
    14: "16 tiles · Numbers up to 20. Don't panic!",
    15: "20 tiles · HARD MODE. Multiples of 5 & 10.",
    16: "20 tiles · 50 joins the number pool.",
    17: "25 tiles · Full 5×5 grid. Maximum tiles!",
    18: "25 tiles · Numbers up to 100.",
    19: "25 tiles · 75 added. Toughest mix yet.",
    20: "25 tiles · FINAL LEVEL. Give it everything!",
};

// ── Timer helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the allowed time (in seconds) for a given level.
 * Time scales from 30 s at level 1 up to a maximum of 150 s.
 */
function getTimeForLevel(level) {
    const base    = 30;
    const step    = 8;
    const maxTime = 150;
    return Math.min(base + (level - 1) * step, maxTime);
}

/**
 * Formats a total-seconds value as "M:SS".
 * e.g. 75 → "1:15"
 */
function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Admin access list ─────────────────────────────────────────────────────────
// Usernames (lowercase) that are granted admin-panel access.
const ADMIN_LIST = ["noamwolf", "pinchas", "theboss"];

/**
 * Returns true if the given username is in the admin list.
 * @param {string} username
 */
function checkAdmin(username) {
    return ADMIN_LIST.includes((username || "").toLowerCase());
}