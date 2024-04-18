var playerMoney = 1000; // Variable to track player's money
var dealerSum = 0;
var playerSum = 0;
var dealerAceCount = 0;
var playerAceCount = 0;
var currentBet = 0;
var hidden;
var deck;
var canHit = true;

window.onload = function () {
	updateMoneyDisplay();
	buildDeck();
	shuffleDeck();

	// Attach the handleDeal function to the Deal button
	document.getElementById("deal").addEventListener("click", handleDeal);

	// Add event listeners to chip images to handle adding bets
	let chips = document.getElementsByClassName("chip");
	for (let chip of chips) {
		chip.addEventListener("click", function () {
			let chipValue = parseFloat(chip.querySelector(".chip-value").innerText);
			addChipBet(chipValue);
		});
	}
};

function addChipBet(chipValue) {
	// Check if the player has enough money to place the bet
	if (playerMoney < chipValue && playerMoney !== chipValue) {
		alert("Insufficient funds. Please select a lower bet amount.");
		return;
	}

	// Add chip value to the current bet amount
	currentBet += chipValue;
	playerMoney -= chipValue; // Deduct the bet amount from player's money

	// Show the updated bet amount
	document.getElementById("bet").innerText = "Bet: £" + currentBet;

	// Update the display of player's money
	updateMoneyDisplay();

	// Enable the Deal button after a valid bet is added
	document.getElementById("deal").disabled = false;
}

