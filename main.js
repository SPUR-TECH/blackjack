// Variable to track player's money
var playerMoney = 1000;

// Variables to track sums, counts, and flags
var dealerSum = 0;
var playerSum = 0;
var dealerAceCount = 0;
var playerAceCount = 0;
// var splitAceCount1 = 0; // Ace count for the first split hand
// var splitAceCount2 = 0; // Ace count for the second split hand
var currentBet = 0;
var hidden;
var deck;
var canHit = true;
var isDealInitiated = false; // Flag to track whether deal has been initiated
var hasDoubled = false; // Flag to track if the player has already doubled in the current game

// Function to save player's progress to local storage
function savePlayerProgress() {
	localStorage.setItem("playerMoney", playerMoney);
}

// Function to retrieve player's progress from local storage
function retrievePlayerProgress() {
	let savedMoney = localStorage.getItem("playerMoney");
	if (savedMoney !== null) {
		playerMoney = parseInt(savedMoney);
		updateMoneyDisplay(); // Update the displayed money
	}
}

// Event listener for window onload
window.onload = function () {
	retrievePlayerProgress();
	updateMoneyDisplay();
	buildDeck();
	shuffleDeck();

	// Add event listener for the "Cancel Bet" button
	document.getElementById("cancel-bet").addEventListener("click", cancelBet);

	// Attach the handleDeal function to the Deal button
	document.getElementById("deal").addEventListener("click", handleDeal);

	// Add event listener for the "Hit" button
	document.getElementById("hit").addEventListener("click", hit);

	// Add event listener for the "Double" button
	document.getElementById("double").addEventListener("click", double);
	// Initially disable the Double button
	document.getElementById("double").disabled = true;

	// Add event listener for the "Stand" button
	document.getElementById("stand").addEventListener("click", stand);

	// Add event listeners to chip images to handle adding bets
	let chips = document.getElementsByClassName("chip");
	for (let chip of chips) {
		chip.addEventListener("click", function () {
			if (!isDealInitiated) {
				let chipValue = parseFloat(chip.querySelector(".chip-value").innerText);
				addChipBet(chipValue);
			}
		});
	}

	// Add a button click event listener to enter fullscreen mode
	document
		.getElementById("fullscreen-btn")
		.addEventListener("click", function () {
			enterFullscreen();
		});

	// Listen for fullscreen change events
	document.addEventListener("fullscreenchange", handleFullscreenChange);
};

// Function to enter fullscreen mode
function enterFullscreen() {
	// Check if the document supports fullscreen mode
	if (document.fullscreenEnabled) {
		// Request fullscreen mode
		document.documentElement
			.requestFullscreen()
			.then(function () {
				console.log("Entered fullscreen mode.");
			})
			.catch(function (error) {
				console.error("Error entering fullscreen mode:", error);
			});
	} else {
		console.error("Fullscreen mode is not supported in this browser.");
	}
}

// Function to handle fullscreen change
function handleFullscreenChange() {
	// Check if currently in fullscreen mode
	let isInFullscreen = document.fullscreenElement !== null;

	// Hide or show the fullscreen button based on fullscreen state
	let fullscreenBtn = document.getElementById("fullscreen-btn");
	fullscreenBtn.style.display = isInFullscreen ? "none" : "block";
}

// Function to handle canceling the current bet
function cancelBet() {
	// Check if the deal hasn't been initiated yet
	if (currentBet > 0 && !isDealInitiated) {
		document.getElementById("cancel-bet").style = "display-block";
		// Add the current bet amount back to player's money
		playerMoney += currentBet;

		// Reset the current bet amount to 0
		currentBet = 0;

		// Update the display of player's money and bet amount
		updateMoneyDisplay();
		document.getElementById("bet").innerText = "Bet: £" + currentBet;

		// Disable the Deal button since there's no bet
		document.getElementById("deal").disabled = true;
	} else {
		showMessage("You can't cancel your bet after dealing.");
	}
}

