import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import { AgentFilter } from './AgentFilter';

interface FormsTopbarProps {
  selectedAgents: string[];
  onAgentsChange: (agentIds: string[]) => void;
}

export function FormsTopbar({ selectedAgents, onAgentsChange }: FormsTopbarProps) {
  return (
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="flex-1">
        <AgentFilter selectedAgents={selectedAgents} onAgentsChange={onAgentsChange} />
      </div>
      <Link to={ROUTES.ADD_FORM}>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Form
        </Button>
      </Link>
    </div>
  );
}

