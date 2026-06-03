function runStates() {
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
        return;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.9)";
    ctx.fillRect(cx - 200, cy - 120, 400, 240);
    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 200, cy - 120, 400, 240);
    ctx.shadowBlur = 0;

    // title
    ctx.fillStyle = "rgb(180, 215, 255)";
    ctx.font = "bold 26px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("STATS", cx, cy - 80);

    // divider
    ctx.strokeStyle = "rgba(80, 140, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy - 55);
    ctx.lineTo(cx + 150, cy - 55);
    ctx.stroke();

    // tiles clicked stat
    ctx.fillStyle = "rgba(100, 150, 255, 0.6)";
    ctx.font = "11px 'Courier New'";
    ctx.fillText("TILES CLICKED", cx, cy - 20);

    ctx.shadowColor = "rgba(80, 255, 160, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgb(80, 255, 160)";
    ctx.font = "bold 48px 'Courier New'";
    ctx.fillText(tilesClicked, cx, cy + 30);
    ctx.shadowBlur = 0;
}