// Function to handle adding chip bet
function addChipBet(chipValue) {
	// Check if the player has enough money to place the bet
	if (playerMoney < chipValue && playerMoney !== chipValue) {
		showMessage("Insufficient funds.");
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

// Function to handle doubling the bet
function double() {
	// Check if the player has enough money to double the bet
	if (playerMoney >= currentBet) {
		// Deduct the original bet amount from player's money
		playerMoney -= currentBet;

		// Double the current bet amount
		let doubleBet = currentBet * 2;

		// Update the current bet amount
		currentBet = doubleBet;

		// Show the updated bet amount
		document.getElementById("bet").innerText = "Bet: £" + currentBet;

		// Update the display of player's money
		updateMoneyDisplay();

		// Set the flag to true to indicate that the player has doubled
		hasDoubled = true;

		// Deal one additional card to the player
		dealCard(document.getElementById("player"));

		// Automatically stand after doubling
		stand();

		// Disable the "Double" button after doubling
		document.getElementById("double").disabled = true;
	} else {
		// Alert the player about insufficient funds to double the bet
		alert("Insufficient funds to double the bet.");
	}
}

// Function to handle deal initiation
function handleDeal() {
	if (currentBet === 0) {
		showMessage("Please place a bet before dealing.");
		return;
	}

	// Disable the Deal button to prevent multiple deals
	document.getElementById("deal").disabled = true;

	// Enable the Double button after dealing cards
	document.getElementById("double").disabled = false;

	// Deal the player's initial two visible cards
	for (let i = 0; i < 2; i++) {
		dealCard(document.getElementById("player"));
	}

	// Start the game after a valid bet is input and the Deal button is pressed
	startGame(currentBet);

	// Set the deal initiation flag to true
	isDealInitiated = true;
}

// Function to deal a card
function dealCard(hand) {
	// Check if the deck is empty or has very few cards left
	if (deck.length < 10) {
		// Adjust the threshold as needed
		shuffleDeck(); // Reshuffle the deck
		alert("The deck has been reshuffled.");
	}

	// Deal one card from the deck to the specified hand
	let cardImg = document.createElement("img");
	let card = deck.pop();
	cardImg.src = "./img/" + card + ".png";

	// Update the player's sum based on the dealt card
	if (hand.id === "player") {
		playerSum += getValue(card);
		playerAceCount += checkAce(card);
	} else if (hand.id === "dealer" && hand.childNodes.length === 0) {
		// Deal the hidden card only to the dealer
		hidden = card; // Store the hidden card
		cardImg.src = "./img/back.png"; // Display the back side image for the hidden card
		cardImg.alt = "Hidden Card";
		dealerSum += getValue(card); // Add the value of the hidden card to dealerSum
		dealerAceCount += checkAce(card); // Increment dealerAceCount if the hidden card is an ace
	} else {
		dealerSum += getValue(card);
		dealerAceCount += checkAce(card);
	}

	// Append the card to the specified hand
	hand.appendChild(cardImg);

	// Update player's score display if it's the player's hand
	if (hand.id === "player") {
		document.getElementById("player-score").innerText = playerSum;
	}
}

// Function to update money display
function updateMoneyDisplay() {
	let cashDisplay = document.getElementById("cash");
	cashDisplay.innerText = "Cash: £" + playerMoney;

	// Check if player's money is 0 and last game has been played
	if (playerMoney === 0 && currentBet === 0) {
		document.getElementById("reset-money").style.display = "block";
		// Check if player's money is less than the lowest bet of 50
	} else {
		document.getElementById("reset-money").style.display = "none";
	}

	// Save player's progress after updating the money display
	savePlayerProgress();
}

// Function to reset player's money
function resetMoney() {
	// Reset player's money to 1000
	playerMoney = 1000;

	// Update money display
	updateMoneyDisplay();
}

// Function to build the deck
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

	// Add multiple copies of each card value to the deck
	for (let i = 0; i < types.length; i++) {
		for (let j = 0; j < values.length; j++) {
			// Add each card value 4 times (adjust as needed)
			for (let k = 0; k < 40; k++) {
				deck.push(values[j] + "-" + types[i]);
			}
		}
	}
}

// Function to shuffle the deck
function shuffleDeck() {
	for (let i = 0; i < deck.length; i++) {
		let j = Math.floor(Math.random() * deck.length);
		let temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
}

// Function to determine the outcome of the game
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

	showMessage(message);

	// Show the scores after the game outcome is determined
	document.getElementById("player-score").innerText = playerSum;
	document.getElementById("dealer-score").innerText = dealerSum;
	document.getElementById("player-score").style.display = "block";
	document.getElementById("dealer-score").style.display = "block";

	// Clear the current bet
	clearBet();

	// Check if player's money is zero and show the "Reset Money" button
	if (playerMoney === 0) {
		document.getElementById("reset-money").style.display = "block";
	}

	// Update money display after determining the outcome
	updateMoneyDisplay();

	// Enable the Deal button only after the game outcome is determined
	document.getElementById("deal").disabled = false;

	// Call resetGame() after a delay
	setTimeout(resetGame, 2000); // Adjust the delay as needed (in milliseconds)
}

// Function to determine the dealer's action
function determineDealerAction() {
	// Check if dealer has reached 21
	if (dealerSum === 21 && dealerAceCount > 0) {
		// Dealer has reached 21 with an ace, no further action needed
		dealerStand();
	} else if (dealerSum < 17 || (dealerSum === 17 && dealerAceCount > 0)) {
		// If dealer's total is less than 17 or dealer has a soft 17, they must hit
		dealerHit();
	} else {
		// Otherwise, dealer stands
		dealerStand();
	}
}

// Function for dealer to hit
function dealerHit() {
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
		} else if (dealerSum > 21) {
			clearInterval(interval); // Stop drawing cards if the dealer has busted
			// Show the player's score after the dealer busts
			document.getElementById("player-score").style.display = "block";
			// Show the dealer's score after the dealer busts
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
			showMessage("DEALER BUST!!");
		} else {
			clearInterval(interval); // Stop drawing cards once the dealer's score is 17 or higher
			// Show the player's score after the dealer stands
			document.getElementById("player-score").style.display = "block";
			// Show the dealer's score after the dealer stands
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
		}
	}, 1000); // Adjust the delay (in milliseconds) between drawing cards
}

