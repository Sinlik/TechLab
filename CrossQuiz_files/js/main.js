const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let scene = "menu"; // "menu", "game", "how"

let flickerTimer = 0;

let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;

// math squares 
let squares = [];
let isCorrect = false;
let points = 0;
// number that needs to be solved

let saveTimeout = null;


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

// Event listeners
canvas.addEventListener('mousemove', function(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});
canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    clickX = event.clientX - rect.left;
    clickY = event.clientY - rect.top;

    if (scene !== "game" || resetting || gameOver || levelWon) {
        return;
    }

    // Allow clicks on winning screen buttons even when levelWon = true
    if (levelWon) {
        return;   // let winningScreen() handle the click
    }
    
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

            tilesClicked += 1;
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveGame();
            }, 1000); // Save once per second max

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

function loseHeart() {
    const lostIndex = playerHealth; // index of heart just lost (already decremented)
    heartAnimations[lostIndex] = { shake: 8, flash: 1.0 }; // shake frames, flash opacity
}


// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (scene === "hub") {
        window.location.href = "../TechLab_Hub/home.html";
    } else if (scene === "menu") {
        menu();
    } else if (scene === "levelSelect" || scene === "game") {
        runGame();
    } else if (scene === "how") {
        runHow();
    } else if (scene === "states") {
        runStates();
    } else if (scene === "admin") {
        runAdmin();
    }

    requestAnimationFrame(gameLoop);
}

// Start
waitForAuth().then(() => readGame()).then(() => {
    playMusic();
    gameLoop();
});