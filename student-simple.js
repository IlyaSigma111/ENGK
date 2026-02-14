// ============================================
// student-simple.js - СПЕЦИАЛЬНО ДЛЯ АЙФОНА
// ============================================

console.log("🔥 student-simple.js загружается...");

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let db = null;
let noobRequests = 0;

// Элементы DOM
let joinScreen, waitingScreen, questionScreen, resultScreen;
let joinButton, errorContainer, notificationContainer;
let displayName, displayCode, displayScore, roomPlayers;
let currentQSpan, questionText, optionsContainer, answerStatus, resultContent;

// ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ЗАГРУЗКИ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Student page initializing for iPhone...");
    
    // Получаем db из window
    if (window.db) {
        db = window.db;
        console.log("✅ db получена из window.db");
    } else {
        console.error("❌ window.db не определена!");
    }
    
    // Получаем все элементы DOM
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
    
    console.log("📊 Элементы найдены:", {
        joinButton: !!joinButton,
        joinScreen: !!joinScreen
    });
    
    // УСТАНАВЛИВАЕМ ОБРАБОТЧИКИ СПЕЦИАЛЬНО ДЛЯ АЙФОНА
    if (joinButton) {
        // Для iPhone используем оба события
        joinButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("👆 click на joinButton");
            joinGame();
        });
        
        // Добавляем touch событие для надёжности
        joinButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            console.log("👆 touch на joinButton");
            joinGame();
        }, { passive: false });
        
        console.log("✅ Обработчики на joinButton установлены");
    }
    
    // Обработчики для полей ввода
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
    
    // Проверяем Firebase через 1 секунду
    setTimeout(checkFirebase, 1000);
    
    console.log("✅ Инициализация завершена");
});

// ПРОВЕРКА FIREBASE
function checkFirebase() {
    console.log("🔍 Проверка Firebase:");
    console.log("   - window.db =", window.db ? "✅" : "❌");
    console.log("   - firebase global =", typeof firebase !== 'undefined' ? "✅" : "❌");
    
    if (!db && window.db) {
        db = window.db;
        console.log("✅ db восстановлена");
    }
}

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function joinGame() {
    console.log("🎮 joinGame вызвана");
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('gameCode');
    
    if (!nameInput || !codeInput) {
        console.error("❌ Поля ввода не найдены");
        alert("Ошибка: поля ввода не найдены");
        return;
    }
    
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();
    
    console.log("📝 Введено:", { name, code });
    
    // Валидация
    if (!name || name.length < 2) {
        showError("Enter your name (min 2 characters)");
        return;
    }
    
    if (!code || code.length !== 8 || !/^\d+$/.test(code)) {
        showError("Enter 8-digit game code");
        return;
    }
    
    // Проверка Firebase
    if (!db) {
        if (window.db) {
            db = window.db;
            console.log("✅ db взята из window.db");
        } else {
            showError("Firebase not connected. Refresh page.");
            return;
        }
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    console.log("🎮 Подключение к игре:", currentGameId);
    
    // Блокируем кнопку
    if (joinButton) {
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
        joinButton.disabled = true;
        // Для iPhone
        joinButton.style.opacity = '0.7';
        joinButton.style.pointerEvents = 'none';
    }
    
    // Проверяем существование игры
    if (!db || !db.ref) {
        console.error("❌ db.ref не существует");
        showError("Database error");
        resetButton();
        return;
    }
    
    db.ref(`games/${currentGameId}`).once('value')
        .then(snapshot => {
            console.log("📊 Ответ от Firebase:", snapshot.exists() ? "игра найдена" : "игра не найдена");
            
            if (!snapshot.exists()) {
                throw new Error(`Game with code ${code} not found!`);
            }
            
            const game = snapshot.val();
            
            if (game.status === "finished") {
                throw new Error("This game is already finished");
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
                score: 0,
                noobRequests: 0,
                device: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "📱 Mobile" : "💻 Computer"
            });
        })
        .then(() => {
            console.log("✅ Игрок зарегистрирован");
            
            // Обновляем отображение
            if (displayName) displayName.textContent = name;
            if (displayCode) displayCode.textContent = code;
            
            switchScreen('waiting');
            
            // Слушаем игру
            listenToGame();
            listenToNotifications();
            
            // Восстанавливаем кнопку
            resetButton();
        })
        .catch(error => {
            console.error("❌ Ошибка:", error);
            showError(error.message);
            resetButton();
        });
}

// СБРОС КНОПКИ
function resetButton() {
    if (joinButton) {
        joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
        joinButton.disabled = false;
        joinButton.style.opacity = '1';
        joinButton.style.pointerEvents = 'auto';
    }
}

// ============================================
// 🤓 РЕЖИМ ДЛЯ ЧАЙНИКОВ
// ============================================

function requestTranslation() {
    console.log("🤓 requestTranslation");
    
    if (!playerName || !currentGameId) {
        showNotification("❌ Join the game first!", "error");
        return;
    }
    
    if (!currentQuestion) {
        showNotification("❌ No active question!", "error");
        return;
    }
    
    noobRequests++;
    
    // Отправляем запрос в Firebase
    if (db && currentGameId) {
        db.ref(`noob_requests/${currentGameId}`).push({
            playerName: playerName,
            type: 'translation',
            questionData: {
                id: currentQuestion.id,
                text: currentQuestion.text
            },
            timestamp: Date.now()
        });
    }
    
    showNotification("🌐 Translation requested!", "warning");
    
    // Простой перевод
    const translatedText = simpleTranslate(currentQuestion.text);
    showNotification(`📝 ${translatedText}`, "info");
}

