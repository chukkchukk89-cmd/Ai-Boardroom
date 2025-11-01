
// Fix: Implements the simulation logic for Project Mode.
import { Agent, ProjectData, TaskStatus, Milestone } from '../types';
import { generateAgentResponse, AgentLLMResponse } from './maestroPrompting';
import { MAESTRO_PROJECT_PROMPTS } from '../prompts';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StateUpdate {
  log?: { role: string; avatar: string; content: string; };
  agentStatus?: { agentId: string; status: 'idle' | 'working' | 'done' | 'error'; task: string | null };
  milestoneStatus?: { milestoneId: string; status: TaskStatus };
  finalDocument?: string;
}

type UpdateStateCallback = (update: StateUpdate) => void;
type SessionControlRef = React.MutableRefObject<{ isRunning: boolean }>;

/**
 * Runs a full project simulation based on the provided project data.
 * It iterates through milestones, assigns tasks to agents, and collects their outputs.
 * @param projectData The complete project plan.
 * @param agents The list of all available agents.
 * @param updateState A callback function to push state updates to the UI.
 * @param sessionControl A ref to check if the session should continue running.
 */
export async function runProjectSimulation(
  projectData: ProjectData,
  agents: Agent[],
  updateState: UpdateStateCallback,
  sessionControl: SessionControlRef
): Promise<void> {
    
  const allDeliverables: { milestone: string; agent: string; content: string }[] = [];
  const maestro = agents.find(a => a.role === 'Maestro')!;
  
  const sortedMilestones = sortMilestones(projectData.milestones);

  for (const milestone of sortedMilestones) {
    if (!sessionControl.current.isRunning) {
      updateState({ log: { role: 'Maestro', avatar: '👑', content: 'Project simulation stopped.' } });
      return;
    }

    updateState({
      log: { role: 'Maestro', avatar: '👑', content: `Starting Milestone: "${milestone.name}"` },
    });
    updateState({ milestoneStatus: { milestoneId: milestone.milestoneId, status: 'inprogress' } });

    const assignedAgents = agents.filter(a => milestone.assignedAgents.includes(a.agentId) || milestone.assignedAgents.includes(a.role));

    const agentPromises = assignedAgents.map(async (agent) => {
        if (!sessionControl.current.isRunning) return null;
        
        const taskDescription = `Contribute to '${milestone.name}': ${milestone.objective}`;
        updateState({ agentStatus: { agentId: agent.id, status: 'working', task: taskDescription } });

        const context = {
            mode: 'Project',
            agent,
            agents,
            userName: 'User',
            sessionGoal: projectData.goal,
            currentMilestone: milestone,
            lastTurns: [],
        };

        try {
            const response: AgentLLMResponse = await generateAgentResponse(context as any, "Generate your deliverable for the current milestone.", 0.7);
            
            updateState({ log: { role: agent.role, avatar: agent.avatar, content: response.text } });
            updateState({ agentStatus: { agentId: agent.id, status: 'done', task: null } });

            return {
                milestone: milestone.name,
                agent: agent.role,
                content: response.text
            };

        } catch (error) {
            console.error(`Error with agent ${agent.role}:`, error);
            const errorMessage = `Agent ${agent.role} encountered an error. Skipping task.`;
            updateState({ log: { role: 'Maestro', avatar: '👑', content: errorMessage } });
            updateState({ agentStatus: { agentId: agent.id, status: 'error', task: null } });
            return null;
        }
    });

    const results = await Promise.all(agentPromises);
    results.forEach(result => {
        if (result) {
            allDeliverables.push(result);
        }
    });
    
    if (sessionControl.current.isRunning) {
        updateState({ milestoneStatus: { milestoneId: milestone.milestoneId, status: 'done' } });
    }
  }

  if (sessionControl.current.isRunning) {
    updateState({ log: { role: 'Maestro', avatar: '👑', content: "All milestones complete. Synthesizing final document..." } });
    updateState({ agentStatus: { agentId: maestro.id, status: 'working', task: "Synthesizing final document" } });
    
    const combinedDeliverables = allDeliverables.map(d => `
--- START DELIVERABLE ---
Milestone: ${d.milestone}
Agent: ${d.agent}
Content:
${d.content}
--- END DELIVERABLE ---
    `).join('\n\n');

    try {
        const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY!);
        const model = ai.getGenerativeModel({
            model: maestro.model.modelName,
            systemInstruction: MAESTRO_PROJECT_PROMPTS.FINAL_SYNTHESIS.systemInstruction,
        });
        
        const streamResult = await model.generateContentStream(
            `Project Goal: ${projectData.goal}\n\nCombined Agent Deliverables:\n${combinedDeliverables}`
        );

        let finalDocumentText = '';
        for await (const chunk of streamResult.stream) {
            if (!sessionControl.current.isRunning) break;
            const chunkText = chunk.text();
            finalDocumentText += chunkText;
            updateState({ finalDocument: finalDocumentText });
        }

        if (sessionControl.current.isRunning) {
            updateState({ log: { role: 'Maestro', avatar: '👑', content: "Final project document generated." } });
        }

    } catch (error) {
         console.error(`Error with Maestro synthesis:`, error);
        const errorMessage = `Maestro encountered an error during final synthesis.`;
        updateState({ log: { role: 'Maestro', avatar: '👑', content: errorMessage } });
    } finally {
         updateState({ agentStatus: { agentId: maestro.id, status: 'done', task: null } });
    }
  }
}

function sortMilestones(milestones: Milestone[]): Milestone[] {
    const sorted: Milestone[] = [];
    const visited = new Set<string>();
    const milestoneMap = new Map(milestones.map(m => [m.milestoneId, m]));

    function visit(milestoneId: string) {
        if (visited.has(milestoneId)) return;
        visited.add(milestoneId);

        const milestone = milestoneMap.get(milestoneId);
        if (!milestone) return;

        milestone.dependencies.forEach(depId => {
            if (milestoneMap.has(depId)) {
                visit(depId);
            }
        });
        
        sorted.push(milestone);
    }

    milestones.forEach(m => {
        if (!visited.has(m.milestoneId)) {
            visit(m.milestoneId);
        }
    });

    return sorted;
}
