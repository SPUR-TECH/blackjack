var playerMoney = 1000; // Variable to track player's money

var dealerSum = 0;
var playerSum = 0;

var dealerAceCount = 0;
var playerAceCount = 0;

var hidden;
var deck;

var canHit = true;

window.onload = function () {
	updateMoneyDisplay();
	buildDeck();
	shuffleDeck();

	// Attach the handleDeal function to the Deal button
	document.getElementById("deal").addEventListener("click", handleDeal);
};

function handleDeal() {
	let betInput = document.getElementById("bet").value.trim();
	console.log("Bet Input:", betInput);
	let bet = parseFloat(betInput);
	console.log("Bet:", bet);

	// Check if the parsed value is valid
	if (isNaN(bet) || bet <= 0 || bet > playerMoney || betInput === "") {
		alert("Please enter a valid bet.");
		return;
	}

	// Check if the bet exceeds two decimal places
	if ((bet * 100) % 1 !== 0) {
		alert("Please enter a bet with up to two decimal places.");
		return;
	}

	playerMoney -= bet; // Deduct the bet amount from player's money
	updateMoneyDisplay(); // Update money display

	// Start the game after a valid bet is input and the Deal button is pressed
	startGame();
}

function updateMoneyDisplay() {
	document.getElementById("cash").innerText = "Cash: £" + playerMoney; // Update money display
}

function buildDeck() {
	let values = [
		"A",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"J",
		"Q",
		"K",
	];

	let types = ["C", "D", "H", "S"];
	deck = [];

	for (let i = 0; i < types.length; i++) {
		for (let j = 0; j < values.length; j++) {
			deck.push(values[j] + "-" + types[i]);
		}
	}
}

function shuffleDeck() {
	for (let i = 0; i < deck.length; i++) {
		let j = Math.floor(Math.random() * deck.length);
		let temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
}

function startGame() {
	let betInput = document.getElementById("bet").value.trim();
	console.log("Bet Input:", betInput);
	let bet = parseFloat(betInput);
	console.log("Bet:", bet);

	// Check if the parsed value is valid
	if (isNaN(bet) || bet <= 0 || bet > playerMoney || betInput === "") {
		alert("Please enter a valid bet.");
		return;
	}

	// Check if the bet exceeds two decimal places
	if ((bet * 100) % 1 !== 0) {
		alert("Please enter a bet with up to two decimal places.");
		return;
	}

	playerMoney -= bet; // Deduct the bet amount from player's money
	updateMoneyDisplay(); // Update money display

	hidden = deck.pop();
	dealerSum += getValue(hidden);
	dealerAceCount += checkAce(hidden);

	while (dealerSum < 17) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "./img/" + card + ".png";
		dealerSum += getValue(card);
		dealerAceCount += checkAce(card);
		document.getElementById("dealer").append(cardImg);
	}

	for (let i = 0; i < 2; i++) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "./img/" + card + ".png";
		playerSum += getValue(card);
		playerAceCount += checkAce(card);
		document.getElementById("player").append(cardImg);
	}

	document.getElementById("hit").addEventListener("click", hit);
	document.getElementById("stand").addEventListener("click", stand);
}

function hit() {
	if (!canHit) {
		return;
	}
	let cardImg = document.createElement("img");
	let card = deck.pop();
	cardImg.src = "./img/" + card + ".png";
	playerSum += getValue(card);
	playerAceCount += checkAce(card);
	document.getElementById("player").append(cardImg);

	if (reduceAce(playerSum, playerAceCount) > 21) {
		canHit = false;
	}
}

function stand() {
	dealerSum = reduceAce(dealerSum, dealerAceCount);
	playerSum = reduceAce(playerSum, playerAceCount);
	canHit = false;
	document.getElementById("hidden").src = "./img/" + hidden + ".png";

	let message = "";
	if (playerSum > 21) {
		message = "YOU BUST!!";
	} else if (dealerSum > 21) {
		message = "DEALER BUST!!";
	} else if (playerSum == dealerSum) {
		message = "NO WINNERS!!";
	} else if (playerSum > dealerAceCount) {
		message = "YOU WIN!!";
	} else if (dealerSum > playerAceCount) {
		message = "YOU LOSE!!";
	}

	document.getElementById("dealer-score").innerText = dealerSum;
	document.getElementById("player-score").innerText = playerSum;
	document.getElementById("results").innerText = message;
}

function getValue(card) {
	let data = card.split("-"); // ["4-C"] == ["4", "C"]
	let value = data[0];

	if (isNaN(value)) {
		//"J","Q","K"
		if (value == "A") {
			return 11;
		}
		return 10;
	}
	return parseInt(value);
}

function checkAce(card) {
	if (card[0] == "A") {
		return 1;
	}
	return 0;
}

function reduceAce(playerSum, playerAceCount) {
	while (playerSum > 21 && playerAceCount > 0) {
		playerSum -= 10;
		playerAceCount -= 1;
	}
	return playerSum;
}
