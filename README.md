# 🎯 Alisson vs Rafa — Placar de Discordâncias

App com dados compartilhados em tempo real via Firebase Firestore.

---

## 🔥 Passo 1 — Criar projeto no Firebase (gratuito)

1. Acesse https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `discordias-app`) e clique em **Continuar** até criar
4. No menu lateral, clique em **Firestore Database**
5. Clique em **"Criar banco de dados"**
6. Escolha **"Iniciar no modo de teste"** → clique em **Próximo** → **Concluir**

---

## ⚙️ Passo 2 — Pegar as credenciais do Firebase

1. No menu lateral do Firebase, clique na engrenagem ⚙️ → **Configurações do projeto**
2. Role para baixo até **"Seus apps"**
3. Clique em **"</>  Web"** para adicionar um app web
4. Dê um apelido (ex: `discordias`) e clique em **Registrar app**
5. Copie o objeto `firebaseConfig` que aparecer — vai ser assim:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "discordias-app.firebaseapp.com",
  projectId: "discordias-app",
  storageBucket: "discordias-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## ✏️ Passo 3 — Colar as credenciais no projeto

Abra o arquivo `src/firebase.js` e substitua os campos `"COLE_AQUI"` pelos valores copiados acima.

---

## 🚀 Passo 4 — Publicar no Vercel

1. Crie uma conta gratuita em https://github.com e suba esta pasta como repositório
2. Acesse https://vercel.com, faça login com o GitHub
3. Clique em **"Add New Project"** → selecione o repositório
4. Clique em **Deploy** (sem mudar nada — o Vercel detecta o Vite automaticamente)
5. Em ~30 segundos você terá uma URL como `discordias-app.vercel.app`

Mande essa URL para o Alisson e o Rafa — os dados são sincronizados em tempo real entre todos os dispositivos! 🎉

---

## 🛡️ Passo 5 (opcional) — Proteger o banco de dados

Depois de publicar, é recomendado ir no Firebase Console → Firestore → **Regras** e trocar para:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /app/placar {
      allow read, write: if true;
    }
  }
}
```

Isso garante que apenas o documento do placar seja público.
