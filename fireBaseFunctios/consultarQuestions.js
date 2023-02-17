import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);


async function ResponderPreguta(pregunta) {
    const palabrasClave = ['gmail', 'drive', 'maps', 'docs', 'sheet', 'youtube',
    'cloud', 'chrome', 'meet', 'calendario', 'formularios', 'formulario']
    let newFormatQuestion = String(pregunta).toLocaleLowerCase().replace('?', '').replace('¿', '').trim()
    let pregunta_separada = String(newFormatQuestion).split(' ')
    let categoria = []
    var newQuestion = {};
    var respuesta='';
    pregunta_separada.map(function (palabra) {
        if (palabrasClave.includes(palabra)) {
            categoria.push(palabra)
        }
    })
    if (categoria.length != 0) {
        let documento = categoria[0]
        const docRef = doc(db, "Questions", documento);
        const questionRef = collection(db, "Questions");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log('si extiste')
            console.log(newFormatQuestion)
            if (docSnap.data()[newFormatQuestion] != undefined) {
                respuesta=docSnap.data()[newFormatQuestion]
                console.log(docSnap.data()[newFormatQuestion])
            }
            else {
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Q:${newFormatQuestion}
                       A:`,
                    temperature: 0,
                    max_tokens: 400,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: ["Q:"],
                });
                respuesta= response.data.choices[0].text
                newQuestion[newFormatQuestion] = response.data.choices[0].text
                await updateDoc(doc(questionRef,documento), newQuestion);
                console.log('agregar a gmail')
            }
        } else {
            console.log('No esta, tenemos que crearlo')
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Q:${newFormatQuestion}
                   A:`,
                temperature: 0,
                max_tokens: 400,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["Q:"],
            });
            respuesta=response.data.choices[0].text;
            newQuestion[newFormatQuestion] = response.data.choices[0].text;
            await setDoc(doc(db, "Questions", documento), newQuestion)
        }
    }else{
        respuesta='Lo lamento no se responder eso, solo estoy enfocado en google'
    }
    return respuesta;
}
export{ResponderPreguta}
//ResponderPreguta('que es google drive?')
