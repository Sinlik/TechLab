// home.js — only hub-specific logic

let scene = "home";
let currentUserFirebase = "";
let currentEmailFirebase = "";
let signUpError = "";
let signInError = "";

function homeBackground() {
    const { surfY, netCX, netTop } = background(time);

    const H = canvas.height, W = canvas.width;
    const figY = surfY + H * 0.06;
    const figSize = H * 0.1;
    const period = 3.0;
    const phase = (time % period) / period;
    const ballStartX = W * 0.25, ballStartY = figY - figSize * 2;
    const ballPeakY = netTop - H * 0.08;
    const ballEndX = W * 0.65, ballEndY = figY - figSize * 2;
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
    userProfileCard(currentUserFirebase, currentEmailFirebase, W - 180, 120, 320, 140);
    button("Sign Up", W / 2,       H / 2 - 250, 180, 60, "signUp");
    button("Sign In", W / 2,       H / 2 - 175, 180, 60, "signIn");
    button("Games",   W / 2 - 225, H / 2 - 250, 180, 60, "games");
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            currentUserFirebase = data.username || "";
            currentEmailFirebase = data.email || "";
        }
    } else {
        currentUserFirebase = "";
        currentEmailFirebase = "";
    }
});

function signUpScreen() {
    homeBackground();
    authPanel("Sign Up", "Create Account", async () => {
        const rawUser = getInput("Sign Up_user").value.trim();
        const pass = getInput("Sign Up_pass").value.trim();

        const userRegex = /^[a-zA-Z0-9._-]+$/;
        if (!rawUser || !userRegex.test(rawUser)) { signUpError = "Invalid username."; return; }

        const email = rawUser.toLowerCase() + "@crosswizz.game";
        try {
            const cred = await auth.createUserWithEmailAndPassword(email, pass);
            await db.collection("users").doc(cred.user.uid).set({
                username: rawUser, email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            scene = "home";
        } catch (e) { signUpError = e.message; }
    });
}

function signInScreen() {
    homeBackground();
    authPanel("Sign In", "Log In", async () => {
        const user = getInput("Sign In_user").value.trim();
        const pass = getInput("Sign In_pass").value.trim();

        const email = user.toLowerCase() + "@crosswizz.game";
        try {
            const cred = await auth.signInWithEmailAndPassword(email, pass);
            const doc = await db.collection("users").doc(cred.user.uid).get();
            if (!doc.exists) { signInError = "User profile not found."; return; }
            scene = "home";
        } catch (e) { signInError = e.message; }
    });
}

function gameLoop(ts) {
    if (!last) last = ts;
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    time += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (scene === "signUp") {
        signUpScreen();
    } else if (scene === "signIn") {
        signInScreen();
    } else if (scene === "games") {
        scene = "redirecting";
        window.location.href = "../CrossQuiz_files/index.html";
    } else {
        homeBackground();
    }

    clickX = -1; clickY = -1;
    requestAnimationFrame(gameLoop);
}

waitForAuth().then(() => requestAnimationFrame(gameLoop));
