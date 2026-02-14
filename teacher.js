// ============================================
// teacher.js - С ЛИДЕРБОРДОМ И КНОПКОЙ ЗАВЕРШЕНИЯ
// ============================================

console.log("🔥 teacher.js загружается...");

let currentGameId = null;
let currentQuestionIndex = 0;
let playersListener = null;
let gameListener = null;
let answersListener = null;
let db = null;
let currentQuestionId = null;
let totalPlayersCount = 0;
let gameFinished = false;
let finalLeaderboard = [];

// Элементы DOM
let startSection, gameControls, gameCodeDisplay, playersList, playerCount;
let statsContent, questionsList, currentQ, presentationMode, mainInterface;
let presentationQNum, presentationQuestion, answeredCount, correctCount, percentage;
let leaderboardPanel, leaderboardList, leaderboardDate;

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Teacher panel initializing...");
    
    if (window.db) {
        db = window.db;
        console.log("✅ db получена");
    }
    
    // Получаем элементы
    startSection = document.getElementById('startSection');
    gameControls = document.getElementById('gameControls');
    gameCodeDisplay = document.getElementById('gameCode');
    playersList = document.getElementById('playersList');
    playerCount = document.getElementById('playerCount');
    statsContent = document.getElementById('statsContent');
    questionsList = document.getElementById('questionsList');
    currentQ = document.getElementById('currentQ');
    
    mainInterface = document.getElementById('mainInterface');
    presentationMode = document.getElementById('presentationMode');
    presentationQNum = document.getElementById('presentationQNum');
    presentationQuestion = document.getElementById('presentationQuestion');
    
    answeredCount = document.getElementById('answeredCount');
    correctCount = document.getElementById('correctCount');
    percentage = document.getElementById('percentage');
    
    leaderboardPanel = document.getElementById('leaderboardPanel');
    leaderboardList = document.getElementById('leaderboardList');
    leaderboardDate = document.getElementById('leaderboardDate');
    
    // Загружаем вопросы
    if (window.QUIZ_DATA) {
        console.log(`✅ Загружено ${QUIZ_DATA.questions.length} вопросов`);
        updateQuestionsList();
    }
});

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function startNewGame() {
    if (!db) {
        if (window.db) {
            db = window.db;
        } else {
            alert("Firebase not connected");
            return;
        }
    }
    
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    currentGameId = "game_" + code;
    currentQuestionIndex = 0;
    gameFinished = false;
    
    startSection.style.display = 'none';
    gameControls.style.display = 'block';
    gameCodeDisplay.textContent = code;
    currentQ.textContent = '0/30';
    
    const gameData = {
        id: currentGameId,
        created: Date.now(),
        status: "lobby",
        currentQuestion: null,
        players: {},
        answers: {},
        finished: false,
        finalLeaderboard: null
    };
    
    db.ref('games/' + currentGameId).set(gameData)
        .then(() => {
            console.log("✅ Игра создана, код:", code);
            listenToPlayers();
            listenToGame();
        })
        .catch(error => {
            console.error("❌ Ошибка:", error);
            alert("Error: " + error.message);
        });
}

// ============================================
// 👥 СЛУШАТЬ ИГРОКОВ
// ============================================

function listenToPlayers() {
    if (!currentGameId || !db) return;
    
    db.ref(`games/${currentGameId}/players`).on('value', snapshot => {
        const players = snapshot.val() || {};
        const playerArray = Object.entries(players).map(([name, data]) => ({
            name,
            score: data.score || 0
        }));
        
        playerCount.textContent = playerArray.length;
        totalPlayersCount = playerArray.length;
        updatePlayersList(playerArray);
    });
}

function updatePlayersList(players) {
    if (!playersList) return;
    
    if (players.length === 0) {
        playersList.innerHTML = '<div class="empty-state">No players yet</div>';
        return;
    }
    
    // Сортируем по очкам
    players.sort((a, b) => b.score - a.score);
    
    playersList.innerHTML = players.map(player => `
        <div class="player-card">
            <div class="player-avatar">${player.name.charAt(0).toUpperCase()}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-score">${player.score}</div>
        </div>
    `).join('');
}

