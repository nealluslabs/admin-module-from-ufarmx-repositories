import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { type Agent } from '@/services/agent.service';
import { type Form } from '@/services/form.service';

interface ResponsesTopbarProps {
    agents: Agent[];
    forms: Form[];
    selectedAgentId: string | null;
    selectedFormId: string | null;
    onAgentChange: (id: string | null) => void;
    onFormChange: (id: string | null) => void;
    onClearFilters: () => void;
}

export function ResponsesTopbar({
    agents,
    forms,
    selectedAgentId,
    selectedFormId,
    onAgentChange,
    onFormChange,
    onClearFilters,
}: ResponsesTopbarProps) {
    const hasFilters = !!selectedAgentId || !!selectedFormId;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 gap-4">
                <Select
                    value={selectedAgentId || 'all'}
                    onValueChange={(val) => onAgentChange(val === 'all' ? null : val)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Agent" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents.map((agent) => (
                            <SelectItem key={agent.userId || agent._id} value={agent.userId || agent._id}>
                                {agent.firstName} {agent.lastName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedFormId || 'all'}
                    onValueChange={(val) => onFormChange(val === 'all' ? null : val)}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Form" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Forms</SelectItem>
                        {forms.map((form) => (
                            <SelectItem key={form._id || form.id} value={form._id || form.id || 'unknown'}>
                                {form.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" onClick={onClearFilters}>
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
