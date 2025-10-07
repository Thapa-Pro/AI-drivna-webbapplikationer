import "./App.css";
import { useRef, useState } from "react";
import { ChatOllama } from "@langchain/ollama";

import Message from "./components/Message";

function App() {
  const llm = new ChatOllama({
    model: "llama3.1:8b",
  });

  const inputRef = useRef();
  const [messages, setMessages] = useState([]);
  const [streamMessage, setStreamMessage] = useState(null);

  async function getAnswer(event) {
    event.preventDefault();
    const question = inputRef.current.value;
    console.log(question);

    const updatedMessages = [...messages, { content: question, role: "user" }];

    setMessages((prevState) => {
      return [...prevState, { content: question, role: "user" }];
    });

    const answer = await llm.stream(updatedMessages);

    let temp = "";
    for await (const answerChunk of answer) {
      temp += answerChunk.content;
      console.log(temp);
      setStreamMessage(temp);
    }

    setMessages((prevState) => {
      return [...prevState, { content: temp, role: "assistant" }];
    });

    setStreamMessage("");

    console.log(answer);
  }

  const messageComponents = messages.map((message, index) => {
    return (
      <Message content={message.content} role={message.role} key={index} />
    );
  });

  return (
    <main className="chat">
      <section className="chat__messages">
        {messageComponents}
        {streamMessage && <Message content={streamMessage} role="assistant" />}
      </section>
      <form className="chat__form">
        <input type="text" ref={inputRef} />
        <button onClick={getAnswer}>Fråga</button>
      </form>
    </main>
  );
}

export default App;
