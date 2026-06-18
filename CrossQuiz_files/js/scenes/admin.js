let adminUsers = null;
let selectedAdminUser = null;

let adminViewingLevel = 1;
let adminQuestionScroll = 0;

let lineHeight = 20;
let maxVisibleItems = 5;

let showAdminFeedback = false;
let adminFeedbackType = ""; // "correct" or "wrong"
let adminFeedbackQuestion = "";
let adminFeedbackUserAnswer = "";
let adminFeedbackCorrectAnswer = "";
let feedbackTimeout = null;

const cx = canvas.width / 2;
const cy = canvas.height / 2;

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
            adminViewingLevel = 1;

            clickX = -1;
            clickY = -1;
        }

        y += 28;
    });

    button("Back", canvas.width / 2, canvas.height - 80, 160, 50, "menu");
}

canvas.addEventListener("wheel", (e) => {
    if (!selectedAdminUser) return;

    const scrollAmount = lineHeight * 0.1;
    adminQuestionScroll += e.deltaY > 0 ? scrollAmount : -scrollAmount;

    if (adminQuestionScroll < 0) adminQuestionScroll = 0;

    console.log(`📜 Scroll: ${adminQuestionScroll}`);

    e.preventDefault();
});

function adminUserInfo() {
    // Background overlay
    ctx.fillStyle = "rgba(5, 8, 20, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const questionAreaTop = cy - 10;
    const questionAreaHeight = 150; // Expanded to show more questions

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

    const lvl = adminViewingLevel;
    const key = `level_${lvl}_questions`;
    const answersKey = `level_${lvl}_answers`;
    const questions = user[key] || [];
    const answers = user[answersKey] || [];

    // console.log(`📊 Admin display: Level ${lvl}, ${questions.length} questions, ${answers.length} answer records`);
    console.log("Raw answers from Firestore:", JSON.stringify(answers));

    if (answers.length > 0) {
        console.log(`   First answer guesses:`, answers[0].userGuesses);
    }

    // First pass: calculate total height of all content
    let totalContentHeight = 30; // LEVEL text height
    for (let i = 0; i < questions.length; i++) {
        const answerData = answers[i];
        totalContentHeight += lineHeight * 0.6; // question
        totalContentHeight += lineHeight * 0.6; // correct answer
        
        if (answerData && answerData.userGuesses && answerData.userGuesses.length > 0) {
            totalContentHeight += answerData.userGuesses.length * (lineHeight * 0.5); // each guess
        } else {
            totalContentHeight += lineHeight * 0.5; // "no attempts" message
        }
        totalContentHeight += lineHeight * 0.4; // spacing
    }

    // Update max scroll
    const maxScroll = Math.max(0, totalContentHeight - questionAreaHeight + 30);
    console.log(`📐 Total height: ${totalContentHeight}, Max scroll: ${maxScroll}, Current: ${adminQuestionScroll}`);

    adminQuestionScroll = Math.max(0, Math.min(adminQuestionScroll, maxScroll));

    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 240, questionAreaTop, 480, questionAreaHeight);
    ctx.clip();

    // Start drawing from the top with scroll offset
    let offsetY = questionAreaTop + 20 - adminQuestionScroll;
    console.log(`🎨 Drawing from offsetY: ${offsetY} (area top: ${questionAreaTop}, scroll: ${adminQuestionScroll})`);

    ctx.fillStyle = "rgb(180,225,255)";
    ctx.font = "bold 18px Courier New";
    ctx.textAlign = "left";
    ctx.fillText(`LEVEL ${lvl}`, cx - 240, offsetY);

    offsetY += 30;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const answerData = answers[i];

        // Display question
        ctx.fillStyle = "rgb(180,220,255)";
        ctx.font = "bold 13px Courier New";
        ctx.textAlign = "left";
        ctx.fillText(`Q: ${q.question}`, cx - 220, offsetY);
        offsetY += lineHeight * 0.6;

        // Display correct answer in green
        ctx.fillStyle = "rgb(100, 255, 100)";
        ctx.font = "13px Courier New";
        ctx.fillText(`✓ Correct: ${q.answer}`, cx - 220, offsetY);
        offsetY += lineHeight * 0.6;

        // Display user guesses
        if (answerData && answerData.userGuesses && answerData.userGuesses.length > 0) {
            answerData.userGuesses.forEach((guess, idx) => {
                // Color based on correctness
                ctx.fillStyle = guess.correct ? "rgb(100, 255, 100)" : "rgb(255, 100, 100)";
                ctx.font = "12px Courier New";
                ctx.fillText(
                    `${guess.correct ? "✓" : "✗"} Guess ${idx + 1}: ${guess.guess}`,
                    cx - 220,
                    offsetY
                );
                offsetY += lineHeight * 0.5;

                // Show time taken if this was the correct guess
                if (guess.correct && answerData.timeTaken) {
                    const timeMs = answerData.timeTaken;
                    const timeStr = timeMs >= 1000 ? `${(timeMs/1000).toFixed(2)}s` : `${timeMs}ms`;
                    ctx.fillStyle = "rgb(180, 200, 255)";
                    ctx.font = "11px Courier New";
                    ctx.fillText(
                        `⏱️ Time: ${timeStr}`,
                        cx - 220,
                        offsetY
                    );
                    offsetY += lineHeight * 0.4;
                }
            });
        } else {
            ctx.fillStyle = "rgb(200, 150, 100)";
            ctx.font = "12px Courier New";
            ctx.fillText(`No attempts recorded`, cx - 220, offsetY);
            offsetY += lineHeight * 0.5;
        }

        offsetY += lineHeight * 0.4;
    }

    ctx.restore();

    // Draw answer feedback overlay if showing
    if (showAdminFeedback) {
        const feedbackX = cx - 200;
        const feedbackY = questionAreaTop + questionAreaHeight / 2 - 60;
        const feedbackW = 400;
        const feedbackH = 120;

        // Background
        ctx.fillStyle = adminFeedbackType === "correct" ? "rgba(21, 255, 0, 0.95)" : "rgba(255, 50, 50, 0.95)";
        ctx.fillRect(feedbackX, feedbackY, feedbackW, feedbackH);

        // Border
        ctx.strokeStyle = adminFeedbackType === "correct" ? "rgb(100, 255, 100)" : "rgb(255, 100, 100)";
        ctx.lineWidth = 3;
        ctx.strokeRect(feedbackX, feedbackY, feedbackW, feedbackH);

        // Title
        ctx.fillStyle = "white";
        ctx.font = "bold 22px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(
            adminFeedbackType === "correct" ? "✓ CORRECT!" : "✗ WRONG!",
            feedbackX + feedbackW / 2,
            feedbackY + 28
        );

        // Question
        ctx.font = "15px Courier New";
        ctx.fillStyle = "rgb(220, 240, 255)";
        ctx.fillText(
            `Question: ${adminFeedbackQuestion}`,
            feedbackX + feedbackW / 2,
            feedbackY + 55
        );

        // User's answer
        ctx.fillStyle = adminFeedbackType === "correct" ? "rgb(180, 255, 180)" : "rgb(255, 180, 180)";
        ctx.fillText(
            `Your answer: ${adminFeedbackUserAnswer}`,
            feedbackX + feedbackW / 2,
            feedbackY + 80
        );

        // Show correct answer if wrong
        if (adminFeedbackType === "wrong") {
            ctx.fillStyle = "rgb(255, 255, 180)";
            ctx.fillText(
                `Correct answer: ${adminFeedbackCorrectAnswer}`,
                feedbackX + feedbackW / 2,
                feedbackY + 105
            );
        }
    }

    if (!questions || questions.length === 0) {
        ctx.fillStyle = "rgba(140,180,255,0.7)";
        ctx.fillText(
            "No questions saved for this level.",
            cx - 220,
            questionAreaTop + 40
        );
    }

    adminQuestionScroll = Math.max(0, Math.min(adminQuestionScroll, maxScroll));

    // Previous button
    const navY = cy + 165;

    const prevX = cx - 240;
    const navW = 100;
    const navH = 45;

    ctx.fillStyle = "rgba(20,40,100,0.8)";
    ctx.fillRect(prevX, navY, navW, navH);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("← PREV", prevX + navW / 2, navY + 28);

    if (
        clickX > prevX &&
        clickX < prevX + navW &&
        clickY > navY &&
        clickY < navY + navH
    ) {
        adminViewingLevel = Math.max(1, adminViewingLevel - 1);
        adminQuestionScroll = 0;
        clickX = clickY = -1;
    }

    // NEXT
    const nextX = cx + 140;

    ctx.fillStyle = "rgba(20,40,100,0.8)";
    ctx.fillRect(nextX, navY, navW, navH);

    ctx.fillStyle = "white";
    ctx.fillText("NEXT →", nextX + navW / 2, navY + 28);

    if (
        clickX > nextX &&
        clickX < nextX + navW &&
        clickY > navY &&
        clickY < navY + navH
    ) {
        adminViewingLevel++;
        adminQuestionScroll = 0;
        clickX = clickY = -1;
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

    const pdfX = cx - 10;
    const pdfY = cy;   // below the nav row
    const pdfW = 180;
    const pdfH = 42;

    const pdfHover = mouseX > pdfX && mouseX < pdfX + pdfW && mouseY > pdfY && mouseY < pdfY + pdfH;

    // Background
    ctx.fillStyle = pdfHover ? "rgba(30, 70, 30, 0.85)" : "rgba(10, 40, 15, 0.75)";
    ctx.fillRect(pdfX, pdfY, pdfW, pdfH);

    // Border
    ctx.shadowColor = pdfHover ? "rgba(80, 255, 120, 0.8)" : "rgba(40, 180, 80, 0.4)";
    ctx.shadowBlur = pdfHover ? 14 : 6;
    ctx.strokeStyle = pdfHover ? "rgba(100, 255, 140, 0.9)" : "rgba(50, 200, 90, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(pdfX, pdfY, pdfW, pdfH);
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = pdfHover ? "rgb(180, 255, 190)" : "rgb(100, 230, 130)";
    ctx.font = "bold 14px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("⬇ EXPORT PDF", pdfX + pdfW / 2, pdfY + 26);

    // Click handler
    if (clickX > pdfX && clickX < pdfX + pdfW && clickY > pdfY && clickY < pdfY + pdfH) {
        clickX = -1;
        clickY = -1;
        generateAdminPDF(selectedAdminUser);
    }
    // Click handler
    if (clickX > bx && clickX < bx + bw && clickY > by && clickY < by + bh) {
        selectedAdminUser = null;
        adminViewingLevel = 1;
        adminQuestionScroll = 0;

        clickX = -1;
        clickY = -1;
    }
}

