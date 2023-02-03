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
  let mensaje =JSON.stringify(req.body);
  let pregunta = req.body['queryResult']['queryText'];
  var intencion = req.body['queryResult']['intent']['displayName']
  if(intencion=='Default_Fallback_Intent'){  
  responder_gmail(pregunta).then(function (result) {
    console.log('entrando en la promesa')
    const agent = new WebhookClient({ request: req, response: res });
    function fallback(agent) {
      agent.add(`${result}`);
    }
    function PruebaWeb(agent) {
      agent.add(`${result}`);
    }
    let intentMap = new Map();
    intentMap.set('PruebaWeb', PruebaWeb);
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default_Fallback_Intent', fallback);
    agent.handleRequest(intentMap);
  })
}else{
  const agent2 = new WebhookClient({ request: req, response: res });
  switch (intencion) {
    case 'Datos del correo':
      function Datos(agent2) {
        agent2.add(`Enviando Correo`);
      }
      let intentMap = new Map();
      intentMap.set('Datos del correo', Datos);
      agent2.handleRequest(intentMap);
      break;
  }
}

});


app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});