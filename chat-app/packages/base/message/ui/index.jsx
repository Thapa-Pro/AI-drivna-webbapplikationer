import './index.css';

export const Message = ({ text, role }) => {
  return (
    <article className={`message message--${ role === 'user' ? 'user' : 'assistant' }`}>
      <section className="message__bubble">
        <span className="message__sender">{ role }</span>
        <p className="message__content">
          { text }
        </p>
      </section>
    </article>
  )
}
