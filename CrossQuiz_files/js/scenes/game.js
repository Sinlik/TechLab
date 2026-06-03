let resultText = "";

function createLevel() {
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
    if (!tiles.some(t => t.exist)) {
        levelWon = true;
        winningScreen();
        return
    }

    if (!levelWon) {
        for (let sq of tiles) {
            if (sq.exist) {
                mathSquare(sq.x, sq.y, 50, 50, sq.symbol, sq.type, sq.hitsLeft);
            }
        }
    }
    updateComboParticles();
    if (!tiles.some(t => t.exist)) {
        console.log("No more tiles left, you win!");
        winningScreen();
    }
}


function runGame() {
    if (selectedLevel === 0) {
        levelSelector();
    } else {
        createLevel();
    }
}