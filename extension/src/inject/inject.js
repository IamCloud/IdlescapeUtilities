var gold = "";
var heat = "";
var username = "";
var GLB_FarmingTimeDisplay = true;
var GLB_DisplayExpCalc = true;
var GLB_MarketHistoryUnitDisplay = true;
var GLB_essenceNeeded = 400;
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
			}, 1000);
		}

		onReady(LoadScript);

	}
}, 10);


function LoadScript() {

	//Gold
	chrome.storage.local.get(['goldFullDisplay'], function (result) {
		var goldFullDisplay = false;
		if (result.goldFullDisplay === undefined) {
			chrome.storage.local.set({ "goldFullDisplay": true });
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
	chrome.storage.local.get(['heatFullDisplay'], function (result) {
		var heatFullDisplay = false;
		if (result.heatFullDisplay === undefined) {
			chrome.storage.local.set({ "heatFullDisplay": true });
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
	chrome.storage.local.get(['expCalcDisplay'], function (result) {
		if (result.expCalcDisplay === undefined) {
			chrome.storage.local.set({ "expCalcDisplay": true });
			GLB_DisplayExpCalc = true;
		} else {
			GLB_DisplayExpCalc = result.expCalcDisplay;
		}
		addPlayerAreaObserverIfNeeded();
	});

	//Set default runecrafting
	chrome.storage.local.get(['runecraftingPercent'], function (result) {
		if (result.runecraftingPercent === undefined) {
			chrome.storage.local.set({ "runecraftingPercent": 0 });
		}
	});
	//Farming
	chrome.storage.local.get(['farmingTimeDisplay'], function (result) {
		if (result.farmingTimeDisplay === undefined) {
			chrome.storage.local.set({ "farmingTimeDisplay": true });
			GLB_FarmingTimeDisplay = true;
		} else {
			GLB_FarmingTimeDisplay = result.farmingTimeDisplay;
		}
		addPlayerAreaObserverIfNeeded();
	});

	//Market History
	chrome.storage.local.get(['marketHistoryByUnit'], function (result) {
		if (result.marketHistoryByUnit === undefined) {
			chrome.storage.local.set({ "marketHistoryByUnit": true });
			GLB_MarketHistoryUnitDisplay = true;
		} else {
			GLB_MarketHistoryUnitDisplay = result.marketHistoryByUnit;
		}
		addPlayerAreaObserverIfNeeded();
	});




	//Chat highlight
	// chrome.storage.local.get(['chatMentionsHighlight'], function(result) {
	// 	var chatMentionsHighlight = false;
	// 	if (result !== true) {
	// 		chrome.storage.local.set({"chatMentionsHighlight": false});
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

var playerAreaObserverAlreadySet = false;
function addPlayerAreaObserverIfNeeded() {
	if (!playerAreaObserverAlreadySet && (GLB_DisplayExpCalc || GLB_FarmingTimeDisplay || GLB_MarketHistoryUnitDisplay)) {
		var observedNode = document.getElementsByClassName("play-area")[0];

		var playAreaObserver = new MutationObserver(function (mutations, observer) {
			// fired when a mutation occurs
			playerAreaChanged(mutations[0].target, observer);
			// ...
		});
		playAreaObserver.observe(observedNode, {
			attributes: true, childList: true
		});

		playerAreaChanged(observedNode);
		playerAreaObserverAlreadySet = true;
	}
}

function addExtensionPopupButton() {
	var userOnline = document.getElementById("usersOnline");
	var img = document.createElement('img');
	img.className = "extIcon";
	if (window.browser) {
		img.src = browser.runtime.getURL('/icons/icon48.png');
	} else {
		img.src = chrome.runtime.getURL('/icons/icon48.png');
	}
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
	if (window.browser) {
		request.open('GET', browser.runtime.getURL('src/popup/popup.html'), true);
	} else {
		request.open('GET', chrome.runtime.getURL('src/popup/popup.html'), true);
	}

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
var marketplaceObserver;
function playerAreaChanged(target, observer) {
	if (scrollingTextObserver) { scrollingTextObserver.disconnect(); }
	if (marketplaceObserver) { marketplaceObserver.disconnect(); }
	var AverageExpPerTick;
	var remainingExpToLevel;
	if (GLB_DisplayExpCalc && target.classList.contains("theme-mining")) {
		AverageExpPerTick = [2.6, 4.66, 10.25, 18.61, 22.80, 48.60, 53.50, 67.05];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("miningHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachScrollingTextObservers("miningHeader", AverageExpPerTick);
	} else if (GLB_DisplayExpCalc && target.classList.contains("theme-foraging") && !target.firstChild.firstChild.classList.contains("farming-container")) {
		AverageExpPerTick = [10.38, 18.25, 8.08, 38.26, 31.50, 17.94, 52.28, 49.73];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("foragingHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachScrollingTextObservers("foragingHeader", AverageExpPerTick);
	} else if (GLB_FarmingTimeDisplay && target.classList.contains("theme-foraging") && target.firstChild.firstChild.classList.contains("farming-container")) {
		displayFarmingTimesLeft();
	} else if (GLB_DisplayExpCalc && target.classList.contains("theme-smithing")) {
		AverageExpPerTick = [10, 100, 100, 200, 300, 1000, 1500];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("smithingHeader").querySelectorAll("span")[4].textContent));
		displayExpCalcs(AverageExpPerTick, remainingExpToLevel);
		AttachScrollingTextObservers("smithingHeader", AverageExpPerTick);
	} else if (GLB_DisplayExpCalc && target.classList.contains("theme-fishing")) {
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("fishingHeader").querySelectorAll("span")[4].textContent));
		displayFishingExpCalcs(remainingExpToLevel);
		AttachScrollingTextObservers("fishingHeader");
	} else if (GLB_DisplayExpCalc && target.classList.contains("theme-runecrafting")) {
		AverageExpPerTick = [100];
		remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("runecraftingHeader").querySelectorAll("span")[4].textContent));
		addRunecraftingPercentInputField();
		displayRunecraftingExpCalcs([100], remainingExpToLevel);
		AttachEssenceObserver([100]);
	} else if (GLB_MarketHistoryUnitDisplay && target.classList.contains("theme-default") && target.querySelector(".marketplace-buy-info")) {
		AttachMarketplaceObserver();
	}
}

var GLB_extraPercentExp = 1;
function AttachScrollingTextObservers(headerId, averageExpPerTick) {
	Array.from(document.getElementsByClassName("scrolling-text")).forEach(function (element) {
		scrollingTextObserver = new MutationObserver(function (mutations, observer) {
			var timelefts = document.querySelectorAll("[IU-class='timeleft']");
			var expPerHours = document.querySelectorAll("[IU-class='expperhour']");
			var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById(headerId).querySelectorAll("span")[4].textContent));
			for (var i = 0; i < timelefts.length; i++) {
				var wrapper = document.getElementsByClassName("resource-wrapper")[i];

				setGlobalExtraPercentExp();

				if (headerId === "fishingHeader") {
					var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
					var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
					var percentTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[2];
					timelefts[i].querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1))));
					expPerHours[i].querySelector("span").textContent = numberWithSpaces(getFishingExpHour(CONST_ZONES[i], seconds, parseFloat(percentTooltip.querySelector("span").textContent.slice(0, -1)))) + " exp/h ";
				} else {
					var extraExp = (averageExpPerTick[i] * GLB_extraPercentExp) / 100;
					timelefts[i].querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / getExpPerHour(wrapper, averageExpPerTick[i] + extraExp));
					expPerHours[i].querySelector("span").textContent = numberWithSpaces(getExpPerHour(wrapper, averageExpPerTick[i] + extraExp)) + " exp/h ";
				}
			}
		});
		scrollingTextObserver.observe(element, {
			attributes: true
		});
	});
}

