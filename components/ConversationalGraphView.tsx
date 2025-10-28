// Creates a 3D visualization of the conversational graph.
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Line } from '@react-three/drei';
import { Mesh, Vector3, MathUtils, Group as ThreeGroup } from 'three';
import { Agent } from '../types';

// Workaround for JSX intrinsic element type errors when @react-three/fiber's type augmentations are not being picked up by TypeScript.
const Group = 'group' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;

const statusColors: Record<Agent['status'], string> = {
  idle: '#6b7280', // gray-500
  working: '#3b82f6', // blue-500
  done: '#8b5cf6', // purple-500
  error: '#ef4444', // red-500
};

const MemoryNodes: React.FC<{ count: number; isLowPowerMode: boolean; }> = ({ count, isLowPowerMode }) => {
  const groupRef = useRef<ThreeGroup>(null!);
  const radius = 0.6;
  const nodes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return { position: new Vector3(x, 0, z), key: `mem-node-${i}` };
    });
  }, [count, radius]);

  useFrame((_state, delta) => {
    if (groupRef.current && !isLowPowerMode) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if(isLowPowerMode) return null;

  return (
    <Group ref={groupRef}>
      {nodes.map(node => (
        <Group key={node.key}>
          <Sphere args={[0.05, 16, 16]} position={node.position}>
             <MeshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} />
          </Sphere>
          <Line points={[new Vector3(0,0,0), node.position]} color="#a78bfa" lineWidth={0.5} transparent opacity={0.5} />
        </Group>
      ))}
    </Group>
  );
};


const AgentNode: React.FC<{ agent: Agent; position: [number, number, number]; isActive: boolean; isLowPowerMode: boolean; }> = ({ agent, position, isActive, isLowPowerMode }) => {
  const meshRef = useRef<Mesh>(null!);
  
  useFrame((_state, delta) => {
    if (isLowPowerMode) {
      meshRef.current.scale.setScalar(1);
      return;
    }
    if (isActive && agent.status === 'working') {
       meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
    } else {
       meshRef.current.scale.lerp(new Vector3(1, 1, 1), delta * 5);
    }
  });

  return (
    <Group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        {isLowPowerMode ? (
            <MeshBasicMaterial color={statusColors[agent.status] || '#6b7280'} />
        ) : (
            <MeshStandardMaterial 
              color={statusColors[agent.status] || '#6b7280'} 
              emissive={isActive ? statusColors[agent.status] : '#000000'}
              emissiveIntensity={isActive ? 0.8 : 0}
            />
        )}
      </Sphere>
      {agent.hasPersonalMemory && <MemoryNodes count={3} isLowPowerMode={isLowPowerMode} />}
      <Html distanceFactor={10} position={[0, -0.6, 0]} center>
        <div className="agent-label">{agent.role}</div>
      </Html>
    </Group>
  );
};

const ConnectionLine: React.FC<{ start: [number, number, number], end: [number, number, number], isLowPowerMode: boolean }> = ({ start, end, isLowPowerMode }) => {
    const ref = useRef<any>(null);
    useFrame(() => {
        if(ref.current && !isLowPowerMode) {
            ref.current.material.opacity = MathUtils.lerp(ref.current.material.opacity, 0, 0.05);
        }
    });
    
    useEffect(() => {
        if(ref.current) ref.current.material.opacity = 1;
    }, [start, end])

    if (isLowPowerMode) return null;

    return <Line ref={ref} points={[start, end]} color="white" lineWidth={2} transparent opacity={0} />;
}


interface ConversationalGraphViewProps {
  agents: Agent[];
  activeAgentId: string | null;
  prevActiveAgentId: string | null;
  isLowPowerMode: boolean;
}

export const ConversationalGraphView: React.FC<ConversationalGraphViewProps> = ({ agents, activeAgentId, prevActiveAgentId, isLowPowerMode }) => {
  const nodePositions = useMemo(() => {
    const positions: { [key: string]: [number, number, number] } = {};
    const maestro = agents.find(a => a.role === 'Maestro');
    const team = agents.filter(a => a.role !== 'Maestro');
    const radius = 2.5;
    
    if (maestro) {
      positions[maestro.id] = [0, 1, 0];
    }

    team.forEach((agent, index) => {
      const angle = (index / team.length) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions[agent.id] = [x, 0, z];
    });

    return positions;
  }, [agents]);

  const activeLine = useMemo(() => {
    if (!activeAgentId || !prevActiveAgentId) return null;
    const start = nodePositions[prevActiveAgentId];
    const end = nodePositions[activeAgentId];
    if (!start || !end) return null;
    return { start, end, key: `${prevActiveAgentId}-${activeAgentId}` };
  }, [activeAgentId, prevActiveAgentId, nodePositions]);

  return (
    <div className="h-full w-full bg-gray-900/50 border border-gray-700 rounded-2xl">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <AmbientLight intensity={isLowPowerMode ? 1.5 : 0.8} />
        {!isLowPowerMode && <PointLight position={[0, 5, 5]} intensity={1.5} />}
        
        {agents.map(agent => (
          <AgentNode 
            key={agent.id} 
            agent={agent} 
            position={nodePositions[agent.id] || [0,0,0]}
            isActive={agent.id === activeAgentId}
            isLowPowerMode={isLowPowerMode}
          />
        ))}

        {activeLine && <ConnectionLine key={activeLine.key} start={activeLine.start} end={activeLine.end} isLowPowerMode={isLowPowerMode} />}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};
