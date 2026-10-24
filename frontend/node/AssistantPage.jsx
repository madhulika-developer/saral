import React from 'react';
import { AssistantChat } from '../components/AssistantChat';

export const AssistantPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <AssistantChat isFloating={false} />
    </div>
  );
};
