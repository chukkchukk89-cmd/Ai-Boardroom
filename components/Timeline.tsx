import React, { useState, useRef, useMemo, useCallback } from 'react';
import { TimelineEvent, TimelineEventType } from '../types';
import { TimelineDotIcon, TimelineDiamondIcon, TimelineDocIcon } from './Icons';

interface TimelineProps {
  events: TimelineEvent[];
  onEventClick: (refId: string) => void;
  containerId: string;
}

const eventStyles: Record<TimelineEventType, { icon: React.FC<{className?: string}>; color: string; size: string; }> = {
  decision: { icon: TimelineDiamondIcon, color: 'text-purple-400', size: 'w-3 h-3' },
  agent_contribution: { icon: TimelineDotIcon, color: 'text-blue-400', size: 'w-2 h-2' },
  user_input: { icon: TimelineDotIcon, color: 'text-green-400', size: 'w-2.5 h-2.5' },
  alteration: { icon: TimelineDiamondIcon, color: 'text-yellow-400', size: 'w-3 h-3' },
  task_complete: { icon: TimelineDotIcon, color: 'text-cyan-400', size: 'w-2 h-2' },
  doc_generation: { icon: TimelineDocIcon, color: 'text-red-400', size: 'w-4 h-4' },
};

// Throttle utility
const throttle = <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle: boolean;
    let lastFunc: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: Parameters<T>) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    } as T;
};

export const Timeline: React.FC<TimelineProps> = ({ events, onEventClick, containerId }) => {
  const [isActive, setIsActive] = useState(false);
  const [tooltip, setTooltip] = useState<{ event: TimelineEvent; top: number } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.timestamp - b.timestamp), [events]);

  const timeRange = useMemo(() => {
    if (sortedEvents.length < 2) return { min: 0, max: 1 };
    const min = sortedEvents[0].timestamp;
    const max = sortedEvents[sortedEvents.length - 1].timestamp;
    return { min, max: max === min ? min + 1 : max };
  }, [sortedEvents]);

  const getPosition = (timestamp: number) => {
    const duration = timeRange.max - timeRange.min;
    if (duration === 0) return 50;
    return ((timestamp - timeRange.min) / duration) * 100;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || sortedEvents.length === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = (y / rect.height) * 100;

    let closestEvent = sortedEvents[0];
    let minDistance = Infinity;

    for (const event of sortedEvents) {
      const eventPos = getPosition(event.timestamp);
      const distance = Math.abs(percentage - eventPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestEvent = event;
      }
    }
    
    if (closestEvent) {
      setTooltip({ event: closestEvent, top: y });
    }
  }, [sortedEvents, getPosition]);

  const throttledMouseMove = useMemo(() => throttle(handleMouseMove, 50), [handleMouseMove]);


  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
     if (tooltip) {
        onEventClick(tooltip.event.refId);
     }
  };

  const visibleEvents = isActive ? sortedEvents : sortedEvents.filter(e => ['decision', 'doc_generation', 'user_input'].includes(e.type));

  return (
    <div
      ref={timelineRef}
      className={`absolute top-0 right-0 h-full w-8 z-20 flex justify-center cursor-pointer group transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => { setIsActive(false); setTooltip(null); }}
      onMouseMove={throttledMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="w-0.5 h-full bg-gray-600/50 group-hover:bg-gray-500 transition-colors" />
      
      {visibleEvents.map((event) => {
        const style = eventStyles[event.type] || eventStyles.agent_contribution;
        const Icon = style.icon;
        return (
          <div
            key={event.id}
            className="absolute -translate-x-1/2"
            style={{ top: `${getPosition(event.timestamp)}%` }}
            onClick={(e) => { e.stopPropagation(); onEventClick(event.refId); }}
          >
            <Icon className={`${style.size} ${style.color} bg-gray-800 transition-transform duration-200 group-hover:scale-150`} />
          </div>
        );
      })}

      {isActive && tooltip && (
        <div
          className="absolute left-[-210px] w-52 p-2 bg-gray-900 border border-gray-600 rounded-md shadow-lg text-white text-xs pointer-events-none"
          style={{ top: `${tooltip.top}px`, transform: 'translateY(-50%)' }}
        >
          <div className="flex items-center gap-2">
            <div className={eventStyles[tooltip.event.type]?.color || 'text-gray-400'}>{tooltip.event.title}</div>
            <span className="ml-auto text-gray-500">{new Date(tooltip.event.timestamp).toLocaleTimeString()}</span>
          </div>
          {tooltip.event.description && <p className="mt-1 text-gray-400">{tooltip.event.description}</p>}
        </div>
      )}
    </div>
  );
};