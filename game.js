document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const choiceBtns = document.querySelectorAll('.choice-btn');
    const playerChoiceEl = document.getElementById('player-choice');
    const computerChoiceEl = document.getElementById('computer-choice');
    const resultMessageEl = document.getElementById('result-message');
    const playerScoreEl = document.getElementById('player-score');
    const computerScoreEl = document.getElementById('computer-score');
    const roundEl = document.getElementById('round');
    const timeEl = document.getElementById('time');
    const pauseBtn = document.getElementById('pause-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const outcomeModal = document.getElementById('outcome-modal');
    const outcomeImage = document.getElementById('outcome-image');
    const outcomeText = document.getElementById('outcome-text');
    const nextRoundBtn = document.getElementById('next-round');
    const confettiCanvas = document.getElementById('confetti-canvas');

    // Game State
    let scores = { player: 0, computer: 0 };
    let currentRound = 1;
    let gameTimer;
    let gameHistory = [];

    // Theme management
    function setTheme(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        setTheme(!body.classList.contains('dark-mode'));
    });

    // Initialize game
    initGame();

    function initGame() {
        gameTimer = new GameTimer(10, timeEl, onTimeUp);
        
        choiceBtns.forEach(btn => {
            btn.addEventListener('click', () => playRound(btn.dataset.choice));
        });
        
        pauseBtn.addEventListener('click', togglePause);
        clearHistoryBtn.addEventListener('click', clearHistory);
        nextRoundBtn.addEventListener('click', startNextRound);
        
        updateRoundDisplay();
        resetChoices();
        gameTimer.start();
    }

    function playRound(playerChoice) {
        if (gameTimer.isPaused) return;
        
        choiceBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        displayChoice(playerChoiceEl, playerChoice);
        
        setTimeout(() => {
            displayChoice(computerChoiceEl, computerChoice);
            
            setTimeout(() => {
                const result = determineWinner(playerChoice, computerChoice);
                updateScore(result);
                showResult(result, playerChoice, computerChoice);
                addToHistory(playerChoice, computerChoice, result);
                
                choiceBtns.forEach(btn => {
                    btn.disabled = false;
                    btn.classList.remove('disabled');
                });
            }, 500);
        }, 500);
        
        gameTimer.pause();
    }

    function displayChoice(element, choice) {
        element.innerHTML = '';
        const icon = document.createElement('i');
        icon.className = `fas fa-hand-${choice}`;
        element.appendChild(icon);
        element.classList.add('selected');
        
        setTimeout(() => {
            element.classList.remove('selected');
        }, 300);
    }

    function determineWinner(player, computer) {
        if (player === computer) return 'draw';
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        return winConditions[player] === computer ? 'win' : 'lose';
    }

    function updateScore(result) {
        if (result === 'win') scores.player++;
        if (result === 'lose') scores.computer++;
        playerScoreEl.textContent = scores.player;
        computerScoreEl.textContent = scores.computer;
    }

    function showResult(result, playerChoice, computerChoice) {
        let message = '';
        let outcome = '';
        let imageUrl = '';
        
        switch(result) {
            case 'win':
                message = `You win! ${capitalize(playerChoice)} beats ${capitalize(computerChoice)}`;
                outcome = 'HURRAY!';
                imageUrl = 'https://emojicdn.elk.sh/🎉';
                showConfetti();
                break;
            case 'lose':
                message = `You lose! ${capitalize(computerChoice)} beats ${capitalize(playerChoice)}`;
                outcome = 'Next time bud!';
                imageUrl = 'https://emojicdn.elk.sh/😢';
                break;
            case 'draw':
                message = "It's a draw!";
                outcome = "It's a tie!";
                imageUrl = 'https://emojicdn.elk.sh/🤝';
                break;
        }
        
        resultMessageEl.textContent = message;
        showOutcome(outcome, imageUrl);
    }

    function showOutcome(text, imageUrl) {
        outcomeText.textContent = text;
        outcomeImage.src = imageUrl;
        outcomeModal.style.display = 'flex';
    }

    function startNextRound() {
        outcomeModal.style.display = 'none';
        confettiCanvas.style.display = 'none';
        
        if (currentRound < 10) {
            currentRound++;
            updateRoundDisplay();
            resetChoices();
            gameTimer.reset();
            gameTimer.start();
        } else {
            endTournament();
        }
    }

    function resetChoices() {
        playerChoiceEl.innerHTML = '<div class="placeholder">?</div>';
        computerChoiceEl.innerHTML = '<div class="placeholder">?</div>';
        resultMessageEl.textContent = 'Choose your move!';
    }

    function updateRoundDisplay() {
        roundEl.textContent = `${currentRound}/10`;
    }

    function onTimeUp() {
        if (playerChoiceEl.querySelector('.placeholder')) {
            resultMessageEl.textContent = "Time's up! You didn't choose.";
            showOutcome("Too slow!", "https://emojicdn.elk.sh/⏱️");
            scores.computer++;
            computerScoreEl.textContent = scores.computer;
            addToHistory('none', 'none', 'timeout');
        }
    }

    function togglePause() {
        if (gameTimer.isPaused) {
            gameTimer.resume();
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            gameTimer.pause();
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function addToHistory(playerChoice, computerChoice, result) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const entry = {
            playerChoice,
            computerChoice,
            result,
            time: timeString
        };
        gameHistory.unshift(entry);
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        gameHistory.slice(0, 10).forEach(game => {
            const item = document.createElement('div');
            item.className = `history-item ${game.result}`;
            const playerEmoji = game.playerChoice === 'none' ? '⏱️' : getEmoji(game.playerChoice);
            const computerEmoji = game.computerChoice === 'none' ? '⏱️' : getEmoji(game.computerChoice);
            item.innerHTML = `
                <span>${playerEmoji} vs ${computerEmoji}</span>
                <span>${game.result.toUpperCase()}</span>
                <span>${game.time}</span>
            `;
            historyList.appendChild(item);
        });
    }

    function getEmoji(choice) {
        const emojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        return emojis[choice] || '?';
    }

    function clearHistory() {
        gameHistory = [];
        updateHistoryDisplay();
    }

    function endTournament() {
        let finalMessage = `Tournament over! Final score: ${scores.player}-${scores.computer}`;
        if (scores.player > scores.computer) {
            finalMessage += " 🏆 YOU WIN!";
            showConfetti();
        } else if (scores.player < scores.computer) {
            finalMessage += " 😢 You lost...";
        } else {
            finalMessage += " 🤝 It's a tie!";
        }
        
        outcomeText.textContent = finalMessage;
        outcomeImage.src = scores.player > scores.computer 
            ? "https://emojicdn.elk.sh/🏆" 
            : scores.player < scores.computer 
            ? "https://emojicdn.elk.sh/😢" 
            : "https://emojicdn.elk.sh/🤝";
        
        nextRoundBtn.textContent = "Play Again";
        nextRoundBtn.onclick = resetGame;
        outcomeModal.style.display = 'flex';
    }

    function resetGame() {
        scores = { player: 0, computer: 0 };
        currentRound = 1;
        playerScoreEl.textContent = '0';
        computerScoreEl.textContent = '0';
        outcomeModal.style.display = 'none';
        nextRoundBtn.textContent = "Next Round";
        nextRoundBtn.onclick = startNextRound;
        updateRoundDisplay();
        resetChoices();
        gameTimer.reset();
        gameTimer.start();
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showConfetti() {
        confettiCanvas.style.display = 'block';
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
        
        function createParticles() {
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: Math.random() * confettiCanvas.width,
                    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                    size: Math.random() * 10 + 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    speed: Math.random() * 3 + 2,
                    angle: Math.random() * Math.PI * 2,
                    rotation: Math.random() * 0.2 - 0.1
                });
            }
        }
        
        function drawParticles() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
                p.y += p.speed;
                p.angle += p.rotation;
                if (p.y > confettiCanvas.height) {
                    p.y = -p.size;
                    p.x = Math.random() * confettiCanvas.width;
                }
            }
            requestAnimationFrame(drawParticles);
        }
        
        createParticles();
        drawParticles();
        setTimeout(() => {
            confettiCanvas.style.display = 'none';
        }, 3000);
    }
});