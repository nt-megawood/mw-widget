import React from 'react';
import type { Message } from '../../types';

interface UserMessageProps {
  message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="message-wrapper user">
      <div className="bubble user">{message.text}</div>
    </div>
  );
};
