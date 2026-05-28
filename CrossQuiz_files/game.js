const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scene = "menu"; // "menu", "game", "how"
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const TOP_UI_HEIGHT = 100; // your top bar zone (points + result + level)
const GRID_MARGIN = 20;    // extra padding above the grid

let text = function(string, x, y, px) {
    let text = string;
    ctx.fillStyle = "black";
    ctx.font = px + "px Arial";
    textAlign = "center";
    ctx.fillText(text, x, y);
}

// create a save JSON file
const SAVE_KEY = "crosswizz_save"

// timer vars

let timeForLevel = 10
let timerSeconds = timeForLevel
let timerInterval = null

let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
// math squares 
let squares = [];
let isCorrect = false;
let points = 0;
// number that needs to be solved
let mathQuestions = [];
let mathQuestion = "";
let mathAnswer = 0;
// checking how many math buttons where clicked (within certain rules)
let symbolsClicked = 0;
// level vars

let levelCount = 20;
let selectedLevel = 0;
let unlockedUpTo = 1

// locked variables
let shakeLevel = 0;
let shakeTimer = 0;

let rows = 1;
let columns = 2;

let currentUserFirebase = "";
let currentEmailFirebase = "";

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            currentUserFirebase = data.username || "";
            currentEmailFirebase = data.email || "";
        }
    } else {
        currentUserFirebase = "";
        currentEmailFirebase = "";
    }
});


function playCorrectSound() {
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.3);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, audioCtx.currentTime + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.35);
    gain2.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.4);
}

function playWrongSound() {
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.2);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(150, audioCtx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.25);
    gain2.gain.setValueAtTime(0.0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc2.start(audioCtx.currentTime + 0.05);
    osc2.stop(audioCtx.currentTime + 0.25);
}

canvas.addEventListener('mousemove', function(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});
let combo = 0;
let comboParticles = []; // active floating combo texts

function playLossComboAnimation() {
    if (combo === 0) return;
    const targetX = canvas.width / 2 + 20;
    const targetY = canvas.height / 2 - 230;

    comboParticles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX,
        targetY,
        text: "x" + combo + "  LOST",
        alpha: 1.0,
        scale: 1.2,
        color: "255, 80, 120",
        loss: true,
        life: 0,
        maxLife: 200   // slower
    });
}

function playComboAnimation() {
    const targetX = canvas.width / 2 + 20;
    const targetY = canvas.height / 2 - 230;

    comboParticles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX,
        targetY,
        text: combo >= 2 ? "x" + combo + "  COMBO" : "CORRECT",
        alpha: 1.0,
        scale: combo >= 3 ? 1.4 : 1.0,
        color: combo >= 5 ? "255, 200, 80"
             : combo >= 3 ? "180, 120, 255"
             :              "80, 255, 160",
        loss: false,
        life: 0,
        maxLife: 200   // slower
    });
}

