import React from 'react';
import type { Message } from '../../types';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const formattedTime = message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="message-wrapper user">
      <div className="message-content">
        <div className="bubble user-bubble">{message.text}</div>
        <div className="user-meta">
          <span className="meta-time">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
