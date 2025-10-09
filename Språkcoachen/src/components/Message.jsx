import "./Message.css";

export default function Message({ role, content }) {
  const cls =
    role === "user" ? "message message--user" : "message message--assistant";
  const label = role === "user" ? "user" : "assistant";
  return (
    <div className={cls}>
      <div className="message__label">{label}</div>
      <div className="message__bubble">{content}</div>
    </div>
  );
}
