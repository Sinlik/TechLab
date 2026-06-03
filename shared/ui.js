const canvas = document.getElementById("homeCanvas");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = 0, mouseY = 0;
let clickX = -1, clickY = -1;

let time = 0;
let last = null;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    clickX = e.clientX - rect.left;
    clickY = e.clientY - rect.top;
});

// ── Input system ──────────────────────────────────────────
const inputs = {};

function getInput(id) {
    if (!inputs[id]) inputs[id] = { value: "", focused: false };
    return inputs[id];
}

window.addEventListener('keydown', (e) => {
    const focused = Object.keys(inputs).find(id => inputs[id].focused);
    if (!focused) return;
    const inp = inputs[focused];
    if (e.key === 'Backspace') inp.value = inp.value.slice(0, -1);
    else if (e.key.length === 1) inp.value += e.key;
});

// ── Drawing functions ─────────────────────────────────────
function background(t) {
    const W = canvas.width;
    const H = canvas.height;
    const horizon = H * 0.52;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0,   "#1A6FA8");
    skyGrad.addColorStop(0.5, "#3BA8D8");
    skyGrad.addColorStop(1,   "#A8DFF0");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizon);

    const sunX = W * 0.78, sunY = H * 0.18, sunR = H * 0.07;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.5);
    sunGlow.addColorStop(0,   "rgba(255, 240, 180, 0.5)");
    sunGlow.addColorStop(1,   "rgba(255, 200, 80, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, horizon);
    ctx.fillStyle = "#FFF0A0";
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFDE59";
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 0.75, 0, Math.PI * 2);
    ctx.fill();

    function drawCloud(x, y, scale, alpha, offset) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#FFFFFF";
        [[0,0,1],[-.5,.2,.7],[.5,.2,.7],[-.25,-.2,.6],[.25,-.2,.55]].forEach(([dx, dy, r]) => {
            ctx.beginPath();
            ctx.arc(x + Math.sin(t * 0.3 + offset) * 4 + dx * scale * 60, y + dy * scale * 30, r * scale * 30, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
    drawCloud(W * 0.15, H * 0.1,  1.1, 0.85, 0);
    drawCloud(W * 0.42, H * 0.07, 0.8, 0.7,  1.2);
    drawCloud(W * 0.65, H * 0.13, 0.6, 0.6,  2.5);

    const oceanGrad = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.18);
    oceanGrad.addColorStop(0,   "#2196C4");
    oceanGrad.addColorStop(0.5, "#1A7CA8");
    oceanGrad.addColorStop(1,   "#155E80");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, horizon, W, H * 0.18);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        const wy = horizon + H * (0.03 + i * 0.025);
        const waveOff = Math.sin(t * 1.2 + i * 0.8) * 5;
        ctx.beginPath();
        ctx.moveTo(W * 0.05, wy + waveOff);
        for (let x = 0; x < W; x += 40) {
            ctx.quadraticCurveTo(x + 20, wy - 3 + waveOff, x + 40, wy + waveOff);
        }
        ctx.stroke();
    }
    ctx.restore();

    const surfY = horizon + H * 0.17;
    const surfShift = Math.sin(t * 0.8) * 3;
    const surfGrad = ctx.createLinearGradient(0, surfY - 6, 0, surfY + 14);
    surfGrad.addColorStop(0,   "rgba(180, 220, 235, 0.7)");
    surfGrad.addColorStop(0.5, "rgba(160, 210, 225, 0.4)");
    surfGrad.addColorStop(1,   "rgba(180, 160, 100, 0)");
    ctx.fillStyle = surfGrad;
    ctx.beginPath();
    ctx.moveTo(0, surfY + surfShift);
    for (let x = 0; x <= W; x += 60) {
        ctx.quadraticCurveTo(x + 30, surfY - 8 + surfShift, x + 60, surfY + 4 + surfShift);
    }
    ctx.lineTo(W, surfY + 20);
    ctx.lineTo(0, surfY + 20);
    ctx.fill();

    const sandGrad = ctx.createLinearGradient(0, surfY + 10, 0, H);
    sandGrad.addColorStop(0,   "#D4B870");
    sandGrad.addColorStop(0.3, "#C9A84C");
    sandGrad.addColorStop(1,   "#B8923A");
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, surfY + 8, W, H - surfY - 10);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#8B6914";
    ctx.lineWidth = 1;
    for (let r = 0; r < 4; r++) {
        const ry = surfY + H * (0.08 + r * 0.07);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 80) {
            ctx.quadraticCurveTo(x + 40, ry - 4, x + 80, ry);
        }
        ctx.stroke();
    }
    ctx.restore();

    const netCX  = W * 0.48;
    const netTop = surfY - H * 0.2;
    const netBot = surfY + H * 0.04;
    const netHalf = W * 0.1;
    const postW  = 6;

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#4A3000";
    ctx.fillRect(netCX - netHalf - 4, netBot - 2, netHalf * 2 + postW + 8, 8);
    ctx.restore();

    const postGrad = ctx.createLinearGradient(0, 0, postW * 2, 0);
    postGrad.addColorStop(0, "#C8A040");
    postGrad.addColorStop(0.5, "#F0D070");
    postGrad.addColorStop(1, "#A07020");
    ctx.fillStyle = postGrad;
    ctx.fillRect(netCX - netHalf - postW / 2, netTop, postW, netBot - netTop);
    ctx.fillRect(netCX + netHalf - postW / 2, netTop, postW, netBot - netTop);

    ctx.fillStyle = "#E8E8E8";
    ctx.fillRect(netCX - netHalf, netTop, netHalf * 2, 5);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#D0D0D0";
    ctx.lineWidth = 0.8;
    for (let nx = netCX - netHalf; nx <= netCX + netHalf; nx += 12) {
        ctx.beginPath();
        ctx.moveTo(nx, netTop + 5);
        ctx.lineTo(nx, netBot);
        ctx.stroke();
    }
    for (let ny = netTop + 5; ny <= netBot; ny += 10) {
        ctx.beginPath();
        ctx.moveTo(netCX - netHalf, ny);
        ctx.lineTo(netCX + netHalf, ny);
        ctx.stroke();
    }
    ctx.restore();

    return { surfY, netCX, netTop };
}

