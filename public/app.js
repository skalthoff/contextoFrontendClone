// Contexto Clone - Enhanced UI Version
const API_BASE = 'https://api.contexto.me/machado/en';

class ContextoGame {
    constructor() {
        this.state = {
            guessHistory: [],
            currentGuess: '',
            message: '',
            messageType: '',
            gameId: 845, // Fixed game ID (actual gameplay)
            displayGameId: this.getTodayGameId(), // Display current day number
            foundWord: false,
            gaveUp: false,
            secretWord: '',
            numberOfAttempts: 0,
            showInstructions: false,
            showStats: false,
            showSettings: false,
            theme: (localStorage.getItem('contextoTheme') || 'light')
        };
        
        this.loadState();
        this.init();
    }
    
    getTodayGameId() {
        // Base game start date (original Contexto launch)
        const startDate = new Date('2022-02-23');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    loadState() {
        const saved = localStorage.getItem('contextoState');
        if (saved) {
            const data = JSON.parse(saved);
            // Always load state for game 845, but update display ID
            if (data.gameId === 845) {
                this.state = { ...this.state, ...data, displayGameId: this.getTodayGameId() };
            }
        }
    }
    
    saveState() {
        localStorage.setItem('contextoState', JSON.stringify(this.state));
    }
    
    async init() {
        this.render();
    }
    
    async submitGuess(word) {
        if (!word || word.trim() === '') return;
        
        word = word.toLowerCase().trim();
        
        // Check if word is single word
        if (word.includes(' ')) {
            this.setState({
                message: 'Please enter only one word',
                messageType: 'error'
            });
            return;
        }
        
        // Check if already guessed
        if (this.state.guessHistory.some(g => g.word === word)) {
            this.setState({
                message: 'You already guessed this word!',
                messageType: 'repeated'
            });
            return;
        }
        
        try {
            // Call Contexto API
            const response = await fetch(`${API_BASE}/game/${this.state.gameId}/${word}`);
            
            if (!response.ok) {
                throw new Error('Word not found');
            }
            
            const data = await response.json();
            
            if (data.distance < 0) {
                this.setState({
                    message: 'Word not in dictionary',
                    messageType: 'error'
                });
                return;
            }
            
            const newGuess = {
                word: data.word || word,
                distance: data.distance
            };
            
            const newHistory = [...this.state.guessHistory, newGuess];
            newHistory.sort((a, b) => a.distance - b.distance);
            
            const foundWord = data.distance === 0;
            
            this.setState({
                guessHistory: newHistory,
                currentGuess: '',
                message: foundWord ? `Congratulations! You found the word in ${this.state.numberOfAttempts + 1} guesses!` : '',
                messageType: foundWord ? 'success' : '',
                foundWord: foundWord,
                secretWord: foundWord ? newGuess.word : this.state.secretWord,
                numberOfAttempts: this.state.numberOfAttempts + 1
            });
            
        } catch (error) {
            this.setState({
                message: 'Error checking word. Please try again.',
                messageType: 'error'
            });
        }
    }
    
    // Removed tip and give up functionality per user request
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveState();
        if (newState.theme) {
            document.body.setAttribute('data-theme', newState.theme);
            localStorage.setItem('contextoTheme', newState.theme);
        }
        this.render();
    }

    toggleTheme() {
        const next = this.state.theme === 'light' ? 'dark' : 'light';
        this.setState({ theme: next });
    }
    
    getBarColor(distance) {
        if (distance < 100) return 'var(--green)';
        if (distance < 1500) return 'var(--yellow)';
        return 'var(--red)';
    }
    
    getBarWidth(distance) {
        const percentage = Math.exp(-distance / 40000 * 100);
        const normalized = (percentage - Math.exp(-100)) / (Math.exp(0) - Math.exp(-100));
        return Math.max(1, normalized * 100);
    }
    
