import "./App.css";
import { useEffect, useRef, useState } from "react";
import Message from "./components/Message";

import { ChatOllama } from "@langchain/ollama";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const llm = new ChatOllama({ model: "llama3.1:8b" });

const chatPrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const translateENPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    [
      "You are a translation engine.",
      "Task: Translate the user's text into English.",
      "Rules:",
      "- Output ONLY the translated text. No quotes, no explanations, no prefixes.",
      "- If the input looks like a question, DO NOT answer it—just translate it.",
      "- Preserve punctuation and formatting as appropriate.",
    ].join("\n")
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const correctSVPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    [
      "You are a careful Swedish spelling-and-grammar corrector.",
      "Task: Return the corrected Swedish version of the user's text.",
      "Rules:",
      "- Output ONLY the corrected Swedish. No quotes, no explanations, no prefixes.",
      "- If the input looks like a question, DO NOT answer it—just correct it.",
      "- Fix punctuation as needed (e.g., missing question marks, commas, capitalization).",
    ].join("\n")
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const memories = {
  chat: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
  en: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
  "sv-correct": new BufferMemory({ returnMessages: true, memoryKey: "history" }),
};

const chains = {
  chat: new ConversationChain({ llm, memory: memories.chat, prompt: chatPrompt }),
  en: new ConversationChain({ llm, memory: memories.en, prompt: translateENPrompt }),
  "sv-correct": new ConversationChain({
    llm,
    memory: memories["sv-correct"],
    prompt: correctSVPrompt,
  }),
};

const storageKeyFor = (mode) => `chatHistory:${mode}`;

async function memoryToUiMessages(memory) {
  const hist = await memory.chatHistory.getMessages();
  return hist.map((m) => ({
    role: m.getType() === "human" ? "user" : "assistant",
    content: m.content,
  }));
}

function rehydrateMemoryFrom(messages, memory) {
  messages.forEach((m) => {
    if (m.role === "user") memory.chatHistory.addUserMessage(m.content);
    else memory.chatHistory.addAIChatMessage(m.content);
  });
}

function App() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    const key = storageKeyFor(mode);
    const saved = localStorage.getItem(key);
    const mem = memories[mode];
    mem.chatHistory.clear();
    if (saved) {
      const parsed = JSON.parse(saved);
      rehydrateMemoryFrom(parsed, mem);
      setMessages(parsed);
    } else {
      setMessages([]);
    }
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value?.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    inputRef.current.value = "";
    await chains[mode].call({ input: text });
    const ui = await memoryToUiMessages(memories[mode]);
    setMessages(ui);
    localStorage.setItem(storageKeyFor(mode), JSON.stringify(ui));
  };

  const handleClear = () => {
    const mem = memories[mode];
    mem.chatHistory.clear();
    setMessages([]);
    localStorage.removeItem(storageKeyFor(mode));
  };

  return (
    <main className="chat">
      <section className="chat__messages">
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
      </section>
      <form className="chat__form" onSubmit={handleSubmit}>
        <div className="select-wrapper">
         <select
           value={mode}
           onChange={(e) => setMode(e.target.value)}
           className="chat__select"
          >
            <option value="chat">Chatta</option>
            <option value="en">Engelska (översätt)</option>
            <option value="sv-correct">Rätt svenska</option>
          </select>
        </div>

        <input type="text" className="chat__input" ref={inputRef} />
        <button type="submit" className="chat__btn">Skicka!</button>
        <button type="button" onClick={handleClear} className="chat__btn clear__btn">Rensa</button>

      </form>
    </main>
  );
}

export default App;
