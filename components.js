/////// LOAD SOUNDS ////////

////// Standard audio ///////

const START = new Audio();
START.src = "sounds/casino-background.mp3";

const CACHING = new Audio();
CACHING.src = "sounds/caching.mp3";

const PLAYER_WIN = new Audio();
PLAYER_WIN.src = "sounds/player-wins.mp3";

////// Standard audio ///////

////////////////////////////////////////////////////////////

////// Howler audio //////

const CHIPS = new Howl({
	src: "sounds/chips.mp3",
});

const CARD_DROP = new Howl({
	src: "sounds/card-drop.mp3",
});

////// Howler audio //////
