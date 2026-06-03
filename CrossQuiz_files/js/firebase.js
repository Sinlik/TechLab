
let adminList = ["noamwolf", "pinchas", "theboss"]

let saving = false;

async function saveGame() {
    if (saving) return;
    saving = true;

    try {
        const user = auth.currentUser;
        if (!user) return;

        const username = (user.displayName || user.email?.split("@")[0] || "").toLowerCase();
        isAdmin = checkAdmin(username);

        const delta = tilesClicked - lastSavedTilesClicked;

        if (delta > 0) {
            await db.collection("users").doc(user.uid).set({
                unlockedUpTo,
                tilesClicked: firebase.firestore.FieldValue.increment(delta),
                username,
                email: user.email,
                isAdmin
            }, { merge: true });

            lastSavedTilesClicked = tilesClicked;
            console.log(`✅ Saved +${delta} tilesClicked (total: ${tilesClicked})`);
        }
    } catch (e) {
        console.warn(e);
    } finally {
        saving = false;
    }
}

async function readGame() {
    const user = auth.currentUser;
    if (!user) {
        // localStorage fallback...
        return;
    }
    try {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.unlockedUpTo) unlockedUpTo = data.unlockedUpTo;
            if (data.tilesClicked !== undefined) {
                tilesClicked = data.tilesClicked;
                lastSavedTilesClicked = data.tilesClicked;   // ← IMPORTANT
            }
            const username = data.username || user.email?.split("@")[0] || "";
            isAdmin = checkAdmin(username);
        }
    } catch (e) {
        console.warn("Firebase read failed.", e);
    }
}


async function saveLevelQuestions() {
    if (!currentLevelQuestions || currentLevelQuestions.length === 0) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        const levelKey = `level_${selectedLevel}_questions`;

        await db.collection("users").doc(user.uid).set({
            [levelKey]: currentLevelQuestions,
            lastPlayedLevel: selectedLevel,
            lastPlayedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Saved ${currentLevelQuestions.length} questions for level ${selectedLevel}`);
    } catch (e) {
        console.warn("Failed to save level questions:", e);
    }
}

function checkAdmin(username) {
    return adminList.includes((username || "").toLowerCase());
}

// Auth listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            currentUserFirebase = data.username || "";
            currentEmailFirebase = data.email || "";
            isAdmin = checkAdmin(currentUserFirebase);
        }
    }
});