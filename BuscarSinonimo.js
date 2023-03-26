import { doc, getDoc, setDoc, query, where, updateDoc, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./fireBaseFunctios/firebase.js";
import { openai_response } from './openAi/openAi_API.js'

async function sinonimosDesdeOpen(verbo) {
    var pregunta = "Convierte a codigo: un string separado por comas sin nombre de variable con todos los sinonimos en infinitivo de la palabra " + '"' + verbo + '"' + " en minuscula,sin acentos, sin comillas y sin corchetes."
    let formateado;
    return Promise.all([openai_response(pregunta)]).then(respuesta => {
        var salidaFinal = respuesta[0].trim().replaceAll('"', '').split(',')
        formateado = salidaFinal.map(palabra => palabra.trim().toLowerCase())
        return formateado
    })
}

function extraerSinonimos(palabra) {
    var palabra_a_min = palabra.toLowerCase().trim()
    var primeraLetra = palabra_a_min.charAt(0)
    return sinonimosDesdeOpen(palabra_a_min)
}

function crear_variaciones(fraseInicial, respuestaDeOpen, tema) {
    var separarFrase = fraseInicial.trim().replace('?', '').replace('¿', '').replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").toLowerCase().split(' ')
    var fraseformateada = fraseInicial.trim().replace('?', '').replace('¿', '').replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").toLowerCase()
    var preguntas = ['que', 'como', 'quien', 'quienes', 'cuales', 'cuando', 'cuanto', 'donde', 'porque', 'por']
    var variantes = [];
    separarFrase.map(function (parte) {
        //console.log('La parte ',parte)
        if (!preguntas.includes(parte) && parte.length > 3) {
            let primeraLetra = parte.charAt(0)
            buscar_en_FireBase_El_Sinonimo(primeraLetra, parte).then(respuesta => {
                //console.log(typeof(respuesta))
                if (respuesta == 'No existe palabra') {
                    //console.log('No existe la palabra')
                    extraerSinonimos(parte).then(arreglo => {
                        ingresar_nueva_palabra(primeraLetra, parte, arreglo);
                        let salidaDiferentes = [fraseformateada];
                        arreglo.map(function (variantes) {
                            var nueva = variantes.replaceAll(';', '')
                            var auxString = fraseformateada;
                            if (!salidaDiferentes.includes(auxString.replaceAll(parte, nueva))) {
                                salidaDiferentes.push(auxString.replaceAll(parte, nueva));
                            }
                        })
                        let allResults = {}
                        salidaDiferentes.map(function (frase) {
                            allResults[frase] = respuestaDeOpen
                        })
                        ingresar_en_question(allResults, tema)

                    })
                }
                if (respuesta == 'No existe documento') {
                    //console.log('No existe el documento')
                    extraerSinonimos(parte).then(arreglo => {
                        ingresar_nuevo_documento(primeraLetra, parte, arreglo);
                        let salidaDiferentes = [fraseformateada];
                        arreglo.map(function (variantes) {
                            var nueva = variantes.replaceAll(';', '')
                            var auxString = fraseformateada;
                            if (!salidaDiferentes.includes(auxString.replaceAll(parte, nueva))) {
                                salidaDiferentes.push(auxString.replaceAll(parte, nueva));
                            }
                        })
                        let allResults = {}
                        salidaDiferentes.map(function (frase) {
                            allResults[frase] = respuestaDeOpen
                        })
                        ingresar_en_question(allResults, tema)
                    })
                }
                if (typeof (respuesta) == 'object') {
                    let salidaDiferentes = [fraseformateada];
                    respuesta.map(function (variantes) {
                        var nueva = variantes.replaceAll(';', '')
                        var auxString = fraseformateada;
                        if (!salidaDiferentes.includes(auxString.replaceAll(parte, nueva))) {
                            salidaDiferentes.push(auxString.replaceAll(parte, nueva));
                        }
                    })
                    let allResults = {}
                    salidaDiferentes.map(function (frase) {
                        allResults[frase] = respuestaDeOpen
                    })
                    ingresar_en_question(allResults, tema)
                }
            })
        }
    })

}
async function ingresar_en_question(allData, tema) {
    const docRef = doc(db, "Questions", tema);
    const questionRef = collection(db, "Questions");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        await updateDoc(doc(questionRef, tema), allData);
    } else {
        await setDoc(doc(db, "Questions", tema), allData);
        await updateDoc(doc(questionRef, tema), allData);
    }

}
async function ingresar_nueva_palabra(primeraLetra, palabra, arreglo) {
    const docRef = doc(db, "Sinonimos", primeraLetra);
    const questionRef = collection(db, "Sinonimos");
    const docSnap = await getDoc(docRef);
    let salidaFire = {}
    salidaFire[palabra] = arreglo;
    await updateDoc(doc(questionRef, primeraLetra), salidaFire);
}
async function ingresar_nuevo_documento(primeraLetra, palabra, arreglo) {
    let salidaFire = {}
    salidaFire[palabra] = arreglo;
    await setDoc(doc(db, "Sinonimos", primeraLetra), salidaFire)
}
async function buscar_en_FireBase_El_Sinonimo(primeraLetra, palabra) {
    const docRef = doc(db, "Sinonimos", primeraLetra);
    const questionRef = collection(db, "Sinonimos");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        var arreglo_De_Sinonimos = docSnap.data()[palabra]
        if (arreglo_De_Sinonimos != undefined) {
            return arreglo_De_Sinonimos;
            //console.log('si existe',arreglo_De_Sinonimos)
        } else {
            return 'No existe palabra'
        }

    } else {
        return 'No existe documento'
    }
}

//extraerSinonimos('acceder').then(x => { console.log(x) })

//crear_variaciones('¿Cómo accedo a maps?', 'Para ingresar a Maps, puedes abrir el navegador web de tu preferencia y escribir en la barra de direcciones "maps.google.com". Esto te llevará a la página principal de Google Maps. Si tienes una cuenta de Google, puedes iniciar sesión para guardar tus ubicaciones favoritas y obtener recomendaciones personalizadas.', 'maps')

export { crear_variaciones }
//console.log(jsonSinonimos)