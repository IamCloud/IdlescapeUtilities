var gold = "";
var heat = "";
var username = "";
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		//Gold
		chrome.storage.sync.get(['goldFullDisplay'], function(result) {
			if (result.goldFullDisplay) {
				var goldObserver = new MutationObserver(function(mutations, observer) {
					if (mutations[0].target) {
						setGoldDisplay(mutations[0].target.textContent);
					}
				});

				goldObserver.observe(document.querySelector("#gold-tooltip > span"), {
					characterData: true, 
					subtree: true
				});
			
				setGoldDisplay(document.querySelector("#gold-tooltip > span").textContent);
			}
		});

		//Heat
		chrome.storage.sync.get(['heatFullDisplay'], function(result) {
			if (result.heatFullDisplay) {
				var heatObserver = new MutationObserver(function(mutations, observer) {
					if (mutations[0].target) {
						setHeatDisplay(mutations[0].target.textContent);
					}
				});
				heatObserver.observe(document.querySelector("#heat-tooltip > span"), {
					characterData: true, 
					subtree: true
				});
			
				setHeatDisplay(document.querySelector("#heat-tooltip > span").textContent);
				
			}
		});

		//EXP calc
		chrome.storage.sync.get(['expCalcDisplay'], function(result) {
			if (result.expCalcDisplay) {
				var playAreaObserver = new MutationObserver(function(mutations, observer) {
					// fired when a mutation occurs
					playerAreaChanged(mutations[0].target, observer);
					// ...
				});
				playAreaObserver.observe(document.getElementsByClassName("play-area")[0], {
					attributes: true
				});

				playerAreaChanged(document.getElementsByClassName("play-area")[0]);
			}
		});

		//Chat highlight
		chrome.storage.sync.get(['chatMentionsHighlight'], function(result) {
			if (result.chatMentionsHighlight) {
				username = document.querySelector(".navbar1").firstChild.childNodes[1].textContent;
				var chatObserver = new MutationObserver(function(mutations, observer) {
					chatChanged(mutations, observer);
				});
				chatObserver.observe(document.getElementsByClassName("chat-message-list")[0].firstChild, {
					childList: true
				});
			}
		});


	}
	}, 10);
});

function chatChanged(mutation, observer) {
	var target = mutation[0].target.lastChild.firstChild.childNodes[1];
	if (target) {
		var text = target.textContent;
		if (text.includes(username)) {
			target.classList.add("chatHighlight");
		}
	}	
}
function playerAreaChanged(target, observer) {
	var AverageExpPerTick;
	var remainingExpToLevel;
	if (target.classList.contains("theme-mining")) {
		AverageExpPerTick = [2.6, 4.66, 10.25, 18.61, 22.80, 48.60, 53.50, 67.05];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("miningHeader").querySelectorAll("span")[4].textContent));
	} else if(target.classList.contains("theme-foraging")) {
		AverageExpPerTick = [10.38, 18.25, 8.08, 38.26, 31.50, 17.94, 52.28, 49.73];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("foragingHeader").querySelectorAll("span")[4].textContent));
	} else if(target.classList.contains("theme-fishing")) {
		AverageExpPerTick = [10.92, 36.02, 35, 30.38];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("fishingHeader").querySelectorAll("span")[4].textContent));
	} else if(target.classList.contains("theme-smithing")) {
		AverageExpPerTick = [10, 100, 100,200,300,1000,1500];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("smithingHeader").querySelectorAll("span")[4].textContent));
	}

	if (AverageExpPerTick) {
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);

		Array.from(document.getElementsByClassName("scrolling-text")).forEach(function(element) {
			var scrollingTextObserver = new MutationObserver(function(mutations, observer) {
				updateTimeLefts(AverageExpPerTick);
			});
			scrollingTextObserver.observe(element, {
				attributes: true
			});
		});
	}
}

function updateTimeLefts(AverageExpPerTick) {
	var timelefts = document.querySelectorAll("[IU-class='timeleft']");
	var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("smithingHeader").querySelectorAll("span")[4].textContent));
	for (var i = 0; i < timelefts.length; i++) {
		var wrapper = document.getElementsByClassName("resource-wrapper")[i];
		timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getExpPerHour(wrapper, AverageExpPerTick[i])).toFixed(2) + "h to lvl";
	}
}

function getExpPerHour(wrapper, averageExpPerTick) {
	var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
	var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
	var avrExpPerTick = averageExpPerTick;
	if (document.getElementsByClassName("buff-donation")[0]) {
		avrExpPerTick = avrExpPerTick * 1.20;
	}
	return parseInt(((3600/seconds) * avrExpPerTick).toFixed(2));
}

function extractIntFromString(text) {
	var numb = text.match(/\d/g);
	return numb.join("");
}

function setGoldDisplay(goldText) {
	document.getElementById("gold").innerText = goldText;
}

function setHeatDisplay(goldText) {
	document.getElementById("heat").innerText = goldText;
}

function displayExpCalcs(AverageExpPerTick, remainingExpToLevel) {
	var resourceListWrappers = document.getElementsByClassName("resource-wrapper");
	for (var i = 0; i < resourceListWrappers.length; i++) {
		var wrapper = document.getElementsByClassName("resource-wrapper")[i];
		var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];

		var expPerHour = getExpPerHour(wrapper, AverageExpPerTick[i]);

		var expPerHourElem = timeTooltip.parentElement.cloneNode(true);
		
		expPerHourElem.firstChild.removeChild(expPerHourElem.firstChild.childNodes[0]);
		var timeLeftElem = expPerHourElem.cloneNode(true);
		expPerHourElem.setAttribute("IU-class", "expperhour");
		expPerHourElem.querySelector("span").textContent = numberWithSpaces(expPerHour) + " exp/h ";
		timeTooltip.parentElement.parentElement.appendChild(expPerHourElem);

		timeLeftElem.setAttribute("IU-class", "timeleft");
		timeLeftElem.querySelector("span").textContent = (remainingExpToLevel / expPerHour).toFixed(2) + "h to lvl";
		timeTooltip.parentElement.parentElement.appendChild(timeLeftElem);
	}
};

function numberWithSpaces(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}
