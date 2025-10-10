import "./App.css";
import { useRef, useState } from "react";
import { ChatOllama } from "@langchain/ollama";

import Message from "./components/Message";

function App() {
  const llm = new ChatOllama({
    model: "llama3.1:8b",
  });

  const inputRef = useRef();
  const [mode, setMode] = useState("chat"); // "chat" | "en" | "sv-correct"
  const [messages, setMessages] = useState([]);
  const [streamMessage, setStreamMessage] = useState(null);

  function systemPromptFor(mode) {
    if (mode === "en") {
      return `You are a translation engine. Translate the user's message into English.
- Return ONLY the translation text (no explanations, no quotes, no prefixes). \
- If it is a question, don't answer it just translate in English.`;
    }
    if (mode === "sv-correct") {
      return `You are a Swedish grammar corrector. If the user's Swedish text contains mistakes, return the corrected Swedish.
- Importantly, if the text is a question, don't answer it just correct it.
- Return ONLY Swedish text (no explanations, no quotes, no prefixes).`;
    }
    return null; // normal chat
  }

  async function getAnswer(event) {
    event.preventDefault();

    const question = inputRef.current.value?.trim();
    if (!question) return;

    // show user's message in the thread
    setMessages((prev) => [...prev, { content: question, role: "user" }]);

    // build the message list for the LLM
    const sys = systemPromptFor(mode);
    const updatedMessages = sys
      ? [
          { role: "system", content: sys },
          ...messages,
          { role: "user", content: question },
        ]
      : [...messages, { role: "user", content: question }];

    // stream the answer
    const answer = await llm.stream(updatedMessages);

    let temp = "";
    for await (const chunk of answer) {
      temp += chunk.content;
      setStreamMessage(temp);
    }

    // commit the assistant message
    setMessages((prev) => [...prev, { content: temp, role: "assistant" }]);
    setStreamMessage("");

    // optional: clear the input after send
    inputRef.current.value = "";
  }

  const messageComponents = messages.map((message, index) => (
    <Message content={message.content} role={message.role} key={index} />
  ));

  return (
    <main className="chat">
      <section className="chat__messages">
        {messageComponents}
        {streamMessage && <Message content={streamMessage} role="assistant" />}
      </section>

      <form className="chat__form">
        {/* mode selector like your screenshot */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          <option value="chat">Chatta</option>
          <option value="en">Engelska</option>
          <option value="sv-correct">Rätt svenska</option>
        </select>

        <input
          type="text"
          ref={inputRef}
          placeholder="Skriv ett meddelande..."
        />
        <button onClick={getAnswer}>Fråga</button>
      </form>
    </main>
  );
}

export default App;
