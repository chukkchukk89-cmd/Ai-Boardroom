// Fix: Creates the UserProfile component.
import React from 'react';

export const UserProfile: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
        U
      </div>
      <div>
        <p className="font-semibold text-white">User</p>
        <p className="text-sm text-gray-400">Team Lead</p>
      </div>
    </div>
  );
};
