import express from "express";
import bodyParser from "body-parser";
import { extraerAsesor } from "./fireBaseFunctios/firebaseFunction.js";
import { openai_response } from "./openAi/openAi_API.js"
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
import { async } from "@firebase/util";
import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./fireBaseFunctios/firebase.js";
import { Configuration, OpenAIApi } from "openai";
import { ResponderPreguta } from './fireBaseFunctios/consultarQuestions.js'
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);
//Para iniciar en el entorno local
const port = process.env.PORT || 3000;
// for parsing json
app.use(
    bodyParser.json({
        limit: "20mb",
    })
);
//**parse application/x-www-form-urlencoded*/
app.use(
    bodyParser.urlencoded({
        extended: false,
        limit: "20mb",
    })
);
//**Funcion get que nos muestra solo que el bot esta funcionando*/
app.get("/", (req, res) => {
    return res.send("Chatbot Funcionando 🤖🤖🤖 ");
});
/**Desde Aqui recibimos las peticiones de dialogFlow */
app.post("/webhook", express.json(), (req, res) => {
    console.log(req.body)
    let responseData = formatResponseForDialogflow([
        'This is a sample response from webhook.',
        'Another sample response.'
    ],
        '',
        '',
        '');
    res.send(responseData);
})

/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})

const formatResponseForDialogflow = (texts, sessionInfo, targetFlow, targetPage) => {

    messages = []

    texts.forEach(text => {
        messages.push(
            {
                text: {
                    text: [text],
                    redactedText: [text]
                },
                responseType: 'HANDLER_PROMPT',
                source: 'VIRTUAL_AGENT'
            }
        );
    });

    let responseData = {
        fulfillment_response: {
            messages: messages
        }
    };

    if (sessionInfo !== '') {
        responseData['sessionInfo'] = sessionInfo;
    }

    if (targetFlow !== '') {
        responseData['targetFlow'] = targetFlow;
    }

    if (targetPage !== '') {
        responseData['targetPage'] = targetPage;
    }

    return responseData
};
