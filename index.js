import express from "express";
import bodyParser from "body-parser";
import { extraerAsesor } from "./fireBaseFunctios/firebaseFunction.js";
import { openai_response } from "./openAi/openAi_API.js"
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
import { async } from "@firebase/util";
import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { db } from "./fireBaseFunctios/firebase.js";
import { ResponderPreguta } from './fireBaseFunctios/consultarQuestions.js';
import { formatResponseForDialogflow } from './DialogFlowFunctions/Response.js';
import { AgregarNuevaPregunta } from "./Sheet/SheetFunctions.js";
import { ResponderConUnSi } from "./Sheet/SheetFunctions.js";
import { ResponderConUnNo } from "./Sheet/SheetFunctions.js";
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
    let tag = req.body.fulfillmentInfo.tag
    let pregunta = req.body.text;
    let sesionId = req.body.sessionInfo.session;
    console.log(tag)
    switch (tag) {
        case 'BuscarPregunta':
            Promise.all([ResponderPreguta(pregunta)]).then(respuesta => {
                let responseData = formatResponseForDialogflow([respuesta], '', '', '');
                res.send(responseData);
                if (respuesta != 'Lo lamento no se responder eso, solo estoy enfocado en google') {
                    AgregarNuevaPregunta(pregunta, respuesta, sesionId)
                }
            }
            )
        case 'ResponderSi':
            ResponderConUnSi(sesionId)
            //let responseDataSi = formatResponseForDialogflow(['¿En Que mas puedo Ayudarte ?'], '', '', '');
            //res.send(responseDataSi);
            break
        case 'ResponderNo':
            //ResponderConUnNo(sesionId)
            //let responseDataNo = formatResponseForDialogflow(['¿En Que mas puedo Ayudarte ?'], '', '', '');
            res.send(responseDataNo);
    }
    //console.log(req.body)
})

/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})


