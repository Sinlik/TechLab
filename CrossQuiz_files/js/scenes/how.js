// call this once per level, before the game starts
const HOW_TO_DURATION = 180; // frames (~3 seconds at 60fps)

const LEVEL_HOWTO = {
    1:  "2 tiles · Add or subtract numbers up to 5.",
    2:  "4 tiles · Same rules, a bit more to solve!",
    3:  "4 tiles · Numbers go up to 8 now.",
    4:  "4 tiles · Full 1–10 range unlocked.",
    5:  "6 tiles · Grid gets wider. Stay sharp!",
    6:  "6 tiles · Numbers up to 12 introduced.",
    7:  "9 tiles · Bigger grid. Addition & subtraction.",
    8:  "9 tiles · MULTIPLICATION unlocked! ×2 to ×5.",
    9:  "9 tiles · Times tables up to ×12.",
    10: "9 tiles · No small numbers — stay focused.",
    11: "12 tiles · Grid grows. All three operators.",
    12: "12 tiles · Numbers up to 15 appear.",
    13: "16 tiles · 4×4 grid. It's getting serious.",
    14: "16 tiles · Numbers up to 20. Don't panic!",
    15: "20 tiles · HARD MODE. Multiples of 5 & 10.",
    16: "20 tiles · 50 joins the number pool.",
    17: "25 tiles · Full 5×5 grid. Maximum tiles!",
    18: "25 tiles · Numbers up to 100.",
    19: "25 tiles · 75 added. Toughest mix yet.",
    20: "25 tiles · FINAL LEVEL. Give it everything!",
};

const MAX_HEALTH = 3;

function howTo() {
    if (howToShown) return;

    howToTimer++;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const msg = LEVEL_HOWTO[selectedLevel] || "";

    // fade out in last 30 frames
    const alpha = howToTimer > HOW_TO_DURATION - 30
        ? (HOW_TO_DURATION - howToTimer) / 30
        : 1;

    // overlay
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = "rgba(5, 8, 20, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;

    // panel
    ctx.fillStyle = "rgba(15, 25, 60, 0.95)";
    ctx.fillRect(cx - 220, cy - 70, 440, 140);
    ctx.shadowColor = "rgba(80, 140, 255, 0.5)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 220, cy - 70, 440, 140);
    ctx.shadowBlur = 0;

    // level label
    ctx.fillStyle = "rgba(100, 150, 255, 0.7)";
    ctx.font = "11px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LEVEL  " + selectedLevel, cx, cy - 38);

    // divider
    ctx.strokeStyle = "rgba(80, 140, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy - 20);
    ctx.lineTo(cx + 140, cy - 20);
    ctx.stroke();

    // message
    ctx.shadowColor = "rgba(120, 180, 255, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgb(180, 215, 255)";
    ctx.font = "bold 15px 'Courier New'";
    ctx.fillText(msg, cx, cy + 10);
    ctx.shadowBlur = 0;

     // "Got It" button
    const bx = cx - 70, by = cy + 30, bw = 140, bh = 36;
    const bHover = mouseX > bx && mouseX < bx + bw &&
                   mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(60, 100, 220, 0.5)" : "rgba(15, 25, 80, 0.7)";
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
    ctx.font = "13px 'Courier New'";
    ctx.fillText("GOT IT", cx, by + 18);
    ctx.shadowBlur = 0;

    ctx.restore();

    // click detection
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        howToShown = true;
        clickX = -1;
        clickY = -1;
    }
}