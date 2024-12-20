const express = require('express');
const axios = require('axios');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/reset-cookies', (req, res) => {
    res.clearCookie('chatHistory');
    res.send('Cookies reset');
});

let systemMessageContent = "Vous êtes un assistant très serviable";

app.post('/api/update-system-message', (req, res) => {
    const mode = req.body.mode;
    console.log('Received mode:', mode);

    switch (mode) {
        case 'Mode 1':
            systemMessageContent = "Mode Vérif: Objectif : Vérifier la véracité d'une information en se basant sur les sources fiables suivantes : Factuel (AFP Factuel) Hoaxbuster CheckNews (Libération) Decodex (Le Monde) Snopes Les Décodeurs (Le Monde) Instructions pour le chatbot : Lorsque l'utilisateur te fournit une information, tu dois vérifier si cette information est vraie ou fausse en consultant les bases de données et les articles provenant des sources suivantes : Factuel (AFP), Hoaxbuster, CheckNews, Decodex, Snopes, et Les Décodeurs. Si tu trouves des résultats de vérification, résume-les et explique brièvement pourquoi l'information est correcte ou incorrecte. Fournis les liens directs vers les sources pertinentes de chaque site utilisé pour que l'utilisateur puisse vérifier les informations de manière indépendante. Si l'information n'est pas vérifiable directement dans ces ressources, indique-le clairement et explique pourquoi l'information ne peut pas être vérifiée avec les sources disponibles. Format de réponse attendu : Une brève explication de la véracité de l'information. La mention des sources utilisées et les liens directs vers celles-ci. Si l'information est fausse ou douteuse, explique pourquoi et où l'utilisateur peut vérifier cette conclusion. ";
            break;
        case 'Mode 2':
            systemMessageContent = "Mode JeunePoèteDeLaRue: Parle moi comme un rappeur technique, utilise des multisyllabiques, des comparaisons et des métaphores. Inspire toi de rappeur français comme JungleJack, Ateyaba, HJeuneCrack, Booba";
            break;
        case 'Mode 3':
            systemMessageContent = "Mode Projet: Objectif :Aider à la gestion de projet en résumant les cahiers des charges, proposant des plannings et un chiffrage global. Tâches Principales : Résumer brièvement les cahiers des charges reçus. Élaborer un planning de projet succinct. Fournir un chiffrage global estimatif.";
            break;
        default:
            console.log('Invalid mode received');
            return res.status(400).send('Invalid mode');
    }

    console.log('System message updated to:', systemMessageContent);
    res.send('System message updated');
});

app.post('/api/chat', async (req, res) => {
    const prompt = req.body.prompt;
    console.log('Received prompt:', prompt);

    let chatHistory;
    if (req.cookies.chatHistory) {
        chatHistory = JSON.parse(req.cookies.chatHistory);
    } else {
        chatHistory = [];
    }

    chatHistory.push({ role: "user", content: prompt });

    const systemMessage = {
        role: "system",
        content: systemMessageContent
    };

    const messages = [systemMessage, ...chatHistory.map(entry => ({
        role: entry.role,
        content: entry.content
    }))];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
        chatHistory.push({ role: "assistant", content: reply });

        res.cookie('chatHistory', JSON.stringify(chatHistory), { httpOnly: true });

        res.json({ reply: reply });
    } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
        res.status(500).send('Error communicating with OpenAI');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});