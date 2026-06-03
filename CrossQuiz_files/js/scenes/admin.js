let adminUsers = null;
let selectedAdminUser = null;

async function loadAdminData() {
    const snapshot = await db.collection("users").get();
    adminUsers = snapshot.docs.map(d => d.data());
}
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
function runAdmin() {
    // background
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

    // title
    ctx.shadowColor = "rgba(120, 180, 255, 0.8)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(180, 215, 255, 1)";
    ctx.font = "bold 42px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("ADMIN CORE", canvas.width / 2, 80);
    ctx.shadowBlur = 0;

    if (selectedAdminUser) {
        adminUserInfo();
        return;
    }

    // loading state
    if (!adminUsers) {
        ctx.fillStyle = "rgba(180, 220, 255, 0.8)";
        ctx.font = "20px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("Loading users...", canvas.width / 2, canvas.height / 2);
        loadAdminData();
        return;
    }

    // panel
    ctx.fillStyle = "rgba(20, 30, 60, 0.5)";
    roundRect(ctx, canvas.width / 2 - 300, 120, 600, 400, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(180, 220, 255, 0.8)";
    ctx.font = "16px Courier New";
    ctx.textAlign = "left";

    let y = 160;

    adminUsers.forEach((u, i) => {
        const name = u.username || "Unknown";
        const level = u.unlockedUpTo || 0;
        const tiles = u.tilesClicked || 0;

        const lineY = y;
        const isHover = mouseX > canvas.width/2 - 280 && mouseX < canvas.width/2 + 280 && 
                        mouseY > lineY - 12 && mouseY < lineY + 12;

        // Highlight on hover
        ctx.fillStyle = isHover ? "rgba(140, 220, 255, 1)" : "rgba(180, 220, 255, 0.85)";
        ctx.fillText(
            `${i + 1}. ${name} | Level: ${level} | Tiles: ${tiles}`,
            canvas.width / 2 - 280,
            lineY
        );

        // Click detection
        if (clickX > canvas.width/2 - 280 && clickX < canvas.width/2 + 280 && 
            clickY > lineY - 15 && clickY < lineY + 15) {
            
            selectedAdminUser = u;
            clickX = -1;
            clickY = -1;
        }

        y += 28;
    });

    button("Back", canvas.width / 2, canvas.height - 80, 160, 50, "menu");
}

function adminUserInfo() {
    // Background overlay
    ctx.fillStyle = "rgba(5, 8, 20, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Main card
    ctx.fillStyle = "rgba(15, 25, 60, 0.95)";
    ctx.shadowColor = "rgba(80, 140, 255, 0.6)";
    ctx.shadowBlur = 25;
    roundRect(ctx, cx - 280, cy - 220, 560, 440, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border glow
    ctx.strokeStyle = "rgba(100, 180, 255, 0.7)";
    ctx.lineWidth = 3;
    roundRect(ctx, cx - 280, cy - 220, 560, 440, 20);
    ctx.stroke();

    const user = selectedAdminUser || {};
    const username = user.username || "Unknown";

    // Title
    ctx.shadowColor = "rgba(120, 200, 255, 0.9)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgb(180, 225, 255)";
    ctx.font = "bold 28px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(username.toUpperCase() + " — PROFILE", cx, cy - 175);
    ctx.shadowBlur = 0;

    // Stats Section
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(160, 210, 255, 0.9)";
    ctx.font = "16px 'Courier New'";

    let statsY = cy - 130;

    ctx.fillText(`HIGHEST LEVEL:`, cx - 240, statsY);
    ctx.fillStyle = "rgb(80, 255, 180)";
    ctx.fillText((user.unlockedUpTo || 1).toString(), cx + 50, statsY);

    statsY += 35;
    ctx.fillStyle = "rgba(160, 210, 255, 0.9)";
    ctx.fillText(`TOTAL TILES CLICKED:`, cx - 240, statsY);
    ctx.fillStyle = "rgb(80, 255, 180)";
    ctx.fillText((user.tilesClicked || 0).toLocaleString(), cx + 50, statsY);

    // Questions Section
    ctx.fillStyle = "rgba(160, 210, 255, 0.9)";
    ctx.font = "bold 17px 'Courier New'";
    ctx.fillText("QUESTIONS GENERATED", cx - 240, cy - 40);

    ctx.strokeStyle = "rgba(80, 140, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy - 28);
    ctx.lineTo(cx + 240, cy - 28);
    ctx.stroke();

    // Display questions per level
    let qY = cy + 10;
    let hasQuestions = false;

    for (let lvl = 1; lvl <= 20; lvl++) {
        const key = `level_${lvl}_questions`;
        const questions = user[key];

        if (questions && questions.length > 0) {
            hasQuestions = true;
            ctx.fillStyle = "rgba(140, 200, 255, 0.9)";
            ctx.font = "bold 14px 'Courier New'";
            ctx.fillText(`LEVEL ${lvl} (${questions.length} questions):`, cx - 240, qY);
            
            qY += 22;

            // Show first 3 questions as preview
            ctx.font = "13px 'Courier New'";
            ctx.fillStyle = "rgb(180, 220, 255)";
            for (let i = 0; i < Math.min(3, questions.length); i++) {
                const q = questions[i];
                ctx.fillText(`• ${q.question} = ${q.answer}`, cx - 220, qY);
                qY += 20;
            }

            if (questions.length > 3) {
                ctx.fillStyle = "rgba(140, 180, 255, 0.7)";
                ctx.fillText(`   ... +${questions.length - 3} more`, cx - 220, qY);
                qY += 18;
            }
        }
    }

    if (!hasQuestions) {
        ctx.fillStyle = "rgba(140, 180, 255, 0.6)";
        ctx.font = "14px 'Courier New'";
        ctx.fillText("(No question data saved yet)", cx - 100, cy);
    }

    // Back button
    const bx = cx - 80;
    const by = cy + 165;
    const bw = 160;
    const bh = 45;

    const bHover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;

    ctx.fillStyle = bHover ? "rgba(60, 100, 220, 0.5)" : "rgba(15, 25, 80, 0.7)";
    ctx.fillRect(bx, by, bw, bh);

    ctx.shadowColor = bHover ? "rgba(100, 160, 255, 0.9)" : "rgba(60, 100, 200, 0.5)";
    ctx.shadowBlur = bHover ? 12 : 6;
    ctx.strokeStyle = bHover ? "rgba(140, 190, 255, 0.9)" : "rgba(80, 140, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.shadowBlur = 0;

    ctx.fillStyle = bHover ? "rgb(200, 225, 255)" : "rgb(140, 190, 255)";
    ctx.font = "bold 15px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("← BACK TO LIST", cx, by + 27);

    // Click handler
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        selectedAdminUser = null;
        clickX = -1;
        clickY = -1;
    }
}