async function generateAdminPDF(user) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const colRight = pageW - margin;

    function headerBar(label) {
        doc.setFillColor(15, 25, 70);
        doc.rect(margin, y - 14, pageW - margin * 2, 20, "F");
        doc.setTextColor(100, 180, 255);
        doc.setFontSize(11);
        doc.setFont("courier", "bold");
        doc.text(label, margin + 6, y);
        y += 18;
    }

    function checkPage(needed = 20) {
        if (y + needed > pageH - margin) {
            doc.addPage();
            y = margin + 20;
        }
    }

    let y = margin;

    // Cover block
    doc.setFillColor(5, 8, 30);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setTextColor(180, 215, 255);
    doc.setFontSize(28);
    doc.setFont("courier", "bold");
    doc.text("ADMIN REPORT", pageW / 2, 120, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(80, 255, 180);
    doc.text((user.username || "Unknown").toUpperCase(), pageW / 2, 162, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(140, 180, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, 192, { align: "center" });

    // Stats block on cover
    doc.setFillColor(20, 30, 70);
    doc.roundedRect(margin, 220, pageW - margin * 2, 80, 8, 8, "F");

    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    doc.setTextColor(160, 210, 255);
    doc.text("Highest Level Reached:", margin + 20, 252);
    doc.setTextColor(80, 255, 180);
    doc.text(String(user.unlockedUpTo || 1), margin + 220, 252);

    doc.setTextColor(160, 210, 255);
    doc.text("Total Tiles Clicked:", margin + 20, 278);
    doc.setTextColor(80, 255, 180);
    doc.text((user.tilesClicked || 0).toLocaleString(), margin + 220, 278);

    // Gather all levels
    const levelKeys = Object.keys(user)
        .filter(k => k.startsWith("level_") && k.endsWith("_questions"))
        .map(k => parseInt(k.replace("level_", "").replace("_questions", "")))
        .sort((a, b) => a - b);

    // New page for questions
    doc.addPage();
    doc.setFillColor(5, 8, 30);
    doc.rect(0, 0, pageW, pageH, "F");
    y = margin + 10;

    for (const lvl of levelKeys) {
        const questions = user[`level_${lvl}_questions`] || [];
        const answers   = user[`level_${lvl}_answers`]   || [];

        if (questions.length === 0) continue;

        checkPage(40);

        // Level header
        doc.setFillColor(10, 20, 80);
        doc.rect(margin, y - 14, pageW - margin * 2, 22, "F");
        doc.setDrawColor(100, 160, 255);
        doc.setLineWidth(0.5);
        doc.rect(margin, y - 14, pageW - margin * 2, 22);
        doc.setTextColor(100, 200, 255);
        doc.setFontSize(13);
        doc.setFont("courier", "bold");
        doc.text(`LEVEL ${lvl}  —  ${questions.length} question${questions.length !== 1 ? "s" : ""}`, margin + 10, y);
        y += 28;

        questions.forEach((q, i) => {
            checkPage(80);

            const answerData = answers[i] || {};
            const guesses    = answerData.userGuesses || [];
            const correct    = guesses.find(g => g.correct);

            // Question row
            doc.setFillColor(18, 28, 58);
            doc.rect(margin, y - 12, pageW - margin * 2, 16, "F");
            doc.setTextColor(180, 220, 255);
            doc.setFontSize(10);
            doc.setFont("courier", "bold");
            const qLines = doc.splitTextToSize(`Q${i+1}: ${q.question}`, colRight - margin - 10);
            doc.text(qLines, margin + 8, y);
            y += qLines.length * 13 + 4;

            checkPage(16);

            // Correct answer
            doc.setTextColor(80, 220, 120);
            doc.setFont("courier", "normal");
            doc.text(`✓ Answer: ${q.answer}`, margin + 16, y);
            y += 14;

            checkPage(16);

            // Time taken
            if (answerData.timeTaken) {
                const ms  = answerData.timeTaken;
                const str = ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
                doc.setTextColor(160, 190, 255);
                doc.setFontSize(9);
                doc.text(`⏱  Time to solve: ${str}`, margin + 16, y);
                y += 13;
            }

            // Guesses
            if (guesses.length > 0) {
                guesses.forEach((g, gi) => {
                    checkPage(13);
                    doc.setFontSize(9);
                    doc.setTextColor(g.correct ? [100, 255, 120] : [255, 100, 100]);
                    doc.text(
                        `${g.correct ? "✓" : "✗"} Guess ${gi + 1}: ${g.guess}`,
                        margin + 24,
                        y
                    );
                    y += 13;
                });
            } else {
                checkPage(13);
                doc.setTextColor(200, 150, 80);
                doc.setFontSize(9);
                doc.text("No attempts recorded", margin + 24, y);
                y += 13;
            }

            y += 10; // spacing between questions

            // Refill dark background on new page
            if (y > pageH - margin) {
                doc.addPage();
                doc.setFillColor(5, 8, 30);
                doc.rect(0, 0, pageW, pageH, "F");
                y = margin + 20;
            }
        });

        y += 14; // spacing between levels
    }

    // Footer on last page
    doc.setTextColor(60, 100, 180);
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.text(
        `ADMIN CORE  •  ${user.username || "Unknown"}  •  ${new Date().toLocaleString()}`,
        pageW / 2,
        pageH - 24,
        { align: "center" }
    );

    doc.save(`admin_report_${(user.username || "user").toLowerCase().replace(/\s+/g, "_")}.pdf`);
}

// const pdfX = cx;
// const pdfY = cy;   // below the nav row
// const pdfW = 180;
// const pdfH = 42;

// const pdfHover = mouseX > pdfX && mouseX < pdfX + pdfW && mouseY > pdfY && mouseY < pdfY + pdfH;

// // Background
// ctx.fillStyle = pdfHover ? "rgba(30, 70, 30, 0.85)" : "rgba(10, 40, 15, 0.75)";
// ctx.fillRect(pdfX, pdfY, pdfW, pdfH);

// // Border
// ctx.shadowColor = pdfHover ? "rgba(80, 255, 120, 0.8)" : "rgba(40, 180, 80, 0.4)";
// ctx.shadowBlur = pdfHover ? 14 : 6;
// ctx.strokeStyle = pdfHover ? "rgba(100, 255, 140, 0.9)" : "rgba(50, 200, 90, 0.6)";
// ctx.lineWidth = 2;
// ctx.strokeRect(pdfX, pdfY, pdfW, pdfH);
// ctx.shadowBlur = 0;

// // Label
// ctx.fillStyle = pdfHover ? "rgb(180, 255, 190)" : "rgb(100, 230, 130)";
// ctx.font = "bold 14px 'Courier New'";
// ctx.textAlign = "center";
// ctx.fillText("⬇ EXPORT PDF", pdfX + pdfW / 2, pdfY + 26);

// // Click handler
// if (clickX > pdfX && clickX < pdfX + pdfW && clickY > pdfY && clickY < pdfY + pdfH) {
//     clickX = -1;
//     clickY = -1;
//     generateAdminPDF(selectedAdminUser);
// }