function handleDeal() {
	if (currentBet === 0) {
		alert("Please place a bet before dealing.");
		return;
	}

	// Disable the Deal button to prevent multiple deals
	document.getElementById("deal").disabled = true;

	// Start the game after a valid bet is input and the Deal button is pressed
	startGame(currentBet);
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

function startGame(bet) {
	resetGame();

	currentBet = bet; // Set the current bet amount
	updateMoneyDisplay(); // Update money display (don't deduct the bet amount again)

	canHit = true; // Reset canHit to true

	// Clear the player and dealer hands
	document.getElementById("player").innerHTML = "";
	document.getElementById("dealer").innerHTML = "";
	dealerSum = 0;
	playerSum = 0;
	dealerAceCount = 0;
	playerAceCount = 0;

	// Deal the hidden card for the dealer
	hidden = deck.pop(); // Assign a random card from the deck to the hidden variable
	let dealerHiddenCardImg = document.createElement("img");
	dealerHiddenCardImg.src = "./img/back.png"; // Display the back side image for the hidden card
	dealerHiddenCardImg.alt = "Hidden Card";
	document.getElementById("dealer").appendChild(dealerHiddenCardImg);

	// Deal the dealer's second card (visible)
	let card2 = deck.pop();
	let dealerVisibleCardImg = document.createElement("img");
	dealerVisibleCardImg.src = "./img/" + card2 + ".png";
	dealerVisibleCardImg.alt = "Dealer Card";
	document.getElementById("dealer").appendChild(dealerVisibleCardImg);
	dealerSum += getValue(card2); // Add the value of the second card to dealerSum
	dealerAceCount += checkAce(card2);

	// If the hidden card is not an Ace, add its value to dealerSum
	dealerSum += getValue(hidden);
	dealerAceCount += checkAce(hidden);

	// Deal the player's initial two cards
	for (let i = 0; i < 2; i++) {
		let cardImg = document.createElement("img");
		let card = deck.pop();
		cardImg.src = "./img/" + card + ".png";
		playerSum += getValue(card);
		playerAceCount += checkAce(card);
		document.getElementById("player").append(cardImg);
	}

	// Update score displays
	document.getElementById("dealer-score").innerText = dealerSum;
	document.getElementById("player-score").innerText = playerSum;

	// Add event listeners for Hit and Stand
	document.getElementById("hit").addEventListener("click", hit);
	document.getElementById("stand").addEventListener("click", stand);

	// Check for BLACKJACK!!
	if (
		playerSum === 21 &&
		document.getElementById("player").childNodes.length === 2
	) {
		document.getElementById("results").innerText = "BLACKJACK!!";
		// Update player's money instantly
		playerMoney += 2.5 * currentBet; // Double the bet amount (original bet + win)
		updateMoneyDisplay(); // Update the displayed money
	}
}

function determineOutcome() {
	let message = "";
	let winnings = 0;

	if (playerSum > 21) {
		message = "YOU BUST!!";
	} else if (dealerSum > 21) {
		winnings = 2 * currentBet; // Double the bet amount (original bet + win)
		message = "DEALER BUST!!";
	} else if (playerSum === dealerSum) {
		winnings = currentBet; // Return the original bet amount
		message = "NO WINNERS!!";
	} else if (playerSum > dealerSum) {
		winnings = 2 * currentBet; // Double the bet amount (original bet + win)
		message = "YOU WIN!!";
	} else if (dealerSum > playerSum) {
		message = "YOU LOSE!!";
	}

	playerMoney += winnings; // Update player's money
	updateMoneyDisplay(); // Update the displayed money

	document.getElementById("results").innerText = message;

	// Show the scores after the game outcome is determined
	document.getElementById("player-score").innerText = playerSum;
	document.getElementById("dealer-score").innerText = dealerSum;
	document.getElementById("player-score").style.display = "block";
	document.getElementById("dealer-score").style.display = "block";

	// Enable the Deal button only after the game outcome is determined
	document.getElementById("deal").disabled = false;

	// Clear the current bet
	clearBet();
}

function determineDealerAction() {
	// Determine if the dealer should hit or stand based on their current total
	if (dealerSum < 17 || (dealerSum === 17 && dealerAceCount > 0)) {
		// If dealer's total is less than 17 or dealer has a soft 17, they must hit
		dealerHit();
	} else {
		// Otherwise, dealer stands
		dealerStand();
	}
}

function dealerHit() {
	let interval = setInterval(function () {
		if (dealerSum < 17 || (dealerSum === 17 && dealerAceCount > 0)) {
			// Dealer must hit if total is less than 17 or dealer has a soft 17
			let cardImg = document.createElement("img");
			let card = deck.pop();
			cardImg.src = "./img/" + card + ".png";
			dealerSum += getValue(card);
			dealerAceCount += checkAce(card);
			document.getElementById("dealer").append(cardImg);
			dealerSum = reduceAce(dealerSum, dealerAceCount); // Ensure dealer's total is calculated after each card is drawn
			// Update the displayed score
			document.getElementById("dealer-score").innerText = dealerSum;
		} else {
			clearInterval(interval); // Stop drawing cards once the dealer's score is 17 or higher
			// Show the player's score after the dealer stands
			document.getElementById("player-score").style.display = "block";
			// Show the dealer's score after the dealer stands
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
			// Check if dealer busts after the game outcome is determined
			if (dealerSum > 21) {
				document.getElementById("results").innerText = "DEALER BUST!!";
			}
		}
	}, 1000); // Adjust the delay (in milliseconds) between drawing cards
}

function dealerStand() {
	// Dealer stands, no further action needed
	// Show the player's score after the dealer stands
	document.getElementById("player-score").style.display = "block";
	// Show the dealer's score after the dealer stands
	document.getElementById("dealer-score").style.display = "block";
	// Determine the outcome of the game
	determineOutcome();
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

	// Check if the player's score exceeds 21 and adjust the value of Ace if necessary
	if (playerSum > 21) {
		playerSum = reduceAce(playerSum, playerAceCount);
	}

	document.getElementById("player").append(cardImg);

	// Update player's score display after adjusting the value of Ace
	document.getElementById("player-score").innerText = playerSum;

	if (playerSum > 21) {
		canHit = false;
		endGame("YOU BUST!!");
	}
}

function stand() {
	dealerSum = reduceAce(dealerSum, dealerAceCount);
	playerSum = reduceAce(playerSum, playerAceCount);
	canHit = false;

	// Update the hidden card to show its value
	document.getElementById("dealer").childNodes[0].src =
		"./img/" + hidden + ".png";

	// Display the updated score after revealing the hidden card
	document.getElementById("dealer-score").innerText = dealerSum;

	// Determine if the dealer should hit or stand based on their current total
	let interval = setInterval(function () {
		if (dealerSum < 17) {
			let cardImg = document.createElement("img");
			let card = deck.pop();
			cardImg.src = "./img/" + card + ".png";
			dealerSum += getValue(card);
			dealerAceCount += checkAce(card);
			document.getElementById("dealer").append(cardImg);
			dealerSum = reduceAce(dealerSum, dealerAceCount); // Ensure dealer's total is calculated after each card is drawn
			// Update the displayed score
			document.getElementById("dealer-score").innerText = dealerSum;
		} else {
			clearInterval(interval); // Stop drawing cards once the dealer's score is 17 or higher
			// Dont show the player's score until the player stands
			document.getElementById("player-score").style.display = "block";
			// Dont show the dealer's score until the dealer stands
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
			// Check if dealer busts after the game outcome is determined
			if (dealerSum > 21) {
				document.getElementById("results").innerText = "DEALER BUST!!";
			}
		}
	}, 1000); // Adjust the delay (in milliseconds) between drawing cards
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

function clearBet() {
	currentBet = 0;
	document.getElementById("bet").innerText = "Bet: £" + currentBet;
}

function resetGame() {
	// Remove old score and message
	document.getElementById("results").innerText = "";
	document.getElementById("dealer-score").innerText = "";
	document.getElementById("player-score").innerText = "";

	// Clear player and dealer hands
	document.getElementById("player").innerHTML = "";
	document.getElementById("dealer").innerHTML = "";

	// Hide the scores
	document.getElementById("dealer-score").style.display = "none";
	document.getElementById("player-score").style.display = "none";

	// Remove event listener for the "Stand" button
	document.getElementById("stand").removeEventListener("click", stand);

	// Add event listener for the "Stand" button
	document.getElementById("stand").addEventListener("click", stand);

	// Remove event listener for the "Hit" button
	document.getElementById("hit").removeEventListener("click", hit);

	// Reset canHit to allow the player to hit again
	canHit = true;

	// Reset the player's Ace count to 0 when the game is reset
	playerAceCount = 0;
}

function endGame(message) {
	document.getElementById("results").innerText = message;
	// Disable Hit and Stand buttons
	document.getElementById("hit").disabled = true;
	document.getElementById("stand").disabled = true;
	// Enable the Deal button
	document.getElementById("deal").disabled = false;
}
