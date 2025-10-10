import "./Message.css";

function Message({ content, role }) {
  const isOwnMessage = role === "user";

  return (
    <article className={`message-row ${isOwnMessage ? "own" : "bot"}`}>
      <section className="message-bubble">
        <span className="sender">{role}</span>
        <p>{content}</p>
      </section>
    </article>
  );
}

export default Message;
