chrome.storage.sync.get(['goldFullDisplay'], function(result) {
    document.getElementById("golddisplay").checked = result.goldFullDisplay;
});
chrome.storage.sync.get(['heatFullDisplay'], function(result) {
    document.getElementById("heatdisplay").checked = result.heatFullDisplay;
});
chrome.storage.sync.get(['expCalcDisplay'], function(result) {
    document.getElementById("expcalc").checked = result.expCalcDisplay;
});
chrome.storage.sync.get(['chatMentionsHighlight'], function(result) {
    document.getElementById("chatMentionsHighlight").checked = result.chatMentionsHighlight;
});
document.getElementById("golddisplay").addEventListener("input", function(checkbox) {
    chrome.storage.sync.set({"goldFullDisplay": checkbox.target.checked}, function() {
        userPrefChanged();
    });
});
document.getElementById("heatdisplay").addEventListener("input", function(checkbox) {
    chrome.storage.sync.set({"heatFullDisplay": checkbox.target.checked}, function() {
        userPrefChanged();
    });
});
document.getElementById("expcalc").addEventListener("input", function(checkbox) {
    chrome.storage.sync.set({"expCalcDisplay": checkbox.target.checked}, function() {
        userPrefChanged();
    });
});
document.getElementById("chatMentionsHighlight").addEventListener("input", function(checkbox) {
    chrome.storage.sync.set({"chatMentionsHighlight": checkbox.target.checked}, function() {
        userPrefChanged();
    });
});

function userPrefChanged() {

}