
let tiles = [];
let mathQuestions = [];
let currentLevelQuestions = [];
let currentLevelAnswers = []; // Track user answers for each question
let currentQuestionIndex = -1; // Track which question is currently being asked
let mathQuestion = "";
let mathAnswer = 0;

let timerInterval = null

// Add this near the top with other variables
let questionStartTime = null; // Track when current question was shown
let questionTimeData = []; // Array to store time for each question


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

function getTileType(level) {
    const rand = Math.random();
    if (level <= 7) return "blue";                              // easy: all blue
    if (level <= 14) return rand < 0.7 ? "blue" : "orange";   // normal: some orange
    return rand < 0.4 ? "blue" : rand < 0.75 ? "orange" : "red"; // hard: mix
}

function createMathQuestions(level = 1) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

    rows    = config.rows;
    columns = config.columns;

    const totalCells = rows * columns;
    mathQuestions = [];
    currentLevelQuestions = []; // Reset for new level
    currentLevelAnswers = []; // Reset user answers for new level

    let questionIndex = 0; // Counter for all generated questions

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

        const qText = `${num1} ${operator} ${num2} = ?`;
        
        // Store for Firebase with index
        currentLevelQuestions.push({
            question: qText,
            answer: answer,
            operator: operator
        });
        
        // Initialize answer tracking for this question
        currentLevelAnswers.push({
            userGuesses: [],
            correct: null
        });

        const idx = questionIndex;
        questionIndex++;

        return { question: qText, answer, questionIndex: idx };
    }

    for (let i = 0; i < totalCells; i++) {
        const type = getTileType(level);
        const hitsRequired = type === "blue" ? 1 : type === "orange" ? 2 : 3;

        const questions = Array.from({ length: hitsRequired }, generateQuestion);

        mathQuestions.push({
            questions,
            answer: questions[0].answer,
            question: questions[0].question,
            type,
            hitsRequired,
            questionIndices: questions.map(q => q.questionIndex)
        });
    }

    // Save questions to Firebase after generating
    saveLevelQuestions();
}


function getTimeForLevel(level) {
    const base = 30;
    const step = 8;
    const maxTime = 150;
    return Math.min(base + (level - 1) * step, maxTime);
}

function mathSquare(x, y, width, height, symbol, type, hitsLeft) {
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

function handleTileClicks() {
    if (resetting || gameOver || levelWon) return;

    for (let sq of tiles) {
        if (!sq.exist) continue;
        if (clickX > sq.x && clickX < sq.x + 50 && clickY > sq.y && clickY < sq.y + 50) {
            
            playTileClunk();

            isCorrect = (sq.symbol == mathAnswer);
            resetting = true;
            tilesClicked += 1;

            // Record user guess
            if (currentQuestionIndex >= 0 && currentQuestionIndex < currentLevelAnswers.length) {
                currentLevelAnswers[currentQuestionIndex].userGuesses.push({
                    guess: sq.symbol,
                    correct: isCorrect
                });
                
                // Mark as correct if this was the right answer
                if (isCorrect) {
                    currentLevelAnswers[currentQuestionIndex].correct = true;
                }
                console.log(`📝 Recorded guess for question ${currentQuestionIndex}: ${sq.symbol} (${isCorrect ? 'correct' : 'wrong'})`);
            } else {
                console.warn(`⚠️ Could not record guess: currentQuestionIndex=${currentQuestionIndex}, answers.length=${currentLevelAnswers.length}`);
            }

            // Save answers immediately after recording
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveGame();
                saveLevelQuestions();
            }, 500);

            if (isCorrect) {
                combo++;
                playComboAnimation();
                resultBgColor = "rgb(21, 255, 0)";
                playCorrectSound();

                // Record time taken for this question
                if (questionStartTime && currentQuestionIndex >= 0) {
                    const timeTaken = Date.now() - questionStartTime; // in milliseconds

                    // Update the answer data with time taken
                    if (currentQuestionIndex < currentLevelAnswers.length) {
                        currentLevelAnswers[currentQuestionIndex].timeTaken = timeTaken;
                        console.log(`⏱️ Question ${currentQuestionIndex} solved in ${timeTaken}ms`);
                    }
                }

                // Reset start time for next question
                questionStartTime = null;

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
                    if (tiles.some(t => t.exist)) createNumberToSolve();
                }, 500);
            } else {
                playLossComboAnimation();
                combo = 0;
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

            clickX = -1;
            clickY = -1;
            break;
        }
    }
}
async function clearLevelData(level) {
    const user = auth.currentUser;
    if (!user) return;

    const levelKey = `level_${level}_questions`;
    const levelAnswersKey = `level_${level}_answers`;

    await db.collection("users").doc(user.uid).set({
        [levelKey]: [],
        [levelAnswersKey]: []
    }, { merge: true });
}

function initGame() {
    clearLevelData(selectedLevel); // wipe old data first
    mathQuestions = [];
    createMathQuestions(selectedLevel);

    const TILE_SIZE = 50;
    const SPACING_X = 80;
    const SPACING_Y = 80;

    const GRID_WIDTH  = (columns - 1) * SPACING_X + TILE_SIZE;
    const GRID_HEIGHT = (rows - 1) * SPACING_Y + TILE_SIZE;

    const availableTop = TOP_UI_HEIGHT + GRID_MARGIN;
    const availableHeight = canvas.height - availableTop;
    const gridStartY = availableTop + (availableHeight - GRID_HEIGHT) / 2;
    const startX = (canvas.width - GRID_WIDTH) / 2;
    const startY = gridStartY;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const q = mathQuestions[i * columns + j];
            tiles.push({
                x: startX + j * SPACING_X,
                y: startY + i * SPACING_Y,
                symbol: q.questions[0].answer,
                exist: true,
                type: q.type,
                hitsRequired: q.hitsRequired,
                hitsLeft: q.hitsRequired,
                questions: q.questions
            });
        }
    }

    questionIdx = 0;
    createNumberToSolve();

    clearInterval(timerInterval);
    timeForLevel = getTimeForLevel(selectedLevel);
    timerSeconds = timeForLevel;
    levelStartSeconds = timeForLevel;


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

    // Get the question index stored with this question
    currentQuestionIndex = q.questionIndex;
    
    // Record when this question started
    questionStartTime = Date.now();
    
    console.log(`🎯 New question: "${q.question}" (index: ${currentQuestionIndex}, answer: ${mathAnswer})`);
}

function resetGame() {
    clearInterval(timerInterval);

    squares = [];
    tiles = [];
    points = 0;
    mathQuestion = "";
    mathAnswer = 0;
    symbolsClicked = 0;
    isCorrect = false;
    resetting = false;
    combo = 0;
    comboParticles = [];
    playerHealth = 3;
    gameOver = false;
    levelWon = false;
}

function startLevel(levelNum) {
    selectedLevel = levelNum;
    currentLevelQuestions = [];
    resetGame();
    initGame();
    scene = "game";
    levelWon = false;
    howToShown = false;
    howToTimer = 0;
}