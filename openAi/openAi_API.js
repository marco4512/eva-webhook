import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

async function openai_response(pregunta) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Q:${pregunta}
             A:`,
    temperature: 0,
    max_tokens: 400,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ["Q:"],
  })

  return response.data.choices[0].text
}
export { openai_response }
