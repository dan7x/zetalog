// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({
            sheetID: "", // url to tracker gsheet
            sheetTab: "",
            records: {} // dict of(gameKey: [# played, score, {properties}])
        });
    }
});
