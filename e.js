import { openai_response } from "./openAi/openAi_API.js"
var respuestaOpenAi = openai_response('hola');
var aux='';
console.log(aux.length)
respuestaOpenAi.then(result => {
    aux=aux+'->'+result
    console.log('respuesta --- >',result);
    /*function fallback(agent) {
        agent.add(`${result}`);
    }
    let intentMap = new Map();
    intentMap.set('Default_Fallback_Intent', fallback);
    agent.handleRequest(intentMap)*/
})

console.log('respuesta del api ->',aux)