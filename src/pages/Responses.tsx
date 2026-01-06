import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClipboardDocumentList, HiArrowDownTray } from 'react-icons/hi2';
import { responseService, type FormResponse } from '@/services/response.service';
import { agentService, type Agent } from '@/services/agent.service';
import { formService, type Form } from '@/services/form.service';
import { ResponseCard } from '@/components/responses/ResponseCard';
import { ResponsesTopbar } from '@/components/responses/ResponsesTopbar';
import { Button } from '@/components/ui/button';

import toast from 'react-hot-toast';

export default function Responses() {
    const navigate = useNavigate();
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

    // Multi-select & Export
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedResponseIds, setSelectedResponseIds] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [responsesData, agentsData, formsData] = await Promise.all([
                responseService.getAllResponses(),
                agentService.getAgents(),
                formService.getForms(),
            ]);
            setResponses(responsesData);
            setAgents(agentsData);
            setForms(formsData);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResponses = useMemo(() => {
        return responses.filter((response) => {
            const matchAgent = selectedAgentId
                ? response.filledBy?._id === selectedAgentId || response.agent_user_id === selectedAgentId
                : true;
            const matchForm = selectedFormId
                ? response.form_id === selectedFormId || response.form?._id === selectedFormId
                : true;
            return matchAgent && matchForm;
        });
    }, [responses, selectedAgentId, selectedFormId]);

    const toggleSelectionMode = () => {
        setIsSelecting(!isSelecting);
        setSelectedResponseIds([]);
    };

    const handleToggleSelect = (id: string) => {
        if (selectedFormId === null) {
            // It's recommended to filter by one form first to avoid mixed CSV structure,
            // but if api supports it or user wants it...
            // The API `exportSelectedFormResponses` requires `formId`.
            // So we MUST enforce single form selection IF we want to use that API.
            // But let's check: if user selects responses from mixed forms, we can't export easily with that API.
            // So maybe we prompt user to filter by form first?
        }

        setSelectedResponseIds((prev) =>
            prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        if (selectedResponseIds.length === 0) {
            toast.error('Select at least one response to export');
            return;
        }

        // Check if all selected responses belong to the same form
        // We need to find the formId for the selected responses.
        const selectedResponsesList = responses.filter(r => selectedResponseIds.includes(r._id));
        const firstFormId = selectedResponsesList[0]?.form_id;

        const distinctFormIds = new Set(selectedResponsesList.map(r => r.form_id));
        if (distinctFormIds.size > 1) {
            toast.error('Please select responses from only one form at a time for export.');
            return;
        }

        if (!firstFormId) {
            toast.error('Could not determine form ID');
            return;
        }

        try {
            setExporting(true);
            const blob = await formService.exportSelectedFormResponses(firstFormId, selectedResponseIds);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `responses-export.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            toast.success('Export downloaded successfully');
            setIsSelecting(false);
            setSelectedResponseIds([]);
        } catch (error) {
            console.error(error);
            toast.error('Failed to export responses');
        } finally {
            setExporting(false);
        }
    };

    const handleView = (response: FormResponse) => {
        // Navigate to response detail
        navigate(`/form/responses/${response._id}`);
    };

    const getAgentName = (userId?: string) => {
        if (!userId) return undefined;
        const agent = agents.find(a => a.userId === userId || a.user?._id === userId);
        return agent ? `${agent.firstName} ${agent.lastName}` : undefined;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Responses</h1>
                    <p className="text-muted-foreground">
                        View and manage form submissions from agents.
                    </p>
                </div>
                <div className="flex gap-2">
                    {isSelecting ? (
                        <>
                            <Button variant="ghost" onClick={toggleSelectionMode}>Cancel</Button>
                            <Button onClick={handleExport} disabled={exporting || selectedResponseIds.length === 0}>
                                {exporting ? 'Exporting...' : `Export (${selectedResponseIds.length})`}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={toggleSelectionMode}>
                            <HiArrowDownTray className="mr-2 h-4 w-4" />
                            Select & Export
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm dark:bg-zinc-950">
                <ResponsesTopbar
                    agents={agents}
                    forms={forms}
                    selectedAgentId={selectedAgentId}
                    selectedFormId={selectedFormId}
                    onAgentChange={setSelectedAgentId}
                    onFormChange={setSelectedFormId}
                    onClearFilters={() => {
                        setSelectedAgentId(null);
                        setSelectedFormId(null);
                    }}
                />
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : filteredResponses.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <HiOutlineClipboardDocumentList className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No responses found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mt-2">
                        {responses.length === 0
                            ? "Agents haven't submitted any responses yet."
                            : "Try adjusting filters to see more results."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResponses.map((response) => (
                        <ResponseCard
                            key={response._id}
                            response={response}
                            onView={handleView}
                            isSelecting={isSelecting}
                            isSelected={selectedResponseIds.includes(response._id)}
                            onToggleSelect={handleToggleSelect}
                            agentName={getAgentName(response.agent_user_id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
