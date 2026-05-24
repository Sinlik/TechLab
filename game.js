const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scene = "menu"; // "menu", "game", "how"
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let text = function(string, x, y, px) {
    let text = string;
    ctx.fillStyle = "black";
    ctx.font = px + "px Arial";
    textAlign = "center";
    ctx.fillText(text, x, y);
}

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

let rows = 1;
let columns = 2;
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

canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    clickX = event.clientX - rect.left;
    clickY = event.clientY - rect.top;

    if (scene !== "game" || resetting) return;

    for (let sq of squares) {
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

            if (isCorrect) {
                resultBgColor = "rgb(21, 255, 0)";
                playCorrectSound();
                setTimeout(() => {
                    sq.exist = false;
                    points += 1;
                    resultBgColor = "rgb(65, 115, 138)";
                    isCorrect = false;
                    resetting = false;
                    if (squares.some(s => s.exist)) createNumberToSolve();
                }, 500);
            } else {
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

function createMathQuestions(level = 1) {
    // Determine difficulty and grid size from level
    let difficulty = "easy";
    if (level >= 8 && level <= 14) difficulty = "normal";
    else if (level >= 15) difficulty = "hard";

    // Set rows/columns based on difficulty
    if (difficulty === "easy") {
        rows = 1;
        columns = 2;
    } else if (difficulty === "normal") {
        rows = 3;
        columns = 3;
    } else { // hard
        rows = 5;
        columns = 5;
    }
    
    console.log("Level " + level + " (" + difficulty + "): " + rows + "x" + columns);
    
    let totalCells = rows * columns;
    mathQuestions = [];


    for (let i = 0; i < totalCells; i++) {
        let numbers, operators;
        
        if (difficulty === "easy") {
            numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            operators = ["+", "-"];
        } else if (difficulty === "normal") {
            numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20];
            operators = ["+", "-", "*"];
        } else { // hard
            numbers = [5, 10, 15, 20, 25, 30, 50, 100];
            operators = ["+", "-", "*"];
        }
        
        const num1 = numbers[Math.floor(Math.random() * numbers.length)];
        const num2 = numbers[Math.floor(Math.random() * numbers.length)];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let question = `${num1} ${operator} ${num2} = ?`;
        let answer = eval(num1 + " " + operator + " " + num2);
        console.log("Generated math question (" + difficulty + "): " + question);
        mathQuestions.push({ question, answer });
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
    squares = [];
    points = 0;
    questionIdx = 0;
    mathQuestion = "";
    mathAnswer = 0;
    isCorrect = false;
    resetting = false;
    resultBgColor = "rgb(65, 115, 138)";
    mathQuestions = [];
}

// make winning screen
let winningScreen = function() {
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
        resetGame();
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
let mathSquare = function(x, y, width, height, symbol) {
    const isOp = typeof symbol === "string";
    const isHover = mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;

    // tile base color
    let baseColor = isOp ? "rgba(180, 120, 255, 0.15)" : "rgba(30, 60, 120, 0.6)";
    if (isHover) baseColor = isOp ? "rgba(180, 120, 255, 0.35)" : "rgba(60, 100, 200, 0.75)";

    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, width, height);

    // border
    if (isHover) {
        ctx.shadowColor = isOp ? "rgba(180, 120, 255, 0.6)" : "rgba(80, 140, 255, 0.6)";
        ctx.shadowBlur = 6;
        ctx.strokeStyle = isOp ? "rgba(180, 120, 255, 0.6)" : "rgba(80, 140, 255, 0.6)";
        ctx.lineWidth = 1;
    } else {
        ctx.strokeStyle = isOp ? "rgba(140, 80, 220, 0.3)" : "rgba(40, 80, 160, 0.4)";
        ctx.lineWidth = 0.5;
    }
    ctx.strokeRect(x, y, width, height);
    ctx.shadowBlur = 0;

    // symbol text
    ctx.shadowColor = isOp ? "rgba(200, 140, 255, 0.8)" : "rgba(120, 180, 255, 0.6)";
    ctx.shadowBlur = 3;
    ctx.fillStyle = isOp ? "rgb(220, 170, 255)" : "rgb(160, 200, 255)";
    ctx.font = isOp ? "bold 30px 'Courier New'" : "30px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, x + width / 2, y + height / 2);
    ctx.shadowBlur = 0;
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
        button("Start", canvas.width/ 2, canvas.height / 2 - 75, 150, 50, "levelSelect");
        button("How", canvas.width / 2, canvas.height / 2, 150, 50, "menu");
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
    let levelPrev = function(levelNum, x, y) {
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

        // Click detection
        if (clickX > x && clickX < x + 100 && clickY > y && clickY < y + 100) {
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
            // console.log("levelNum: " + levelNum);
            levelPrev(levelNum, 100 + (i * 130), 80 + (row * 120));
        }
    }
}

let createLevel = function() {
    if (squares.length === 0) {
        console.log("Initializing game for level " + selectedLevel + "...");
        resetGame();
        initGame();
    }
    
    // background for game area
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // DEBUG: Show current grid info
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "14px 'Courier New'";
    ctx.textAlign = "left";
    // ctx.fillText("Level: " + selectedLevel + " | Grid: " + rows + "x" + columns, 200, 80);
    // stars
    for (let i = 0; i < 120; i++) {
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
        resetGame()
        scene = "menu";
        selectedLevel = 0;
        clickX = -1; clickY = -1;
        console.log("menu")
    }
    numberToSolveScreen(canvas.width/2 - 50, canvas.height/2 - 230, mathQuestion);
    // console.log("mathQuestion: " + mathQuestion + ", numToSolve: " + numToSolve);
    pointsScreen(canvas.width/2 - 190, canvas.height/2 - 230);
    resultScreen(canvas.width/2 - 50, canvas.height/2 - 170, resultText);
    let allSymbols = squares.filter(sq => sq.exist).map(sq => sq.symbol);
    let numbers = allSymbols.filter(sym => typeof sym === "number");
    // console.log("numbers.length: " + numbers.length)
    // apply blur to everything drawn after this point if game is won
    let output = ""
    for (let sq of squares) {
        if (sq.exist) {
            ctx.fillStyle = "rgb(143, 198, 145)";
            mathSquare(sq.x, sq.y, 50, 50, sq.symbol);
        }
    }
    // if points = number of symbols, then display winning screen
    // console.log("numbers left: " + numbers.length);
    if (numbers.length == 0) {
        ctx.filter = "blur(4px)";
        console.log("No more symbols left, you win!");
        ctx.filter = "none";
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
// because the game runs the functions in the game loop many times, we want to run this code only when the game is initialized, 
// so that the number to solve doesn't change every frame.
let questionIdx = 0;
function createNumberToSolve() {
    if (questionIdx < mathQuestions.length) {
        mathQuestion = mathQuestions[questionIdx].question;
        mathAnswer = mathQuestions[questionIdx].answer;
        questionIdx++;
    } else {
        console.warn("No more questions available!");
        mathQuestion = "Complete!";
        mathAnswer = 0;
    }
}

function initGame() {
    let idx = 0;
    questionIdx = 0;
    // Reset and create questions based on selected level
    createMathQuestions(selectedLevel);
    console.log("rows: " + rows, " columns: " + columns)

    // collect answers and shuffle them
    let answers = mathQuestions.map(q => q.answer);
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    // Create grid with proper spacing

    // Set positioning based on grid size
    let startX, startY;
    
    if (rows === 1 && columns === 2) {
        startX = 350;
        startY = 200;
    } else if (rows === 3 && columns === 3) {
        startX = 300;
        startY = 200;
    } else if (rows === 5 && columns === 5) {
        startX = 230;
        startY = 200;
    }
    const spacingX = 80;
    const spacingY = 80;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            squares.push({ 
                x: startX + j * spacingX, 
                y: startY + i * spacingY, 
                symbol: answers[idx], 
                exist: true 
            });
            idx++;
        }
    }
    createNumberToSolve();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (scene === "menu") {
        menu();
    }
    if (scene === "levelSelect" || scene === "game") {
        runGame();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();