function updateComboParticles() {
    for (let i = comboParticles.length - 1; i >= 0; i--) {
        const p = comboParticles[i];
        p.life++;

        // move toward target (lerp)
        p.x += (p.targetX - p.x) * 0.08;
        p.y += (p.targetY - p.y) * 0.08;

        // fade out in second half of life
        if (p.life > p.maxLife * 0.5) {
            p.alpha = 1 - (p.life - p.maxLife * 0.5) / (p.maxLife * 0.5);
        }

        if (p.life >= p.maxLife) {
            comboParticles.splice(i, 1);
            continue;
        }

        // draw
        ctx.save();
        ctx.globalAlpha = p.alpha;

        const fontSize = Math.round(14 * p.scale);
        ctx.font = `bold ${fontSize}px 'Courier New'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = `rgba(${p.color}, 0.9)`;
        ctx.shadowBlur = p.loss ? 12 : 8;
        ctx.fillStyle = `rgba(${p.color}, 1)`;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    clickX = event.clientX - rect.left;
    clickY = event.clientY - rect.top;

    if (scene !== "game" || resetting || gameOver) return;

    for (let sq of tiles) {
        if (!sq.exist) continue;
        if (clickX > sq.x && clickX < sq.x + 50 && clickY > sq.y && clickY < sq.y + 50) {
            // play tile clunk once
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.connect(g); g.connect(audioCtx.destination);
            osc.type = "square";
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.02);
            g.gain.setValueAtTime(0.4, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
            osc.start(); osc.stop(audioCtx.currentTime + 0.02);

            isCorrect = (sq.symbol == mathAnswer);
            resetting = true;

            tilesClicked++
            saveGame();
            console.log(tilesClicked)
            if (isCorrect) {
                combo++
                playComboAnimation()
                resultBgColor = "rgb(21, 255, 0)";
                playCorrectSound();
                setTimeout(() => {
                    sq.hitsLeft -= 1;
                    if (sq.hitsLeft <= 0) {
                        sq.exist = false;
                    } else {
                        const nextHitIdx = sq.hitsRequired - sq.hitsLeft;
                        sq.symbol = sq.questions[nextHitIdx].answer;
                    }
                    points += 1 * combo;
                    resultBgColor = "rgb(65, 115, 138)";
                    isCorrect = false;
                    resetting = false;
                    if (tiles.some(t => t.exist)) 
                        createNumberToSolve(); // only move to next prompt when correct
                }, 500);
            } else {
                playLossComboAnimation()
                combo = 0
                playerHealth--;
                loseHeart();
                if (playerHealth <= 0) gameOver = true;
                resultBgColor = "rgb(255, 0, 0)";
                playWrongSound();
                setTimeout(() => {
                    resultBgColor = "rgb(65, 115, 138)";
                    isCorrect = false;
                    resetting = false;
                }, 500);
            }

            clickX = -1; clickY = -1;
            break; // stop after first matching square
        }
    }
});

function randomSymbol() {
    let all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "+", "-", "*"];
    return all[Math.floor(Math.random() * all.length)];
}

const LEVEL_CONFIG = {
  1:  { rows: 1, columns: 2, ops: ['+', '-'], nums: [1,2,3,4,5] },
  2:  { rows: 2, columns: 2, ops: ['+', '-'], nums: [1,2,3,4,5] },
  3:  { rows: 2, columns: 2, ops: ['+', '-'], nums: [1,2,3,4,5,6,7,8] },
  4:  { rows: 2, columns: 2, ops: ['+', '-'], nums: [1,2,3,4,5,6,7,8,9,10] },
  5:  { rows: 2, columns: 3, ops: ['+', '-'], nums: [1,2,3,4,5,6,7,8,9,10] },
  6:  { rows: 2, columns: 3, ops: ['+', '-'], nums: [2,3,4,5,6,7,8,9,10,11,12] },
  7:  { rows: 3, columns: 3, ops: ['+', '-'], nums: [2,3,4,5,6,7,8,9,10,11,12] },
  8:  { rows: 3, columns: 3, ops: ['+', '-', '*'], nums: [1,2,3,4,5,6,7,8,9,10] },
  9:  { rows: 3, columns: 3, ops: ['+', '-', '*'], nums: [1,2,3,4,5,6,7,8,9,10,11,12] },
  10: { rows: 3, columns: 3, ops: ['+', '-', '*'], nums: [2,3,4,5,6,7,8,9,10,11,12] },
  11: { rows: 3, columns: 4, ops: ['+', '-', '*'], nums: [2,3,4,5,6,7,8,9,10,11,12] },
  12: { rows: 3, columns: 4, ops: ['+', '-', '*'], nums: [3,4,5,6,7,8,9,10,11,12,15] },
  13: { rows: 4, columns: 4, ops: ['+', '-', '*'], nums: [3,4,5,6,7,8,9,10,11,12,15] },
  14: { rows: 4, columns: 4, ops: ['+', '-', '*'], nums: [4,5,6,7,8,9,10,11,12,15,20] },
  15: { rows: 4, columns: 5, ops: ['+', '-', '*'], nums: [5,10,15,20,25,30] },
  16: { rows: 4, columns: 5, ops: ['+', '-', '*'], nums: [5,10,15,20,25,30,50] },
  17: { rows: 5, columns: 5, ops: ['+', '-', '*'], nums: [5,10,15,20,25,30,50] },
  18: { rows: 5, columns: 5, ops: ['+', '-', '*'], nums: [10,15,20,25,30,50,100] },
  19: { rows: 5, columns: 5, ops: ['+', '-', '*'], nums: [10,20,25,30,50,75,100] },
  20: { rows: 5, columns: 5, ops: ['+', '-', '*'], nums: [12,15,20,25,50,75,100] },
};

function runHow() {
    // background
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    for (let i = 0; i < 130; i++) {
        const sx = (i * 137.508) % canvas.width;
        const sy = (i * 97.333) % canvas.height;
        const size = i % 5 === 0 ? 1.5 : 0.7;
        const brightness = 0.3 + (i % 7) * 0.1;
        ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // nebula glow
    ctx.save();
    const nebula1 = ctx.createRadialGradient(200, 300, 0, 200, 300, 180);
    nebula1.addColorStop(0, "rgba(80, 40, 160, 0.12)");
    nebula1.addColorStop(1, "rgba(80, 40, 160, 0)");
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebula2 = ctx.createRadialGradient(600, 200, 0, 600, 200, 200);
    nebula2.addColorStop(0, "rgba(20, 80, 160, 0.1)");
    nebula2.addColorStop(1, "rgba(20, 80, 160, 0)");
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // back button
    const bx = 30, by = 20, bw = 80, bh = 30;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(80, 120, 255, 0.3)" : "rgba(30, 50, 120, 0.4)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.strokeStyle = bHover ? "rgba(120, 160, 255, 0.9)" : "rgba(80, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(180, 210, 255)" : "rgb(120, 160, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("← BACK", bx + bw / 2, by + bh / 2);
    ctx.shadowBlur = 0;

    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        scene = "menu";
        clickX = -1;
        clickY = -1;
        return;
    }

    // main instruction panel
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 250, cy - 120, 500, 240);

    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 250, cy - 120, 500, 240);
    ctx.shadowBlur = 0;

    // title
    ctx.fillStyle = "rgb(180, 215, 255)";
    ctx.font = "bold 26px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HOW TO PLAY", cx, cy - 80);

    // divider
    ctx.strokeStyle = "rgba(80, 140, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 170, cy - 55);
    ctx.lineTo(cx + 170, cy - 55);
    ctx.stroke();

    // instructions
    ctx.fillStyle = "rgba(200, 225, 255, 0.95)";
    ctx.font = "14px 'Courier New'";
    ctx.fillText("1. Read the answer at the top.", cx, cy - 20);
    ctx.fillText("2. Click the tile with that answer.", cx, cy + 10);
    ctx.fillText("3. Some tiles need multiple correct clicks.", cx, cy + 40);
    ctx.fillText("4. Clear all tiles to finish the level.", cx, cy + 70);

    // small tip line
    ctx.fillStyle = "rgba(140, 180, 255, 0.8)";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("Tip: Later levels have more tiles and harder numbers.", cx, cy + 105);
}

function createMathQuestions(level = 1) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

    rows    = config.rows;
    columns = config.columns;

    const totalCells = rows * columns;
    mathQuestions = [];

    function generateQuestion() {
        let num1, num2, operator, answer;
        do {
            num1     = config.nums[Math.floor(Math.random() * config.nums.length)];
            num2     = config.nums[Math.floor(Math.random() * config.nums.length)];
            operator = config.ops[Math.floor(Math.random() * config.ops.length)];
            answer   = operator === '*' ? num1 * num2
                       : operator === '+' ? num1 + num2
                       :                    num1 - num2;
        } while (answer <= 0 || !Number.isInteger(answer));
        return { question: `${num1} ${operator} ${num2} = ?`, answer };
    }

    for (let i = 0; i < totalCells; i++) {
        const type = getTileType(level);
        const hitsRequired = type === "blue" ? 1 : type === "orange" ? 2 : 3;

        // Generate one unique question per required hit
        const questions = Array.from({ length: hitsRequired }, generateQuestion);

        mathQuestions.push({
            questions,        // array of { question, answer } — one per hit
            answer: questions[0].answer,
            question: questions[0].question,
            type,
            hitsRequired
        });
    }
}

let pointsScreen = function(x, y) {
    ctx.fillStyle = "rgba(15, 25, 60, 0.6)";
    ctx.fillRect(x, y, 120, 34);

    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 120, 34);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(120, 180, 255, 0.6)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "rgb(140, 180, 255)";
    ctx.font = "12px 'Courier New'";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("PTS  " + points, x + 12, y + 17);
    ctx.shadowBlur = 0;
}
// function to display the number to solve at the top of the game screen
let numberToSolveScreen = function(x, y, num) {
    ctx.fillStyle = "rgba(15, 25, 60, 0.6)";
    ctx.fillRect(x, y, 140, 34);

    ctx.shadowColor = "rgba(60, 255, 150, 0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(60, 255, 150, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 140, 34);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(80, 255, 160, 0.7)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "rgb(80, 255, 160)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("FIND  " + num, x + 12, y + 17);
    ctx.shadowBlur = 0;
}

function resetGame() {
    clearInterval(timerInterval);
    timerSeconds = timeForLevel;
    squares = [];
    tiles = [];
    points = 0;
    mathQuestion = "";
    mathAnswer = 0;
    isCorrect = false;
    resetting = false;
    combo = 0;
    comboParticles = []
    playerHealth = 3;
    resultBgColor = "rgb(65, 115, 138)";
    mathQuestions = [];
    howToShown = false;
    howToTimer = 0;
}

// make winning screen
let winningScreen = function() {
    clearInterval(timerInterval)
    // saveGame()
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 200, cy - 80, 400, 180);

    ctx.shadowColor = "rgba(60, 255, 150, 0.6)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(60, 255, 150, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 200, cy - 80, 400, 180);
    ctx.shadowBlur = 0;

    // win title
    ctx.shadowColor = "rgba(80, 255, 160, 0.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgb(80, 255, 160)";
    ctx.font = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MISSION COMPLETE", cx, cy - 30);
    ctx.shadowBlur = 0;

    // points
    ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
    ctx.font = "13px 'Courier New'";
    ctx.fillText("FINAL SCORE  " + points + "  PTS", cx, cy + 10);

    // divider
    ctx.strokeStyle = "rgba(60, 255, 150, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 32);
    ctx.lineTo(cx + 120, cy + 32);
    ctx.stroke();

    // play again button
    const bx = cx - 100, by = cy + 48, bw = 200, bh = 36;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(60, 100, 220, 0.4)" : "rgba(15, 25, 80, 0.6)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.shadowColor = bHover ? "rgba(100, 160, 255, 0.9)" : "rgba(60, 100, 200, 0.4)";
    ctx.shadowBlur = bHover ? 12 : 5;
    ctx.strokeStyle = bHover ? "rgba(140, 190, 255, 0.9)" : "rgba(60, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;

    ctx.shadowColor = bHover ? "rgba(160, 210, 255, 0.9)" : "rgba(100, 160, 255, 0.5)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(200, 225, 255)" : "rgb(120, 170, 255)";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("PLAY AGAIN", cx, by + 18);
    ctx.shadowBlur = 0;

    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        const nextLevel = selectedLevel < levelCount ? selectedLevel + 1 : 1;
        if (nextLevel > unlockedUpTo) unlockedUpTo = nextLevel;
        resetGame();
        selectedLevel = nextLevel
        clickX = -1; clickY = -1;
    }
}
// global text for result screen
let resultBgColor = "rgb(65, 115, 138)";
let resultScreen = function(x, y, text) {
   // result screen
    const isNeutral = resultBgColor === "rgb(65, 115, 138)";
    const isGreen   = resultBgColor === "rgb(21, 255, 0)";

    const glowColor  = isGreen   ? "rgba(60, 255, 150, 0.8)"
                     : !isNeutral ? "rgba(255, 80, 100, 0.8)"
                     :              "rgba(80, 140, 255, 0.5)";
    const fillColor  = isGreen   ? "rgba(20, 60, 40, 0.7)"
                     : !isNeutral ? "rgba(60, 15, 25, 0.7)"
                     :              "rgba(15, 25, 60, 0.6)";
    const textColor  = isGreen   ? "rgb(80, 255, 160)"
                     : !isNeutral ? "rgb(255, 100, 120)"
                     :              "rgb(140, 180, 255)";
    const label      = text !== "" ? "= " + text : "_ ○ _";

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, 140, 34);

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isNeutral ? 6 : 14;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 140, 34);
    ctx.shadowBlur = 0;

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isNeutral ? 4 : 10;
    ctx.fillStyle = textColor;
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 70, y + 17);
    ctx.shadowBlur = 0;
}

// check to see when three symbols are clicked in a row, then evaluate the expression and update the result screen
let resultText = "";
let clickedSquares = [];
let resetting = false;
let flickerTimer = 0;
let flickerOpacity = 100;
let getTileType = function(level) {
    const rand = Math.random();
    if (level <= 7) return "blue";                              // easy: all blue
    if (level <= 14) return rand < 0.7 ? "blue" : "orange";   // normal: some orange
    return rand < 0.4 ? "blue" : rand < 0.75 ? "orange" : "red"; // hard: mix
}
let mathSquare = function(x, y, width, height, symbol, type, hitsLeft) {
    /* three types: blue one, what there is now, that has one solution
    Orange, two solutions, after you get the first number right, another number appears, so the block doesn't dissapear, once that is selected correctly, it will dissapear
    Red, three solutions, same thing, just three times*/
    const isOp = typeof symbol === "string";
    const isHover = mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;
    
    // tile color based on type
    let baseColor, hoverColor, borderColor, glowColor, textColor;
    if (type === "orange") {
        baseColor  = "rgba(180, 80, 20, 0.6)";
        hoverColor = "rgba(220, 120, 40, 0.75)";
        borderColor = "rgba(255, 160, 60, 0.6)";
        glowColor  = "rgba(255, 140, 40, 0.6)";
        textColor  = "rgb(255, 200, 120)";
    } else if (type === "red") {
        baseColor  = "rgba(160, 20, 20, 0.6)";
        hoverColor = "rgba(200, 40, 40, 0.75)";
        borderColor = "rgba(255, 80, 80, 0.6)";
        glowColor  = "rgba(255, 60, 60, 0.6)";
        textColor  = "rgb(255, 160, 160)";
    } else {
        baseColor  = "rgba(30, 60, 120, 0.6)";
        hoverColor = "rgba(60, 100, 200, 0.75)";
        borderColor = "rgba(80, 140, 255, 0.6)";
        glowColor  = "rgba(120, 180, 255, 0.6)";
        textColor  = "rgb(160, 200, 255)";
    }

    ctx.fillStyle = isHover ? hoverColor : baseColor;
    ctx.fillRect(x, y, width, height);

    if (isHover) {
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
    } else {
        ctx.strokeStyle = borderColor.replace("0.6", "0.3");
        ctx.lineWidth = 0.5;
    }
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0;

    // symbol — shrink font for longer numbers
    const digits = String(symbol).length;
    const fontSize = digits >= 4 ? 16 : digits === 3 ? 20 : 30;

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 3;
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px 'Courier New'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, x + width / 2, y + height / 2);
    ctx.shadowBlur = 0;

    // hit dots at bottom of tile (remaining hits indicator)
    if (type !== "blue") {
        for (let d = 0; d < hitsLeft; d++) {
            ctx.fillStyle = textColor;
            ctx.beginPath();
            ctx.arc(x + width/2 + (d - (hitsLeft-1)/2) * 10, y + height - 7, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

let button = function(string, x, y, width, height, target) {
    const bx = x - width / 2, by = y - height / 2;
    const hover = mouseX > bx && mouseX < bx + width &&
                  mouseY > by && mouseY < by + height;
    const clicked = clickX > bx && clickX < bx + width &&
                    clickY > by && clickY < by + height;

    // tile fill
    ctx.fillStyle = hover ? "rgba(60, 100, 220, 0.35)" : "rgba(15, 25, 80, 0.5)";
    ctx.fillRect(bx, by, width, height);

    // glowing border
    ctx.shadowColor = hover ? "rgba(100, 160, 255, 0.9)" : "rgba(60, 100, 200, 0.4)";
    ctx.shadowBlur = hover ? 12 : 5;
    ctx.strokeStyle = hover ? "rgba(140, 190, 255, 0.9)" : "rgba(60, 100, 200, 0.5)";
    ctx.lineWidth = hover ? 1.5 : 1;
    ctx.strokeRect(bx, by, width, height);
    ctx.shadowBlur = 0;

    // text
    ctx.shadowColor = hover ? "rgba(160, 210, 255, 0.9)" : "rgba(100, 160, 255, 0.5)";
    ctx.shadowBlur = hover ? 10 : 4;
    ctx.fillStyle = hover ? "rgb(200, 225, 255)" : "rgb(120, 170, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(string.toUpperCase(), x, y);
    ctx.shadowBlur = 0;

    if (clicked) {
        // clicking sound effect
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.08);

        scene = target;
        clickX = -1;
        clickY = -1;
    }
}


let menu = function() {
    readGame()
    // deep space background
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    for (let i = 0; i < 160; i++) {
        const sx = (i * 137.508) % canvas.width;
        const sy = (i * 97.333) % canvas.height;
        const size = i % 7 === 0 ? 1.8 : i % 3 === 0 ? 1.1 : 0.5;
        const brightness = 0.2 + (i % 9) * 0.08;
        ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // nebula glows
    ctx.save();
    const n1 = ctx.createRadialGradient(150, 200, 0, 150, 200, 220);
    n1.addColorStop(0, "rgba(80, 30, 180, 0.13)");
    n1.addColorStop(1, "rgba(80, 30, 180, 0)");
    ctx.fillStyle = n1; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const n2 = ctx.createRadialGradient(650, 400, 0, 650, 400, 200);
    n2.addColorStop(0, "rgba(20, 80, 200, 0.1)");
    n2.addColorStop(1, "rgba(20, 80, 200, 0)");
    ctx.fillStyle = n2; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const n3 = ctx.createRadialGradient(400, 500, 0, 400, 500, 160);
    n3.addColorStop(0, "rgba(0, 160, 120, 0.07)");
    n3.addColorStop(1, "rgba(0, 160, 120, 0)");
    ctx.fillStyle = n3; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // planet — large dim circle bottom right
    ctx.save();
    const planet = ctx.createRadialGradient(720, 560, 10, 700, 540, 130);
    planet.addColorStop(0, "rgba(40, 60, 140, 0.55)");
    planet.addColorStop(0.6, "rgba(20, 30, 80, 0.4)");
    planet.addColorStop(1, "rgba(10, 15, 40, 0)");
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(700, 550, 130, 0, Math.PI * 2);
    ctx.fill();
    // planet ring
    ctx.strokeStyle = "rgba(80, 120, 220, 0.2)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(700, 550, 180, 30, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // title

    // flicker logic
    flickerTimer++;
    if (flickerTimer % 180 === 0) {
        flickerOpacity = 0.2;
    } else if (flickerTimer % 180 < 8) {
        flickerOpacity = (flickerTimer % 2 === 0) ? 0.2 : 1;
    } else {
        flickerOpacity = 1;
    }

    // title
    ctx.shadowColor = `rgba(120, 180, 255, ${0.8 * flickerOpacity})`;
    ctx.shadowBlur = 18;
    ctx.fillStyle = `rgba(180, 215, 255, ${flickerOpacity})`;
    ctx.font = "bold 48px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CROSSWIZZ", canvas.width / 2, 110);
    ctx.shadowBlur = 0;

    // subtitle
    ctx.fillStyle = "rgba(100, 140, 220, 0.7)";
    ctx.font = "11px 'Courier New'";
    ctx.fillText("S O L V E  ·  C L I C K  ·  S C O R E", canvas.width / 2, 148);
    button("Hub", canvas.width/ 2 - 275, canvas.height / 2 - 225, 150, 50, "hub");
    button("Start", canvas.width/ 2, canvas.height / 2 - 75, 150, 50, "levelSelect");
    button("How", canvas.width / 2, canvas.height / 2, 150, 50, "how");
    button("Save", canvas.width / 2, canvas.height / 2 + 75, 150, 50, "saveGame")
    button("States", canvas.width / 2, canvas.height / 2 + 150, 150, 50, "states");
    // button("Stat", canvas.width / 2, canvas.height / 2 + 150, 150, 50, "resetSession")
}

let levelSelector = function(level) {
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // back button
    const bx = 30, by = 20, bw = 80, bh = 30;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(80, 120, 255, 0.3)" : "rgba(30, 50, 120, 0.4)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.strokeStyle = bHover ? "rgba(120, 160, 255, 0.9)" : "rgba(80, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(180, 210, 255)" : "rgb(120, 160, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("← BACK", bx + bw / 2, by + bh / 2);
    ctx.shadowBlur = 0;

    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        resetGame();
        scene = "menu";
        clickX = -1; clickY = -1;
        selectedLevel = 0;
    }

    // level preview
    let levelPrev = function(levelNum, x, y, locked) {
        // shake offset
        let ox = 0;
        if (shakeLevel === levelNum && shakeTimer > 0) {
            shakeTimer--;
            ox = Math.sin(shakeTimer * 1.8) * 5;
        }
        x += ox; // shift everything by the offset
        const isHover = mouseX > x && mouseX < x + 100 && mouseY > y && mouseY < y + 100;
        
        // outer glow background (brighter on hover)
        ctx.shadowColor = isHover ? "rgba(100, 255, 200, 0.9)" : "rgba(60, 255, 150, 0.6)";
        ctx.shadowBlur = isHover ? 30 : 20;
        ctx.fillStyle = isHover ? "rgba(20, 50, 100, 0.95)" : "rgba(15, 35, 80, 0.8)";
        ctx.fillRect(x - 2, y - 2, 104, 104);
        
        // main tile background with gradient (brighter on hover)
        const grad = ctx.createLinearGradient(x, y, x + 100, y + 100);
        if (isHover) {
            grad.addColorStop(0, "rgba(120, 180, 255, 0.6)");
            grad.addColorStop(1, "rgba(100, 150, 220, 0.8)");
        } else {
            grad.addColorStop(0, "rgba(80, 140, 200, 0.4)");
            grad.addColorStop(1, "rgba(60, 100, 160, 0.6)");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, 100, 100);

        // glowing border (thicker on hover)
        ctx.shadowColor = isHover ? "rgba(150, 255, 200, 0.9)" : "rgba(100, 200, 255, 0.8)";
        ctx.shadowBlur = isHover ? 18 : 10;
        ctx.strokeStyle = isHover ? "rgba(150, 255, 200, 0.95)" : "rgba(120, 180, 255, 0.7)";
        ctx.lineWidth = isHover ? 3 : 2;
        ctx.strokeRect(x, y, 100, 100);
        ctx.shadowBlur = 0;

        // inner dark panel
        ctx.fillStyle = isHover ? "rgba(15, 30, 70, 0.95)" : "rgba(10, 20, 50, 0.9)";
        ctx.fillRect(x + 15, y + 15, 70, 70);

        // inner border
        ctx.strokeStyle = isHover ? "rgba(120, 180, 255, 0.7)" : "rgba(80, 140, 200, 0.5)";
        ctx.lineWidth = isHover ? 1.5 : 1;
        ctx.strokeRect(x + 15, y + 15, 70, 70);

        // glowing text (brighter on hover)
        ctx.shadowColor = isHover ? "rgba(200, 255, 255, 0.95)" : "rgba(100, 200, 255, 0.9)";
        ctx.shadowBlur = isHover ? 16 : 12;
        ctx.fillStyle = isHover ? "rgb(200, 255, 255)" : "rgb(180, 220, 255)";
        ctx.font = isHover ? "bold 44px 'Courier New'" : "bold 40px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(" " + levelNum + " ", x + 50, y + 50);
        ctx.shadowBlur = 0;

        if (locked) {
            // dark overlay
            ctx.fillStyle = "rgba(5, 8, 20, 0.75)";
            ctx.fillRect(x, y, 100, 100);

            // lock body
            const lx = x + 50, ly = y + 50;
            ctx.fillStyle = "rgba(80, 100, 160, 0.9)";
            ctx.beginPath();
            ctx.roundRect(lx - 12, ly - 4, 24, 20, 4);
            ctx.fill();

            ctx.strokeStyle = "rgba(120, 150, 220, 0.8)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(lx - 12, ly - 4, 24, 20, 4);
            ctx.stroke();

            // lock shackle
            ctx.strokeStyle = "rgba(120, 150, 220, 0.8)";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.arc(lx, ly - 4, 8, Math.PI, 0);
            ctx.stroke();

            // keyhole
            ctx.fillStyle = "rgba(5, 8, 20, 0.9)";
            ctx.beginPath();
            ctx.arc(lx, ly + 4, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(lx - 2, ly + 4, 4, 6);
        }

        // Click detection
        if (clickX > x && clickX < x + 100 && clickY > y && clickY < y + 100) {
            if (locked) {
                shakeLevel = levelNum;
                shakeTimer = 20; // frames to shake

                const osc = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                osc.connect(g); g.connect(audioCtx.destination);
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(80, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
                g.gain.setValueAtTime(0.3, audioCtx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                osc.start(); osc.stop(audioCtx.currentTime + 0.15);

                clickX = -1; clickY = -1;
                return;
            }
            resetGame();
            selectedLevel = levelNum;
            console.log("Level " + levelNum + " selected!");
            scene = "game"; // transition to game with selected level
            clickX = -1;
            clickY = -1;
        }
    }

    for (let row = 0; row < Math.ceil(levelCount / 5); row++) {
        for (let i = 0; i < 5 && (row * 5 + i) < levelCount; i++) {
            const levelNum = row * 5 + i + 1;
            levelPrev(levelNum, 100 + (i * 130), 80 + (row * 120), levelNum > unlockedUpTo);
        }
    }
}

let displayLevelNum = function(x, y) {
    ctx.fillStyle = "rgba(15, 25, 60, 0.6)";
    ctx.fillRect(x, y, 120, 34);

    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 120, 34);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(120, 180, 255, 0.6)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "rgb(140, 180, 255)";
    ctx.font = "12px 'Courier New'";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("LVL  " + selectedLevel, x + 12, y + 17);
    ctx.shadowBlur = 0;
}

let playerHealth = 3;
const MAX_HEALTH = 3;

heartAnimations = []; // track per-heart animations

function loseHeart() {
    const lostIndex = playerHealth; // index of heart just lost (already decremented)
    heartAnimations[lostIndex] = { shake: 8, flash: 1.0 }; // shake frames, flash opacity
}

function drawHeart(cx, cy, size, filled, anim) {
    // apply shake offset
    let ox = 0;
    if (anim && anim.shake > 0) {
        ox = Math.sin(anim.shake * 2.2) * 4;
        anim.shake -= 1;
    }
    // flash alpha override for the moment of loss
    let flashAlpha = 1;
    if (anim && anim.flash > 0) {
        flashAlpha = anim.flash;
        anim.flash = Math.max(0, anim.flash - 0.04); // fade over ~25 frames
    }

    ctx.save();
    ctx.translate(ox, 0);
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.3);
    ctx.bezierCurveTo(cx, cy, cx - size * 0.5, cy, cx - size * 0.5, cy - size * 0.25);
    ctx.bezierCurveTo(cx - size * 0.5, cy - size * 0.6, cx, cy - size * 0.6, cx, cy - size * 0.25);
    ctx.bezierCurveTo(cx, cy - size * 0.6, cx + size * 0.5, cy - size * 0.6, cx + size * 0.5, cy - size * 0.25);
    ctx.bezierCurveTo(cx + size * 0.5, cy, cx, cy, cx, cy + size * 0.3);
    ctx.closePath();

    if (filled) {
        ctx.fillStyle = `rgba(255, 80, 120, ${flashAlpha})`;
        ctx.shadowColor = `rgba(255, 80, 120, ${0.8 * flashAlpha})`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255, 120, 150, ${0.9 * flashAlpha})`;
    } else {
        // just-lost heart: briefly flashes white then settles to empty
        if (anim && anim.flash > 0) {
            ctx.fillStyle = `rgba(255, 200, 220, ${anim.flash * 0.6})`;
        } else {
            ctx.fillStyle = "rgba(255, 80, 120, 0.12)";
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 80, 120, 0.3)";
    }

    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function healthScreen(x, y) {
    const w = 120, h = 34;

    ctx.fillStyle = "rgba(15, 25, 60, 0.6)";
    ctx.fillRect(x, y, w, h);

    ctx.shadowColor = "rgba(255, 80, 120, 0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(255, 80, 120, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    const heartSize = 10;
    const spacing = 30;
    const startX = x + 22;
    const cy = y + h / 2;

    for (let i = 0; i < MAX_HEALTH; i++) {
        drawHeart(startX + i * spacing, cy, heartSize, i < playerHealth, heartAnimations[i]);
    }
}

let gameOver = false;

function gameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 200, cy - 80, 400, 180);

    ctx.shadowColor = "rgba(255, 80, 120, 0.6)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(255, 80, 120, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 200, cy - 80, 400, 180);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 100, 140, 0.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgb(255, 100, 140)";
    ctx.font = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MISSION FAILED", cx, cy - 30);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
    ctx.font = "13px 'Courier New'";
    ctx.fillText("SCORE  " + points + "  PTS", cx, cy + 10);

    ctx.strokeStyle = "rgba(255, 80, 120, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 32);
    ctx.lineTo(cx + 120, cy + 32);
    ctx.stroke();

    const bx = cx - 100, by = cy + 48, bw = 200, bh = 36;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(60, 100, 220, 0.4)" : "rgba(15, 25, 80, 0.6)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.shadowColor = bHover ? "rgba(100, 160, 255, 0.9)" : "rgba(60, 100, 200, 0.4)";
    ctx.shadowBlur = bHover ? 12 : 5;
    ctx.strokeStyle = bHover ? "rgba(140, 190, 255, 0.9)" : "rgba(60, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;

    ctx.fillStyle = bHover ? "rgb(200, 225, 255)" : "rgb(120, 170, 255)";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("TRY AGAIN", cx, by + 18);

    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        gameOver = false;
        playerHealth = MAX_HEALTH;
        heartAnimations = [];
        resetGame();
        // stay on same level
        selectedLevel = selectedLevel;
        clickX = -1; clickY = -1;
    }
}


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

