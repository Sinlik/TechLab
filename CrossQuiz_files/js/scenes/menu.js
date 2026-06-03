function menu() {
    // readGame()
    // deep space background
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

    // nebula glows
    ctx.save();
    const n1 = ctx.createRadialGradient(150, 200, 0, 150, 200, 220);
    n1.addColorStop(0, "rgba(80, 30, 180, 0.13)");
    n1.addColorStop(1, "rgba(80, 30, 180, 0)");
    ctx.fillStyle = n1; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const n2 = ctx.createRadialGradient(650, 400, 0, 650, 400, 200);
    n2.addColorStop(0, "rgba(20, 80, 200, 0.1)");
    n2.addColorStop(1, "rgba(20, 80, 200, 0)");
    ctx.fillStyle = n2; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const n3 = ctx.createRadialGradient(400, 500, 0, 400, 500, 160);
    n3.addColorStop(0, "rgba(0, 160, 120, 0.07)");
    n3.addColorStop(1, "rgba(0, 160, 120, 0)");
    ctx.fillStyle = n3; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // planet — large dim circle bottom right
    ctx.save();
    const planet = ctx.createRadialGradient(720, 560, 10, 700, 540, 130);
    planet.addColorStop(0, "rgba(40, 60, 140, 0.55)");
    planet.addColorStop(0.6, "rgba(20, 30, 80, 0.4)");
    planet.addColorStop(1, "rgba(10, 15, 40, 0)");
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(700, 550, 130, 0, Math.PI * 2);
    ctx.fill();
    // planet ring
    ctx.strokeStyle = "rgba(80, 120, 220, 0.2)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(700, 550, 180, 30, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // title

    // flicker logic
    flickerTimer++;
    if (flickerTimer % 180 === 0) {
        flickerOpacity = 0.2;
    } else if (flickerTimer % 180 < 8) {
        flickerOpacity = (flickerTimer % 2 === 0) ? 0.2 : 1;
    } else {
        flickerOpacity = 1;
    }

    // title
    ctx.shadowColor = `rgba(120, 180, 255, ${0.8 * flickerOpacity})`;
    ctx.shadowBlur = 18;
    ctx.fillStyle = `rgba(180, 215, 255, ${flickerOpacity})`;
    ctx.font = "bold 48px 'Courier New'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CROSSWIZZ", canvas.width / 2, 110);
    ctx.shadowBlur = 0;

    // subtitle
    ctx.fillStyle = "rgba(100, 140, 220, 0.7)";
    ctx.font = "11px 'Courier New'";
    ctx.fillText("S O L V E  ·  C L I C K  ·  S C O R E", canvas.width / 2, 148);
    button("Hub", canvas.width/ 2 - 275, canvas.height / 2 - 225, 150, 50, "hub");
    button("Start", canvas.width/ 2, canvas.height / 2 - 75, 150, 50, "levelSelect");
    button("How", canvas.width / 2, canvas.height / 2, 150, 50, "how");
    button("Save", canvas.width / 2, canvas.height / 2 + 75, 150, 50, "saveGame")
    button("States", canvas.width / 2, canvas.height / 2 + 150, 150, 50, "states");
    if (isAdmin)
        button("Admin", canvas.width / 2 + 275, canvas.height / 2 - 225, 150, 50, "admin");
    // button("Stat", canvas.width / 2, canvas.height / 2 + 150, 150, 50, "resetSession")
}