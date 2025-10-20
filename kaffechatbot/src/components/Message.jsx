import "./Message.css";

export default function Message({ role, content }) {
  const cls = role === "user" ? "message user" : "message bot";
  return (
    <div className={cls}>
      <div className="bubble">
        <small className="who">{role}</small>
        <div>{content}</div>
      </div>
    </div>
  );
}
