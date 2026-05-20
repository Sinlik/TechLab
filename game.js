const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scene = "menu"; // "menu", "game", "how"

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
let numToSolve = 0;
// checking how many math buttons where clicked (within certain rules)
let symbolsClicked = 0;

canvas.addEventListener('mousemove', function(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    clickX = event.clientX - rect.left;
    clickY = event.clientY - rect.top;
});

function randomSymbol() {
    let all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "+", "-", "*"];
    return all[Math.floor(Math.random() * all.length)];
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

// make winning screen

let winningScreen = function() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // first check if no more symbols are left, then display winning screen
    ctx.fillStyle = "rgb(21, 255, 0)";
    ctx.fillRect(canvas.width/2 - 160, canvas.height/2 - 50, 320, 100);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("You win! Final points: " + points, canvas.width/2, canvas.height/2 + 10);
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

    if (symbolsClicked == 3) {
        isCorrect = (resultText == numToSolve);
        resultBgColor = isCorrect ? "rgb(21, 255, 0)" : "rgb(255, 0, 0)";
    }
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
    const isClicked = clickedSquares.some(c => c.x === x && c.y === y);

    // tile base color
    let baseColor = isOp ? "rgba(180, 120, 255, 0.15)" : "rgba(30, 60, 120, 0.6)";
    if (isHover) baseColor = isOp ? "rgba(180, 120, 255, 0.35)" : "rgba(60, 100, 200, 0.75)";
    if (isClicked) baseColor = isOp ? "rgba(200, 140, 255, 0.45)" : "rgba(80, 140, 255, 0.6)";

    // tile fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, width, height);

    // glowing border
    if (isClicked) {
        ctx.shadowColor = isOp ? "rgba(200, 140, 255, 0.9)" : "rgba(80, 180, 255, 0.9)";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = isOp ? "rgba(200, 140, 255, 0.9)" : "rgba(80, 180, 255, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, width, height);
        ctx.shadowBlur = 0;
    } else if (isHover) {
        ctx.strokeStyle = isOp ? "rgba(180, 120, 255, 0.6)" : "rgba(80, 140, 255, 0.6)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    } else {
        ctx.strokeStyle = isOp ? "rgba(140, 80, 220, 0.3)" : "rgba(40, 80, 160, 0.4)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, width, height);
    }

    // click handling (unchanged logic)
    if (clickX > x && clickX < x + width && clickY > y && clickY < y + height) {
        if (symbolsClicked == 3) {
            resultText = "";
            symbolsClicked = 0;
            showResult = false;
        }
        if (typeof symbol === "number" && symbolsClicked == 0 ||
            symbolsClicked == 1 && typeof symbol === "string" ||
            symbolsClicked == 2 && typeof symbol === "number") {
            if (typeof symbol === "string") {
                clickedSquares.push({x, y, width, height, exist: true});
            } else {
                clickedSquares.push({x, y, width, height, exist: false});
            }
            resultText += " " + symbol;
            symbolsClicked++;
        }
        if (symbolsClicked == 3) {
            resultText = eval(resultText);
            isCorrect = (resultText == numToSolve);
        }
        clickX = -1;
        clickY = -1;
    }

    if (isCorrect && symbolsClicked == 3 && !resetting) {
        resetting = true;
        setTimeout(() => {
            clickedSquares = [];
            resultText = "";
            resultBgColor = "rgb(65, 115, 138)";
            isCorrect = false;
            points += 1;
            symbolsClicked = 0;
            resetting = false;
            if (squares.some(sq => sq.exist)) createNumberToSolve();
        }, 500);
    }
    if (!isCorrect && symbolsClicked == 3) {
        setTimeout(() => {
            resultText = "";
            resultBgColor = "rgb(65, 115, 138)";
            symbolsClicked = 0;
        }, 500);
    }
    if (symbolsClicked == 3) {
        if (isCorrect) {
            for (let sq of squares) {
                if (clickedSquares.some(c => c.x === sq.x && c.y === sq.y) && typeof sq.symbol === "number") {
                    sq.exist = false;
                }
            }
        }
        if (!isCorrect && symbolsClicked == 3) clickedSquares = [];
    }

    // symbol text with glow
    ctx.shadowColor = isOp ? "rgba(200, 140, 255, 0.8)" : "rgba(120, 180, 255, 0.6)";
    ctx.shadowBlur = isClicked ? 8 : 3;
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
    button("Start", canvas.width/ 2, canvas.height / 2 - 75, 150, 50, "game");
    button("How", canvas.width / 2, canvas.height / 2, 150, 50, "menu");
}

let runGame = function() {
    if (squares.length === 0) {
        initGame();
    }
    // background for game area
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        scene = "menu";
        clickX = -1; clickY = -1;
    }

    numberToSolveScreen(canvas.width/2 - 50, canvas.height/2 - 230, numToSolve);
    pointsScreen(canvas.width/2 - 190, canvas.height/2 - 230);
    resultScreen(canvas.width/2 - 50, canvas.height/2 - 170, resultText);

    let allSymbols = squares.filter(sq => sq.exist).map(sq => sq.symbol);
    let numbers = allSymbols.filter(sym => typeof sym === "number");
    // apply blur to everything drawn after this point if game is won
    if (numbers.length <= 2) {
        ctx.filter = "blur(4px)";
    }

    let output = ""
    for (let sq of squares) {
        if (sq.exist) {
            ctx.fillStyle = "rgb(143, 198, 145)";
            mathSquare(sq.x, sq.y, 50, 50, sq.symbol);
        }
    }
    // if points = number of symbols, then display winning screen
    console.log("numbers left: " + numbers.length);
    if (numbers.length <= 2) {
        console.log("No more symbols left, you win!");
        ctx.filter = "none";
        winningScreen();
    }
}
// because the game runs the functions in the game loop many times, we want to run this code only when the game is initialized, 
// so that the number to solve doesn't change every frame.
function createNumberToSolve() {
    let allSymbols = squares.filter(sq => sq.exist).map(sq => sq.symbol);
    let numbers = allSymbols.filter(sym => typeof sym === "number");
    let operators = allSymbols.filter(sym => typeof sym === "string");

    console.log("operators.length: " + operators.length + ", numbers.length: " + numbers.length);
    if (operators.length > 0) {
        let num1 = numbers[Math.floor(Math.random() * numbers.length)];
        let num2 = numbers[Math.floor(Math.random() * numbers.length)];
        let operator = operators[Math.floor(Math.random() * operators.length)];
        numToSolve = Math.round(eval(num1 + " " + operator + " " + num2));
        console.log("can solve number: " + numToSolve + " with: " + num1 + " " + operator + " " + num2);
    }
}

function initGame() {
    let rows = 5;
    let columns = 4;
    let totalCells = rows * columns;
    let numOperators = Math.round(totalCells * 0.15);
    let symbols = [];

    let operatorPool = ["+", "-", "*"];
    for (let i = 0; i < numOperators; i++) {
        symbols.push(operatorPool[i % operatorPool.length]);
    }

    if (isCorrect) {
        points += 1;
    }
    if (points == 0) {
        while (symbols.length < totalCells) {
            let s = randomSymbol();
            if (typeof s === "number") symbols.push(s); // only add numbers to fill remaining slots
        }
        symbols.sort(() => Math.random() - 0.5); // shuffle

        let idx = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                squares.push({x: 300 + j * 60, y: 220 + i * 60, symbol: symbols[idx++], exist: true});
            }
        }
    }
    createNumberToSolve();  // ← call the renamed function
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (scene === "menu") {
        menu();
    }
    if (scene === "game") {
        runGame();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();