const cardsArray = [
  { name: "A", img: "meme1.png" },
  { name: "B", img: "meme3.png" },
  { name: "C", img: "meme2.png" },
  { name: "D", img: "meme5.png" },
  { name: "E", img: "meme4.png" },
  { name: "F", img: "meme7.png" },
  { name: "G", img: "meme6.png" },
  { name: "H", img: "meme8.png" },
  { name: "I", img: "meme9.png" },
  { name: "J", img: "meme10.png" },
  { name: "K", img: "meme11.png" },
  { name: "L", img: "meme12.png" },
];

let gameBoard = document.getElementById("game-board");
let moveCounter = document.getElementById("move-counter");
let timerDisplay = document.getElementById("timer");
let resetButton = document.getElementById("reset-button");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let timer = null;
let seconds = 0;
let matchedPairs = 0;

let flipSound = new Audio("cardflip.mp3.wav");
let winSound = new Audio("winsound.mp3.wav");
let matchSound = new Audio("match.mp3");
let gameOverSound = new Audio("gameover.mp3.wav"); // Game over sound

let difficulty = "easy"; // Default difficulty
const difficultySettings = {
  easy: { pairs: 4, color: "green", timeLimit: 30 }, // 30 seconds
  medium: { pairs: 8, color: "orange", timeLimit: 60 }, // 1 minute
  hard: { pairs: 12, color: "black", timeLimit: 90 }, // 1 minute 30 seconds
};

function shuffleCards() {
  let cards = [
    ...cardsArray.slice(0, difficultySettings[difficulty].pairs),
    ...cardsArray.slice(0, difficultySettings[difficulty].pairs),
  ]; // Duplicate the cards for matching
  return cards.sort(() => 0.5 - Math.random());
}

function setDifficulty() {
  difficulty = document.getElementById("difficulty").value;
  resetGame(); // Reset the game when difficulty changes
}

function createBoard() {
  const shuffledCards = shuffleCards();
  gameBoard.innerHTML = ""; // Clear existing cards
  shuffledCards.forEach((card) => {
    let cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.name = card.name;
    cardElement.style.backgroundColor = difficultySettings[difficulty].color;

    let imgElement = document.createElement("img");
    imgElement.src = card.img;
    imgElement.classList.add("hidden"); // Initially hide the image
    cardElement.appendChild(imgElement);
    cardElement.addEventListener("click", flipCard); // Add event listener to flip card
    gameBoard.appendChild(cardElement); // Append card to game board
  });
}

let isTimerRunning = false; // Flag to track if the timer is running

function startTimer() {
  if (isTimerRunning) return; // Prevent starting multiple timers

  seconds = 0; // Reset seconds for the new game
  const timeLimit = difficultySettings[difficulty].timeLimit; // Get time limit based on difficulty

  timer = setInterval(() => {
    seconds++;
    const remainingTime = timeLimit - seconds; // Calculate remaining time
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;

    // Update the timer display
    timerDisplay.innerText = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;

    // Check if time is up
    if (remainingTime <= 0) {
      clearInterval(timer); // Stop the timer
      isTimerRunning = false; // Reset the running flag
      gameOver(); // Call game over if time runs out
    }
  }, 1000); // Set the interval to 1 second

  isTimerRunning = true; // Set the timer running flag to true
}

function stopTimer() {
  clearInterval(timer);
  timer = null; // Ensure the timer is properly reset
  isTimerRunning = false; // Reset the flag when the timer stops
}

function resetTimer() {
  stopTimer(); // Stop any ongoing timer
  seconds = 0; // Reset seconds
  timerDisplay.innerText = "00:00"; // Reset display
}

function resetGame() {
  stopTimer(); // Stop any ongoing timer
  moves = 0;
  matchedPairs = 0;
  moveCounter.innerText = moves;
  resetTimer(); // Reset the timer display
  createBoard(); // Recreate the game board
  displayHighScores(); // Display high scores on reset
  startTimer(); // Start the timer for the new game
}

// Call this function when you want to start the game for the first time
function initializeGame() {
  resetGame(); // Set everything up and start the game
}

