function levelSelector(level) {
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
            if (!locked) {
                const osc  = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = "sine";
                osc.frequency.setValueAtTime(300, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.25);

                startLevel(levelNum);
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