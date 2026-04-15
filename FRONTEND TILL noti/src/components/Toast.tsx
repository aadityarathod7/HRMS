import React from 'react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number; // Duration in milliseconds
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer); // Cleanup on unmount
  }, [duration, onClose]);

  return (
    <div className="toast">
      {message}
    </div>
  );
};

export default Toast; 