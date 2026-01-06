import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { HiOutlineCalendar, HiOutlineUser, HiPencil, HiTrash, HiArrowLeft } from 'react-icons/hi2';
import { responseService, type FormResponse } from '@/services/response.service';
import { ResponseViewer } from '@/components/responses/ResponseViewer';
import { ResponseEditor } from '@/components/responses/ResponseEditor';
import { ResponseAnalysis } from '@/components/responses/ResponseAnalysis';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

export default function ResponseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [response, setResponse] = useState<FormResponse | null>(null);
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (responseId: string) => {
        try {
            setIsLoading(true);
            const [resData, analysisData] = await Promise.all([
                responseService.getResponseById(responseId),
                responseService.getResponseAnalysis(responseId).catch(() => []) // Handle 404/error gracefully
            ]);
            setResponse(resData);
            setAnalysis(analysisData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load response details');
            navigate(ROUTES.RESPONSES);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (data: Record<string, any>) => {
        if (!response || !id) return;
        try {
            setIsSaving(true);
            const updated = await responseService.updateResponse(id, { responseObject: data });
            setResponse(updated);
            setIsEditing(false);
            toast.success('Response updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update response');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            setIsDeleting(true);
            await responseService.deleteResponse(id);
            toast.success('Response deleted successfully');
            navigate(ROUTES.RESPONSES);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Failed to delete response');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!id) return;
        try {
            setIsAnalysisLoading(true);
            // Optimistic update? No, let's wait for stream/response.
            // We send { newChat: false, message: ... } ? 
            // BE controller expects `newChat` but payload is `{newChat: boolean}`?
            // Old code: `chat = { newChat }` (where newChat was state string).
            // Wait, let's check old code `addNewChat`:
            // `const chat = { newChat };` (newChat is string input).
            // `analyseResponseById(id, chat)`
            // New controller: `req.body.newChat` (boolean)? 
            // Swagger says `newChat (boolean)`.
            // BUT `analyzeResponse` controller:
            // `const { newChat = false, message } = req.body;`
            // So I should send `message`.
            const res = await responseService.analyzeResponse(id, { newChat: false, message });
            setAnalysis(res);
        } catch (error) {
            console.error(error);
            toast.error('Failed to analyze response');
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!id) return;
        if (!confirm('Are you sure you want to clear the analysis history?')) return;
        try {
            await responseService.deleteResponseAnalysis(id);
            setAnalysis([]);
            toast.success('Chat history cleared');
        } catch (error) {
            console.error(error);
            toast.error('Failed to clear chat');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!response) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="-ml-3" onClick={() => navigate(ROUTES.RESPONSES)}>
                            <HiArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {response.form?.title || response.form_id}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <HiOutlineUser className="w-4 h-4" />
                            {response.filledBy
                                ? `${response.filledBy.firstName} ${response.filledBy.lastName}`
                                : `Agent ${response.agent_user_id || 'Unknown'}`
                            }
                        </div>
                        <div className="flex items-center gap-1">
                            <HiOutlineCalendar className="w-4 h-4" />
                            {response.createdAt ? format(new Date(response.createdAt), 'PPP p') : 'Unknown Date'}
                        </div>
                        <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                            ID: {response._id}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <HiPencil className="w-4 h-4 mr-2" />
                                Edit Response
                            </Button>
                            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                                <HiTrash className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Response Content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {isEditing ? (
                        <ResponseEditor
                            response={response}
                            onSave={handleUpdate}
                            onCancel={() => setIsEditing(false)}
                            isSaving={isSaving}
                        />
                    ) : (
                        <ResponseViewer response={response} />
                    )}
                </div>

                {/* Right Column: AI Analysis (1 col) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ResponseAnalysis
                            analysis={analysis}
                            onSendMessage={handleSendMessage}
                            onClearChat={handleClearChat}
                            isLoading={isAnalysisLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Response</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this response? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
