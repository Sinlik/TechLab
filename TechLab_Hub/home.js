// home.js — only hub-specific logic

let scene = "home";
let currentUserFirebase = "";
let currentEmailFirebase = "";
let signUpError = "";
let signInError = "";

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

function gameLoop() {
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
        userProfileCard(currentUserFirebase, currentEmailFirebase, canvas.width - 180, 120, 320, 140);
        button("Sign Up", canvas.width / 2, canvas.height / 2 - 250, 180, 60, "signUp");
        button("Sign In", canvas.width / 2, canvas.height / 2 - 175, 180, 60, "signIn");
        button("Games",   canvas.width / 2 - 225, canvas.height / 2 - 250, 180, 60, "games");
    }

    clickX = -1; clickY = -1;
    requestAnimationFrame(gameLoop);
}

waitForAuth().then(() => gameLoop());