function stickFigure(x, y, size, facing, armRaise) {
    const c = "#1A4A6A";
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, size * 0.35, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y - size * 1.65, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.43);
    ctx.lineTo(x, y - size * 0.6);
    ctx.stroke();
    const armY = y - size * 1.15;
    const raise = armRaise || 0;
    ctx.beginPath();
    ctx.moveTo(x, armY);
    ctx.lineTo(x + facing * size * 0.45, armY - size * 0.15 - raise * size * 0.4);
    ctx.moveTo(x, armY);
    ctx.lineTo(x - facing * size * 0.3, armY + size * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.6);
    ctx.lineTo(x - size * 0.25, y);
    ctx.moveTo(x, y - size * 0.6);
    ctx.lineTo(x + size * 0.25, y);
    ctx.stroke();
}

function beachBall(x, y, r) {
    const colors = ["#E8403A","#F5C518","#4DB8FF","#FFFFFF","#1DB954"];
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, a, a + Math.PI * 2 / 5);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    time += dt;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { surfY, netCX, netTop } = background(time);

    const figY = surfY + H * 0.06;
    const figSize = H * 0.1;

    const period = 3.0;
    const phase = (time % period) / period;

    const ballStartX = W * 0.25;
    const ballStartY = figY - figSize * 2;
    const ballPeakY = netTop - H * 0.08;
    const ballEndX = W * 0.65;
    const ballEndY = figY - figSize * 2;

    let ballX, ballY, phase2;
    const leftServe = phase < 0.5;
    if (leftServe) {
        phase2 = phase / 0.5;
        ballX = ballStartX + (ballEndX - ballStartX) * phase2;
        ballY = ballStartY + (ballEndY - ballStartY) * phase2
              + (-Math.sin(phase2 * Math.PI)) * (ballPeakY - (ballStartY + ballEndY) / 2) * 1.8;
    } else {
        phase2 = (phase - 0.5) / 0.5;
        ballX = ballEndX + (ballStartX - ballEndX) * phase2;
        ballY = ballEndY + (ballStartY - ballEndY) * phase2
              + (-Math.sin(phase2 * Math.PI)) * (ballPeakY - (ballStartY + ballEndY) / 2) * 1.8;
    }

    const leftArmRaise  = leftServe  && phase2 < 0.3 ? Math.sin(phase2 / 0.3 * Math.PI) : 0;
    const rightArmRaise = !leftServe && phase2 < 0.3 ? Math.sin(phase2 / 0.3 * Math.PI) : 0;

    stickFigure(W * 0.25, figY, figSize,  1, leftArmRaise);
    stickFigure(W * 0.65, figY, figSize, -1, rightArmRaise);
    beachBall(ballX, ballY, H * 0.045);

    requestAnimationFrame(loop);
}

