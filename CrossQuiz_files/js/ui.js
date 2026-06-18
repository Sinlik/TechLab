let resultBgColor = "rgb(65, 115, 138)";
heartAnimations = []; // track per-heart animations

function text(string, x, y, px) {
    let text = string;
    ctx.fillStyle = "black";
    ctx.font = px + "px Arial";
    textAlign = "center";
    ctx.fillText(text, x, y);
}

function button(string, x, y, width, height, target) {
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

function pointsScreen(x, y) {
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
function numberToSolveScreen(x, y, num) {
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

function displayLevelNum(x, y) {
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

function resultScreen(x, y, text) {
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

// make winning screen
function winningScreen() {
    clearInterval(timerInterval)
    saveGame()
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

    const timePlayed = Math.max(0, levelStartSeconds - timerSeconds);
    ctx.fillStyle = "rgb(140, 180, 255)";
    ctx.font = "13px Courier New";
    ctx.fillText(`TIME: ${formatTime(timePlayed)}`, cx, cy);

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
    ctx.fillText("FINAL SCORE  " + points + "  PTS", cx, cy + 20);

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
        if (nextLevel > unlockedUpTo) {
            unlockedUpTo = nextLevel;
            saveGame();  // ← persist the new unlock
        }

        levelWon = false;
        resetGame();
        
        startLevel(nextLevel);
        clickX = -1;
        clickY = -1;
    }
}

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

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

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

let saveGameCounter = 0;
function runSaveGame() {
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

    const cx = canvas.width / 2, cy = canvas.height / 2;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 180, cy - 80, 360, 160);

    ctx.shadowColor = "rgba(60, 255, 150, 0.6)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(60, 255, 150, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 180, cy - 80, 360, 160);
    ctx.shadowBlur = 0;

    // title
    ctx.shadowColor = "rgba(80, 255, 160, 0.9)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgb(80, 255, 160)";
    ctx.font = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SAVE COMPLETE", cx, cy - 25);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(180, 220, 255, 0.9)";
    ctx.font = "14px 'Courier New'";
    ctx.fillText(`Level: ${unlockedUpTo}`, cx, cy + 10);
    ctx.fillText(`Tiles Clicked: ${tilesClicked}`, cx, cy + 35);

    saveGameCounter++;
    if (saveGameCounter > 120) {
        scene = "menu";
        saveGameCounter = 0;
    }
}