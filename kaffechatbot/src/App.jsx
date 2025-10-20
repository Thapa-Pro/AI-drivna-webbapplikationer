// src/App.jsx
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Message from "./components/Message.jsx";
import "./components/Message.css";

import { ensureMenu, formatMenuForLLM } from "./lib/airbean.js";
import { makeCoffeeChain, makeMemory, makeModel } from "./llm/coffeeChain.js";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hej! Jag är din barista-assistent ☕ Vad vill du veta om menyn idag?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [menuStamp, setMenuStamp] = useState(null);

  const inputRef = useRef(null);
  const chainRef = useRef(null);
  const memoryRef = useRef(null);

  useEffect(() => {
    const model = makeModel();
    const memory = makeMemory();
    chainRef.current = makeCoffeeChain({ model, memory });
    memoryRef.current = memory;

    (async () => {
      try {
        await ensureMenu();
        const ts = Number(localStorage.getItem("airbean_menu_time") || Date.now());
        setMenuStamp(new Date(ts));
      } catch {}
    })();
  }, []);


  // ==== Added for Scroll window =====
useEffect(() => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}, [messages]);

  function push(role, content) {
    setMessages((m) => [...m, { role, content }]);
  }

  async function refreshMenu() {
    setLoading(true);
    try {
      await ensureMenu({ force: true });
      const ts = Number(localStorage.getItem("airbean_menu_time") || Date.now());
      setMenuStamp(new Date(ts));
      push("assistant", "Menyn har uppdaterats.");
    } catch {
      push("assistant", "Kunde inte uppdatera menyn.");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    memoryRef.current?.clear?.();
    setMessages([{ role: "assistant", content: "Chatten rensad. Vad vill du veta om menyn? ☕" }]);
  }

  async function onSend(e) {
    e.preventDefault();
    const text = (inputRef.current?.value || "").trim();
    if (!text || loading) return;
// ================== Can be removed ===========
// ✅ ADD THIS BLOCK (polite filter) — place it right here
  if (/\b(hell|fuck|shit)\b/i.test(text)) {
    push("assistant", "Låt oss hålla samtalet trevligt ☕🙂");
    inputRef.current.value = "";
    return;
  }
// ================== Can be removed ===========
    push("user", text);
    inputRef.current.value = "";
    setLoading(true);

    try {
      const menu = await ensureMenu();

      // Build ONE input string (ConversationChain expects a single 'input')
      const input = [
        "[MENY]",
        formatMenuForLLM(menu),
        "[SLUT MENY]",
        "",
        "[KUNDENS FRÅGA]",
        text,
      ].join("\n");

      const result = await chainRef.current.invoke({ input });

      const reply =
        result?.response ??
        result?.text ??
        result?.output ??
        "(inget svar)";
      push("assistant", reply);
    } catch (err) {
      console.error("LLM error:", err);
      const m = String(err?.message || "");
      let msg = "Oj! Något gick fel. Försök igen.";
      if (m.includes("model")) msg = "Modellen hittades inte i Ollama. Kolla modellnamnet i coffeeChain.js.";
      if (m.includes("fetch") || m.includes("Failed")) msg = "Kunde inte nå Ollama. Kontrollera proxy och att 'ollama serve' kör.";
      push("assistant", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card chat">
        <div className="header">
          <h1 className="title">Kaffechatbot ☕</h1>
          <div className="actions">
            <button className="btn" onClick={refreshMenu} disabled={loading}>Uppdatera meny</button>
            <button className="btn danger" onClick={clearChat} disabled={loading}>Rensa chat</button>
          </div>
        </div>

        <div className="messages">
          {messages.map((m, i) => <Message key={i} role={m.role} content={m.content} />)}
          {loading && <Message role="assistant" content="Skriver…" />}
        </div>

        <form className="inputRow" onSubmit={onSend}>
          <input className="input" ref={inputRef} placeholder="Skriv en fråga om kaffemenyn…" />
          <button className="btn primary" type="submit" disabled={loading}>Skicka</button>
        </form>

        <div className="kicker">
          <span className="menuTag">Meny hämtad</span>
          {menuStamp && <span className="small"> • cache: {menuStamp.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}