// call this once per level, before the game starts
let howToShown = false;
let howToTimer = 0;
const HOW_TO_DURATION = 180; // frames (~3 seconds at 60fps)

function howTo() {
    if (howToShown) return;

    howToTimer++;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const msg = LEVEL_HOWTO[selectedLevel] || "";

    // fade out in last 30 frames
    const alpha = howToTimer > HOW_TO_DURATION - 30
        ? (HOW_TO_DURATION - howToTimer) / 30
        : 1;

    // overlay
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.95)";
    ctx.fillRect(cx - 220, cy - 70, 440, 140);
    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 220, cy - 70, 440, 140);
    ctx.shadowBlur = 0;

    // level label
    ctx.fillStyle = "rgba(100, 150, 255, 0.7)";
    ctx.font = "11px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LEVEL  " + selectedLevel, cx, cy - 38);

    // divider
    ctx.strokeStyle = "rgba(80, 140, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy - 20);
    ctx.lineTo(cx + 140, cy - 20);
    ctx.stroke();

    // message
    ctx.shadowColor = "rgba(120, 180, 255, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgb(180, 215, 255)";
    ctx.font = "bold 15px 'Courier New'";
    ctx.fillText(msg, cx, cy + 10);
    ctx.shadowBlur = 0;

     // "Got It" button
    const bx = cx - 70, by = cy + 30, bw = 140, bh = 36;
    const bHover = mouseX > bx && mouseX < bx + bw &&
                   mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(60, 100, 220, 0.5)" : "rgba(15, 25, 80, 0.7)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.shadowColor = bHover ? "rgba(100, 160, 255, 0.9)" : "rgba(60, 100, 200, 0.4)";
    ctx.shadowBlur = bHover ? 12 : 5;
    ctx.strokeStyle = bHover ? "rgba(140, 190, 255, 0.9)" : "rgba(60, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;

    ctx.shadowColor = bHover ? "rgba(160, 210, 255, 0.9)" : "rgba(100, 160, 255, 0.5)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(200, 225, 255)" : "rgb(120, 170, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.fillText("GOT IT", cx, by + 18);
    ctx.shadowBlur = 0;

    ctx.restore();

    // click detection
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        howToShown = true;
        clickX = -1;
        clickY = -1;
    }
}


