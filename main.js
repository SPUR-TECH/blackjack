var dealerSum = 0;
var playerSum = 0;

var dealerAceCount = 0;
var playerAceCount = 0;

var hidden;
var deck;

var canHit = true;

window.onload = function () {
	buildDeck();
	shuffleDeck();
	startGame();
};

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
	console.log(deck);
}

function startGame() {
	hidden = deck.pop();
	dealerSum += getValue(hidden);
	dealerAceCount += checkAce(hidden);
	console.log(hidden);
	console.log(dealerSum);
	while (dealerSum < 17) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "./img/" + card + ".png";
		dealerSum += getValue(card);
		dealerAceCount += checkAce(card);
		document.getElementById("dealer").append(cardImg);
		console.log("Card Image Path:", "./img/" + card + ".png"); // Log the constructed image source path
	}
	console.log(dealerSum);

	for (let i = 0; i < 2; i++) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "./img/" + card + ".png";
		playerSum += getValue(card);
		playerAceCount += checkAce(card);
		document.getElementById("player").append(cardImg);
	}
	console.log(playerSum);
	document.getElementById("deal").addEventListener("click", deal);
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
