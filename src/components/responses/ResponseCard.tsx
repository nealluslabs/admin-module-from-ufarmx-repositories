import { format } from 'date-fns';
import { HiOutlineDocumentText, HiOutlineUser, HiOutlineCalendar, HiEye } from 'react-icons/hi2';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type FormResponse } from '@/services/response.service';

interface ResponseCardProps {
    response: FormResponse;
    onView: (response: FormResponse) => void;
    isSelecting: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
    // Fallback agent name if filledBy is missing
    agentName?: string;
}

export function ResponseCard({
    response,
    onView,
    isSelecting,
    isSelected,
    onToggleSelect,
    agentName
}: ResponseCardProps) {
    return (
        <Card className={`relative transition-all hover:shadow-md ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}>
            {isSelecting && (
                <div className="absolute right-4 top-4 z-10">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect && onToggleSelect(response._id)}
                    />
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold line-clamp-1">
                            {response.form?.title || response.form_id}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            ID: {response._id.substring(response._id.length - 8)}
                        </CardDescription>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <HiOutlineDocumentText className="w-4 h-4" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground gap-2">
                    <HiOutlineUser className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                        {response.filledBy
                            ? `${response.filledBy.firstName} ${response.filledBy.lastName}`
                            : agentName || response.agent_user_id || 'Unknown Agent'}
                    </span>
                </div>
                <div className="flex items-center text-muted-foreground gap-2">
                    <HiOutlineCalendar className="w-4 h-4 shrink-0" />
                    <span>
                        {response.createdAt
                            ? format(new Date(response.createdAt), 'PPP p')
                            : 'Unknown Date'}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                {!isSelecting && (
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onView(response)}>
                        <HiEye className="w-4 h-4" />
                        View Details
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