function flipCard() {
  if (lockBoard || this === firstCard || this.classList.contains("match"))
    return;

  if (!firstCard) {
    firstCard = this;
    flipSound.play();
    firstCard.classList.add("flip");
    const cardImage = firstCard.querySelector("img");
    cardImage.classList.remove("hidden");
    this.classList.add("card-flipped"); // Hide the question mark
    startTimer();
    startBackgroundMusic(); // Start playing background music when the game starts
    return;
  }

  secondCard = this;
  lockBoard = true; // Lock the board

  flipSound.play();
  secondCard.classList.add("flip");
  const cardImage = secondCard.querySelector("img");

  cardImage.classList.remove("hidden");
  this.classList.add("card-flipped"); // Hide the question mark

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    matchSound.play();
    firstCard.classList.add("match");
    secondCard.classList.add("match");
    disableCards();
    matchedPairs++;

    if (matchedPairs === difficultySettings[difficulty].pairs) {
      stopTimer(); // Stop the timer
      winSound.play();
      showWinModal(calculateScore());
    }
  } else {
    setTimeout(unflipCards, 1000);
  }

  moves++;
  moveCounter.innerText = moves;
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();
}

function unflipCards() {
  firstCard.classList.remove("flip");
  firstCard.querySelector("img").classList.add("hidden");
  secondCard.classList.remove("flip");
  secondCard.querySelector("img").classList.add("hidden");
  resetBoard();
}

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function resetGame() {
  moves = 0;
  matchedPairs = 0;
  moveCounter.innerText = moves;
  resetTimer(); // Reset the timer
  createBoard(); // Recreate the game board
  displayHighScores(); // Display high score on reset
}

function calculateScore() {
  const finalMoves = parseInt(moveCounter.innerText);
  const time = seconds;
  const calculatedScore = Math.max(0, 1000 - (finalMoves * 5 + time / 10));
  return Math.min(calculatedScore, 1000);
}

// Function to show the Win Modal when the user wins
function showWinModal(score) {
  // Update the final score in the Win Modal
  document.getElementById("final-score").textContent = score;

  // Stop the background music
  stopBackgroundMusic();

  // Show the Win Modal and prevent closing by clicking outside or using the ESC key
  $("#winModal").modal({
    backdrop: "static", // Prevent closing by clicking outside
    keyboard: false, // Disable closing via the ESC key
  });

  const playAgainButton = document.getElementById("play-again-button");

  // Define the playAgain function
  function playAgain() {
    // Add the current score to the high scores
    addScore(score); // Add the score to the high score list

    // Automatically display the updated high scores in the High Score Modal
    displayHighScores(); // Update the High Score Modal with new scores

    resetGame(); // Reset the game state
    shuffleCards(); // Shuffle the cards for a new game

    // Hide the Win Modal after resetting the game
    $("#winModal").modal("hide");

    // Start the background music when the user plays again
    startBackgroundMusic();
  }

  // Remove any existing event listeners to avoid duplicates
  playAgainButton.removeEventListener("click", playAgain); // Ensure old listeners are removed

  // Add a new event listener for the 'Play Again' button
  playAgainButton.addEventListener("click", playAgain);
}

// Function to show the game over modal
function showGameOverModal() {
  $("#gameOverModal").modal({
    backdrop: "static", // Prevent closing by clicking outside
    keyboard: false, // Disable closing via the ESC key
  });

  const playAgainButton = document.getElementById(
    "play-again-button-game-over"
  );

  // Clear previous event listener to prevent duplicates
  playAgainButton.removeEventListener("click", playAgain);
  playAgainButton.addEventListener("click", playAgain);
}

// Function to handle game over scenario when the time runs out
function gameOver() {
  stopBackgroundMusic();
  stopTimer(); // Stop the timer
  gameOverSound.play(); // Play the game over sound

  // Show the game over modal after a brief delay
  setTimeout(() => {
    showGameOverModal();
  }, 1000);
}

// Function to handle the "Play Again" action
function playAgain() {
  resetGame(); // Reset the game state
  startBackgroundMusic();
  $("#gameOverModal").modal("hide"); // Hide the game over modal
}

// Prevent closing the modal when clicking outside of it or using the keyboard
$("#gameOverModal")
  .on("show.bs.modal", function () {
    $("body").css("overflow", "hidden"); // Prevent background scrolling
  })
  .on("hidden.bs.modal", function () {
    $("body").css("overflow", ""); // Restore background scrolling when modal is closed
  });

// Initialize the game board on page load
window.onload = function () {
  createBoard();
  document
    .getElementById("difficulty")
    .addEventListener("change", setDifficulty);
  resetTimer(); // Ensure the timer is reset on page load
  displayHighScores(); // Display high scores on page load
};

// Function to get high scores from local storage
function getHighScores() {
  // Get scores from local storage and parse them
  // If there are no high scores, return an empty array
  return JSON.parse(localStorage.getItem("highScores")) || [];
}