function AttachMarketplaceObserver() {

	marketplaceObserver = new MutationObserver(function (mutations, observer) {
		if (mutations[0].target.classList.contains("marketplace-history") && mutations[0].target.children.length > 1) {
			displayMarketHistoryUnitCost(mutations[0].target);
			marketplaceObserver.disconnect();
		}
	});
	marketplaceObserver.observe(document.getElementsByClassName("play-area-container")[0], {
		attributes: true, childList: true, subtree: true
	});
}

function setGlobalExtraPercentExp() {
	var activeScrolling = document.getElementsByClassName("scrolling-text-active")[0];
	if (activeScrolling) {
		var scrollingText = document.getElementsByClassName("scrolling-text-active")[0].textContent;
		var normalExp = scrollingText.split(" ")[0];
		var extraExpElem = scrollingText.split("(+")[1];
		if (extraExpElem) {
			let extraExpText = extraExpElem.substring(0, extraExpElem.length - 4);
			GLB_extraPercentExp = (extraExpText / normalExp) * 100;
		} else {
			GLB_extraPercentExp = 1;
		}
	}
}

function getExpPerHour(wrapper, averageExpPerTick) {
	var timeTooltip = wrapper.querySelectorAll(".resource-node-time-tooltip")[1];
	var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
	return parseInt(((3600 / seconds) * averageExpPerTick).toFixed(2));
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

		var extraExp = (AverageExpPerTick[i] * GLB_extraPercentExp) / 100;
		var expPerHour = getExpPerHour(wrapper, AverageExpPerTick[i] + extraExp);

		var expPerHourElem = timeTooltip.parentElement.cloneNode(true);

		expPerHourElem.firstChild.removeChild(expPerHourElem.firstChild.childNodes[0]);
		var timeLeftElem = expPerHourElem.cloneNode(true);
		expPerHourElem.setAttribute("IU-class", "expperhour");
		expPerHourElem.querySelector("span").textContent = numberWithSpaces(expPerHour) + " exp/h ";
		timeTooltip.parentElement.parentElement.appendChild(expPerHourElem);

		timeLeftElem.setAttribute("IU-class", "timeleft");
		timeLeftElem.querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / expPerHour);
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
		expPerHourElem.querySelector("span").textContent = numberWithSpaces(expPerHour.toFixed(0)) + " exp/h";
		timeTooltip.parentElement.parentElement.appendChild(expPerHourElem);

		timeLeftElem.setAttribute("IU-class", "timeleft");
		timeLeftElem.querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / expPerHour);
		timeTooltip.parentElement.parentElement.appendChild(timeLeftElem);
	}
}

