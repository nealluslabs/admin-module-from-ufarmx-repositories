import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiMagnifyingGlass, HiOutlineUsers } from 'react-icons/hi2';
import { agentService, type Agent } from '@/services/agent.service';
import { AgentCard } from '@/components/agents/AgentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ROUTES } from '@/utils/routes';
import toast from 'react-hot-toast';

export default function Agents() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await agentService.getAgents();
            setAgents(data);
        } catch (error) {
            toast.error('Failed to fetch agents');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickDelete = (agent: Agent) => {
        setAgentToDelete(agent);
    };

    const confirmDelete = async () => {
        if (!agentToDelete) return;

        try {
            setDeletingId(agentToDelete._id);
            await agentService.deleteAgent(agentToDelete._id);
            toast.success('Agent deleted successfully');
            setAgents((prev) => prev.filter((a) => a._id !== agentToDelete._id));
        } catch (error) {
            toast.error('Failed to delete agent');
            console.error(error);
        } finally {
            setDeletingId(null);
            setAgentToDelete(null);
        }
    };

    const filteredAgents = agents.filter((agent) => {
        const query = searchQuery.toLowerCase();
        return (
            agent.firstName.toLowerCase().includes(query) ||
            agent.lastName.toLowerCase().includes(query) ||
            (agent.user?.email || agent.email || '').toLowerCase().includes(query) ||
            (agent.phoneNumber || '').includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
                    <p className="text-muted-foreground">
                        Manage your field agents and view their performance.
                    </p>
                </div>
                <Button onClick={() => navigate(ROUTES.ADD_AGENT)} className="w-full sm:w-auto">
                    <HiPlus className="mr-2 h-4 w-4" />
                    Add Agent
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border shadow-sm dark:bg-zinc-950">
                <HiMagnifyingGlass className="h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search agents by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 px-0 h-auto text-base"
                />
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : filteredAgents.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <HiOutlineUsers className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No agents found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-2">
                        {searchQuery
                            ? `No agents matching "${searchQuery}"`
                            : "Get started by creating your first agent."}
                    </p>
                    {!searchQuery && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => navigate(ROUTES.ADD_AGENT)}
                        >
                            Add Agent
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAgents.map((agent) => (
                        <AgentCard
                            key={agent._id}
                            agent={agent}
                            onDelete={handleClickDelete}
                            isDeleting={deletingId === agent._id}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Agent</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">{agentToDelete?.firstName} {agentToDelete?.lastName}</span>?
                            This action cannot be undone and will remove their access to the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAgentToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={!!deletingId}>
                            {deletingId ? 'Deleting...' : 'Delete Agent'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