let createLevel = function() {
    if (gameOver) {
        gameOverScreen();
        return;
    }
    if (!howToShown) {
        howTo()
        return;
    }
    if (tiles.length === 0) {
        console.log("Initializing game for level " + selectedLevel + "...");
        initGame();
    }

    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // DEBUG: Show current grid info
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "14px 'Courier New'";
    ctx.textAlign = "left";
    // ctx.fillText("Level: " + selectedLevel + " | Grid: " + rows + "x" + columns, 200, 80);
    // stars
    for (let i = 0; i < 130; i++) {
        const sx = (i * 137.508) % canvas.width;
        const sy = (i * 97.333) % canvas.height;
        const size = i % 5 === 0 ? 1.5 : 0.7;
        const brightness = 0.3 + (i % 7) * 0.1;
        ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }
    // nebula glow patches
    ctx.save();
    const nebula1 = ctx.createRadialGradient(200, 300, 0, 200, 300, 180);
    nebula1.addColorStop(0, "rgba(80, 40, 160, 0.12)");
    nebula1.addColorStop(1, "rgba(80, 40, 160, 0)");
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const nebula2 = ctx.createRadialGradient(600, 200, 0, 600, 200, 200);
    nebula2.addColorStop(0, "rgba(20, 80, 160, 0.1)");
    nebula2.addColorStop(1, "rgba(20, 80, 160, 0)");
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // back button
    const bx = 30, by = 20, bw = 80, bh = 30;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    ctx.fillStyle = bHover ? "rgba(80, 120, 255, 0.3)" : "rgba(30, 50, 120, 0.4)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = bHover ? "rgba(120, 160, 255, 0.9)" : "rgba(80, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(180, 210, 255)" : "rgb(120, 160, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("← BACK", bx + bw / 2, by + bh / 2);
    ctx.shadowBlur = 0;
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        // resetGame()
        scene = "menu";
        selectedLevel = 0;
        clickX = -1; clickY = -1;
        console.log("menu")
    }

    numberToSolveScreen(canvas.width/2 - 50, canvas.height/2 - 230, mathQuestion);
    // console.log("mathQuestion: " + mathQuestion + ", numToSolve: " + numToSolve);
    pointsScreen(canvas.width/2 - 190, canvas.height/2 - 230);
    resultScreen(canvas.width/2 - 50, canvas.height/2 - 170, resultText);
    // let allSymbols = squares.filter(sq => sq.exist).map(sq => sq.symbol);
    displayLevelNum(canvas.width/2 - 190, canvas.height/2 - 170)
    healthScreen(canvas.width/2 + 110, canvas.height/2 - 230);
    timerScreen(canvas.width/2 + 110, canvas.height/2 - 170);
    // let numbers = allSymbols.filter(sym => typeof sym === "number");

    // apply blur to everything drawn after this point if game is won
    let output = ""
    for (let sq of tiles) {
        if (sq.exist) {
            ctx.fillStyle = "rgb(143, 198, 145)";
            mathSquare(sq.x, sq.y, 50, 50, sq.symbol, sq.type, sq.hitsLeft);
        }
    }
    // if points = number of symbols, then display winning screen
    // console.log("numbers left: " + numbers.length);
    // Win condition: no more tiles
    updateComboParticles();

    if (!tiles.some(t => t.exist)) {
        winningScreen();
    }

    if (!tiles.some(t => t.exist)) {
        console.log("No more tiles left, you win!");
        winningScreen();
    }
}

let runGame = function() {
    if (selectedLevel == 0) {
        levelSelector()
    }

    if (selectedLevel >= 1) {
        createLevel();
    }
}

function timerScreen(x, y) {
    ctx.fillStyle = "rgba(15, 25, 60, 0.6)";
    ctx.fillRect(x, y, 120, 34);

    const warning = timerSeconds <= 10;

    ctx.shadowColor = warning ? "rgba(255, 80, 80, 0.7)" : "rgba(255, 200, 80, 0.5)";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = warning ? "rgba(255, 80, 80, 0.6)" : "rgba(255, 200, 80, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 120, 34);
    ctx.shadowBlur = 0;

    ctx.shadowColor = warning ? "rgba(255, 100, 100, 0.9)" : "rgba(255, 210, 100, 0.7)";
    ctx.shadowBlur = warning ? 8 : 4;
    ctx.fillStyle = warning ? "rgb(255, 100, 100)" : "rgb(255, 210, 100)";
    ctx.font = "12px 'Courier New'";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("TIME  " + timerSeconds + "s", x + 12, y + 17);
    ctx.shadowBlur = 0;
}

// because the game runs the functions in the game loop many times, we want to run this code only when the game is initialized, 
// so that the number to solve doesn't change every frame.
let questionIdx = 0;
function createNumberToSolve() {
    const activeTiles = tiles.filter(t => t.exist);
    if (activeTiles.length === 0) return;

    // Pick a random currently-visible tile and ask for its current symbol
    const tile = activeTiles[Math.floor(Math.random() * activeTiles.length)];

    // Find which hit we're on for this tile
    const hitIdx = tile.hitsRequired - tile.hitsLeft;
    const q = tile.questions[hitIdx];

    mathQuestion = q.question;
    mathAnswer   = tile.symbol; // always matches what's displayed
}


let tiles = []
let prompts = []

// states for the player
let tilesClicked = 0

function initGame() {
    tiles = [];
    createMathQuestions(selectedLevel);

    const TILE_SIZE = 50;
    const SPACING_X = 80;
    const SPACING_Y = 80;

    const GRID_WIDTH  = (columns - 1) * SPACING_X + TILE_SIZE;
    const GRID_HEIGHT = (rows - 1) * SPACING_Y + TILE_SIZE;

    // Remaining space after top UI
    const availableTop    = TOP_UI_HEIGHT + GRID_MARGIN;
    const availableHeight = canvas.height - availableTop;

    // Vertically center the grid in the bottom area
    const gridStartY = availableTop + (availableHeight - GRID_HEIGHT) / 2;

    // Horizontally center the grid on the canvas
    const startX = (canvas.width - GRID_WIDTH) / 2;
    const startY = gridStartY;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const q = mathQuestions[i * columns + j];
            tiles.push({
                x: startX + j * SPACING_X,
                y: startY + i * SPACING_Y,
                symbol: q.questions[0].answer,   // shows current hit's answer
                exist: true,
                type: q.type,
                hitsRequired: q.hitsRequired,
                hitsLeft: q.hitsRequired,
                questions: q.questions           // full list of questions for this tile
            });

            createNumberToSolve()
        }
    }

    prompts = prompts.sort(() => Math.random() - 0.5);
    questionIdx = 0;
    createNumberToSolve();

    clearInterval(timerInterval);
    timerSeconds = timeForLevel;
    timerInterval = setInterval(() => {
        if (!gameOver) {
            timerSeconds--;
            if (timerSeconds <= 0) {
                timerSeconds = 0;
                clearInterval(timerInterval);
                gameOver = true;
            }
        }
    }, 1000);
}