// ============================================
// 📝 УПРАВЛЕНИЕ ВОПРОСАМИ
// ============================================

function startNextQuestion() {
    if (!currentGameId) {
        alert("Create a game first!");
        return;
    }
    
    if (gameFinished) {
        alert("Game already finished. Start a new game.");
        return;
    }
    
    const question = QUIZ_DATA.questions[currentQuestionIndex];
    if (!question) {
        endGame();
        return;
    }
    
    answeredCount.textContent = '0';
    correctCount.textContent = '0';
    percentage.textContent = '0%';
    
    db.ref(`games/${currentGameId}/answers/${question.id}`).remove();
    
    db.ref('games/' + currentGameId).update({
        status: "question_active",
        currentQuestion: question.id,
        questionStartTime: Date.now()
    }).then(() => {
        enterPresentationMode(question);
        startAnswerTracking(question.id);
        currentQuestionIndex++;
        currentQ.textContent = currentQuestionIndex + '/30';
        updateQuestionsList();
    });
}

function startAnswerTracking(questionId) {
    if (!currentGameId || !questionId || !db) return;
    
    currentQuestionId = questionId;
    
    if (answersListener) {
        db.ref(`games/${currentGameId}/answers/${currentQuestionId}`).off('value', answersListener);
    }
    
    answersListener = db.ref(`games/${currentGameId}/answers/${questionId}`).on('value', snapshot => {
        const answers = snapshot.val() || {};
        updateAnswerStats(answers);
    });
}

function updateAnswerStats(answers) {
    const totalAnswers = Object.keys(answers).length;
    let correct = 0;
    
    Object.values(answers).forEach(answer => {
        if (answer.isCorrect) correct++;
    });
    
    answeredCount.textContent = totalAnswers;
    correctCount.textContent = correct;
    
    const percent = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0;
    percentage.textContent = percent + '%';
}

// ============================================
// 🖥️ ПРЕЗЕНТАЦИЯ
// ============================================

function enterPresentationMode(question) {
    mainInterface.style.display = 'none';
    presentationMode.style.display = 'flex';
    presentationMode.classList.add('active');
    
    presentationQNum.textContent = currentQuestionIndex + 1;
    presentationQuestion.innerHTML = `<h2>${question.text}</h2>`;
}

function exitPresentation() {
    if (answersListener && currentQuestionId && db) {
        db.ref(`games/${currentGameId}/answers/${currentQuestionId}`).off('value', answersListener);
        answersListener = null;
    }
    
    presentationMode.classList.remove('active');
    presentationMode.style.display = 'none';
    mainInterface.style.display = 'flex';
    
    if (currentGameId && db) {
        db.ref('games/' + currentGameId).update({ status: "lobby" });
    }
}

function showAnswerPresentation() {
    const question = QUIZ_DATA.questions[currentQuestionIndex - 1];
    if (!question) return;
    
    const correctAnswer = question.options[question.correct];
    
    presentationQuestion.innerHTML += `
        <div style="margin-top:30px; padding:20px; background:rgba(67,233,123,0.1); border-radius:20px;">
            <h3 style="color:#43e97b;">✅ CORRECT ANSWER:</h3>
            <div style="font-size:1.8rem; margin:15px 0;">${correctAnswer}</div>
            <div>${question.explanation}</div>
        </div>
    `;
    
    db.ref('games/' + currentGameId).update({ status: "showing_results" });
}

function showAnswer() {
    showAnswerPresentation();
}

function nextQuestion() {
    exitPresentation();
}

// ============================================
// 🏁 ЗАВЕРШЕНИЕ ИГРЫ
// ============================================

function endGameEarly() {
    if (!currentGameId) {
        alert("Create a game first!");
        return;
    }
    
    if (confirm("End game now and show final results?")) {
        endGame();
    }
}

