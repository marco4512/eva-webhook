const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {WebhookClient} = require('dialogflow-fulfillment');

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



app.get("/", (req, res) => {
  return res.send("Chatbot Funcionando 🤖🤖🤖 ");
});
app.post("/webhook", express.json(), (req, res) => {
  const agent = new WebhookClient({ request:req, response:res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function PruebaWeb(agent) {
    agent.add(`Respuesta desde webHook`);
  }
  let intentMap = new Map();
  intentMap.set('PruebaWeb', PruebaWeb);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});


app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});