        render() {
                const app = document.getElementById('root');
                const guessesMarkup = this.state.guessHistory.map((guess, index) => {
                        const current = index === 0 ? ' current' : '';
                        return `
                        <div class="row-wrapper${current}">
                                <div class="outer-bar"></div>
                                <div class="inner-bar" style="width:${this.getBarWidth(guess.distance)}%;background-color:${this.getBarColor(guess.distance)}"></div>
                                <div class="row">
                                    <span>${guess.word}</span>
                                    <span>${guess.distance === 0 ? '0' : guess.distance}</span>
                                </div>
                        </div>`;
                }).join('');
                app.innerHTML = `
                <div class="wrapper">
                    <main>
                        <div class="top-bar">
                            <button class="btn" title="Instructions" onclick="game.setState({ showInstructions: true })"><span class="material-symbols-rounded">help</span></button>
                            <div class="title"><h1>CONTEXTO</h1></div>
                            <div style="display:flex;gap:6px;">
                                <button class="btn" title="Stats" onclick="game.setState({ showStats: true })"><span class="material-symbols-rounded">bar_chart</span></button>
                                <button class="btn" title="Theme" onclick="game.toggleTheme()"><span class="material-symbols-rounded">${this.state.theme === 'light' ? 'dark_mode' : 'light_mode'}</span></button>
                            </div>
                        </div>
                        <div class="info-bar">
                            <span class="label">GAME:</span> <span>#${this.state.displayGameId}</span> <span class="label">GUESSES:</span> <span>${this.state.numberOfAttempts}</span>
                        </div>
                        ${this.state.foundWord ? `
                            <div class="end-msg">
                                <p><b>You found it!</b></p>
                                <p>The word was: <b>${this.state.secretWord}</b></p>
                                <p>Attempts: ${this.state.numberOfAttempts}</p>
                            </div>
                        ` : `
                            <form onsubmit="event.preventDefault(); game.submitGuess(game.state.currentGuess);" autocomplete="off">
                                <input class="word" type="text" placeholder="type a word" value="${this.state.currentGuess}" oninput="game.state.currentGuess=this.value" onkeydown="if(event.key==='Enter'){game.submitGuess(this.value)}" />
                            </form>
                        `}
                        <div class="message ${this.state.messageType}">${this.state.message}</div>
                        <div class="guess-history">${guessesMarkup || '<p class="label">Start guessing!</p>'}</div>
                    </main>
                </div>
                ${this.state.showInstructions ? this.renderInstructionsModal() : ''}
                ${this.state.showStats ? this.renderStatsModal() : ''}
                ${this.state.showSettings ? this.renderSettingsModal() : ''}
                `;
        }

    renderInstructionsModal() {
        return `
        <div class="modal-bg" onclick="if(event.target===this) game.setState({showInstructions:false})">
            <div class="modal">
                <div class="modal-title"><h2>How to play</h2></div>
                <p>Guess the secret word (#0). Each guess returns a similarity rank. Lower is closer.</p>
                <p>Words are ranked by an AI model analyzing large text corpora.</p>
                <p>Use tips sparingly; they count toward stats.</p>
                <div class="modal-btn-div"><button class="button small" onclick="game.setState({showInstructions:false})">Close</button></div>
            </div>
        </div>`;
    }

    renderStatsModal() {
        return `
        <div class="modal-bg" onclick="if(event.target===this) game.setState({showStats:false})">
            <div class="modal">
                <div class="modal-title"><h2>Statistics</h2></div>
                <p>Game: #${this.state.displayGameId}</p>
                <p>Guesses: ${this.state.numberOfAttempts}</p>
                <p>Status: ${this.state.foundWord ? 'Solved' : 'In Progress'}</p>
                <div class="modal-btn-div"><button class="button small" onclick="game.setState({showStats:false})">Close</button></div>
            </div>
        </div>`;
    }

    renderSettingsModal() {
        return `
        <div class="modal-bg" onclick="if(event.target===this) game.setState({showSettings:false})">
            <div class="modal">
                <div class="modal-title"><h2>Settings</h2></div>
                <p>Theme: ${this.state.theme}</p>
                <button class="button small" onclick="game.toggleTheme()">Toggle Theme</button>
                <div class="modal-btn-div"><button class="button small" onclick="game.setState({showSettings:false})">Close</button></div>
            </div>
        </div>`;
    }
}

// Initialize game
window.game = new ContextoGame();
