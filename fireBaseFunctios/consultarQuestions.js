import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { crear_variaciones } from "../BuscarSinonimo.js";
import { openai_response } from "../openAi/openAi_API.js";

async function ResponderPreguta(pregunta) {
    const palabrasClave = ['gmail', 'drive', 'maps', 'docs', 'sheet', 'youtube',
        'cloud', 'chrome', 'meet', 'calendario', 'formularios', 'formulario']

    let newFormatQuestion = String(pregunta).toLocaleLowerCase().replace('?', '').replace('¿', '').trim()
    let pregunta_separada = String(newFormatQuestion).split(' ')
    let categoria = []
    var respuesta = '';
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
                respuesta = docSnap.data()[newFormatQuestion]
                return respuesta;
            }
            else {
                return Promise.all([openai_response(newFormatQuestion)]).then(response => {
                    respuesta = response[0] != undefined ? response[0] : 'No pude procesar tu pregunta'
                    crear_variaciones(pregunta, respuesta, documento)
                    console.log('Se agrego a una existente')
                    return respuesta
                })
            }
        } else {
            console.log('No esta, tenemos que crearlo')
            return Promise.all([openai_response(newFormatQuestion)]).then(response => {
                respuesta = response[0] != undefined ? response[0] : 'No pude procesar tu pregunta'
                crear_variaciones(pregunta, respuesta, documento)
                console.log('Se agrego a una nueva')
                return respuesta
            })
        }
    } else {
        return 'Lo lamento no se responder eso, solo estoy enfocado en google'
    }
}
export { ResponderPreguta }
Promise.all([ResponderPreguta('como abro maps?')]).then(res => {
    console.log('respuesta->', res)
}
)

