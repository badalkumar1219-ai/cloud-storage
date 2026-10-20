// ============================================
// Toast – Simple notification component
// ============================================

import { useState, useEffect } from "react";
import "./Toast.css";

function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
    warning: "⚠️",
  };

  return (
    <div className={`toast toast-${type} ${visible ? "toast-enter" : "toast-exit"}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

/**
 * ToastContainer – Renders a stack of toasts.
 * Usage:
 *   const [toasts, setToasts] = useState([]);
 *   function addToast(message, type) {
 *     setToasts(prev => [...prev, { id: Date.now(), message, type }]);
 *   }
 *   <ToastContainer toasts={toasts} setToasts={setToasts} />
 */
export function ToastContainer({ toasts, setToasts }) {
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default Toast;
