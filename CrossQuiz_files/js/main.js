let flickerTimer = 0;

let mouseX = 0;
let mouseY = 0;
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


let clickX = -1, clickY = -1;
let _pendingClickX = -1, _pendingClickY = -1; // raw from event
// Event listeners
canvas.addEventListener('mousemove', function(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left; 
    mouseY = event.clientY - rect.top;
});
canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    _pendingClickX = event.clientX - rect.left;
    _pendingClickY = event.clientY - rect.top;

});

canvas.addEventListener("wheel", (e) => {
    if (!selectedAdminUser) return;

    adminQuestionScroll += e.deltaY > 0 ? lineHeight : -lineHeight;

    if (adminQuestionScroll < 0) adminQuestionScroll = 0;

    e.preventDefault();
});

function loseHeart() {
    const lostIndex = playerHealth; // index of heart just lost (already decremented)
    heartAnimations[lostIndex] = { shake: 8, flash: 1.0 }; // shake frames, flash opacity
}


// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clickX = _pendingClickX;
    clickY = _pendingClickY;
    _pendingClickX = -1;
    _pendingClickY = -1;

    if (scene === "hub") {
        window.location.href = "../TechLab_Hub/home.html";
    } else if (scene === "menu") {
        menu();
    } else if (scene === "levelSelect" || scene === "game") {
        runGame();
    } else if (scene === "how") {
        runHow();
    } else if (scene === "saveGame") {
        runSaveGame();
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