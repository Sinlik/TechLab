function waitForAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(resolve); // resolves with user or null
    });
}
