var gold = "";
var heat = "";
var username = "";
var CONST_FISHES = [new Fish("Shrimp", 5, 59.84),
new Fish("Anchovy", 25, 40.16),
new Fish("Trout", 50, 59.84),
new Fish("Salmon", 75, 40.16),
new Fish("Lobster", 100, 100),
new Fish("Tuna", 125, 59.84),
new Fish("Shark", 150, 40.16)];
var CONST_ZONES = [new FishingZone("Net", [0, 1]),
new FishingZone("Net", [2, 3]),
new FishingZone("Net", [4]),
new FishingZone("Net", [5, 6])];

function Fish(name, exp, percentChance) {
	this.name = name;
	this.exp = exp;
	this.percentChance = percentChance;
}

function FishingZone(name, fishesIndeces) {
	this.name = name;
	this.fishes = [];
	for (var i = 0; i < fishesIndeces.length; i++) {
		this.fishes.push(CONST_FISHES[fishesIndeces[i]]);
	}
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;



var readyStateCheckInterval = setInterval(function () {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		function onReady(callback) {
			var intervalId = window.setInterval(function () {
				if (document.getElementsByClassName('combine-main-area')[0] !== undefined) {
					window.clearInterval(intervalId);
					callback.call(this);
				}
			}, 500);
		}

		onReady(LoadScript);

	}
}, 10);


function LoadScript() {
	//Gold
	chrome.storage.sync.get(['goldFullDisplay'], function (result) {
		var goldFullDisplay = false;
		if (result === undefined) {
			chrome.storage.sync.set({ "goldFullDisplay": true });
			goldFullDisplay = true;
		} else {
			goldFullDisplay = result.goldFullDisplay;
		}
		if (goldFullDisplay) {

			var observedNode = document.querySelector("#gold-tooltip > span");

			var goldObserver = new MutationObserver(function (mutations, observer) {
				if (mutations[0].target) {
					setGoldDisplay(mutations[0].target.textContent);
				}
			});

			goldObserver.observe(observedNode, {
				characterData: true,
				subtree: true
			});

			setGoldDisplay(observedNode.textContent);

		}
	});

	//Heat
	chrome.storage.sync.get(['heatFullDisplay'], function (result) {
		var heatFullDisplay = false;
		if (result === undefined) {
			chrome.storage.sync.set({ "heatFullDisplay": true });
			heatFullDisplay = true;
		} else {
			heatFullDisplay = result.heatFullDisplay;
		}
		if (heatFullDisplay) {

			var observedNode = document.querySelector("#heat-tooltip > span");

			var heatObserver = new MutationObserver(function (mutations, observer) {
				if (mutations[0].target) {
					setHeatDisplay(mutations[0].target.textContent);
				}
			});
			heatObserver.observe(observedNode, {
				characterData: true,
				subtree: true
			});

			setHeatDisplay(observedNode.textContent);
		}
	});

	//EXP calc
	chrome.storage.sync.get(['expCalcDisplay'], function (result) {
		var expCalcDisplay = false;
		if (result === undefined) {
			chrome.storage.sync.set({ "expCalcDisplay": true });
			expCalcDisplay = true;
		} else {
			expCalcDisplay = result.expCalcDisplay;
		}
		if (expCalcDisplay) {


			var observedNode = document.getElementsByClassName("play-area")[0];

			var playAreaObserver = new MutationObserver(function (mutations, observer) {
				// fired when a mutation occurs
				playerAreaChanged(mutations[0].target, observer);
				// ...
			});
			playAreaObserver.observe(observedNode, {
				attributes: true
			});

			playerAreaChanged(observedNode);

		}
	});
	//Chat highlight
	// chrome.storage.sync.get(['chatMentionsHighlight'], function(result) {
	// 	var chatMentionsHighlight = false;
	// 	if (result !== true) {
	// 		chrome.storage.sync.set({"chatMentionsHighlight": false});
	// 		chatMentionsHighlight = false;
	// 	} else {
	// 		chatMentionsHighlight = result.chatMentionsHighlight;
	// 	}
	// 	if (chatMentionsHighlight) {
	// 		username = document.querySelector(".navbar1").firstChild.childNodes[1].textContent;
	// 		var chatObserver = new MutationObserver(function(mutations, observer) {
	// 			chatChanged(mutations, observer);
	// 		});
	// 		chatObserver.observe(document.getElementsByClassName("chat-message-list")[0].firstChild, {
	// 			childList: true
	// 		});
	// 	}
	// });

	createPopup();
	addExtensionPopupButton();
}