function endGame() {
    console.log("🏁 Завершение игры");
    
    gameFinished = true;
    
    // Получаем финальный лидерборд
    db.ref(`games/${currentGameId}/players`).once('value')
        .then(snapshot => {
            const players = snapshot.val() || {};
            const leaderboard = Object.entries(players).map(([name, data]) => ({
                name: name,
                score: data.score || 0
            }));
            
            // Сортируем по очкам
            leaderboard.sort((a, b) => b.score - a.score);
            finalLeaderboard = leaderboard;
            
            // Сохраняем в Firebase
            return db.ref(`games/${currentGameId}`).update({
                status: "finished",
                finished: true,
                finalLeaderboard: leaderboard,
                finishedAt: Date.now()
            });
        })
        .then(() => {
            showLeaderboard();
        })
        .catch(error => {
            console.error("❌ Ошибка при завершении:", error);
        });
}

function showLeaderboard() {
    if (!leaderboardPanel || !leaderboardList) return;
    
    leaderboardDate.textContent = new Date().toLocaleString('ru-RU');
    
    if (finalLeaderboard.length === 0) {
        leaderboardList.innerHTML = '<div style="text-align:center; padding:30px;">No players participated</div>';
    } else {
        leaderboardList.innerHTML = finalLeaderboard.map((player, index) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score}</div>
                ${index === 0 ? '<div class="leaderboard-crown">👑</div>' : ''}
            </div>
        `).join('');
    }
    
    leaderboardPanel.classList.add('active');
}

function closeLeaderboard() {
    leaderboardPanel.classList.remove('active');
}

// ============================================
// 🔄 СБРОС ИГРЫ
// ============================================

function resetGame() {
    if (!confirm("Delete current game and start over?")) return;
    
    if (currentGameId && db) {
        db.ref('games/' + currentGameId).remove();
    }
    
    currentGameId = null;
    currentQuestionIndex = 0;
    gameFinished = false;
    finalLeaderboard = [];
    
    startSection.style.display = 'block';
    gameControls.style.display = 'none';
    gameCodeDisplay.textContent = '----';
    playersList.innerHTML = '<div class="empty-state">No players yet</div>';
    playerCount.textContent = '0';
    currentQ.textContent = '0/30';
    
    answeredCount.textContent = '0';
    correctCount.textContent = '0';
    percentage.textContent = '0%';
    
    updateQuestionsList();
}

// ============================================
// 📋 ВОПРОСЫ
// ============================================

function updateQuestionsList() {
    if (!questionsList || !QUIZ_DATA) return;
    
    questionsList.innerHTML = QUIZ_DATA.questions.map((q, index) => {
        const isCurrent = index === currentQuestionIndex - 1;
        const isCompleted = index < currentQuestionIndex - 1;
        
        let statusClass = '';
        if (isCurrent) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';
        
        return `
            <div class="question-item ${statusClass}" onclick="selectQuestion(${index})">
                <div>${index + 1}</div>
            </div>
        `;
    }).join('');
}

function selectQuestion(index) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions[index]) return;
    
    if (gameFinished) {
        alert("Game finished. Start a new game.");
        return;
    }
    
    currentQuestionIndex = index;
    startNextQuestion();
}

function listenToGame() {
    if (!currentGameId || !db) return;
    
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) return;
        
        // Если игра завершена и мы ещё не показывали лидерборд
        if (game.finished && !gameFinished) {
            gameFinished = true;
            finalLeaderboard = game.finalLeaderboard || [];
            showLeaderboard();
        }
    });
}

// ============================================
// 📤 ЭКСПОРТ
// ============================================

window.startNewGame = startNewGame;
window.startNextQuestion = startNextQuestion;
window.showAnswer = showAnswer;
window.nextQuestion = nextQuestion;
window.resetGame = resetGame;
window.exitPresentation = exitPresentation;
window.showAnswerPresentation = showAnswerPresentation;
window.selectQuestion = selectQuestion;
window.endGameEarly = endGameEarly;
window.closeLeaderboard = closeLeaderboard;

console.log("✅ teacher.js загружен");
