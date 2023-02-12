import express from "express";
import bodyParser from "body-parser";
import { openai_response } from "./openAi/openAi_API.js"
import { doc, getDoc, query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./firebase.js";
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
import { async } from "@firebase/util";
import { Configuration, OpenAIApi } from "openai";
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
    var respuestaOpenAi = openai_response(pregunta, intencion);
    var parametros = req.body['queryResult']['parameters']
    async function fallback(agent) {
        if (pregunta != 'como ingresar a gmail') {
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Q:${pregunta}
                   A:`,
                temperature: 0,
                max_tokens: 100,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["Q:"],
            });
            agent.add(`${response.data.choices[0].text}`);
        } else {
            agent.add('esta pregunta ya esta')
        }
    }
    async function enviarCorreoAsesor(agent) {
        var asesores = [];
        const querySnapshot = await getDocs(collection(db, "Asesores"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            let valores = Array.from(doc.data().email)
            valores.map(function (correo) {
                if (correo == parametros.email.toLowerCase()) {
                    agent.add(`${doc.id}`)
                    asesores.push(doc.id)
                }
            })
        });
    }
    let intentMap = new Map();
    if (intencion == 'Default_Fallback_Intent') {
        intentMap.set('Default_Fallback_Intent', fallback);
    } else {
        intentMap.set('enviarCorreoAsesor', enviarCorreoAsesor);
    }

    agent.handleRequest(intentMap)
});

/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})