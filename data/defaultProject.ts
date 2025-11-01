import { ProjectData } from '../types';

export const defaultProject: ProjectData = {
  "projectId": "proj-001",
  "projectName": "Boardroom Demo with Itinerary & Voice Agents",
  "superPrompt": "Create a live demo of the Boardroom system with itinerary overlay, Al agents with voice personalities, and interactive project tracking. Deadline: 2 weeks.",
  "goal": "Produce a polished, interactive demo for presentation within 2 weeks",
  "constraints": [
    "Performance efficiency",
    "Scalable UI",
    "Accurate voice playback"
  ],
  "milestones": [
    {
      "milestoneId": "m1",
      "name": "Architecture Setup",
      "objective": "Design and implement the system architecture for itinerary-driven boardroom mode",
      "deliverables": [
        "Backend API schema",
        "Agent orchestration logic",
        "Data model"
      ],
      "estimatedDuration": "3 days",
      "assignedAgents": [
        "ArchitectBot",
        "CodeSmith"
      ],
      "dependencies": [],
      "currentStatus": "pending"
    },
    {
      "milestoneId": "m2",
      "name": "UI/UX Design",
      "objective": "Design visual layout for itinerary, agent nodes, and interactive panels",
      "deliverables": [
        "Itinerary overlay UI",
        "3D graph visualization",
        "Interaction prototypes"
      ],
      "estimatedDuration": "3 days",
      "assignedAgents": [
        "UXBot",
        "DesignBot"
      ],
      "dependencies": [
        "m1"
      ],
      "currentStatus": "pending"
    },
    {
      "milestoneId": "m3",
      "name": "TTS Integration",
      "objective": "Integrate cost-effective Gemini TTS and optional GCP TTS voices for agents",
      "deliverables": [
        "Gemini TTS calls",
        "Voice selection panel",
        "Audio playback integration"
      ],
      "estimatedDuration": "2 days",
      "assignedAgents": [
        "AudioBot",
        "CodeSmith"
      ],
      "dependencies": [
        "m1"
      ],
      "currentStatus": "pending"
    },
    {
      "milestoneId": "m4",
      "name": "Iterative Simulation & Project Mode",
      "objective": "Enable dynamic milestone tracking and agent task execution in Project Mode",
      "deliverables": [
        "runProjectSimulation loop",
        "Project tracking panel",
        "Itinerary-aware agent logic"
      ],
      "estimatedDuration": "4 days",
      "assignedAgents": [
        "Maestro",
        "StrategistBot",
        "UXBot"
      ],
      "dependencies": [
        "m1",
        "m2",
        "m3"
      ],
      "currentStatus": "pending"
    },
    {
      "milestoneId": "m5",
      "name": "Testing & Optimization",
      "objective": "Test all systems end-to-end and optimize performance for live demo",
      "deliverables": [
        "Bug reports",
        "Performance benchmarks",
        "User feedback loop"
      ],
      "estimatedDuration": "2 days",
      "assignedAgents": [
        "QABot",
        "CodeSmith",
        "UXBot"
      ],
      "dependencies": [
        "m4"
      ],
      "currentStatus": "pending"
    }
  ],
  "agents": [
    {
      "agentId": "ArchitectBot",
      "specializations": [
        "system design",
        "API architecture",
        "scalability"
      ],
      "currentTasks": [],
      "availability": true
    },
    {
      "agentId": "UXBot",
      "specializations": [
        "UI/UX",
        "interaction design",
        "3D visualization"
      ],
      "currentTasks": [],
      "availability": true
    },
    {
      "agentId": "CodeSmith",
      "specializations": [
        "implementation",
        "integration",
        "debugging"
      ],
      "currentTasks": [],
      "availability": true
    },
    {
      "agentId": "AudioBot",
      "specializations": [
        "TTS integration",
        "voice selection",
        "playback"
      ],
      "currentTasks": [],
      "availability": true
    },
    {
      "agentId": "StrategistBot",
      "specializations": [
        "milestone planning",
        "dependency management",
        "dynamic allocation"
      ],
      "currentTasks": [],
      "availability": true
    }
  ]
};
