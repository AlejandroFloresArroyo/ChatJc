import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
var CryptoJS = require("crypto-js");

firebase.initializeApp({
  apiKey: "AIzaSyDHF2tvnZ-BdB_S8233gc1CWMy5bAeQ9nI",
  authDomain: "chat-jc-36ea7.firebaseapp.com",
  projectId: "chat-jc-36ea7",
  storageBucket: "chat-jc-36ea7.appspot.com",
  messagingSenderId: "605415018946",
  appId: "1:605415018946:web:63ba7b817798e55836c65b",
  measurementId: "G-BVFCLGJKX7",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  //Estado del inicio de sesion del usuario
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>💬 Chat JC 💬</h1>
        <SignOut />
      </header>

      {/* Si el usuario esta iniciado abre chatroom o manda a la ventana de sign in */}
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Iniciar Sesion con google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Cerrar Sesion
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");
  const [formValueKey, setFormValueKey] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const coded = CryptoJS.AES.encrypt(formValue, formValueKey).toString();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: coded,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    setFormValueKey("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>
      {/* Formulario para enviar el mensaje */}
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Mensaje..."
        />
        <hr />
        <input
          value={formValueKey}
          onChange={(e) => setFormValueKey(e.target.value)}
          placeholder="Secreto"
        ></input>
        <button type="submit" disabled={!formValue}>
          Enviar 🕊️
        </button>
      </form>
    </>
  );
}

function decode(message) {
  const key = prompt("Indica la clave secreta");
  const decoded = CryptoJS.AES.decrypt(message, key);
  const originalMessage = decoded.toString(CryptoJS.enc.Utf8);
  originalMessage.length > 0
    ? alert("El mensaje es: " + originalMessage)
    : alert("Clave incorrecta");
}

// Chat function
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
        <button
          class="btn"
          onClick={() => {
            decode(text);
          }}
        >
          👁
        </button>
      </div>
    </>
  );
}

export default App;