function button(text, x, y, w, h, target) {
    // make a generic wood sign post
    // const w = 100, h = 90;
    const bx = x - w / 2, by = y - h / 2;
    const hover = mouseX > bx && mouseX < bx + w && mouseY > by && mouseY < by + h;
    const clicked = clickX > bx && clickX < bx + w && clickY > by && clickY < by + h;

    ctx.save();

    // slight scale up on hover
    if (hover) {
        ctx.translate(x, y);
        ctx.scale(1.04, 1.04);
        ctx.translate(-x, -y);
    }

    // drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // wood base — rounded rect
    const woodGrad = ctx.createLinearGradient(bx, by, bx, by + h);
    woodGrad.addColorStop(0,   hover ? "#B8980A" : "#A8880A");
    woodGrad.addColorStop(0.4, hover ? "#C4A020" : "#B49010");
    woodGrad.addColorStop(1,   hover ? "#907008" : "#806008");
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 14);
    ctx.fill();

    ctx.shadowColor = "transparent";

    // wood grain lines — subtle, horizontal, slightly wavy
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 14);
    ctx.clip();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
    ctx.lineWidth = 1;
    const grainLines = [0.22, 0.38, 0.55, 0.7, 0.83];
    grainLines.forEach(t => {
        const gy = by + h * t;
        ctx.beginPath();
        ctx.moveTo(bx + 10, gy);
        ctx.quadraticCurveTo(bx + w * 0.35, gy + 2, bx + w * 0.65, gy - 1);
        ctx.quadraticCurveTo(bx + w * 0.85, gy + 1, bx + w - 10, gy);
        ctx.stroke();
    });
    ctx.restore();

    // border / edge highlight
    ctx.strokeStyle = "rgba(255, 220, 80, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx + 1, by + 1, w - 2, h - 2, 13);
    ctx.stroke();

    // inner dark border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 14);
    ctx.stroke();

    // text
    ctx.fillStyle = hover ? "#FFF8DC" : "#F5E8A0";
    ctx.font = "bold 16px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), x, y);

    ctx.restore();

    if (clicked) {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.1);
        g.gain.setValueAtTime(0.2, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
        osc.start(); osc.stop(ac.currentTime + 0.1);

        if (target) { scene = target; }
        clickX = -1; clickY = -1;
        return true;
    }
    return false;
}

function drawInput(id, label, x, y, w, h, isPassword) {
    const inp = getInput(id);
    const bx = x - w / 2, by = y - h / 2;

    // click to focus
    if (clickX > bx && clickX < bx + w && clickY > by && clickY < by + h) {
        Object.keys(inputs).forEach(k => inputs[k].focused = false);
        inp.focused = true;
    }

    // box shadow
    ctx.shadowColor = inp.focused ? "rgba(180, 130, 20, 0.6)" : "rgba(0,0,0,0.3)";
    ctx.shadowBlur = inp.focused ? 14 : 6;
    ctx.shadowOffsetY = 3;

    // wood background
    const grad = ctx.createLinearGradient(bx, by, bx, by + h);
    grad.addColorStop(0,   inp.focused ? "#C4A020" : "#A8880A");
    grad.addColorStop(0.5, inp.focused ? "#D4B030" : "#B49010");
    grad.addColorStop(1,   inp.focused ? "#A08010" : "#806008");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 10);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // grain lines
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 10);
    ctx.clip();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1;
    [0.3, 0.55, 0.75].forEach(t => {
        const gy = by + h * t;
        ctx.beginPath();
        ctx.moveTo(bx + 8, gy);
        ctx.quadraticCurveTo(bx + w * 0.4, gy + 1.5, bx + w * 0.7, gy - 1);
        ctx.quadraticCurveTo(bx + w * 0.9, gy + 1, bx + w - 8, gy);
        ctx.stroke();
    });
    ctx.restore();

    // border
    ctx.strokeStyle = inp.focused ? "rgba(255, 220, 80, 0.5)" : "rgba(0,0,0,0.25)";
    ctx.lineWidth = inp.focused ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 10);
    ctx.stroke();

    // label above
    ctx.fillStyle = "rgba(40, 20, 0, 0.85)";
    ctx.font = "bold 13px 'Georgia', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label.toUpperCase(), bx, by - 14);

    // value or placeholder
    const display = isPassword ? "•".repeat(inp.value.length) : inp.value;
    const placeholder = inp.value === "";
    ctx.fillStyle = placeholder ? "rgba(40, 20, 0, 0.35)" : "rgba(20, 10, 0, 0.85)";
    ctx.font = "15px 'Georgia', serif";
    ctx.textAlign = "left";
    ctx.fillText(placeholder ? label : display, bx + 14, y);

    // blinking cursor
    if (inp.focused) {
        const textW = ctx.measureText(display).width;
        const cursorX = bx + 14 + textW + 2;
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = "rgba(20, 10, 0, 0.8)";
            ctx.fillRect(cursorX, by + 8, 2, h - 16);
        }
    }
}

