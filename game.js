const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scene = "game"; // "menu", "game", "how"

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
// number that needs to be solved
let numberToSolve = 0;
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

let points = 0;
let pointsScreen = function(x, y) {
    ctx.fillStyle = "rgb(65, 115, 138)";
    ctx.fillRect(x, y, 100, 30);
    ctx.fillStyle = "rgb(113, 41, 41)";
    ctx.fillText("Points: " + points, x + 13, y + 15);
}
// function to display the number to solve at the top of the game screen
let numberToSolveScreen = function(x, y, num) {
    ctx.fillStyle = "rgb(65, 115, 138)";
    ctx.fillRect(x, y, 100, 30);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Find: " + num, x + 13, y + 15);
}

// global text for result screen
let resultBgColor = "rgb(65, 115, 138)";
let isCorrect = false;
let resultScreen = function(x, y, text) {
    ctx.fillStyle = resultBgColor;
    ctx.fillRect(x, y, 100, 30);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(text, x + 13, y + 15);
    if (symbolsClicked == 3) {
        console.log("symbols clicked: " + symbolsClicked)
        isCorrect = (text == numberToSolve);
        if (isCorrect) {
            setTimeout(() => {
                resultBgColor = "rgb(21, 255, 0)"
            }, 100);
        } else {
            setTimeout(() => {
                resultBgColor = "rgb(255, 0, 0)"
            }, 100);
        }
        resultBgColor = "rgb(65, 115, 138)";
    }
}

// check to see when three symbols are clicked in a row, then evaluate the expression and update the result screen
let resultText = "";
let clickedSquares = [];
let mathSquare = function(x, y, width, height, symbol) {
    let mathColor = "rgb(143, 198, 145)";
    if (mouseX > x && mouseX < x + width &&
        mouseY > y && mouseY < y + height) {
        mathColor = "rgb(85, 116, 86)";
    }
    ctx.fillStyle = mathColor;
    ctx.fillRect(x, y, width, height);
    if (clickX > x && clickX < x + width &&
        clickY > y && clickY < y + height) {
            if (symbolsClicked < 3) {
                ctx.strokeStyle = "rgb(255, 0, 0)";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
            }
            console.log("resultText before: " + resultText)
            if (symbolsClicked == 3) {
                console.log("resetting resultText and symbolsClicked")
                resultText = "";
                symbolsClicked = 0;
                showResult = false;
            }
            mathColor = "rgb(36, 37, 43)";
            if(typeof symbol === "number" && symbolsClicked == 0 || 
                symbolsClicked == 1 && typeof symbol === "string" || 
                symbolsClicked == 2 && typeof symbol === "number") {
                clickedSquares.push({x: x, y: y, width: width, height: height});
                resultText += " " + symbol;
                console.log("resultText after click: " + resultText)
                symbolsClicked++;
            }
            if (symbolsClicked == 3) {
                clickedSquares = [];
                resultText = eval(resultText);
            }
            clickX = -1;
            clickY = -1;
    }

    if (isCorrect && symbolsClicked == 3) {
        // wait (0.2 seconds) and then reset the game
        setTimeout(() => {
            console.log("solved problem " + numberToSolve)
            resultText = "";
            resultBgColor = "rgb(65, 115, 138)";  
            initGame();   
            isCorrect = false;  
        }, 500);
    } if (!isCorrect && symbolsClicked == 3) {
        setTimeout(() => {
            console.log("not solved " + numberToSolve)
            resultText = ""
            resultBgColor = "rgb(65, 115, 138)"
            symbolsClicked = 0;
        }, 500)
    }
    if (clickedSquares.some(c => c.x === x && c.y === y)) {
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(symbol, x + width/2, y + height/2 + 1);
}
console.log("resultText After: " + resultText)

let button = function(string, x, y, width, height, target) {
    let text = string;
    let btnColor = "rgb(35, 127, 184)";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Add hover effect
    if (mouseX > x - width/2 && mouseX < x + width/2 &&
    mouseY > y - height/2 && mouseY < y + height/2) {
        btnColor = "rgb(45, 117, 167)";
        if (clickX > x - width/2 && clickX < x + width/2 &&
        clickY > y - height/2 && clickY < y + height/2) {
            scene = target;
        }
    }
    ctx.fillStyle = btnColor;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

let menu = function() {
    text("CrossQuiz", canvas.width/2, 100, 50);
    button("Start", canvas.width/ 2, canvas.height / 2 - 75, 150, 50, "game");
    button("How", canvas.width / 2, canvas.height / 2, 150, 50, "menu");
}

let runGame = function() {
    if (squares.length === 0) {
        initGame();
    }
    button("Back", 100, 50, 150, 50, "menu");
    ctx.fillStyle = "rgb(67, 69, 85)";
    ctx.fillRect(100, 200, 600, 350);
    numberToSolveScreen(canvas.width/2 - 50, canvas.height/2 - 230, numberToSolve);
    pointsScreen(canvas.width/2 - 190, canvas.height/2 - 230);
    resultScreen(canvas.width/2 - 50, canvas.height/2 - 170, resultText);

    for (let sq of squares) {
        ctx.fillStyle = "rgb(143, 198, 145)";
        mathSquare(sq.x, sq.y, 20, 20, sq.symbol);
    }
}
// because the game runs the functions in the game loop many times, we want to run this code only when the game is initialized, 
// so that the number to solve doesn't change every frame.
function initGame() {
    if(isCorrect) {
        points += 1;
    } 
    if (points == 0) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 19; j++) {
                squares.push({x: 120 + j * 30, y: 220 + i * 32, symbol: randomSymbol()});
            }
        }
    }
    let allSymbols = squares.map(sq => sq.symbol);
    let numbers = allSymbols.filter(sym => typeof sym === "number");
    let operators = allSymbols.filter(sym => typeof sym === "string");

    if (isCorrect || points == 0) {
        // make sure there are at least two numbers and one operator to solve the problem
        let num1 = numbers[Math.floor(Math.random() * numbers.length)];
        let num2 = numbers[Math.floor(Math.random() * numbers.length)];
        let operator = operators[Math.floor(Math.random() * operators.length)];
        numberToSolve = Math.round(eval(num1 + " " + operator + " " + num2));
        console.log(num1, operator, num2, "=", numberToSolve);
    }
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