function addExtensionPopupButton() {
	var userOnline = document.getElementById("usersOnline");
	var img = document.createElement('img');
	img.className = "extIcon";
	img.src = chrome.extension.getURL('/icons/icon48.png');
	img.alt = "IU";
	img.addEventListener("click", function () {
		openPopup();
	});
	userOnline.appendChild(img);
}

function openPopup() {
	var modal = document.getElementById("IU-modal");
	modal.style.display = "block";
}
function closePopup() {
	var modal = document.getElementById("IU-modal");
	modal.style.display = "none";
}
function createPopup() {
	var request = new XMLHttpRequest();
	request.open('GET', chrome.extension.getURL('src/popup/popup.html'), true);

	request.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			// Success!
			var modal = document.createElement("div");
			modal.innerHTML = this.response;
			document.body.appendChild(modal);
			initModalScript();
		} else {
			// We reached our target server, but it returned an error
			console.log("Idlescape utilities error encountered. We reached our target server, but it returned an error")
		}
	};

	request.onerror = function () {
		// There was a connection error of some sort
		console.log("Idlescape utilities error encountered. There was a connection error of some sort")
	};

	request.send();
}



function chatChanged(mutation, observer) {
	var target = mutation[0].target.lastChild.firstChild.childNodes[1];
	if (target) {
		var text = target.textContent;
		if (text.includes(username)) {
			target.classList.add("chatHighlight");
		}
	}
}

var scrollingTextObserver;
function playerAreaChanged(target, observer) {
	if (scrollingTextObserver) { scrollingTextObserver.disconnect(); }
	var AverageExpPerTick;
	var remainingExpToLevel;
	if (target.classList.contains("theme-mining")) {
		AverageExpPerTick = [2.6, 4.66, 10.25, 18.61, 22.80, 48.60, 53.50, 67.05];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("miningHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachExpLeftObserver("miningHeader", AverageExpPerTick);
		AttachTimeObserver("miningHeader", AverageExpPerTick);
	} else if (target.classList.contains("theme-foraging")) {
		AverageExpPerTick = [10.38, 18.25, 8.08, 38.26, 31.50, 17.94, 52.28, 49.73];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("foragingHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachExpLeftObserver("foragingHeader", AverageExpPerTick);
		AttachTimeObserver("foragingHeader", AverageExpPerTick);
	} else if (target.classList.contains("theme-smithing")) {
		AverageExpPerTick = [10, 100, 100, 200, 300, 1000, 1500];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("smithingHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachExpLeftObserver("smithingHeader", AverageExpPerTick);
		AttachTimeObserver("smithingHeader", AverageExpPerTick);
	} else if (target.classList.contains("theme-fishing")) {
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("fishingHeader").querySelectorAll("span")[4].textContent));
		displayFishingExpCalcs(remainingExpToLevel);
		AttachExpLeftObserver("fishingHeader");
		AttachFishingChanceObserver("fishingHeader");
		AttachTimeObserver("fishingHeader");
	}
}

function AttachExpLeftObserver(headerId, averageExpPerTick) {
	Array.from(document.getElementsByClassName("scrolling-text")).forEach(function (element) {
		scrollingTextObserver = new MutationObserver(function (mutations, observer) {
			var timelefts = document.querySelectorAll("[IU-class='timeleft']");
			var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById(headerId).querySelectorAll("span")[4].textContent));
			for (var i = 0; i < timelefts.length; i++) {
				var wrapper = document.getElementsByClassName("resource-wrapper")[i];
				if (headerId === "fishingHeader") {
					var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
					var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
					var percentTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[2];
					timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))).toFixed(2) + "h to lvl";
				} else {
					timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getExpPerHour(wrapper, averageExpPerTick[i])).toFixed(2) + "h to lvl";
				}
			}
		});
		scrollingTextObserver.observe(element, {
			attributes: true
		});
	});
}

