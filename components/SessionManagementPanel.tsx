// Fix: This component is likely a typo or wrapper for SessionManagerPanel.
// It will delegate to SessionManagerPanel to consolidate session controls.
import React from 'react';
import { SessionManagerPanel } from './SessionManagerPanel';

// Re-exporting or wrapping SessionManagerPanel to handle potential naming inconsistencies.
export const SessionManagementPanel: React.FC<React.ComponentProps<typeof SessionManagerPanel>> = (props) => {
  return <SessionManagerPanel {...props} />;
};