function addRunecraftingPercentInputField() {
	var info = document.getElementsByClassName("runecrafting-info")[0];
	var nextLine = document.createElement("br");
	info.appendChild(nextLine);
	var label = document.createElement("span");
	label.innerText = "Runecrafting enchant percent (requires refresh to update): ";
	label.style.color = "deepskyblue";
	info.appendChild(label);
	var input = document.createElement("input");
	input.classList.add("IU-input");
	input.type = "number";
	input.min = "0";
	input.max = "100";
	chrome.storage.local.get(['runecraftingPercent'], function (result) {
		if (result.runecraftingPercent === undefined) {
			chrome.storage.local.set({ "runecraftingPercent": 0 });
		} else {
			input.value = result.runecraftingPercent;
		}
	});
	input.addEventListener("change", function (e) {
		chrome.storage.local.set({ "runecraftingPercent": e.target.value });
	});
	info.appendChild(input);
}
function displayRunecraftingExpCalcs(AverageExpPerTick, remainingExpToLevel) {
	chrome.storage.local.get(['runecraftingPercent'], function (result) {
		var craftingList = document.querySelector(".crafting-grid").children;
		for (var i = 0; i < craftingList.length; i++) {
			var wrapper = craftingList[i];
			var timeTooltip = wrapper.querySelectorAll(".resource-as-row-required-resources")[0].firstChild;
			var neededEssenceTooltip = wrapper.querySelectorAll(".resource-as-row-required-resources")[0].children[1];
			var neededEssences = parseFloat(neededEssenceTooltip.querySelector("span").textContent);



			var currentEssences = parseFloat(document.getElementsByClassName("essence-list")[0].children[i].querySelector("span").textContent.replace(/,/g, ""));

			var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
			var avrExpPerTick = AverageExpPerTick[0];
			if (document.getElementsByClassName("buff-donation")[0]) {
				avrExpPerTick = avrExpPerTick * 1.20;
			}
			expPerHour = parseInt(((3600 / seconds) * avrExpPerTick).toFixed(2));

			var timeLeftToEmptyEssence = timeTooltip.cloneNode(true);

			timeLeftToEmptyEssence.firstChild.removeChild(timeLeftToEmptyEssence.firstChild.childNodes[0]);
			var timeLeftElem = timeLeftToEmptyEssence.cloneNode(true);
			timeLeftToEmptyEssence.setAttribute("IU-class", "timelefttoempty");

			if (result !== undefined) {
				neededEssences = (neededEssences * (100 - result.runecraftingPercent)) / 100;
			}
			timeLeftToEmptyEssence.querySelector("span").textContent = getTimeLeftText((((currentEssences / neededEssences) * seconds) / 60) / 60) + " to empty";
			timeTooltip.parentElement.appendChild(timeLeftToEmptyEssence);



			timeLeftElem.setAttribute("IU-class", "timeleft");
			timeLeftElem.querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / expPerHour) + " to lvl";
			timeTooltip.parentElement.appendChild(timeLeftElem);
			GLB_essenceNeeded = neededEssences;
		}
	});
}

