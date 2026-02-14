// ============================================
// FIREBASE CONFIG - ENGLISH: FEARS AND PHOBIAS
// ============================================

// 🔥 НОВАЯ КОНФИГУРАЦИЯ FIREBASE (твоя)
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
// 📚 30 ВОПРОСОВ ПО АНГЛИЙСКОМУ: FEARS AND PHOBIAS
// ============================================

// Функция для перемешивания вариантов ответов
function shuffleOptions(question) {
    const options = [...question.options];
    const correctAnswer = options[question.correct];
    
    // Перемешиваем массив
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Находим новый индекс правильного ответа
    const newCorrectIndex = options.indexOf(correctAnswer);
    
    return {
        ...question,
        options: options,
        correct: newCorrectIndex
    };
}

window.QUIZ_DATA = {
    id: "english_fears_phobias",
    title: "English: Fears and Phobias",
    description: "30 questions about fears, phobias and preferences",
    subject: "English",
    author: "English Teacher",
    version: "2024.1",
    
    // Получить вопрос с перемешанными вариантами
    getShuffledQuestion(index) {
        if (index < 0 || index >= this.questions.length) return null;
        return shuffleOptions({...this.questions[index]});
    },
    
    questions: [
        // ===== 🟢 ЛЁГКИЕ ВОПРОСЫ (1-10) - Vocabulary =====
        {
            id: 1,
            type: "easy",
            text: "How do you translate the word 'fear' into Russian?",
            options: [
                "Страх",
                "Радость",
                "Гнев",
                "Удивление"
            ],
            correct: 0,
            explanation: "'Fear' means 'страх' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 2,
            type: "easy",
            text: "What does the word 'spider' mean in Russian?",
            options: [
                "Змея",
                "Паук",
                "Мышь",
                "Птица"
            ],
            correct: 1,
            explanation: "'Spider' is 'паук' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 3,
            type: "easy",
            text: "How do you say 'тьма' in English?",
            options: [
                "Light",
                "Darkness",
                "Brightness",
                "Shadow"
            ],
            correct: 1,
            explanation: "'Тьма' translates to 'darkness' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 4,
            type: "easy",
            text: "What is the English word for 'высота'?",
            options: [
                "Depth",
                "Width",
                "Height",
                "Length"
            ],
            correct: 2,
            explanation: "'Высота' means 'height' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 5,
            type: "easy",
            text: "How do you translate 'толпа' into English?",
            options: [
                "Alone",
                "Crowd",
                "Room",
                "Street"
            ],
            correct: 1,
            explanation: "'Толпа' is 'crowd' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 6,
            type: "easy",
            text: "What does 'snake' mean in Russian?",
            options: [
                "Паук",
                "Ящерица",
                "Змея",
                "Крокодил"
            ],
            correct: 2,
            explanation: "'Snake' means 'змея' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 7,
            type: "easy",
            text: "How do you say 'полёт' in English?",
            options: [
                "Trip",
                "Flight",
                "Journey",
                "Walk"
            ],
            correct: 1,
            explanation: "'Полёт' translates to 'flight' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 8,
            type: "easy",
            text: "What is the English for 'публичная речь'?",
            options: [
                "Private conversation",
                "Public speaking",
                "Loud scream",
                "Quiet whisper"
            ],
            correct: 1,
            explanation: "'Публичная речь' is 'public speaking' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 9,
            type: "easy",
            text: "How do you translate 'буря' into English?",
            options: [
                "Rain",
                "Snow",
                "Storm",
                "Wind"
            ],
            correct: 2,
            explanation: "'Буря' means 'storm' in English.",
            points: 1,
            difficulty: "easy"
        },
        {
            id: 10,
            type: "easy",
            text: "What does 'alone' mean in Russian?",
            options: [
                "Вместе",
                "Одинокий",
                "Счастливый",
                "Грустный"
            ],
            correct: 1,
            explanation: "'Alone' means 'одинокий' in Russian.",
            points: 1,
            difficulty: "easy"
        },
        
        // ===== 🟡 СРЕДНИЕ ВОПРОСЫ (11-20) - Fill in the blank =====
        {
            id: 11,
            type: "medium",
            text: "Many people have a _____ of spiders.",
            options: [
                "fear",
                "like",
                "love",
                "hate"
            ],
            correct: 0,
            explanation: "The correct phrase is 'fear of spiders'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 12,
            type: "medium",
            text: "She feels _____ when she sees a snake.",
            options: [
                "happy",
                "scared",
                "excited",
                "calm"
            ],
            correct: 1,
            explanation: "People usually feel 'scared' when they see a snake.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 13,
            type: "medium",
            text: "He is afraid of _____ in the dark.",
            options: [
                "being",
                "be",
                "been",
                "is"
            ],
            correct: 0,
            explanation: "After preposition 'of' we use gerund: 'being'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 14,
            type: "medium",
            text: "I have a phobia of _____ in front of people.",
            options: [
                "speaking",
                "speak",
                "spoke",
                "speaks"
            ],
            correct: 0,
            explanation: "After 'of' we need gerund: 'speaking'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 15,
            type: "medium",
            text: "The _____ of heights is called acrophobia.",
            options: [
                "fear",
                "love",
                "hate",
                "joy"
            ],
            correct: 0,
            explanation: "Acrophobia is the 'fear' of heights.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 16,
            type: "medium",
            text: "She can't fly because she's afraid of _____.",
            options: [
                "planes",
                "cars",
                "trains",
                "buses"
            ],
            correct: 0,
            explanation: "If you can't fly, you're afraid of 'planes'.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 17,
            type: "medium",
            text: "He feels anxious when he is in _____ places.",
            options: [
                "crowded",
                "empty",
                "quiet",
                "clean"
            ],
            correct: 0,
            explanation: "Anxiety often happens in 'crowded' places.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 18,
            type: "medium",
            text: "My sister has a phobia of _____ water.",
            options: [
                "deep",
                "shallow",
                "warm",
                "cold"
            ],
            correct: 0,
            explanation: "Aquaphobia is the fear of 'deep' water.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 19,
            type: "medium",
            text: "_____ is the fear of thunderstorms.",
            options: [
                "Astraphobia",
                "Arachnophobia",
                "Acrophobia",
                "Claustrophobia"
            ],
            correct: 0,
            explanation: "Astraphobia is the fear of thunder and lightning.",
            points: 2,
            difficulty: "medium"
        },
        {
            id: 20,
            type: "medium",
            text: "He couldn't sleep because he was _____ of the dark.",
            options: [
                "scared",
                "happy",
                "tired",
                "hungry"
            ],
            correct: 0,
            explanation: "If you can't sleep because of dark, you're 'scared'.",
            points: 2,
            difficulty: "medium"
        },
        
        // ===== 🔴 СЛОЖНЫЕ ВОПРОСЫ (21-30) - Preferences =====
        {
            id: 21,
            type: "hard",
            text: "If you're afraid of heights, which place would you PREFER to visit?",
            options: [
                "A ground floor café",
                "A rooftop restaurant",
                "An observation deck",
                "A mountain peak"
            ],
            correct: 0,
            explanation: "Someone afraid of heights would prefer to stay on the ground floor.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 22,
            type: "hard",
            text: "Someone with arachnophobia (fear of spiders) would PREFER to:",
            options: [
                "Visit a butterfly garden",
                "Go to a spider exhibition",
                "Watch a movie about tarantulas",
                "Hold a tarantula"
            ],
            correct: 0,
            explanation: "A butterfly garden has no spiders, so it's the best choice.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 23,
            type: "hard",
            text: "If you're afraid of public speaking, which job would you PREFER?",
            options: [
                "Librarian",
                "News anchor",
                "Teacher",
                "Tour guide"
            ],
            correct: 0,
            explanation: "Librarians work quietly with books, no public speaking required.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 24,
            type: "hard",
            text: "A person afraid of flying would SPECIFICALLY choose to travel by:",
            options: [
                "Train",
                "Plane",
                "Hot air balloon",
                "Helicopter"
            ],
            correct: 0,
            explanation: "Trains stay on the ground - the safest choice for fear of flying.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 25,
            type: "hard",
            text: "Someone with claustrophobia (fear of small spaces) would PREFER to live in:",
            options: [
                "A house with big windows",
                "A small apartment",
                "An elevator",
                "A basement"
            ],
            correct: 0,
            explanation: "Big windows make spaces feel larger and less confining.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 26,
            type: "hard",
            text: "If you're afraid of the dark, you would MOST LIKELY:",
            options: [
                "Sleep with a night light",
                "Go camping alone",
                "Explore caves",
                "Watch horror movies at night"
            ],
            correct: 0,
            explanation: "A night light helps people feel safer in the dark.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 27,
            type: "hard",
            text: "A person afraid of dogs would PREFER to walk:",
            options: [
                "In a dog-free park",
                "At a dog walking area",
                "To a pet store",
                "Through a kennel"
            ],
            correct: 0,
            explanation: "A dog-free park has no dogs, so it's the safest choice.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 28,
            type: "hard",
            text: "Someone with aquaphobia (fear of water) would SPECIFICALLY avoid:",
            options: [
                "Swimming in the ocean",
                "Taking a shower",
                "Drinking water",
                "Washing hands"
            ],
            correct: 0,
            explanation: "The ocean is deep water - the scariest for someone with aquaphobia.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 29,
            type: "hard",
            text: "If you're afraid of crowds, you would PREFER to shop:",
            options: [
                "Online",
                "On Black Friday",
                "At a concert",
                "In a busy mall"
            ],
            correct: 0,
            explanation: "Online shopping means no crowds at all.",
            points: 3,
            difficulty: "hard"
        },
        {
            id: 30,
            type: "hard",
            text: "A person with social anxiety would MOST LIKELY enjoy:",
            options: [
                "Reading a book alone at home",
                "Giving a presentation",
                "Attending a big party",
                "Performing on stage"
            ],
            correct: 0,
            explanation: "Reading alone at home involves no social interaction.",
            points: 3,
            difficulty: "hard"
        }
    ]
};

