const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let scene = "menu"; // "menu", "game", "how", "levelSelect", etc.

const TOP_UI_HEIGHT = 100;
const GRID_MARGIN = 20;

const SAVE_KEY = "crosswizz_save";
const LEVEL_COUNT = 20;

let levelStartSeconds = 0;

let adminList = ["noamwolf", "pinchas", "theboss", "unknown2"];
let isAdmin = false;

let currentUserFirebase = "";
let currentEmailFirebase = "";

// Game state
let playerHealth = 3;
let gameOver = false;
let levelWon = false;
let timerSeconds = 30;
let tilesClicked = 0;
let lastSavedTilesClicked = 0;

let combo = 0;
let comboParticles = [];

let resetting = false;
let howToShown = false;
let howToTimer = 0;