async function saveGame() {
    console.log(tilesClicked)
    const user = auth.currentUser;
    if (!user) {
        // fallback to localStorage if not logged in
        localStorage.setItem(SAVE_KEY, JSON.stringify({ unlockedUpTo, tilesClicked}));
        return;
    }
    try {
        await db.collection("users").doc(user.uid).update({
            unlockedUpTo: unlockedUpTo,
            tilesClicked: tilesClicked
        });
        console.log("Game saved to Firebase.");
    } catch (e) {
        console.warn("Firebase save failed, falling back to localStorage.", e);
        localStorage.setItem(SAVE_KEY, JSON.stringify({ unlockedUpTo }));
    }
}

async function readGame() {
    const user = auth.currentUser;
    if (!user) {
        // fallback to localStorage
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            if (data.unlockedUpTo) unlockedUpTo = data.unlockedUpTo;
            if (data.tilesClicked) tilesClicked = data.tilesClicked
        } catch (e) {
            localStorage.removeItem(SAVE_KEY);
        }
        return;
    }
    try {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.unlockedUpTo) unlockedUpTo = data.unlockedUpTo;
            if (data.tilesClicked) tilesClicked = data.tilesClicked
        }
    } catch (e) {
        console.warn("Firebase read failed.", e);
    }
}

