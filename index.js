import express from "express";
import bodyParser from "body-parser";
import { openai_response } from "./openAi/openAi_API.js"
import { extraerAsesor } from "./firebaseFunction.js";
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
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
    var parametros = req.body['queryResult']['parameters']
    console.log('Entrando a intencion', intencion)
    seleccionarIntenciones(agent,intencion)
  
});
/**Seleccionar opcion */
function seleccionarIntenciones(agent,intencion) {    
    return new Promise(function() {
        switch (intencion) {
            case 'Default_Fallback_Intent':
                var respuestaOpenAi = openai_response(pregunta);
                respuestaOpenAi.then(result => {
                    function fallback(agent) {
                        agent.add(`${result}`);
                    }
                    let intentMap = new Map();
                    intentMap.set('Default_Fallback_Intent', fallback);
                    agent.handleRequest(intentMap)
                })
                break;
        }
        setTimeout(openai_response, 3000);
    });
}
/**Mostrar la consola de manera local */
app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}`);
})