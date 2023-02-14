import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);
async function extraerQuestions(pregunta) {

    const docRef = doc(db, "Questions", "SomeQuestions");
    const questionRef = collection(db, "Questions");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        if (docSnap.data()[pregunta] != undefined) {
            console.log(docSnap.data()[pregunta])
        } else {
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
            response.data.choices[0].text
            console.log('Ingresando nueva Pregunta')
            var newQuestion = {};
            newQuestion[pregunta] = response.data.choices[0].text
            await updateDoc(doc(questionRef, "SomeQuestions"), newQuestion);
        }
        //console.log("Document data:", docSnap.data());
    }

}

function Formato(pregunta) {
    let newFormat = String(pregunta).toLocaleLowerCase().replace('?', '').replace('¿', '')
    console.log(newFormat)
}
const palabrasClave = ['gmail', 'drive', 'maps', 'docs', 'sheet', 'youtube',
    'cloud', 'chrome', 'meet', 'calendario', 'formularios', 'formulario']
async function ResponderPreguta(pregunta) {
    let newFormatQuestion = String(pregunta).toLocaleLowerCase().replace('?', '').replace('¿', '').trim()
    let pregunta_separada = String(newFormatQuestion).split(' ')
    let categoria = []
    var newQuestion = {};
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
                console.log(docSnap.data()[newFormatQuestion])
            }
            else {
                const response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `Q:${newFormatQuestion}
                       A:`,
                    temperature: 0,
                    max_tokens: 100,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop: ["Q:"],
                });
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
                max_tokens: 100,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["Q:"],
            });
            newQuestion[newFormatQuestion] = response.data.choices[0].text;
            await setDoc(doc(db, "Questions", documento), newQuestion)
        }
    }
}
ResponderPreguta('que es google drive?')




//Formato('¿Quien pinto la mona Lisa?')

//export {extraerAsesor}
//var preguntas = extraerQuestions('como hago una pizza ?');
//Promise.all([preguntas]).then(resultado => {
//    console.log(resultado)
//})
