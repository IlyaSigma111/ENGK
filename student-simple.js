// ============================================
// student-simple.js - С РАБОЧИМ TELEGRAM БОТОМ
// ============================================

console.log("🔥 student-simple.js загружается...");

let currentGameId = null;
let playerName = null;
let currentQuestion = null;
let hasAnswered = false;
let db = null;
let noobRequests = 0;

// Конфиг Telegram
const TELEGRAM_BOT_TOKEN = "8110893337:AAEXbYtRyyrt_k1oAwjsOhOBUsdPnGCH_oM";
const TELEGRAM_CHAT_ID = "1512777396";

// Элементы DOM
let joinScreen, waitingScreen, questionScreen, resultScreen;
let joinButton, errorContainer, notificationContainer, noobButton;
let displayName, displayCode, displayScore, roomPlayers;
let currentQSpan, questionText, optionsContainer, answerStatus, resultContent;

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Student page initializing...");
    
    // Получаем db из window
    if (window.db) {
        db = window.db;
        console.log("✅ db получена из window.db");
    } else {
        console.error("❌ window.db не определена!");
    }
    
    // Получаем элементы DOM
    joinScreen = document.getElementById('joinScreen');
    waitingScreen = document.getElementById('waitingScreen');
    questionScreen = document.getElementById('questionScreen');
    resultScreen = document.getElementById('resultScreen');
    
    joinButton = document.getElementById('joinButton');
    errorContainer = document.getElementById('errorContainer');
    notificationContainer = document.getElementById('notificationContainer');
    noobButton = document.getElementById('noobButton');
    
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
    
    if (noobButton) {
        noobButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleNoobButtonClick();
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
// 🤓 ОБРАБОТКА КНОПКИ ЧАЙНИКА
// ============================================

function handleNoobButtonClick() {
    console.log("🤓 handleNoobButtonClick");
    
    if (!currentGameId || !playerName) {
        showNotification("❌ Join a game first!", "error");
        return;
    }
    
    if (!currentQuestion) {
        showNotification("❌ No active question!", "error");
        return;
    }
    
    requestTranslation();
}

function requestTranslation() {
    console.log("🤓 requestTranslation");
    
    noobRequests++;
    
    // Отправляем в Firebase
    if (db && currentGameId) {
        const requestData = {
            playerName: playerName,
            type: 'translation',
            questionData: {
                id: currentQuestion.id,
                text: currentQuestion.text
            },
            timestamp: Date.now(),
            gameId: currentGameId
        };
        
        db.ref(`noob_requests/${currentGameId}`).push(requestData)
            .then(() => {
                console.log("✅ Запрос в Firebase отправлен");
                showNotification("🌐 Translation requested!", "warning");
                
                // Показываем перевод
                const translatedText = simpleTranslate(currentQuestion.text);
                showNotification(`📝 ${translatedText}`, "info");
                
                // Отправляем в Telegram
                sendToTelegram('translation', {
                    playerName: playerName,
                    gameId: currentGameId,
                    questionId: currentQuestion.id,
                    questionText: currentQuestion.text
                });
            })
            .catch(error => {
                console.error("❌ Ошибка Firebase:", error);
                showNotification("❌ Failed to send request", "error");
            });
    }
}

// ============================================
// 📤 ОТПРАВКА В TELEGRAM
// ============================================

function sendToTelegram(type, data) {
    console.log(`📤 Отправка в Telegram (${type}):`, data);
    
    let message = '';
    
    if (type === 'translation') {
        message = `🤓 <b>ЗАПРОС ПЕРЕВОДА</b>\n`;
        message += `👤 Игрок: ${data.playerName}\n`;
        message += `🆔 Игра: ${data.gameId}\n`;
        message += `🔢 Вопрос: ${data.questionId}\n`;
        message += `📝 Текст: ${data.questionText}\n`;
        message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}`;
    }
    
    if (type === 'wrong_answer') {
        message = `❌ <b>ОШИБКА ЧАЙНИКА</b>\n`;
        message += `👤 Игрок: ${data.playerName}\n`;
        message += `🆔 Игра: ${data.gameId}\n`;
        message += `🔢 Вопрос: ${data.questionId}\n`;
        message += `📝 Текст: ${data.questionText}\n`;
        message += `❌ Выбрал: ${data.selectedOption}\n`;
        message += `✅ Правильно: ${data.correctOption}`;
    }
    
    // СПОСОБ 1: Через JSONP (работает везде)
    sendViaJsonP(message);
    
    // СПОСОБ 2: Через скрытый iframe (запасной)
    setTimeout(() => sendViaIframe(message), 500);
}

// Способ 1: JSONP
function sendViaJsonP(message) {
    const callbackName = 'tg_callback_' + Date.now();
    const script = document.createElement('script');
    
    // Создаём временную функцию
    window[callbackName] = function(response) {
        console.log("✅ JSONP ответ:", response);
        delete window[callbackName];
        script.remove();
    };
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` +
                `?chat_id=${TELEGRAM_CHAT_ID}` +
                `&text=${encodeURIComponent(message)}` +
                `&parse_mode=HTML` +
                `&callback=${callbackName}`;
    
    script.src = url;
    document.head.appendChild(script);
    
    // Таймаут на случай ошибки
    setTimeout(() => {
        if (window[callbackName]) {
            console.log("⚠️ JSONP таймаут");
            delete window[callbackName];
            script.remove();
        }
    }, 5000);
}

// Способ 2: Iframe
function sendViaIframe(message) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage` +
                `?chat_id=${TELEGRAM_CHAT_ID}` +
                `&text=${encodeURIComponent(message)}` +
                `&parse_mode=HTML`;
    
    iframe.src = url;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
        iframe.remove();
    }, 3000);
}

// ============================================
// 🎮 ОСНОВНЫЕ ФУНКЦИИ
// ============================================

function joinGame() {
    console.log("🎮 joinGame");
    
    const nameInput = document.getElementById('playerName');
    const codeInput = document.getElementById('gameCode');
    
    if (!nameInput || !codeInput) return;
    
    const name = nameInput.value.trim();
    const code = codeInput.value.trim();
    
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
        } else {
            showError("Firebase not connected");
            return;
        }
    }
    
    playerName = name;
    currentGameId = "game_" + code;
    
    if (joinButton) {
        joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CONNECTING...';
        joinButton.disabled = true;
    }
    
    db.ref(`games/${currentGameId}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error(`Game with code ${code} not found!`);
            }
            
            const game = snapshot.val();
            
            if (game.status === "finished") {
                throw new Error("This game is already finished");
            }
            
            if (game.players && game.players[name]) {
                throw new Error("Player with this name already exists!");
            }
            
            return db.ref(`games/${currentGameId}/players/${name}`).set({
                name: name,
                joined: Date.now(),
                score: 0,
                noobRequests: 0
            });
        })
        .then(() => {
            if (displayName) displayName.textContent = name;
            if (displayCode) displayCode.textContent = code;
            
            switchScreen('waiting');
            listenToGame();
            listenToNotifications();
            
            if (joinButton) {
                joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
                joinButton.disabled = false;
            }
        })
        .catch(error => {
            showError(error.message);
            if (joinButton) {
                joinButton.innerHTML = '<i class="fas fa-gamepad"></i> JOIN GAME';
                joinButton.disabled = false;
            }
        });
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

