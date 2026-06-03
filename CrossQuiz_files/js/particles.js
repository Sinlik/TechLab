function playComboAnimation() {
    const targetX = canvas.width / 2 + 20;
    const targetY = canvas.height / 2 - 230;

    comboParticles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX,
        targetY,
        text: combo >= 2 ? "x" + combo + "  COMBO" : "CORRECT",
        alpha: 1.0,
        scale: combo >= 3 ? 1.4 : 1.0,
        color: combo >= 5 ? "255, 200, 80"
             : combo >= 3 ? "180, 120, 255"
             :              "80, 255, 160",
        loss: false,
        life: 0,
        maxLife: 200   // slower
    });
}

function playLossComboAnimation() {
    if (combo === 0) return;
    const targetX = canvas.width / 2 + 20;
    const targetY = canvas.height / 2 - 230;

    comboParticles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX,
        targetY,
        text: "x" + combo + "  LOST",
        alpha: 1.0,
        scale: 1.2,
        color: "255, 80, 120",
        loss: true,
        life: 0,
        maxLife: 200   // slower
    });
}

function updateComboParticles() {
    for (let i = comboParticles.length - 1; i >= 0; i--) {
        const p = comboParticles[i];
        p.life++;

        // move toward target (lerp)
        p.x += (p.targetX - p.x) * 0.08;
        p.y += (p.targetY - p.y) * 0.08;

        // fade out in second half of life
        if (p.life > p.maxLife * 0.5) {
            p.alpha = 1 - (p.life - p.maxLife * 0.5) / (p.maxLife * 0.5);
        }

        if (p.life >= p.maxLife) {
            comboParticles.splice(i, 1);
            continue;
        }

        // draw
        ctx.save();
        ctx.globalAlpha = p.alpha;

        const fontSize = Math.round(14 * p.scale);
        ctx.font = `bold ${fontSize}px 'Courier New'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = `rgba(${p.color}, 0.9)`;
        ctx.shadowBlur = p.loss ? 12 : 8;
        ctx.fillStyle = `rgba(${p.color}, 1)`;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}