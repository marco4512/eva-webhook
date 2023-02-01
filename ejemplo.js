const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey:'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',
});
const openai = new OpenAIApi(configuration);
const prompt = `Q:Como accedo a Gmail
                A:`;
async function PruebaWebconst(){
  const response = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: prompt,
  temperature: 0,
  max_tokens: 100,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ["Q:"],
});
console.log(response.data.choices[0].text)
}
PruebaWebconst()