function listenToGame() {
    if (!currentGameId || !db) return;
    
    db.ref(`games/${currentGameId}`).on('value', snapshot => {
        const game = snapshot.val();
        if (!game) {
            leaveGame();
            return;
        }
        
        const players = game.players || {};
        if (roomPlayers) roomPlayers.textContent = Object.keys(players).length;
        
        if (players[playerName] && displayScore) {
            displayScore.textContent = players[playerName].score || 0;
        }
        
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

function handleQuestion(questionId) {
    if (!QUIZ_DATA || !QUIZ_DATA.questions) return;
    
    const question = QUIZ_DATA.questions.find(q => q.id === questionId);
    if (!question) return;
    
    currentQuestion = shuffleQuestion(question);
    hasAnswered = false;
    
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
    if (hasAnswered || !currentQuestion || !currentGameId || !playerName || !db) return;
    
    hasAnswered = true;
    
    document.querySelectorAll('.option').forEach((opt, idx) => {
        opt.classList.remove('selected');
        if (idx === answerIndex) {
            opt.classList.add('selected');
        }
    });
    
    const isCorrect = (answerIndex === currentQuestion.correct);
    
    // Если неправильно - отправляем в Telegram
    if (!isCorrect) {
        console.log("❌ Неправильный ответ");
        
        // Отправляем в Firebase
        if (db && currentGameId) {
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
        
        // Отправляем в Telegram
        sendToTelegram('wrong_answer', {
            playerName: playerName,
            gameId: currentGameId,
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            selectedOption: currentQuestion.options[answerIndex],
            correctOption: currentQuestion.options[currentQuestion.correct]
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
        console.error("Ошибка:", error);
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

function switchScreen(screenName) {
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
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
        setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
    }
}

function showNotification(message, type = 'info') {
    if (!notificationContainer) return;
    
    const colors = {
        info: '#4facfe',
        success: '#43e97b',
        error: '#ff416c',
        warning: '#f093fb'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.borderLeftColor = colors[type];
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
window.requestTranslation = requestTranslation;
window.selectAnswer = selectAnswer;
window.handleNoobButtonClick = handleNoobButtonClick;

console.log("✅ student-simple.js загружен");