function simpleTranslate(text) {
    const translations = {
        "How do you translate the word 'fear' into Russian?": "Как переводится 'fear'?",
        "What does the word 'spider' mean in Russian?": "Что значит 'spider'?",
        "How do you say 'тьма' in English?": "Как сказать 'тьма'?",
        "What is the English word for 'высота'?": "Как будет 'высота'?",
        "How do you translate 'толпа' into English?": "Перевод 'толпа'?",
        "What does 'snake' mean in Russian?": "Что значит 'snake'?",
        "How do you say 'полёт' in English?": "Как сказать 'полёт'?",
        "What is the English for 'публичная речь'?": "Как будет 'публичная речь'?",
        "How do you translate 'буря' into English?": "Перевод 'буря'?",
        "What does 'alone' mean in Russian?": "Что значит 'alone'?"
    };
    
    return translations[text] || "Translation not available";
}

// ============================================
// 🎮 СЛУШАТЬ ИГРУ
// ============================================

function listenToGame() {
    if (!currentGameId || !db) return;
    
    console.log("👂 Начинаем слушать игру:", currentGameId);
    
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            console.log("Игра удалена");
            leaveGame();
            return;
        }
        
        // Обновляем количество игроков
        const players = game.players || {};
        if (roomPlayers) roomPlayers.textContent = Object.keys(players).length;
        
        // Обновляем счет
        if (players[playerName] && displayScore) {
            displayScore.textContent = players[playerName].score || 0;
        }
        
        // Обрабатываем статус
        const currentQuestionId = game.currentQuestion;
        
        switch (game.status) {
            case "lobby":
            case "waiting":
                if (questionScreen?.classList.contains('active')) {
                    switchScreen('waiting');
                }
                break;
                
            case "question_active":
                if (currentQuestionId && (!currentQuestion || currentQuestion.id !== currentQuestionId)) {
                    handleQuestion(currentQuestionId);
                }
                break;
                
            case "showing_results":
                if (currentQuestionId) {
                    showResults(currentQuestionId);
                }
                break;
        }
    });
}

function listenToNotifications() {
    if (!playerName || !db) return;
    
    db.ref(`notifications/${playerName}`).on('child_added', snapshot => {
        const notification = snapshot.val();
        showNotification(notification.message, notification.message.includes('✅') ? 'success' : 'warning');
        setTimeout(() => snapshot.ref.remove(), 5000);
    });
}

// ============================================
// 📝 ОБРАБОТКА ВОПРОСОВ
// ============================================

function handleQuestion(questionId) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions) return;
    
    const question = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!question) return;
    
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
            
            // Для iPhone используем оба события
            optionDiv.addEventListener('click', function(e) {
                e.preventDefault();
                selectAnswer(index);
            });
            
            optionDiv.addEventListener('touchstart', function(e) {
                e.preventDefault();
                selectAnswer(index);
            }, { passive: false });
            
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
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName || !db) return;
    
    hasAnswered = true;
    
    document.querySelectorAll('.option').forEach((opt, idx) => {
        opt.classList.remove('selected');
        if (idx === answerIndex) {
            opt.classList.add('selected');
        }
    });
    
    const isCorrect = (answerIndex === currentQuestion.correct);
    
    if (!isCorrect && db && currentGameId) {
        db.ref(`noob_requests/${currentGameId}`).push({
            playerName: playerName,
            type: 'wrong_answer',
            questionData: {
                id: currentQuestion.id,
                text: currentQuestion.text,
                selectedOption: currentQuestion.options[answerIndex],
                correctOption: currentQuestion.options[currentQuestion.correct]
            },
            timestamp: Date.now()
        });
    }
    
    db.ref(`games/${currentGameId}/answers/${currentQuestion.id}/${playerName}`).set({
        answerIndex: answerIndex,
        isCorrect: isCorrect,
        timestamp: Date.now()
    }).then(() => {
        if (isCorrect) {
            db.ref(`games/${currentGameId}/players/${playerName}/score`).transaction(score => {
                return (score || 0) + (currentQuestion.points || 1);
            });
        }
        
        if (answerStatus) {
            answerStatus.textContent = isCorrect ? "✅ CORRECT!" : "❌ WRONG";
            answerStatus.className = isCorrect ? "status correct" : "status wrong";
        }
    }).catch(error => {
        console.error("Ошибка отправки ответа:", error);
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
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">${isCorrect ? '✅' : '❌'}</div>
                        <div style="color: ${isCorrect ? '#43e97b' : '#ff416c'}; font-size: 1.3rem; margin-bottom: 10px;">
                            ${isCorrect ? 'CORRECT!' : 'WRONG!'}
                        </div>
                        <div style="font-size: 1.1rem; margin-bottom: 15px;">${points} points</div>
                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; margin-top: 15px;">
                            <div style="color: #4facfe; margin-bottom: 8px;">📝 Explanation:</div>
                            <div>${question.explanation}</div>
                        </div>
                    </div>
                `;
            } else {
                resultHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">⏰</div>
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
    console.log("📱 Переключение на экран:", screenName);
    
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
    noobRequests = 0;
    
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
    console.log(`🔔 ${type}: ${message}`);
    
    if (!notificationContainer) return;
    
    const colors = {
        info: '#4facfe',
        success: '#43e97b',
        error: '#ff416c',
        warning: '#f093fb'
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
// 📤 ЭКСПОРТ
// ============================================

window.joinGame = joinGame;
window.leaveGame = leaveGame;
window.requestTranslation = requestTranslation;
window.selectAnswer = selectAnswer;

console.log("✅ student-simple.js для iPhone загружен");