function authPanel(title, submitLabel, onSubmit) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const pw = 320, ph = 300;
    const px = cx - pw / 2, py = cy - ph / 2;

    // panel shadow
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    // panel wood background
    const panelGrad = ctx.createLinearGradient(px, py, px, py + ph);
    panelGrad.addColorStop(0,   "#C4A020");
    panelGrad.addColorStop(0.5, "#B49010");
    panelGrad.addColorStop(1,   "#906808");
    ctx.fillStyle = panelGrad;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 18);
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // panel grain
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 18);
    ctx.clip();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    [0.15, 0.28, 0.42, 0.57, 0.7, 0.83, 0.93].forEach(t => {
        const gy = py + ph * t;
        ctx.beginPath();
        ctx.moveTo(px + 12, gy);
        ctx.quadraticCurveTo(px + pw * 0.35, gy + 3, px + pw * 0.65, gy - 2);
        ctx.quadraticCurveTo(px + pw * 0.85, gy + 2, px + pw - 12, gy);
        ctx.stroke();
    });
    ctx.restore();

    // panel border
    ctx.strokeStyle = "rgba(255, 220, 80, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(px + 1, py + 1, pw - 2, ph - 2, 17);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 18);
    ctx.stroke();

    // title
    ctx.fillStyle = "rgba(20, 10, 0, 0.85)";
    ctx.font = "bold 22px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title.toUpperCase(), cx, py + 36);

    // divider
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 20, py + 56);
    ctx.lineTo(px + pw - 20, py + 56);
    ctx.stroke();

    // inputs
    drawInput(title + "_user", "Username", cx, cy - 60, 260, 44, false);
    drawInput(title + "_pass", "Password", cx, cy + 10,  260, 44, true);

    // submit button
    if (button(submitLabel, cx, cy + 80, 200, 50, "")) {
        onSubmit();
    }

    // back button — smaller, bottom of panel
    const backBx = px + 12, backBy = py + ph - 34;
    const backHover = mouseX > backBx && mouseX < backBx + 60 && mouseY > backBy && mouseY < backBy + 22;
    ctx.fillStyle = backHover ? "rgba(20,10,0,0.7)" : "rgba(20,10,0,0.45)";
    ctx.font = "12px 'Georgia', serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("← Back", backBx, backBy + 11);
    if (clickX > backBx && clickX < backBx + 60 && clickY > backBy && clickY < backBy + 22) {
        scene = "home";
        Object.keys(inputs).forEach(k => inputs[k].focused = false);
        clickX = -1; clickY = -1;
    }
}

function userProfileCard(username, password, x, y, w, h) {
    const bx = x - w / 2, by = y - h / 2;

    ctx.save();

    // shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    // card background
    ctx.fillStyle = "#E9E9E9";
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 28);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // border
    ctx.strokeStyle = "#173540";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, 28);
    ctx.stroke();

    // avatar circle
    const r = Math.min(h * 0.28, 60);
    const cx = bx + 95;
    const cy = by + h / 2;

    ctx.fillStyle = "#1F6A8A";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#173540";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // text styles
    ctx.fillStyle = "#111";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "20px Arial";

    // password label
    ctx.fillText("Password:", bx + 170, by + h / 2 - 18);

    // username
    ctx.font = "24px Arial";
    ctx.fillText(username || "Username", bx + 170, by + h / 2 + 20);

    // optional password display beneath
    if (password !== undefined && password !== null) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillText(password, bx + 170, by + h / 2 + 48);
    }

    ctx.restore();
}
