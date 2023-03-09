
var apiBack = 'https://script.google.com/macros/s/AKfycbzmTDJVb4N81GE2tDbpdm6YR_VYDIxBhYXCOt_iGKHhbqdO3q-Us1REZOF6HSaRiqE/exec';
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};
async function AgregarNuevaPregunta(Pregunta, Respuesta, IdSesion) {
    var NuevaPregunta = "?Action=NuevaPregunta&Pregunta="+Pregunta+"&Respuesta="+Respuesta+"&ISesion="+IdSesion;
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


//AgregarNuevaPregunta('como ingreso a ', 'Se ingresa llendo a ', 'Sesion tal')
export { AgregarNuevaPregunta, ResponderConUnSi, ResponderConUnNo }