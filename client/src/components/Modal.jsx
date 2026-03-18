import "./components.css";

const Modal = ({ open, title, children, onClose }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="sh-modal-backdrop" onClick={onClose}>
      <div
        className="sh-modal"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="sh-modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="sh-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