function displayFarmingTimesLeft() {
	var progressBars = document.getElementsByClassName("farming-grid")[0].querySelectorAll(".farming-progress-bar");
	if (progressBars.length > 0) {
		setFarmingProgressBarContents(progressBars);

		var estimateTimeObserver = new MutationObserver(function (mutations, observer) {
			setFarmingProgressBarContents(progressBars);
			estimateTimeObserver.disconnect();
			estimateTimeObserver.observe(progressBars[0], {
				attributes: true
			});
		});
		estimateTimeObserver.observe(progressBars[0], {
			attributes: true
		});
	}
}

function setFarmingProgressBarContents(progressBars) {
	for (var i = 0; i < progressBars.length; i++) {
		setFarmingProgressBarContent(progressBars[i], i);
	}
}
function setFarmingProgressBarContent(progressBar, index) {
	progressBar.setAttribute("IU-progress" + index, "");
	progressBar.setAttribute("IU-progressIndex", index);
	var currentVal = progressBar.getAttribute("value");
	var currentMax = progressBar.getAttribute("max");
	var minsLeft = currentMax - currentVal;

	var alreadyExistStyle = document.getElementById("IU-progress" + index);
	var css = "[IU-progress" + index + "]::before { content: '" + minsLeft + "m'}";
	if (alreadyExistStyle) {
		alreadyExistStyle.innerHTML = '';
		alreadyExistStyle.appendChild(document.createTextNode(css));
	} else {
		var styleElem = progressBar.appendChild(document.createElement("style"));
		styleElem.id = "IU-progress" + index;
		styleElem.appendChild(document.createTextNode(css));
	}
}

function displayMarketHistoryUnitCost(target) {


	var table = target;
	//Delete all
	if (table.querySelector(".IU-marketplace-history-header-cu")) {
		table.firstChild.removeChild(table.firstChild.querySelector(".IU-marketplace-history-header-cu"));
		for (var i = 0; i < table.querySelectorAll(".marketplace-history-item").length; i++) {
			var currentRow = table.querySelectorAll(".marketplace-history-item")[i];
			if (currentRow.querySelector(".IU-marketplace-history-item-costunit")) {
				currentRow.removeChild(currentRow.querySelector(".IU-marketplace-history-item-costunit"));
			}
		}
	}

	//Add
	let head = table.querySelector(".marketplace-history-header");
	var newHeader = document.createElement("div");
	newHeader.className = "IU-marketplace-history-header-cu";
	newHeader.innerText = "Cost/Unit";
	head.insertBefore(newHeader, head.children[4]);

	var items = table.querySelectorAll(".marketplace-history-item");
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var totalAmount = extractIntFromString(item.querySelector(".marketplace-history-item-amount").textContent);
		var totalCost = extractIntFromString(item.querySelector(".marketplace-history-item-price").textContent);
		var newCostUnitElem = document.createElement("div");
		newCostUnitElem.className = "IU-marketplace-history-item-costunit";
		newCostUnitElem.innerText = numberWithSpaces(totalCost / totalAmount);
		item.insertBefore(newCostUnitElem, item.children[4]);
	}

	if (document.querySelectorAll(".marketplace-history-container")[0]) {
		var attachHistoryPageObserver = new MutationObserver(function (mutations, observer) {
			attachHistoryPageObserver.disconnect();
			displayMarketHistoryUnitCost(table);
		});
		attachHistoryPageObserver.observe(document.getElementsByClassName("marketplace-history-container")[0], {
			childList: true, attributes: true, subtree: true
		});
	}
}