console.log(`✅ Загружено ${QUIZ_DATA.questions.length} вопросов по английскому (Fears and Phobias)`);
console.log(`🎮 Режим для чайников активирован!`);

// ============================================
// 🤖 TELEGRAM BOT CONFIG
// ============================================

window.TELEGRAM_CONFIG = {
    botToken: "8110893337:AAEXbYtRyyrt_k1oAwjsOhOBUsdPnGCH_oM",
    chatId: "1512777396", // Твой chat ID (можно получить у @userinfobot)
    
    // Функция отправки статистики в Telegram
    sendToTelegram(message) {
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log("✅ Отправлено в Telegram:", message);
            } else {
                console.error("❌ Ошибка Telegram:", data);
            }
        })
        .catch(error => {
            console.error("❌ Ошибка отправки:", error);
        });
    },
    
    // Логирование действий "чайников"
    logNoobAction(playerName, action, questionId, wasCorrect) {
        const date = new Date().toLocaleString('ru-RU');
        const emoji = wasCorrect ? '✅' : '❌';
        const status = wasCorrect ? 'ПРАВИЛЬНО' : 'ОШИБСЯ';
        
        let message = `<b>🤓 РЕЖИМ ЧАЙНИКА</b>\n`;
        message += `👤 Игрок: ${playerName}\n`;
        message += `📅 Время: ${date}\n`;
        message += `🔢 Вопрос №${questionId}\n`;
        message += `${emoji} Результат: ${status}\n`;
        
        if (action === 'translation') {
            message += `🌐 Запросил перевод вопроса\n`;
        }
        
        this.sendToTelegram(message);
    }
};

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
                                    border: 1
