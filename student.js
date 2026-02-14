// ============================================
// student.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

console.log("🔥 student.js загружается...");

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let db = null;

// Элементы DOM
let joinScreen, waitingScreen, questionScreen, resultScreen;
let joinButton, errorContainer, notificationContainer;
let displayName, displayCode, displayScore, roomPlayers;
let currentQSpan, questionText, optionsContainer, answerStatus, resultContent;

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Student page initializing...");
    
    // Получаем db из window
    if (window.db) {
        db = window.db;
        console.log("✅ db получена");
    } else {
        console.error("❌ db не получена!");
    }
    
    // Получаем элементы DOM
    joinScreen = document.getElementById('joinScreen');
    waitingScreen = document.getElementById('waitingScreen');
    questionScreen = document.getElementById('questionScreen');
    resultScreen = document.getElementById('resultScreen');
    
    joinButton = document.getElementById('joinButton');
    errorContainer = document.getElementById('errorContainer');
    notificationContainer = document.getElementById('notificationContainer');
    
    displayName = document.getElementById('displayName');
    displayCode = document.getElementById('displayCode');
    displayScore = document.getElementById('displayScore');
    roomPlayers = document.getElementById('roomPlayers');
    
    currentQSpan = document.getElementById('currentQ');
    questionText = document.getElementById('questionText');
    optionsContainer = document.getElementById('optionsContainer');
    answerStatus = document.getElementById('answerStatus');
    resultContent = document.getElementById('resultContent');
    
    // Устанавливаем обработчики
    if (joinButton) {
        joinButton.addEventListener('click', function(e) {
            e.preventDefault();
            joinGame();
        });
    }
    
    // Обработчики полей ввода
    const playerNameInput = document.getElementById('playerName');
    const gameCodeInput = document.getElementById('gameCode');
    
    if (playerNameInput) {
        playerNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                gameCodeInput?.focus();
            }
        });
    }
    
    if (gameCodeInput) {
        gameCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinGame();
            }
        });
        
        gameCodeInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 8);
        });
    }
    
    console.log("✅ Инициализация завершена");
});

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function joinGame() {
    console.log("🎮 joinGame");
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('gameCode');
    
    if (!nameInput || !codeInput) {
        console.error("❌ Поля ввода не найдены");
        return;
    }
    
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();
    
    console.log("📝 Ввод:", { name, code });
    
    if (!name || name.length < 2) {
        showError("Enter your name (min 2 characters)");
        return;
    }
    
    if (!code || code.length !== 8 || !/^\d+$/.test(code)) {
        showError("Enter 8-digit game code");
        return;
    }
    
    if (!db) {
        if (window.db) {
            db = window.db;
            console.log("✅ db взята из window.db");
        } else {
            showError("Firebase not connected");
            return;
        }
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    console.log("🎮 Подключение к:", currentGameId);
    
    if (joinButton) {
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
        joinButton.disabled = true;
    }
    
    // Проверяем существование игры
    db.ref(`games/${currentGameId}`).once('value')
        .then(snapshot => {
            console.log("📊 Ответ от Firebase:", snapshot.exists() ? "игра найдена" : "игра не найдена");
            
            if (!snapshot.exists()) {
                throw new Error(`Game with code ${code} not found!`);
            }
            
            const game = snapshot.val();
            console.log("📊 Данные игры:", game);
            
            // Проверяем, не завершена ли игра
            if (game.finished === true) {
                throw new Error("This game has already finished");
            }
            
            // Проверяем уникальность имени
            if (game.players && game.players[name]) {
                throw new Error("Player with this name already exists!");
            }
            
            // Регистрируем игрока
            console.log("📝 Регистрация игрока:", name);
            return db.ref(`games/${currentGameId}/players/${name}`).set({
                name: name,
                joined: Date.now(),
                score: 0
            });
        })
        .then(() => {
            console.log("✅ Игрок зарегистрирован");
            
            if (displayName) displayName.textContent = name;
            if (displayCode) displayCode.textContent = code;
            
            switchScreen('waiting');
            listenToGame();
            
            if (joinButton) {
                joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
                joinButton.disabled = false;
            }
        })
        .catch(error => {
            console.error("❌ Ошибка:", error);
            showError(error.message);
            
            if (joinButton) {
                joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
                joinButton.disabled = false;
            }
            
            playerName = null;
            currentGameId = null;
        });
}

// ============================================
// 🎮 СЛУШАТЬ ИГРУ
// ============================================

function listenToGame() {
    if (!currentGameId || !db) {
        console.log("👂 Нет currentGameId или db");
        return;
    }
    
    console.log("👂 Начинаем слушать игру:", currentGameId);
    
    // Слушаем изменения в игре
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        console.log("📊 Обновление игры:", game?.status);
        
        if (!game) {
            console.log("Игра удалена");
            showNotification("Game was deleted", "error");
            leaveGame();
            return;
        }
        
        // Проверяем, завершена ли игра
        if (game.finished === true) {
            console.log("🏁 Игра завершена");
            showNotification("🏁 Game finished!", "info");
            setTimeout(() => leaveGame(), 3000);
            return;
        }
        
        // Обновляем количество игроков
        const players = game.players || {};
        if (roomPlayers) roomPlayers.textContent = Object.keys(players).length;
        
        // Обновляем счет игрока
        if (players[playerName] && displayScore) {
            displayScore.textContent = players[playerName].score || 0;
        }
        
        const currentQuestionId = game.currentQuestion;
        
        // Обрабатываем статус игры
        switch (game.status) {
            case "lobby":
            case "waiting":
                if (questionScreen?.classList.contains('active')) {
                    switchScreen('waiting');
                }
                break;
                
            case "question_active":
                if (currentQuestionId && (!currentQuestion || currentQuestion.id !== currentQuestionId)) {
                    console.log("📝 Новый вопрос:", currentQuestionId);
                    handleQuestion(currentQuestionId);
                }
                break;
                
            case "showing_results":
                if (currentQuestionId) {
                    showResults(currentQuestionId);
                }
                break;
        }
    }, error => {
        console.error("❌ Ошибка слушателя:", error);
    });
}

