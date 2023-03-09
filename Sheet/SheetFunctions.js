
var apiBack = 'https://script.google.com/macros/s/AKfycbyldW4yqTzXtrqIhbC_AS2ZHlGwT694duUSvonayCQMX94SwcSg1o9jcxDPfxAeM8Y/exec';
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};
function AgregarNuevaPregunta(Pregunta, Respuesta, IdSesion) {
    var NuevaPregunta = "?Action=NuevaPregunta&nuevaPregunta=" + Pregunta + " ^ " + Respuesta + " ^ " + IdSesion;
    var urlNuevaPregunta = apiBack + NuevaPregunta;
    fetch(urlNuevaPregunta, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
function ResponderConUnSi(IdSesion) {
    var ResponderSI = '?Action=ResponderSI&SesionId=' + IdSesion;
    var urlResponderSI = apiBack + ResponderSI;
    fetch(urlResponderSI, requestOptions)
}

function ResponderConUnNo(IdSesion) {
    var ResponderNo = '?Action=RespodenderNo&SesionId=' + IdSesion;
    var urlResponderNo = apiBack + ResponderNo;
    fetch(urlResponderNo, requestOptions)
}
export { AgregarNuevaPregunta, ResponderConUnSi, ResponderConUnNo }