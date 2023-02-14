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
    const agent = new WebhookClient({ request: req, response: res });
    var pregunta = req.body['queryResult']['queryText'];
    var intencion = req.body['queryResult']['intent']['displayName']
    //var respuestaOpenAi = openai_response(pregunta, intencion);
    var parametros = req.body['queryResult']['parameters']
    async function fallback(agent) {
        const palabrasClave = ['gmail', 'drive', 'maps', 'docs', 'sheet', 'youtube',
            'cloud', 'chrome', 'meet', 'calendario', 'formularios', 'formulario']
        let newFormatQuestion = String(pregunta).toLocaleLowerCase().replace('?', '').replace('¿', '').trim()
        let pregunta_separada = String(newFormatQuestion).split(' ')
        let categoria = []
        var newQuestion = {};
        var respuesta = '';
        pregunta_separada.map(function (palabra) {
            if (palabrasClave.includes(palabra)) {
                categoria.push(palabra)
            }
        })
        if (categoria.length != 0) {
            let documento = categoria[0]
            const docRef = doc(db, "Questions", documento);
            const questionRef = collection(db, "Questions");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log('si extiste')
                console.log(newFormatQuestion)
                if (docSnap.data()[newFormatQuestion] != undefined) {
                    agent.add(`${docSnap.data()[newFormatQuestion]}`)
                    respuesta = docSnap.data()[newFormatQuestion]
                    console.log(docSnap.data()[newFormatQuestion])
                }
                else {
                    agent.add(`No tengo ese dato aun, dejame buscarlo por ti y pregunta de nuevo`)
                    const response = await openai.createCompletion({
                        model: "text-davinci-003",
                        prompt: `Q:${newFormatQuestion}
                       A:`,
                        temperature: 0,
                        max_tokens: 400,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                        stop: ["Q:"],
                    });
                    newQuestion[newFormatQuestion] = response.data.choices[0].text
                    await updateDoc(doc(questionRef, documento), newQuestion);
                    console.log('agregar a gmail')
                }
            } else {
                agent.add(`No tengo ese dato aun, dejame buscarlo por ti y pregunta de nuevo`)
                console.log('No esta, tenemos que crearlo')
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Q:${newFormatQuestion}
                   A:`,
                    temperature: 0,
                    max_tokens: 400,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: ["Q:"],
                });
                newQuestion[newFormatQuestion] = response.data.choices[0].text;
                await setDoc(doc(db, "Questions", documento), newQuestion)
            }
        }
        //return ResponderPreguta(pregunta).then(res => { agent.add(`${res}`) })
    }
    if (intencion == 'Default_Fallback_Intent') {
        let intentMap = new Map();
        console.log('funcion fALLBACK',fallback);
        intentMap.set('Default_Fallback_Intent', fallback)
        agent.handleRequest(intentMap)

    } else {
        var asesores = extraerAsesor(parametros.email)
        Promise.all([asesores]).then(result => {
            function enviarCorreoAsesor(agent) {
                console.log(result.flat().length)
                if (result.flat().length != 0) {
                    agent.add(`Aqui estan tus asesores`)
                    result.flat().map((asesor) => agent.add(`${asesor}`))
                } else {
                    agent.add(`:c No encuentro a tu asesor`)
                }
            }
            let intentMap = new Map();
            intentMap.set('enviarCorreoAsesor', enviarCorreoAsesor);
            agent.handleRequest(intentMap);
        }).catch(reason => {
            console.log('Razon de que truene ->', reason)
        })
    }
})
/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})