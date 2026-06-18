
let saving = false;

async function saveGame() {
    if (saving) return;
    saving = true;

    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn("❌ No user logged in - cannot save");
            saving = false;
            return;
        }

        const username = (user.displayName || user.email?.split("@")[0] || "").toLowerCase();
        isAdmin = checkAdmin(username);

        const delta = tilesClicked - lastSavedTilesClicked;

        if (delta > 0) {
            console.log(`📤 Saving +${delta} tilesClicked... (current: ${tilesClicked}, last: ${lastSavedTilesClicked})`);
            
            const updateData = {
                unlockedUpTo,
                username,
                email: user.email,
                isAdmin,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Use increment helper for tilesClicked
            updateData.tilesClicked = firebase.firestore.FieldValue.increment(delta);
            
            await db.collection("users").doc(user.uid).set(updateData, { merge: true });

            lastSavedTilesClicked = tilesClicked;
            console.log(`✅ Saved +${delta} tilesClicked (total: ${tilesClicked})`);
        } else {
            console.log(`ℹ️ No new tiles to save (delta: ${delta})`);
        }
    } catch (e) {
        console.error("❌ Save failed:", e);
    } finally {
        saving = false;
    }
}

async function readGame() {
    const user = auth.currentUser;
    if (!user) {
        console.warn("❌ No user logged in - cannot read game data");
        return;
    }
    try {
        const doc = await db.collection("users").doc(user.uid).get();
        if (doc.exists) {
            const data = doc.data();
            console.log("📥 Firebase data loaded:", data);
            
            if (data.unlockedUpTo) {
                unlockedUpTo = data.unlockedUpTo;
                console.log(`✅ Loaded unlockedUpTo: ${unlockedUpTo}`);
            }
            if (data.tilesClicked !== undefined) {
                tilesClicked = data.tilesClicked;
                lastSavedTilesClicked = data.tilesClicked;
                console.log(`✅ Loaded tilesClicked: ${tilesClicked}`);
            }
            const username = data.username || user.email?.split("@")[0] || "";
            isAdmin = checkAdmin(username);
            console.log(`✅ Loaded username: ${username}, isAdmin: ${isAdmin}`);
        } else {
            console.log("ℹ️ No user document found in Firebase - first login");
        }
    } catch (e) {
        console.error("❌ Firebase read failed:", e);
    } 
}


async function saveLevelQuestions() {
    if (!currentLevelQuestions || currentLevelQuestions.length === 0) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        const levelKey = `level_${selectedLevel}_questions`;
        const levelAnswersKey = `level_${selectedLevel}_answers`;

        console.log(`💾 Saving ${currentLevelAnswers.length} answers for level ${selectedLevel}`);
        console.log(`   Answers data:`, currentLevelAnswers);

        const updateData = {
            [levelKey]: currentLevelQuestions,
            [levelAnswersKey]: currentLevelAnswers,
            lastPlayedLevel: selectedLevel,
            lastPlayedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("users").doc(user.uid).set(updateData, { merge: true });

        console.log(`✅ Saved ${currentLevelQuestions.length} questions and answers for level ${selectedLevel}`);
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