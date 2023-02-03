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
  let mensaje =JSON.stringify(req.body);
  let pregunta = req.body['queryResult']['queryText'];
  var intencion = req.body['queryResult']['intent']['displayName'] 
  retornar_respuesta(pregunta).then(function (result) {
    const agent = new WebhookClient({ request: req, response: res });
    console.log('entrando en la promesa')
    function fallback(agent) {
      agent.add(`${result}`);
    }
    let intentMap = new Map();
    intentMap.set('Default_Fallback_Intent', fallback);
    agent.handleRequest(intentMap);
  })
});


app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});