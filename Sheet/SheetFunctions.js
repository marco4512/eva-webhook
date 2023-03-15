import { async } from "@firebase/util";
import {extraerAsesor} from "../fireBaseFunctios/firebaseFunction.js";

var apiBack = 'https://script.google.com/macros/s/AKfycbyNzM8gJirGNLUIqvduRhMkeFee4E4qy5iBrg9ALAWSORR2svGhDkM4kMkTJVToS3g/exec';
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};
async function AgregarNuevaPregunta(Pregunta, Respuesta, IdSesion) {
    var NuevaPregunta = "?Action=NuevaPregunta&Pregunta=" + Pregunta + "&Respuesta=" + Respuesta + "&ISesion=" + IdSesion;
    var urlNuevaPregunta = apiBack + NuevaPregunta;
    fetch(urlNuevaPregunta, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
async function ResponderConUnSi(IdSesion) {
    var ResponderSI = '?Action=ResponderSI&SesionId=' + IdSesion;
    var urlResponderSI = apiBack + ResponderSI;
    fetch(urlResponderSI, requestOptions)
}

async function ResponderConUnNo(IdSesion) {
    var ResponderNo = '?Action=RespodenderNo&SesionId=' + IdSesion;
    var urlResponderNo = apiBack + ResponderNo;
    fetch(urlResponderNo, requestOptions)
}

async function SubirUnTiket(NombreUsuario, Problema, Correo, Asesor, Status) {
    var Url = apiBack + '?Action=SubirTiket&NombreUsuario=' + NombreUsuario + '&Problema=' + Problema + '&Correo=' + Correo + '&Asesor=' + Asesor + '&Status=' + Status
    let result = fetch(Url, requestOptions).then(response => response.text())
    return result
}
async function ExtraerEstado(NumeroSegimiento) {
    var Url = apiBack + '?Action=ConsultarTiket&NumeroSegimiento='+NumeroSegimiento
    let result = fetch(Url, requestOptions).then(response => response.text())
    return result
}
/** 
Promise.all([SubirUnTiket('Jose', 'no me carga', 'jose@hotmail', 'Jose', 'Pendiente')]).then(id => {
    console.log(id)
})
Promise.all([ExtraerEstado('MM153163330M')]).then(id => {
    let Info = JSON.parse(id);
    console.log(Info)
})*/



//AgregarNuevaPregunta('como ingreso a ', 'Se ingresa llendo a ', 'Sesion tal')
export { AgregarNuevaPregunta, ResponderConUnSi, ResponderConUnNo,SubirUnTiket,ExtraerEstado }