import { useEffect, useState } from 'react';
import { agentService, type Agent } from '@/services/agent.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentFilterProps {
  selectedAgents: string[];
  onAgentsChange: (agentIds: string[]) => void;
}

export function AgentFilter({ selectedAgents, onAgentsChange }: AgentFilterProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await agentService.getAgents();
      console.log('Agents loaded:', data); // Debug log
      setAgents(data || []);
      
      if (data.length === 0) {
        console.warn('No agents found');
      }
    } catch (error: any) {
      console.error('Failed to load agents:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load agents';
      
      if (error?.response?.status === 403) {
        toast.error('You do not have permission to view agents');
      } else if (error?.response?.status === 401) {
        toast.error('Please log in to view agents');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAgent = (agentId: string) => {
    if (!selectedAgents.includes(agentId)) {
      onAgentsChange([...selectedAgents, agentId]);
    }
  };

  const handleRemoveAgent = (agentId: string) => {
    onAgentsChange(selectedAgents.filter((id) => id !== agentId));
  };

  const selectedAgentsData = agents.filter((agent) =>
    selectedAgents.includes(agent._id || agent.id || '')
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value=""
        onValueChange={handleSelectAgent}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={isLoading ? 'Loading agents...' : 'Select Agents'} />
        </SelectTrigger>
        <SelectContent>
          {agents
            .filter((agent) => !selectedAgents.includes(agent._id || agent.id || ''))
            .map((agent) => (
              <SelectItem
                key={agent._id || agent.id}
                value={agent._id || agent.id || ''}
              >
                {agent.firstName} {agent.lastName}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedAgentsData.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedAgentsData.map((agent) => (
            <Badge key={agent._id || agent.id} variant="secondary" className="gap-1">
              {agent.firstName} {agent.lastName}
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-secondary p-0.5"
                onClick={() => handleRemoveAgent(agent._id || agent.id || '')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

