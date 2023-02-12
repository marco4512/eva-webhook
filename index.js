import express from "express";
import bodyParser from "body-parser";
import { extraerAsesor } from "./fireBaseFunctios/firebaseFunction.js";
import { openai_response } from "./openAi/openAi_API.js"
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
import { async } from "@firebase/util";
import { doc, getDoc,setDoc, query, where, updateDoc,getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./fireBaseFunctios/firebase.js";
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
    //var respuestaOpenAi = openai_response(pregunta, intencion);
    var parametros = req.body['queryResult']['parameters']
    async function fallback(agent) {
        const docRef = doc(db, "Questions", "SomeQuestions");
        const questionRef = collection(db, "Questions");
        const docSnap = await getDoc(docRef);
        let newPregunta=String(pregunta).toLocaleLowerCase().replace('?','').replace('¿','') 
        if (docSnap.exists()) {
            if(docSnap.data()[newPregunta]!=undefined){
                agent.add(docSnap.data()[newPregunta]);
                console.log(docSnap.data()[newPregunta])
            }else{
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Q:${newPregunta}
                       A:`,
                    temperature: 0,
                    max_tokens: 100,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: ["Q:"],
                });
                agent.add(`${response.data.choices[0].text}`);
                console.log('Ingresando nueva Pregunta')
                var newQuestion={};
                newQuestion[newPregunta]=response.data.choices[0].text
                await updateDoc(doc(questionRef, "SomeQuestions"),newQuestion);
            }
        }
    }
    if (intencion == 'Default_Fallback_Intent') {
        let intentMap = new Map();
        intentMap.set('Default_Fallback_Intent', fallback);
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

    
});

/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})