function AttachFishingChanceObserver(headerId) {
	Array.from(document.querySelectorAll(".resource-required-resources div:nth-of-type(3)")).forEach(function (element) {
		var fishingChanceObserver = new MutationObserver(function (mutations, observer) {
			var timelefts = document.querySelectorAll("[IU-class='timeleft']");
			var expPerHours = document.querySelectorAll("[IU-class='expperhour']");
			var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById(headerId).querySelectorAll("span")[4].textContent));
			for (var i = 0; i < timelefts.length; i++) {
				var wrapper = document.getElementsByClassName("resource-wrapper")[i];
				var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
				var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
				var percentTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[2];
				timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))).toFixed(2) + "h to lvl";
				expPerHours[i].querySelector("span").textContent = numberWithSpaces(getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))) + " exp/h ";
			}
		});
		fishingChanceObserver.observe(element, {
			characterData: true,
			subtree: true
		});
	});
}

function AttachTimeObserver(headerId, averageExpPerTick) {
	Array.from(document.querySelectorAll(".resource-required-resources div:nth-of-type(2)")).forEach(function (element) {
		var timeObserver = new MutationObserver(function (mutations, observer) {
			var timelefts = document.querySelectorAll("[IU-class='timeleft']");
			var expPerHours = document.querySelectorAll("[IU-class='expperhour']");
			var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById(headerId).querySelectorAll("span")[4].textContent));
			for (var i = 0; i < timelefts.length; i++) {
				var wrapper = document.getElementsByClassName("resource-wrapper")[i];
				var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
				var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
				var percentTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[2];
				if (headerId === "fishingHeader") {
					timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))).toFixed(2) + "h to lvl";
					expPerHours[i].querySelector("span").textContent = numberWithSpaces(getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))) + " exp/h ";
				} else {
					timelefts[i].querySelector("span").textContent = (remainingExpToLevel / getExpPerHour(wrapper, averageExpPerTick[i])).toFixed(2) + "h to lvl";
					expPerHours[i].querySelector("span").textContent = numberWithSpaces(getExpPerHour(wrapper, averageExpPerTick[i])) + " exp/h ";
				}
			}
		});
		timeObserver.observe(element, {
			characterData: true,
			subtree: true
		});
	});
}

function getExpPerHour(wrapper, averageExpPerTick) {
	var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
	var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
	var avrExpPerTick = averageExpPerTick;
	if (document.getElementsByClassName("buff-donation")[0]) {
		avrExpPerTick = avrExpPerTick * 1.20;
	}
	return parseInt(((3600 / seconds) * avrExpPerTick).toFixed(2));
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
}

function displayFishingExpCalcs(remainingExpToLevel) {
	var resourceListWrappers = document.getElementsByClassName("resource-wrapper");
	for (var i = 0; i < resourceListWrappers.length; i++) {
		var wrapper = document.getElementsByClassName("resource-wrapper")[i];
		var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
		var percentTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[2];

		var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));

		var expPerHour = getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)));
		if (document.getElementsByClassName("buff-donation")[0]) {
			expPerHour = expPerHour * 1.20;
		}

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
}

function getFishingExpHour(currentZone, seconds, zonePercent) {
	var totalExp = 0;

	for (var i = 0; i < currentZone.fishes.length; i++) {
		var currentFishChance = (currentZone.fishes[i].percentChance * zonePercent) / 100;
		var lootPerHour = (3600 / seconds) * (currentFishChance / 100);
		totalExp += lootPerHour * currentZone.fishes[i].exp;
	}
	return Math.round(totalExp);
}


function numberWithSpaces(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	return parts.join(".");
}

//Modal script
function initModalScript() {
	chrome.storage.sync.get(['goldFullDisplay'], function (result) {
		document.getElementById("golddisplay").checked = result.goldFullDisplay;
	});
	chrome.storage.sync.get(['heatFullDisplay'], function (result) {
		document.getElementById("heatdisplay").checked = result.heatFullDisplay;
	});
	chrome.storage.sync.get(['expCalcDisplay'], function (result) {
		document.getElementById("expcalc").checked = result.expCalcDisplay;
	});
	// chrome.storage.sync.get(['chatMentionsHighlight'], function(result) {
	//     document.getElementById("chatMentionsHighlight").checked = result.chatMentionsHighlight;
	// });
	document.getElementById("golddisplay").addEventListener("input", function (checkbox) {
		chrome.storage.sync.set({ "goldFullDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("heatdisplay").addEventListener("input", function (checkbox) {
		chrome.storage.sync.set({ "heatFullDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("expcalc").addEventListener("input", function (checkbox) {
		chrome.storage.sync.set({ "expCalcDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});

	document.getElementById("IU-close").addEventListener("click", function () {
		closePopup();
	});
	function userPrefChanged() {

	}
}