// Function for dealer to stand
function dealerStand() {
	// Dealer stands, no further action needed
	// Show the player's score after the dealer stands
	document.getElementById("player-score").style.display = "block";
	// Show the dealer's score after the dealer stands
	document.getElementById("dealer-score").style.display = "block";
	// Determine the outcome of the game
	determineOutcome();
}

// Function for player to hit
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
	if (playerSum > 21 && playerAceCount > 0) {
		playerSum = reduceAce(playerSum, playerAceCount);
		playerAceCount -= 1; // Decrement the player's Ace count since one Ace has been reduced
	}

	document.getElementById("player").append(cardImg);

	// Update player's score display after adjusting the value of Ace
	document.getElementById("player-score").innerText = playerSum;

	if (playerSum > 21) {
		canHit = false;
		endGame("YOU BUST!!");
	} else if (playerSum === 21) {
		// If player reaches 21, automatically stand
		stand();
	}

	// Disable the "Double" button after hitting
	document.getElementById("double").disabled = true;
}

// Function for player to stand
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
				showMessage("DEALER BUST!!");
			}
		}
	}, 1000); // Adjust the delay (in milliseconds) between drawing cards
}

// Function to get the value of a card
function getValue(card) {
	let data = card.split("-"); // ["4-C"] == ["4", "C"]
	let value = data[0];

	if (isNaN(value)) {
		//"J","Q","K"
		if (value === "A") {
			// Check if adding 11 would cause the player to bust
			return playerSum + 11 > 21 ? 1 : 11;
		}
		return 10;
	}
	return parseInt(value);
}

// Function to check if a card is an Ace
function checkAce(card) {
	if (card[0] == "A") {
		return 1;
	}
	return 0;
}

// Function to reduce Ace value if necessary
function reduceAce(score, aceCount) {
	while (score > 21 && aceCount > 0) {
		score -= 10;
		aceCount -= 1;
	}
	return score;
}

// Function to clear the current bet
function clearBet() {
	currentBet = 0;
	document.getElementById("bet").innerText = "Bet: £" + currentBet;

	// Update the money display after clearing the bet
	updateMoneyDisplay();
}