// Function to save high scores to local storage
function saveHighScores(highScores) {
  // Save the high scores array to local storage as a JSON string
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

// Function to display high scores in the modal
function displayHighScores() {
  // Get the high-score list element from the DOM
  const highScoreList = document.getElementById("high-score-list");

  // Clear any existing list items
  highScoreList.innerHTML = "";

  // Retrieve the high scores from local storage
  const highScores = getHighScores();

  // Check if there are any high scores
  if (highScores.length === 0) {
    // If no scores exist, show a message
    const noScoresMessage = document.createElement("li");
    noScoresMessage.className = "list-group-item";
    noScoresMessage.textContent = "No high scores yet!";
    highScoreList.appendChild(noScoresMessage);
  } else {
    // Display the top 10 high scores (highest score first)
    highScores.slice(0, 10).forEach((scoreEntry, index) => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = `#${index + 1}: Score - ${
        scoreEntry.score
      }, Date - ${scoreEntry.date}`;
      highScoreList.appendChild(listItem);
    });
  }
}

// Function to add a new score and update high scores
function addScore(newScore) {
  // Get current high scores from local storage
  const highScores = getHighScores();

  // Get the current date as a string (formatted as MM/DD/YYYY)
  const date = new Date().toLocaleDateString();

  // Check if the new score is already in the high scores list (by comparing the score and date)
  const existingScoreIndex = highScores.findIndex(
    (entry) => entry.score === newScore && entry.date === date
  );

  // If the score doesn't already exist, add it to the list
  if (existingScoreIndex === -1) {
    highScores.push({ score: newScore, date: date });
  }

  // Sort the scores in descending order (highest score first)
  highScores.sort((a, b) => b.score - a.score);

  // Limit the number of high scores to 10
  if (highScores.length > 10) {
    highScores.length = 10; // Only keep the top 10 scores
  }

  // Save the updated high scores back to local storage
  saveHighScores(highScores);

  // Display the updated high scores in the modal
  displayHighScores();
}

// Function to open the high score modal
function openHighScoreModal() {
  // Display the high scores before opening the modal
  displayHighScores();

  // Show the modal using Bootstrap's modal method
  $("#highScoreModal").modal("show");
}

// Example usage when a player finishes a game (calling this function when the game ends)
function onGameEnd(playerScore) {
  // Add the player's score and update the high score list
  addScore(playerScore);

  // Open the high score modal to display the updated list
  openHighScoreModal();
}

// Function to reset high scores
function resetHighScores() {
  // Remove highScores from local storage
  localStorage.removeItem("highScores");

  // Optionally, clear the displayed high scores from the modal
  displayHighScores(); // This will refresh the list and show "No high scores yet!"
}

// Example: Attach reset functionality to a "Reset Scores" button
document
  .getElementById("reset-scores-button")
  .addEventListener("click", function () {
    if (confirm("Are you sure you want to delete all high scores?")) {
      resetHighScores();
      alert("High scores have been deleted!");
    }
  });

// Add event listener to reset button
resetButton.addEventListener("click", resetGame);

// Get the 'How to Play' button and progress circle elements
const howToPlayButton = document.getElementById("instruction-button");
const progressCircleContainer = document.getElementById(
  "progress-circle-container"
);

// Event listener for 'How to Play' button click
howToPlayButton.addEventListener("click", () => {
  // Show the circular progress bar
  progressCircleContainer.style.display = "flex"; // Flex to center the spinner

  // Wait for 2 seconds before opening the instruction page
  setTimeout(() => {
    // Hide the circular progress bar after the loading completes
    progressCircleContainer.style.display = "none";

    // Open the instruction.html page in full-screen mode
    const newWindow = window.open("instruction.html", "_blank");

    // Try to make the instruction page full screen
    newWindow.onload = function () {
      if (newWindow.document.documentElement.requestFullscreen) {
        newWindow.document.documentElement.requestFullscreen();
      } else if (newWindow.document.documentElement.mozRequestFullScreen) {
        // Firefox
        newWindow.document.documentElement.mozRequestFullScreen();
      } else if (newWindow.document.documentElement.webkitRequestFullscreen) {
        // Chrome, Safari, and Opera
        newWindow.document.documentElement.webkitRequestFullscreen();
      } else if (newWindow.document.documentElement.msRequestFullscreen) {
        // IE/Edge
        newWindow.document.documentElement.msRequestFullscreen();
      }
    };
  }, 2000); // 2000 ms = 2 seconds
});

// Function to start background music when the game begins
function startBackgroundMusic() {
  const backgroundMusic = document.getElementById("background-music");
  backgroundMusic.play();
}

// Function to stop background music when the user wins or loses
function stopBackgroundMusic() {
  const backgroundMusic = document.getElementById("background-music");
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0; // Reset the music to the beginning
}