function AttachEssenceObserver(avrExpPerTick) {
	Array.from(document.querySelectorAll(".essence-list > div")).forEach(function (element) {
		var essenceObserver = new MutationObserver(function (mutations, observer) {
			var timelefts = document.querySelectorAll("[IU-class='timeleft']");
			var remainingExpToLevel = parseInt(extractIntFromString(document.getElementById("runecraftingHeader").querySelectorAll("span")[4].textContent));
			for (var i = 0; i < timelefts.length; i++) {
				let wrapper = document.querySelector(".crafting-grid").children[i];

				let timeTooltip = wrapper.querySelectorAll(".resource-as-row-required-resources")[0].firstChild;
				let seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));
				let expPerHour = parseInt(((3600 / seconds) * avrExpPerTick[0]).toFixed(2));
				timelefts[i].querySelector("span").textContent = getTimeLeftText(remainingExpToLevel / expPerHour) + " to lvl";
			}

			var trueTarget = mutations[0].target.parentElement.parentElement;
			var essenceList = trueTarget.parentElement;
			var currentIndex = Array.prototype.slice.call(essenceList.children).indexOf(trueTarget);
			var wrapper = essenceList.previousElementSibling.children[currentIndex];
			var currentEssences = parseFloat(document.getElementsByClassName("essence-list")[0].children[currentIndex].querySelector("span").textContent.replace(/,/g, ""));
			var timeTooltip = wrapper.querySelectorAll(".resource-as-row-required-resources")[0].firstChild;
			var seconds = parseFloat(timeTooltip.querySelector("span").textContent.slice(0, -1));

			var timeLeftsForEmpty = essenceList.previousElementSibling.children[currentIndex].querySelector("[IU-class='timelefttoempty']");

			timeLeftsForEmpty.querySelector("span").textContent = getTimeLeftText((((currentEssences / GLB_essenceNeeded) * seconds) / 60) / 60) + " to empty";
		});
		essenceObserver.observe(element, {
			characterData: true,
			subtree: true
		});
	});
}

function getFishingExpHour(currentZone, seconds, zonePercent) {
	var totalExp = 0;

	for (var i = 0; i < currentZone.fishes.length; i++) {
		var currentFishChance = (currentZone.fishes[i].percentChance * zonePercent) / 100;
		var lootPerHour = (3600 / seconds) * (currentFishChance / 100);
		var currentFishExp = currentZone.fishes[i].exp + (currentZone.fishes[i].exp * GLB_extraPercentExp) / 100
		totalExp += lootPerHour * currentFishExp;
	}
	return parseInt(totalExp).toFixed(0);
}


function numberWithSpaces(x) {
	var parts = x.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	return parts.join(".");
}

function getTimeLeftText(timeleftInHours) {
	var decimalTime = parseFloat(timeleftInHours);
	decimalTime = decimalTime * 60 * 60;
	var hours = Math.floor((decimalTime / (60 * 60)));
	decimalTime = decimalTime - (hours * 60 * 60);
	var minutes = Math.floor((decimalTime / 60));
	decimalTime = decimalTime - (minutes * 60);
	var seconds = Math.round(decimalTime);
	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + ":" + minutes + ":" + seconds + " left";
}

//Modal script
function initModalScript() {
	chrome.storage.local.get(['goldFullDisplay'], function (result) {
		document.getElementById("golddisplay").checked = result.goldFullDisplay;

	});
	chrome.storage.local.get(['heatFullDisplay'], function (result) {
		document.getElementById("heatdisplay").checked = result.heatFullDisplay;
	});
	chrome.storage.local.get(['expCalcDisplay'], function (result) {
		document.getElementById("expcalc").checked = result.expCalcDisplay;
	});
	chrome.storage.local.get(['farmingTimeDisplay'], function (result) {
		document.getElementById("farmingtimes").checked = result.farmingTimeDisplay;
	});
	chrome.storage.local.get(['marketHistoryByUnit'], function (result) {
		document.getElementById("marketHistoryByUnit").checked = result.marketHistoryByUnit;
	});
	document.getElementById("golddisplay").addEventListener("input", function (checkbox) {
		chrome.storage.local.set({ "goldFullDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("heatdisplay").addEventListener("input", function (checkbox) {
		chrome.storage.local.set({ "heatFullDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("expcalc").addEventListener("input", function (checkbox) {
		chrome.storage.local.set({ "expCalcDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("marketHistoryByUnit").addEventListener("input", function (checkbox) {
		chrome.storage.local.set({ "marketHistoryByUnit": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});
	document.getElementById("farmingtimes").addEventListener("input", function (checkbox) {
		chrome.storage.local.set({ "farmingTimeDisplay": checkbox.target.checked }, function () {
			userPrefChanged();
		});
	});

	document.getElementById("IU-close").addEventListener("click", function () {
		closePopup();
	});
	function userPrefChanged() {
	}
}