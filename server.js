const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const { WebhookClient } = require('dialogflow-fulfillment');
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

async function responder_gmail(pregunta) {
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
  const agent = new WebhookClient({ request: req, response: res });
  let pregunta = req.body['queryResult']['queryText'];
  let parametros = req.body['queryResult']['parameters']
  let intencion = req.body['queryResult']['intent']['displayName']
  console.log('texto de la intencion->', pregunta, ' parametros ->', parametros, ' intencion->', intencion);
  switch (intencion) {
    case 'Default_Fallback_Intent':
      responder_gmail(pregunta).then(function (result) {
        function fallback(agent) {
          agent.add(`${result}`);
        }
        intentMap.set('Default_Fallback_Intent', fallback);
      })
      agent.handleRequest(intentMap);
      break;
    case 'Datos del correo':
      function Datos(agent) {
        agent.add(`Enviando Correo`);
      }
      let intentMap = new Map();
      intentMap.set('Datos del correo', Datos);
      agent.handleRequest(intentMap);
      break;
  }
});


app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});