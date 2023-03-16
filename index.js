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
import { ResponderConUnNo, SubirUnTiket, ExtraerEstado } from "./Sheet/SheetFunctions.js";
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
    }
})
app.post("/ResponderSi", express.json(), (req, res) => {
    let tag = req.body.fulfillmentInfo.tag
    let pregunta = req.body.text;
    let sesionId = req.body.sessionInfo.session;
    console.log(tag)
    switch (tag) {
        case 'ResponderSi':
            ResponderConUnSi(sesionId)
            let responseDataSi = formatResponseForDialogflow(['¿En Que mas puedo Ayudarte ?'], '', '', '');
            res.send(responseDataSi);
            break
    }
})
app.post("/ResponderNo", express.json(), (req, res) => {
    let tag = req.body.fulfillmentInfo.tag
    let pregunta = req.body.text;
    let sesionId = req.body.sessionInfo.session;
    console.log(tag)
    switch (tag) {
        case 'ResponderNo':
            ResponderConUnNo(sesionId)
            let responseDataSi = formatResponseForDialogflow(['¿En Que mas puedo Ayudarte ?'], '', '', '');
            res.send(responseDataSi);
            break
    }
})
app.post("/SolicitarTiket", express.json(), (req, res) => {
    let tag = req.body.fulfillmentInfo.tag
    let pregunta = req.body.text;
    let Parametros = req.body['sessionInfo']['parameters'];
    console.log('Request del dialog', req.body)
    console.log(tag)
    console.log(Parametros)
    let nombre = Parametros['nombre']
    let correo = Parametros['correoelectronico']
    let Problema = Parametros['problema']
    let status = 'Pendiente';
    var asesores = extraerAsesor(correo)
    Promise.all([asesores]).then(resultado => {
        let asesor;
        if (resultado.flat().length != 0) {
            asesor = resultado.flat()[0]
        } else {
            asesor = 'No se tiene asesor';
        }

        Promise.all([SubirUnTiket(nombre, Problema, correo, asesor, status)]).then(id => {
            let responseDataSi = formatResponseForDialogflow(['Listo, tu Numero de Tiket es el siguiente', id], '', '', '');
            res.send(responseDataSi);
        })
    })
})
app.post("/EstadoTicket", express.json(), (req, res) => {
    let tag = req.body.fulfillmentInfo.tag
    let pregunta = req.body.text;
    let Parametros = req.body['sessionInfo']['parameters'];
    console.log('Request del dialog', req.body)
    console.log(tag)
    console.log(Parametros)
    let idTiket = Parametros['idtiket']
    Promise.all([ExtraerEstado(idTiket)]).then(tiket => {
        console.log('entramos aqui', tiket)
        let respuestaDelBot;
        if (tiket.length != 0) {
            console.log('entrando al if')
            let tiket2= JSON.parse(tiket)
            let Nombre = tiket2['Nombre']
            let asesor = tiket2['Asesor']
            let status = tiket2['Status']
            let problema = tiket2['Problema']
            console.log('estatus',)
            switch (status) {
                case 'Pendiente':
                    respuestaDelBot = `Hola ${Nombre} Por el momento tu asesor ${asesor} 
                                esta por resolver  tu problema :'${problema} `;
                    console.log(' vamos a enviar esto',respuestaDelBot, typeof(respuestaDelBot))
                    let responseDataSi = formatResponseForDialogflow([String(respuestaDelBot)], '', '', '');
                    res.send(responseDataSi);
                    break
                case 'EnProceso':
                    respuestaDelBot = `Hola ${Nombre} Por el momento tu asesor ${asesor} 
                                esta resolviendo  tu problema :'${problema} `;
                    break
                case 'Resuelto':
                    respuestaDelBot = `Hola ${Nombre} tu asesor ${asesor} 
                    ya  resolvio  tu problema :'${problema} `;
            }
        } else {
            respuestaDelBot = `No encuentro el tiket con numero ${idTiket}`;
        }

    })
})
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})