// ============================================
// 📝 ОБРАБОТКА ВОПРОСОВ
// ============================================

function handleQuestion(questionId) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions) {
        console.error("❌ QUIZ_DATA не загружен");
        return;
    }
    
    const question = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!question) {
        console.error("❌ Вопрос не найден:", questionId);
        return;
    }
    
    currentQuestion = shuffleQuestion(question);
    hasAnswered = false;
    
    console.log("📝 Показываем вопрос:", currentQuestion.id);
    
    switchScreen('question');
    
    if (currentQSpan) currentQSpan.textContent = currentQuestion.id;
    if (questionText) questionText.textContent = currentQuestion.text;
    if (answerStatus) {
        answerStatus.textContent = "Choose an answer";
        answerStatus.className = "status";
    }
    
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div>${option}</div>
            `;
            
            optionDiv.addEventListener('click', function(e) {
                e.preventDefault();
                selectAnswer(index);
            });
            
            optionsContainer.appendChild(optionDiv);
        });
    }
}

function shuffleQuestion(question) {
    const options = [...question.options];
    const correctAnswer = options[question.correct];
    
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
        ...question,
        options: options,
        correct: options.indexOf(correctAnswer)
    };
}

function selectAnswer(answerIndex) {
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName || !db) {
        console.log("⛔ Нельзя выбрать ответ:", { hasAnswered, currentQuestion, currentGameId, playerName, db });
        return;
    }
    
    console.log("✅ Выбран ответ:", answerIndex);
    hasAnswered = true;
    
    document.querySelectorAll('.option').forEach((opt, idx) => {
        opt.classList.remove('selected');
        if (idx === answerIndex) {
            opt.classList.add('selected');
        }
    });
    
    const isCorrect = (answerIndex === currentQuestion.correct);
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set({
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timestamp: Date.now()
    }).then(() => {
        if (isCorrect) {
            return db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + (currentQuestion.points || 1);
            });
        }
    }).then(() => {
        if (answerStatus) {
            answerStatus.textContent = isCorrect ? "✅ CORRECT!" : "❌ WRONG";
            answerStatus.className = isCorrect ? "status correct" : "status wrong";
        }
    }).catch(error => {
        console.error("❌ Ошибка отправки ответа:", error);
    });
}

function showResults(questionId) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions || !db || !currentGameId || !playerName) return;
    
    const question = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!question) return;
    
    switchScreen('result');
    
    db.ref(`games/${currentGameId}/answers/${questionId}`).once('value')
        .then(snapshot => {
            const answers = snapshot.val() || {};
            const playerAnswer = answers[playerName];
            
            let resultHTML = '';
            
            if (playerAnswer) {
                const isCorrect = playerAnswer.isCorrect;
                const points = isCorrect ? question.points || 1 : 0;
                
                resultHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2.5rem;">${isCorrect ? '✅' : '❌'}</div>
                        <div style="color: ${isCorrect ? '#43e97b' : '#ff416c'}; font-size: 1.3rem; margin: 10px 0;">
                            ${isCorrect ? 'CORRECT!' : 'WRONG!'}
                        </div>
                        <div>${points} points</div>
                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; margin-top: 15px;">
                            <div style="color: #4facfe;">📝 ${question.explanation}</div>
                        </div>
                    </div>
                `;
            } else {
                resultHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2.5rem;">⏰</div>
                        <div>You didn't answer in time</div>
                    </div>
                `;
            }
            
            if (resultContent) resultContent.innerHTML = resultHTML;
        });
}

// ============================================
// 🔄 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function switchScreen(screenName) {
    console.log("📱 Переход на экран:", screenName);
    
    const screens = {
        join: joinScreen,
        waiting: waitingScreen,
        question: questionScreen,
        result: resultScreen
    };
    
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    const targetScreen = screens[screenName];
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function leaveGame() {
    console.log("👋 Выход из игры");
    
    if (currentGameId && playerName && db) {
        db.ref(`games/${currentGameId}/players/${playerName}`).remove();
    }
    
    currentGameId = null;
    playerName = null;
    currentQuestion = null;
    hasAnswered = false;
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('gameCode');
    
    if (nameInput) nameInput.value = '';
    if (codeInput) codeInput.value = '';
    
    switchScreen('join');
}

function showError(message) {
    console.error("❌ Ошибка:", message);
    
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
        setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
    } else {
        alert(message);
    }
}

function showNotification(message, type = 'info') {
    console.log(`🔔 Уведомление: ${message}`);
    
    if (!notificationContainer) return;
    
    const colors = {
        info: '#4facfe',
        success: '#43e97b',
        error: '#ff416c'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.borderLeftColor = colors[type] || colors.info;
    notification.innerHTML = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================
// Глобальные функции
// ============================================

window.joinGame = joinGame;
window.leaveGame = leaveGame;
window.selectAnswer = selectAnswer;

console.log("✅ student.js загружен");
