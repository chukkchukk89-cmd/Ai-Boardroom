
// Fix: Provides the ProjectMode component, which is the main project interface.
import React from 'react';
import { ProjectMode as ProjectModeComponent } from './components/ProjectMode';

// This file seems to be a wrapper or an alternative entry point.
// For consistency, we will re-export the main component from the components directory.
// Fix: Add props to the component to match the underlying component's signature.
export const ProjectMode: React.FC<React.ComponentProps<typeof ProjectModeComponent>> = (props) => {
  return <ProjectModeComponent {...props} />;
};
