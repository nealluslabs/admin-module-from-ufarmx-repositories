import type { Agent } from '@/services/agent.service';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    HiEllipsisVertical,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiOutlineClipboardDocumentList,
    HiOutlineDocumentText
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

interface AgentCardProps {
    agent: Agent;
    onDelete: (agent: Agent) => void;
    isDeleting?: boolean;
}

export function AgentCard({ agent, onDelete, isDeleting }: AgentCardProps) {
    const navigate = useNavigate();

    // Generate avatar URL (using UI Avatars as in old app)
    const avatarUrl = `https://ui-avatars.com/api/?name=${agent.firstName}+${agent.lastName}&background=0D8ABC&color=fff&size=128`;

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                        <img
                            src={avatarUrl}
                            alt={`${agent.firstName} ${agent.lastName}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-none">
                            {agent.firstName} {agent.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{agent.user?.email || agent.email}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HiEllipsisVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/agent/edit/${agent._id}`)}>
                            Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(agent)}
                        >
                            Delete Agent
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <HiOutlinePhone className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="break-all">{agent.phoneNumber || 'No phone'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <HiOutlineMapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="break-words">{agent.location || 'No location'}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/50 p-4">
                <div className="flex w-full items-center justify-around">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                            <HiOutlineDocumentText className="h-4 w-4" />
                            <span className="text-xs font-medium">FORMS</span>
                        </div>
                        <span className="text-lg font-semibold">{agent.forms?.length || 0}</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                            <HiOutlineClipboardDocumentList className="h-4 w-4" />
                            <span className="text-xs font-medium">RESPONSES</span>
                        </div>
                        <span className="text-lg font-semibold">{agent.responses?.length || 0}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
