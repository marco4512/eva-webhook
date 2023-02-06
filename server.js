import express from "express";
import bodyParser from "body-parser";
import { Configuration, OpenAIApi } from "openai";
import { extraerAsesor } from "./firebaseFunction.js";
const app = express();
import { WebhookClient } from 'dialogflow-fulfillment';
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);
const port = process.env.PORT || 3000;

// for parsing json
app.use(
  bodyParser.json({
    limit: "20mb",
  })
);
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "20mb",
  })
);

async function retornar_respuesta(pregunta) {
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
  return (response.data.choices[0].text)

}

app.get("/", (req, res) => {
  return res.send("Chatbot Funcionando 🤖🤖🤖 ");
});
app.post("/webhook", express.json(), (req, res) => {
  let pregunta = req.body['queryResult']['queryText'];
  var intencion = req.body['queryResult']['intent']['displayName']
  var parametros = req.body['queryResult']['parameters']
  const agent = new WebhookClient({ request: req, response: res });
  var PreguntarAOpenAi = retornar_respuesta(pregunta);
  if (intencion === 'Default_Fallback_Intent') {
    Promise.all([PreguntarAOpenAi]).then(result => {
      function fallback(agent) {
        agent.add(`${result}`);
      }
      let intentMap = new Map();
      intentMap.set('Default_Fallback_Intent', fallback);
      agent.handleRequest(intentMap);
    }).catch(reason => {
      console.log('Razon de que truene ->', reason)
    })
  } else {
    let intentMap = new Map();
    switch (intencion) {
      case 'Datos del correo':
        function DatosCorreo(agent) {
          agent.add(`Eviar correo de: ${parametros['given-name']} con correo  ${parametros['email']}`);
        }
        intentMap.set('Datos del correo', DatosCorreo);
        agent.handleRequest(intentMap);
        break;
      case 'enviarCorreoAsesor':
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
          intentMap.set('enviarCorreoAsesor', enviarCorreoAsesor);
          agent.handleRequest(intentMap);
        }).catch(reason => {
          console.log('Razon de que truene ->', reason)
        })
        break;

    }
  }
});


app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});