// Function to reset the game
function resetGame() {
	// Return cards to the deck
	for (
		let i = 0;
		i < document.getElementById("player").childNodes.length;
		i++
	) {
		let card = document
			.getElementById("player")
			.childNodes[i].src.split("/")
			.pop()
			.split(".")[0];
		deck.push(card);
	}
	for (
		let i = 0;
		i < document.getElementById("dealer").childNodes.length;
		i++
	) {
		let card = document
			.getElementById("dealer")
			.childNodes[i].src.split("/")
			.pop()
			.split(".")[0];
		deck.push(card);
	}
	shuffleDeck();

	// Clear the player and dealer hands
	document.getElementById("player").innerHTML = "";
	document.getElementById("dealer").innerHTML = "";

	// Hide the scores after resetting the game
	document.getElementById("player-score").style.display = "none";
	document.getElementById("dealer-score").style.display = "none";

	// Reset the player and dealer sums and ace counts
	playerSum = 0;
	dealerSum = 0;
	playerAceCount = 0;
	dealerAceCount = 0;

	// Clear the bet
	clearBet();

	// Disable Hit and Stand buttons
	document.getElementById("hit").removeEventListener("click", hit);
	document.getElementById("stand").removeEventListener("click", stand);

	// Enable the Deal button
	document.getElementById("deal").disabled = false;

	// Set the deal initiation flag to false
	isDealInitiated = false;

	// Hide the message display
	document.getElementById("message").innerText = "";
}

// Function to show messages
function showMessage(message) {
	let messageElement = document.getElementById("message");
	messageElement.innerText = message;
	messageElement.style.display = "block"; // Set display to block

	// After 3 seconds, hide the message
	setTimeout(function () {
		messageElement.style.display = "none"; // Set display to none
	}, 3000);
}

// Function to start the game
function startGame(bet) {
	currentBet = bet; // Set the current bet amount
	updateMoneyDisplay(); // Update money display (don't deduct the bet amount again)

	canHit = true; // Reset canHit to true

	// Reset the hasDoubled flag
	hasDoubled = false;

	// Clear the player and dealer hands
	document.getElementById("player").innerHTML = "";
	document.getElementById("dealer").innerHTML = "";
	dealerSum = 0;
	playerSum = 0;
	dealerAceCount = 0; // Reset dealerAceCount
	playerAceCount = 0;

	// Deal the hidden card for the dealer on every first deal
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
	dealerAceCount += checkAce(card2); // Increment dealerAceCount if second card is an ace

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

	// Disable "Double" button before dealing cards
	document.getElementById("double").disabled = true;

	// Check for BLACKJACK!!
	if (
		playerSum === 21 &&
		document.getElementById("player").childNodes.length === 2
	) {
		document.getElementById("results").innerText = "BLACKJACK!!";
		// Update player's blackjack win instantly
		playerMoney += 2.5 * currentBet; // Double the bet amount (original bet + win)
		updateMoneyDisplay(); // Update the displayed money
		// Call resetGame() after a delay
		setTimeout(resetGame, 2000); // Adjust the delay as needed (in milliseconds)
	}

	// Enable "Double" button after dealing cards if conditions are met
	if (playerMoney >= bet) {
		document.getElementById("double").disabled = false;
	}

	// Set the deal initiation flag to true
	isDealInitiated = true; // Set isDealInitiated to true after dealing cards
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

	document.getElementById("results").innerText = message;

	// Show the scores after the game outcome is determined
	document.getElementById("player-score").innerText = playerSum;
	document.getElementById("dealer-score").innerText = dealerSum;
	document.getElementById("player-score").style.display = "block";
	document.getElementById("dealer-score").style.display = "block";

	// Clear the current bet
	clearBet();

	// Check if player's money is zero and show the "Reset Money" button
	if (playerMoney === 0) {
		document.getElementById("reset-money").style.display = "block";
	}

	// Update money display after determining the outcome
	updateMoneyDisplay();

	// Enable the Deal button only after the game outcome is determined
	document.getElementById("deal").disabled = false;

	// Call resetGame() after a delay
	setTimeout(resetGame, 2000); // Adjust the delay as needed (in milliseconds)
}

function determineDealerAction() {
	// Check if dealer has reached 21
	if (dealerSum === 21 && dealerAceCount > 0) {
		// Dealer has reached 21 with an ace, no further action needed
		dealerStand();
	} else if (dealerSum < 17 || (dealerSum === 17 && dealerAceCount > 0)) {
		// If dealer's total is less than 17 or dealer has a soft 17, they must hit
		dealerHit();
	} else {
		// Otherwise, dealer stands
		dealerStand();
	}
}

