import { initializeApp } from "firebase/app";
import {addDoc,getFirestore} from "firebase/firestore";
import 'firebase/compat/firestore';
const firebaseConfig = {
  apiKey: "",
  authDomain: "..com",
  projectId: "basededialogflow",
  storageBucket: "basededialogflow.appspot.com",
  messagingSenderId: "82826287339",
  appId: "1:82826287339:web:bd91289c4521d8888b86ae"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export {db};
export default app; 
