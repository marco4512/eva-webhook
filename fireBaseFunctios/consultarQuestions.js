import { doc, getDoc,setDoc, query, where, updateDoc,getDocs, getFirestore, collection } from "firebase/firestore";
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
        if(docSnap.data()[pregunta]!=undefined){
            console.log(docSnap.data()[pregunta])
        }else{
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
            var newQuestion={};
            newQuestion[pregunta]=response.data.choices[0].text
            await updateDoc(doc(questionRef, "SomeQuestions"),newQuestion);
        }
        //console.log("Document data:", docSnap.data());
    }

}
//export {extraerAsesor}
var preguntas = extraerQuestions('como hago una pizza ?');
//Promise.all([preguntas]).then(resultado => {
//    console.log(resultado)
//})
