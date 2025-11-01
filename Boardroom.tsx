// Fix: Provides the Boardroom component for project goal and task management.
import React from 'react';
import { Boardroom as BoardroomComponent } from './components/Boardroom';

// Re-exporting BoardroomComponent to resolve module error.
export const Boardroom: React.FC<React.ComponentProps<typeof BoardroomComponent>> = (props) => {
  return <BoardroomComponent {...props} />;
};
