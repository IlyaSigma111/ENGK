// ============================================
// FIREBASE CONFIG - С КНОПКАМИ ДЛЯ МОДЕРАЦИИ
// ============================================

// 🔥 НОВАЯ КОНФИГУРАЦИЯ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBC4rcVKEMj88Dm2snG5XXxAuZqeNPMc3c",
  authDomain: "engk-5a74a.firebaseapp.com",
  databaseURL: "https://engk-5a74a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "engk-5a74a",
  storageBucket: "engk-5a74a.firebasestorage.app",
  messagingSenderId: "1512777396",
  appId: "1:1512777396:web:8f219f77f91467f21fd9e1",
  measurementId: "G-CJWPXGL2JQ"
};

// Инициализация Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.database();
    console.log("✅ Firebase инициализирован");
} catch (error) {
    console.error("❌ Ошибка Firebase:", error);
}

// ============================================
// 🤖 TELEGRAM BOT С КНОПКАМИ
// ============================================

window.TELEGRAM_CONFIG = {
    botToken: "8110893337:AAEXbYtRyyrt_k1oAwjsOhOBUsdPnGCH_oM",
    
    // Отправка сообщения с кнопками
    sendModerationMessage(playerName, action, questionData) {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        
        let message = '';
        let keyboard = {};
        
        if (action === 'translation') {
            message = `<b>🤓 ЗАПРОС ПЕРЕВОДА</b>\n`;
            message += `👤 Игрок: ${playerName}\n`;
            message += `🔢 Вопрос: ${questionData.id}\n`;
            message += `📝 Текст: ${questionData.text}\n`;
            message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}\n\n`;
            message += `❓ Разрешить перевод?`;
            
            keyboard = {
                inline_keyboard: [
                    [
                        { text: "✅ РАЗРЕШИТЬ", callback_data: `translate_allow_${playerName}_${questionData.id}` },
                        { text: "❌ ОТКАЗАТЬ", callback_data: `translate_deny_${playerName}_${questionData.id}` }
                    ]
                ]
            };
        }
        
        if (action === 'wrong_answer') {
            message = `<b>🤓 ОШИБКА ЧАЙНИКА</b>\n`;
            message += `👤 Игрок: ${playerName}\n`;
            message += `🔢 Вопрос: ${questionData.id}\n`;
            message += `📝 Текст: ${questionData.text}\n`;
            message += `❌ Выбрал: ${questionData.selectedOption}\n`;
            message += `✅ Правильно: ${questionData.correctOption}\n`;
            message += `⏰ Время: ${new Date().toLocaleString('ru-RU')}\n\n`;
            message += `🎮 Засчитать ответ?`;
            
            keyboard = {
                inline_keyboard: [
                    [
                        { text: "✅ ЗАСЧИТАТЬ", callback_data: `accept_${playerName}_${questionData.id}` },
                        { text: "❌ НЕ ЗАСЧИТЫВАТЬ", callback_data: `reject_${playerName}_${questionData.id}` }
                    ]
                ]
            };
        }
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: "1512777396", // Твой chat ID
                text: message,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log("✅ Сообщение с кнопками отправлено");
            }
        })
        .catch(error => {
            console.error("❌ Ошибка:", error);
        });
    },
    
    // Обработка нажатий на кнопки (нужно будет настроить webhook)
    handleCallback(callbackData) {
        const [action, result, playerName, questionId] = callbackData.split('_');
        
        if (action === 'translate') {
            if (result === 'allow') {
                // Разрешить перевод - показать перевод
                this.sendToPlayer(playerName, "🌐 Перевод разрешён модератором!");
            } else {
                // Отказать в переводе
                this.sendToPlayer(playerName, "❌ Модератор отказал в переводе. Пробуй сам!");
            }
        }
        
        if (action === 'accept' || action === 'reject') {
            const accept = action === 'accept';
            // Засчитать или не засчитать ответ
            this.updatePlayerScore(playerName, questionId, accept);
            
            const message = accept ? "✅ Модератор засчитал ответ!" : "❌ Модератор не засчитал ответ";
            this.sendToPlayer(playerName, message);
        }
    },
    
    // Отправить сообщение игроку (через Firebase или уведомление)
    sendToPlayer(playerName, message) {
        // Сохраняем в Firebase, а student.html будет слушать
        const notificationRef = db.ref(`notifications/${playerName}`).push();
        notificationRef.set({
            message: message,
            timestamp: Date.now(),
            read: false
        });
    },
    
    // Обновить счёт игрока
    updatePlayerScore(playerName, questionId, accept) {
        // Найти текущую игру и игрока
        // Если accept = true, добавить очки
    }
};

// ============================================
// 📚 30 ВОПРОСОВ (те же, что я скинул ранее)
// ============================================

window.QUIZ_DATA = {
    id: "english_fears_phobias",
    title: "English: Fears and Phobias",
    description: "30 questions about fears, phobias and preferences",
    subject: "English",
    author: "English Teacher",
    version: "2024.1",
    
    // Функция для перемешивания вариантов
    getShuffledQuestion(index) {
        if (index < 0 || index >= this.questions.length) return null;
        const question = {...this.questions[index]};
        const options = [...question.options];
        const correctAnswer = options[question.correct];
        
        // Перемешиваем
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        question.options = options;
        question.correct = options.indexOf(correctAnswer);
        
        return question;
    },
    
    questions: [
        // 🟢 ЛЁГКИЕ (1-10)
        {
            id: 1,
            type: "easy",
            text: "How do you translate the word 'fear' into Russian?",
            options: ["Страх", "Радость", "Гнев", "Удивление"],
            correct: 0,
            explanation: "'Fear' means 'страх' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 2,
            type: "easy",
            text: "What does the word 'spider' mean in Russian?",
            options: ["Змея", "Паук", "Мышь", "Птица"],
            correct: 1,
            explanation: "'Spider' is 'паук' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 3,
            type: "easy",
            text: "How do you say 'тьма' in English?",
            options: ["Light", "Darkness", "Brightness", "Shadow"],
            correct: 1,
            explanation: "'Тьма' translates to 'darkness'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 4,
            type: "easy",
            text: "What is the English word for 'высота'?",
            options: ["Depth", "Width", "Height", "Length"],
            correct: 2,
            explanation: "'Высота' means 'height'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 5,
            type: "easy",
            text: "How do you translate 'толпа' into English?",
            options: ["Alone", "Crowd", "Room", "Street"],
            correct: 1,
            explanation: "'Толпа' is 'crowd'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 6,
            type: "easy",
            text: "What does 'snake' mean in Russian?",
            options: ["Паук", "Ящерица", "Змея", "Крокодил"],
            correct: 2,
            explanation: "'Snake' means 'змея'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 7,
            type: "easy",
            text: "How do you say 'полёт' in English?",
            options: ["Trip", "Flight", "Journey", "Walk"],
            correct: 1,
            explanation: "'Полёт' translates to 'flight'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 8,
            type: "easy",
            text: "What is the English for 'публичная речь'?",
            options: ["Private conversation", "Public speaking", "Loud scream", "Quiet whisper"],
            correct: 1,
            explanation: "'Публичная речь' is 'public speaking'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 9,
            type: "easy",
            text: "How do you translate 'буря' into English?",
            options: ["Rain", "Snow", "Storm", "Wind"],
            correct: 2,
            explanation: "'Буря' means 'storm'.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 10,
            type: "easy",
            text: "What does 'alone' mean in Russian?",
            options: ["Вместе", "Одинокий", "Счастливый", "Грустный"],
            correct: 1,
            explanation: "'Alone' means 'одинокий'.",
            points: 1,
            difficulty: "easy"
        },
        
        // 🟡 СРЕДНИЕ (11-20)
        {
            id: 11,
            type: "medium",
            text: "Many people have a _____ of spiders.",
            options: ["fear", "like", "love", "hate"],
            correct: 0,
            explanation: "'Fear of spiders' is the correct phrase.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 12,
            type: "medium",
            text: "She feels _____ when she sees a snake.",
            options: ["happy", "scared", "excited", "calm"],
            correct: 1,
            explanation: "People usually feel 'scared' of snakes.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 13,
            type: "medium",
            text: "He is afraid of _____ in the dark.",
            options: ["being", "be", "been", "is"],
            correct: 0,
            explanation: "After 'of' we use gerund: 'being'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 14,
            type: "medium",
            text: "I have a phobia of _____ in front of people.",
            options: ["speaking", "speak", "spoke", "speaks"],
            correct: 0,
            explanation: "After 'of' we need gerund: 'speaking'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 15,
            type: "medium",
            text: "The _____ of heights is called acrophobia.",
            options: ["fear", "love", "hate", "joy"],
            correct: 0,
            explanation: "Acrophobia is the 'fear' of heights.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 16,
            type: "medium",
            text: "She can't fly because she's afraid of _____.",
            options: ["planes", "cars", "trains", "buses"],
            correct: 0,
            explanation: "Fear of flying means fear of 'planes'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 17,
            type: "medium",
            text: "He feels anxious when he is in _____ places.",
            options: ["crowded", "empty", "quiet", "clean"],
            correct: 0,
            explanation: "Anxiety often happens in 'crowded' places.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 18,
            type: "medium",
            text: "My sister has a phobia of _____ water.",
            options: ["deep", "shallow", "warm", "cold"],
            correct: 0,
            explanation: "Aquaphobia is fear of 'deep' water.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 19,
            type: "medium",
            text: "_____ is the fear of thunderstorms.",
            options: ["Astraphobia", "Arachnophobia", "Acrophobia", "Claustrophobia"],
            correct: 0,
            explanation: "Astraphobia = fear of thunder/lightning.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 20,
            type: "medium",
            text: "He couldn't sleep because he was _____ of the dark.",
            options: ["scared", "happy", "tired", "hungry"],
            correct: 0,
            explanation: "Fear of dark makes you 'scared'.",
            points: 2,
            difficulty: "medium"
        },
        
        // 🔴 СЛОЖНЫЕ - PREFERENCES (21-30)
        {
            id: 21,
            type: "hard",
            text: "If you're afraid of heights, which place would you PREFER to visit?",
            options: ["A ground floor café", "A rooftop restaurant", "An observation deck", "A mountain peak"],
            correct: 0,
            explanation: "Ground floor is safest for fear of heights.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 22,
            type: "hard",
            text: "Someone with arachnophobia would PREFER to:",
            options: ["Visit a butterfly garden", "See a spider exhibit", "Watch a tarantula movie", "Hold a tarantula"],
            correct: 0,
            explanation: "Butterfly garden has no spiders.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 23,
            type: "hard",
            text: "If you fear public speaking, which job would you PREFER?",
            options: ["Librarian", "News anchor", "Teacher", "Tour guide"],
            correct: 0,
            explanation: "Librarians work quietly with books.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 24,
            type: "hard",
            text: "A person afraid of flying would SPECIFICALLY choose:",
            options: ["Train travel", "Plane travel", "Hot air balloon", "Helicopter"],
            correct: 0,
            explanation: "Trains stay safely on the ground.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 25,
            type: "hard",
            text: "Someone with claustrophobia would PREFER:",
            options: ["A house with big windows", "A small apartment", "An elevator ride", "A basement room"],
            correct: 0,
            explanation: "Big windows make spaces feel larger.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 26,
            type: "hard",
            text: "If afraid of the dark, you would MOST LIKELY:",
            options: ["Use a night light", "Go camping alone", "Explore caves", "Watch horror films"],
            correct: 0,
            explanation: "Night lights help with fear of dark.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 27,
            type: "hard",
            text: "A person afraid of dogs would PREFER to walk:",
            options: ["In a dog-free park", "At a dog park", "To a pet store", "Through a kennel"],
            correct: 0,
            explanation: "Dog-free park has no dogs at all.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 28,
            type: "hard",
            text: "Someone with aquaphobia would SPECIFICALLY avoid:",
            options: ["Swimming in the ocean", "Taking a shower", "Drinking water", "Washing hands"],
            correct: 0,
            explanation: "The ocean is deep and scary.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 29,
            type: "hard",
            text: "If you fear crowds, you would PREFER to shop:",
            options: ["Online", "On Black Friday", "At a concert", "In a busy mall"],
            correct: 0,
            explanation: "Online shopping = no crowds.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 30,
            type: "hard",
            text: "A person with social anxiety would MOST enjoy:",
            options: ["Reading alone at home", "Giving a speech", "A big party", "Performing on stage"],
            correct: 0,
            explanation: "Reading alone = no social interaction.",
            points: 3,
            difficulty: "hard"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} вопросов по английскому`);
console.log(`🤖 Telegram-бот с кнопками готов!`);

// ============================================
// 🛠️ СИСТЕМА МОДЕРАТОРОВ
// ============================================

window.moderatorSystem = {
    MODERATOR_PASSWORD: "English2024",
    
    isModerator() {
        return localStorage.getItem('isModerator') === 'true';
    },
    
    setModerator(status) {
        localStorage.setItem('isModerator', status);
    },
    
    showPasswordModal() {
        const modalHTML = `
            <div id="moderatorModal" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(10px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 30px;
                    border-radius: 24px;
                    max-width: 400px;
                    width: 100%;
                ">
                    <h3 style="color: #fff; text-align: center; margin-bottom: 20px;">
                        🔧 Режим модератора
                    </h3>
                    <input type="password" 
                           id="moderatorPassword" 
                           placeholder="Пароль"
                           style="
                                width: 100%;
                                padding: 15px;
                                background: rgba(255,255,255,0.1);
                                border: 1px solid rgba(255,255,255,0.3);
                                border-radius: 12px;
                                color: white;
                                font-size: 16px;
                                margin-bottom: 15px;
                           ">
                    <div style="display: flex; gap: 10px;">
                        <button onclick="moderatorSystem.checkPassword()" 
                                style="
                                    flex: 1;
                                    padding: 15px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                    border: none;
                                    border-radius: 12px;
                                    cursor: pointer;
                                ">
                            Войти
                        </button>
                        <button onclick="moderatorSystem.hideModal()"
                                style="
                                    padding: 15px 25px;
                                    background: rgba(255, 65, 108, 0.2);
                                    color: white;
                                    border: 1px solid rgba(255, 65, 108, 0.5);
                                    border-radius: 12px;
                                    cursor: pointer;
                                ">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    checkPassword() {
        const input = document.getElementById('moderatorPassword');
        if (!input) return;
        
        if (input.value === this.MODERATOR_PASSWORD) {
            this.setModerator(true);
            this.hideModal();
            this.showModeratorControls();
            alert('✅ Вы вошли как модератор!');
        } else {
            alert('❌ Неверный пароль!');
        }
    },
    
    hideModal() {
        const modal = document.getElementById('moderatorModal');
        if (modal) modal.remove();
    },
    
    showModeratorControls() {
        // Показать элементы управления модератора
    }
};