console.log(unlockedUpTo)

function resetSession() {
    unlockedUpTo = 1;
    selectedLevel = 0;
    localStorage.removeItem(SAVE_KEY);
}

function userProfileCard(username, password, x, y, w, h) {
    const bx = x - w / 2, by = y - h / 2;

    ctx.save();

    // shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    // card background
    ctx.fillStyle = "#E9E9E9";
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 28);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // border
    ctx.strokeStyle = "#173540";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 28);
    ctx.stroke();

    // avatar circle
    const r = Math.min(h * 0.28, 60);
    const cx = bx + 95;
    const cy = by + h / 2;

    ctx.fillStyle = "#1F6A8A";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#173540";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // text styles
    ctx.fillStyle = "#111";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "20px Arial";

    // password label
    ctx.fillText("Password:", bx + 170, by + h / 2 - 18);

    // username
    ctx.font = "24px Arial";
    ctx.fillText(username || "Username", bx + 170, by + h / 2 + 20);

    // optional password display beneath
    if (password !== undefined && password !== null) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(password, bx + 170, by + h / 2 + 48);
    }

    ctx.restore();
}

function runStates() {
    // background
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    for (let i = 0; i < 130; i++) {
        const sx = (i * 137.508) % canvas.width;
        const sy = (i * 97.333) % canvas.height;
        const size = i % 5 === 0 ? 1.5 : 0.7;
        const brightness = 0.3 + (i % 7) * 0.1;
        ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // back button
    const bx = 30, by = 20, bw = 80, bh = 30;
    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    ctx.fillStyle = bHover ? "rgba(80, 120, 255, 0.3)" : "rgba(30, 50, 120, 0.4)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = bHover ? "rgba(120, 160, 255, 0.9)" : "rgba(80, 100, 200, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
    ctx.shadowBlur = bHover ? 10 : 4;
    ctx.fillStyle = bHover ? "rgb(180, 210, 255)" : "rgb(120, 160, 255)";
    ctx.font = "13px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("← BACK", bx + bw / 2, by + bh / 2);
    ctx.shadowBlur = 0;
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        scene = "menu";
        clickX = -1; clickY = -1;
        return;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 200, cy - 120, 400, 240);
    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 200, cy - 120, 400, 240);
    ctx.shadowBlur = 0;

    // title
    ctx.fillStyle = "rgb(180, 215, 255)";
    ctx.font = "bold 26px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("STATS", cx, cy - 80);

    // divider
    ctx.strokeStyle = "rgba(80, 140, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy - 55);
    ctx.lineTo(cx + 150, cy - 55);
    ctx.stroke();

    // tiles clicked stat
    ctx.fillStyle = "rgba(100, 150, 255, 0.6)";
    ctx.font = "11px 'Courier New'";
    ctx.fillText("TILES CLICKED", cx, cy - 20);

    ctx.shadowColor = "rgba(80, 255, 160, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgb(80, 255, 160)";
    ctx.font = "bold 48px 'Courier New'";
    ctx.fillText(tilesClicked, cx, cy + 30);
    ctx.shadowBlur = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (scene === "hub") {
        scene = "redirecting";
        window.location.href = "../TechLab_Hub/home.html";
    }
    if (scene === "menu") {
        menu();
    }
    if (scene === "levelSelect" || scene === "game") {
        runGame();
    }
    if (scene === "how") {
        runHow()
    }
    if (scene === "saveGame") {
        saveGame()
        menu()
    }
    if (scene === "states") {
        runStates();
    }
    if (scene === "resetSession") {
        resetSession()
        menu()
    }
    requestAnimationFrame(gameLoop);
}

waitForAuth().then(() => readGame()).then(() => gameLoop());