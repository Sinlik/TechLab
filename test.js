let isCorrect = false;
let resultScreen = function(x, y, text) {
    ctx.fillStyle = resultBgColor;
    ctx.fillRect(x, y, 100, 30);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(text, x + 13, y + 15);
    if (symbolsClicked == 3) {
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
            if (symbolsClicked == 3) {
                resultText = "";
                symbolsClicked = 0;
                showResult = false;
            }
            mathColor = "rgb(36, 37, 43)";
            if(typeof symbol === "number" && symbolsClicked == 0 || 
                symbolsClicked == 1 && typeof symbol === "string" || 
                symbolsClicked == 2 && typeof symbol === "number") {
                clickedSquares.push({x: x, y: y, width: width, height: height, exist: false});
                resultText += " " + symbol;
                symbolsClicked++;
            }
            if (symbolsClicked == 3) {
                resultText = eval(resultText);
            }
            clickX = -1;
            clickY = -1;
    }

    if (isCorrect && symbolsClicked == 3) {
        // wait (0.2 seconds) and then reset the game
        setTimeout(() => {
            // search through the x and y coordinates of the squares and remove the ones that were clicked'
            resultText = "";
            resultBgColor = "rgb(65, 115, 138)";  
            initGame();   
            isCorrect = false;  
        }, 500);
    } if (!isCorrect && symbolsClicked == 3) {
        setTimeout(() => {
            resultText = ""
            resultBgColor = "rgb(65, 115, 138)"
            symbolsClicked = 0;
        }, 500)
    }
    if (symbolsClicked == 3) {
        console.log("symbolsClicked == 3, isCorrect =", isCorrect, "type =", typeof isCorrect)
        for (let sq of clickedSquares) {
            console.log("clicked square at x: " + sq.x + " and y: " + sq.y)
        }
        if (isCorrect) {
            // console.log("is correct, removing squares")
            for (let sq of clickedSquares)
                console.log("square: " + sq.symbol + " at x: " + sq.x + " and y: " + sq.y)
            for (let sq of squares) {
                if (clickedSquares.some(c => c.x === sq.x && c.y === sq.y)) {
                    console.log("removing square: " + sq.symbol + " at x: " + sq.x + " and y: " + sq.y)
                    sq.exist = false;
                }
            }
        } if (!isCorrect && symbolsClicked == 3) {
            console.log("is not correct, resetting squares")
            clickedSquares = [];
        }
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

    let output = ""
    for (let sq of squares) {
        if (sq.exist) {
            ctx.fillStyle = "rgb(143, 198, 145)";
            mathSquare(sq.x, sq.y, 20, 20, sq.symbol);
        }
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
                squares.push({x: 120 + j * 30, y: 220 + i * 32, symbol: randomSymbol(), exist: true});
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