function dealerHit() {
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
		} else if (dealerSum > 21) {
			clearInterval(interval); // Stop drawing cards if the dealer has busted
			// Show the player's score after the dealer busts
			document.getElementById("player-score").style.display = "block";
			// Show the dealer's score after the dealer busts
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
			document.getElementById("results").innerText = "DEALER BUST!!";
		} else {
			clearInterval(interval); // Stop drawing cards once the dealer's score is 17 or higher
			// Show the player's score after the dealer stands
			document.getElementById("player-score").style.display = "block";
			// Show the dealer's score after the dealer stands
			document.getElementById("dealer-score").style.display = "block";
			// Determine the outcome of the game
			determineOutcome();
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
	if (!isDealInitiated || !canHit) {
		return;
	}

	let cardImg = document.createElement("img");
	let card = deck.pop();
	cardImg.src = "./img/" + card + ".png";
	playerSum += getValue(card);
	playerAceCount += checkAce(card);

	// Check if the player's score exceeds 21 and adjust the value of Ace if necessary
	if (playerSum > 21 && playerAceCount > 0) {
		playerSum = reduceAce(playerSum, playerAceCount);
		playerAceCount -= 1; // Decrement the player's Ace count since one Ace has been reduced
	}

	document.getElementById("player").append(cardImg);

	// Update player's score display after adjusting the value of Ace
	document.getElementById("player-score").innerText = playerSum;

	if (playerSum > 21) {
		canHit = false;
		endGame("YOU BUST!!");
	} else if (playerSum === 21) {
		// If player reaches 21, automatically stand
		stand();
	}

	// Disable the "Double" button after hitting
	document.getElementById("double").disabled = true;
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
		if (value === "A") {
			// Check if adding 11 would cause the player to bust
			return playerSum + 11 > 21 ? 1 : 11;
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

function reduceAce(score, aceCount) {
	while (score > 21 && aceCount > 0) {
		score -= 10;
		aceCount -= 1;
	}
	return score;
}

function clearBet() {
	currentBet = 0;
	document.getElementById("bet").innerText = "Bet: £" + currentBet;

	// Update the money display after clearing the bet
	updateMoneyDisplay();
}

function resetGame() {
	// Return cards to the deck
	for (
		let i = 0;
		i < document.getElementById("player").childNodes.length;
		i++
	) {
		let card = document
			.getElementById("player")
			.childNodes[i].src.split("/")
			.pop()
			.split(".")[0];
		deck.push(card);
	}
	for (
		let i = 0;
		i < document.getElementById("dealer").childNodes.length;
		i++
	) {
		let card = document
			.getElementById("dealer")
			.childNodes[i].src.split("/")
			.pop()
			.split(".")[0];
		deck.push(card);
	}
	// Clear old score and message
	document.getElementById("results").innerText = "";
	document.getElementById("dealer-score").innerText = "";
	document.getElementById("player-score").innerText = "";

	// Clear player and dealer hands
	document.getElementById("player").innerHTML = "";
	document.getElementById("dealer").innerHTML = "";

	// Hide the scores
	document.getElementById("dealer-score").style.display = "none";
	document.getElementById("player-score").style.display = "none";

	// Disable Hit and Stand buttons
	document.getElementById("hit").disabled = false;
	document.getElementById("stand").disabled = false;

	// Disable before deal
	document.getElementById("double").disabled = true;

	// Enable the Deal button
	document.getElementById("deal").disabled = false;

	// Reset canHit to allow the player to hit again
	canHit = true;

	// Reset the deal initiation flag to allow adding chips on the next game
	isDealInitiated = false;

	// Reset the player's Ace count to 0 when the game is reset
	playerAceCount = 0;

	// Shuffle the deck again
	shuffleDeck();

	clearBet();

	// Update money display after resetting the game
	updateMoneyDisplay();
}

function endGame(message) {
	document.getElementById("results").innerText = message;

	// Disable Hit and Stand buttons
	document.getElementById("hit").disabled = true;
	document.getElementById("stand").disabled = true;

	// Enable the Deal button
	document.getElementById("deal").disabled = false;

	// Call resetGame() after a delay
	setTimeout(resetGame, 2000); // Adjust the delay as needed (in milliseconds)
}
