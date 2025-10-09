import "./App.css";
import { useRef, useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import Message from "./components/Message";

const MODEL = "llama3.2"; // or "llama3.1:8b"
const llm = new ChatOllama({ baseUrl: "http://localhost:11434", model: MODEL });

function systemFor(mode) {
  if (mode === "translate") {
    return {
      role: "system",
      content:
        "Du är en översättningsmotor. Översätt användarens mening till engelska. " +
        "Svara ENDAST med den översatta meningen, utan citat eller förklaringar.",
    };
  }
  return {
    role: "system",
    content:
      "Du är en språktränare som korrigerar svensk grammatik. " +
      "Korrigera stavning, grammatik och skiljetecken men bevara betydelsen. " +
      "Svara ENDAST med den korrigerade meningen.",
  };
}

export default function App() {
  const inputRef = useRef(null);
  const [mode, setMode] = useState("translate");
  const [messages, setMessages] = useState([]); // [{ role, content }]
  const [streamMessage, setStreamMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSend(e) {
    e.preventDefault();
    const text = (inputRef.current?.value || "").trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    inputRef.current.value = "";
    if (inputRef.current) inputRef.current.style.height = "";

    const convo = [
      systemFor(mode),
      ...messages,
      { role: "user", content: text },
    ];

    setBusy(true);
    setStreamMessage("");
    try {
      const stream = await llm.stream(convo);
      let acc = "";
      for await (const ch of stream) {
        acc += ch.content || "";
        setStreamMessage(acc);
      }
      setMessages((m) => [...m, { role: "assistant", content: acc }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${String(err)}` },
      ]);
    } finally {
      setStreamMessage("");
      setBusy(false);
    }
  }

  return (
    <main className="chat">
      <section className="chat__messages">
        {messages.map((m, i) => (
          <Message key={i} role={m.role} content={m.content} />
        ))}
        {streamMessage && (
          <Message role="assistant" content={streamMessage + " "} />
        )}
      </section>

      {/* TEXTAREA ABOVE actions */}
      <form className="chat__controls" onSubmit={onSend}>
        <textarea
          className="chat__textarea"
          rows={3}
          ref={inputRef}
          placeholder={
            mode === "translate"
              ? "Skriv en mening att översätta…"
              : "Skriv en mening att korrigera…"
          }
          disabled={busy}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />

        <div className="chat__actions">
          <select
            className="chat__select"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={busy}
          >
            <option value="translate">Översätt mening</option>
            <option value="correct">Korrigera mening grammatiskt</option>
          </select>

          <button className="chat__button" disabled={busy}>
            {busy ? (
              <>
                Tänker
                <span className="loading" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </>
            ) : (
              "Go!"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
