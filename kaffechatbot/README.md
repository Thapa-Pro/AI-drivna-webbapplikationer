Övning: Kaffechatbot
En del av det som behövs för denna övning kommer vi gå igenom på lektionerna. Ni kan dock börja med att få upp en grundläggande chatbot och börja fundera kring era prompts med prompt templates.

Instruktioner
I denna övning ska du bygga en chatbot som kan prata om kaffebeställningar.
Kaffechatbotten ska först hämta kaffemenyn från API:et nedan och skicka med som kontext till en språkmodell tillsammans med frågan.

Anropa ett externt API och använda svaret som kontext i en språkmodell.
Bygga en enkel chat-UI i React.
Använda LangChain.js för att skapa ett flöde.
Ditt flöde ska bestå av nedan steg:

Hämtar menyn (om inte redan sparad).
Skapar en prompt där menyn inkluderas som kontext (här ska du använda en prompt template med).
Skickar användarens fråga + menyn till Ollama-modellen.
Tips! Promptdesign är viktigt här så testa olika sätt i din prompt template i hur du formulerar dina frågor samt systemmeddelande.

Exempel på konversation
Användare: Hej! Vad har ni för kaffe idag?
Kaffechatbot Hej! Idag har vi bl.a. espresso, cappuccino, latte och cold brew. Vill du att jag rekommenderar något?
Användare: Hur mycket kostar en cappuccino?
Kaffechatbot En cappuccino kostar 39 kr enligt menyn.
API Dokumentation
API: https://airbean-9pcyw.ondigitalocean.app/api/docs/





# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
