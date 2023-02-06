import { doc, getDoc, query, where, getDocs, getFirestore, collection } from "firebase/firestore";
import { db } from "./firebase.js";

async function extraerAsesor(emailCliente) {
  var asesores=[]
  const querySnapshot = await getDocs(collection(db, "Asesores"));
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    let valores =Array.from(doc.data().email)
    valores.map(function(correo){
      if(correo==emailCliente){
        asesores.push(doc.id)
      }
    })
  });
  return asesores;
}

var asesores=extraerAsesor('Marco@gmail.com')
Promise.all([asesores]).then(resultado=>{
  console.log(resultado.flat())
})

