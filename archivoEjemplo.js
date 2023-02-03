const { Configuration, OpenAIApi } = require("openai");
const { WebhookClient } = require('dialogflow-fulfillment');
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

async function retornar_respuesta(pregunta,PorDefecto) {
    console.log(PorDefecto)
    const response =  openai.createCompletion({
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

let resultado =retornar_respuesta('como es el cielo ?','PorDefecto').then(function (result) {return result;})
console.log(resultado);
console.log('No pendiente')


