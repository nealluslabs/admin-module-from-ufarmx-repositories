import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, Upload, Download, Eye, FileText, X } from 'lucide-react';
import { formService, type Form } from '@/services/form.service';
import { FieldEditor } from '@/components/formbuilder/FieldEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/utils/routes';
import { downloadFileFromBlob } from '@/utils/file-utils';
import toast from 'react-hot-toast';
import type { FormField } from '@/types/form';

export default function FormDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<Form | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (id) {
            loadForm(id);
        }
    }, [id]);

    const loadForm = async (formId: string) => {
        try {
            setIsLoading(true);
            const data = await formService.getForm(formId);
            setForm(data);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to load form');
            navigate(ROUTES.FORMS);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewResponses = () => {
        navigate(ROUTES.RESPONSES, {
            state: { formId: id },
        });
    };

    const handleDownloadTemplate = async () => {
        if (!id || !form) return;

        try {
            const blob = await formService.downloadFormResponseFormat(id);
            downloadFileFromBlob(blob, `${form.title}-response-format.csv`);
            toast.success('Template downloaded successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to download template');
        }
    };

    const handleDownloadResponses = async () => {
        if (!id || !form) return;

        try {
            const blob = await formService.exportFormResponses(id);
            downloadFileFromBlob(blob, `${form.title}-responses.csv`);
            toast.success('Responses downloaded successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to download responses');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadResponses = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        if (file.type !== 'text/csv') {
            toast.error('Please select a CSV file');
            setFile(null);
            return;
        }

        if (!id || isUploading) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('responsesFile', file);

            await formService.uploadFormResponses(id, formData);
            toast.success('Responses uploaded successfully');
            setFile(null);
            handleViewResponses();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to upload responses');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!form) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Form not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
                <div className="flex items-center gap-2">
                    <Badge variant={form.isPublic ? 'default' : 'secondary'}>
                        {form.isPublic ? 'Public' : 'Private'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Form Details & Fields */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Form Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                                    <p className="text-sm">{form.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
                                    <p className="text-sm">{(form as any).createdBy || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created On</h3>
                                    <p className="text-sm">
                                        {form.createdAt ? format(new Date(form.createdAt), 'PPP') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {(form as any).agentDetails && (form as any).agentDetails.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h3>
                                        <div className="space-y-1">
                                            {(form as any).agentDetails.map((agent: any, index: number) => (
                                                <p key={index} className="text-sm pl-4">
                                                    • {agent.firstName} {agent.lastName}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Form Fields */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Fields</CardTitle>
                            <CardDescription>
                                {form.fields?.length || 0} field{form.fields?.length !== 1 ? 's' : ''} in this form
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {form.fields && form.fields.length > 0 ? (
                                form.fields.map((field: FormField, index: number) => (
                                    <FieldEditor
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        onUpdate={() => { }}
                                        onDelete={() => { }}
                                        canDelete={false}
                                        canEdit={false}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No fields in this form
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Actions */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Form Actions</CardTitle>
                            <CardDescription>Manage form responses and data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                onClick={handleViewResponses}
                                className="w-full justify-start"
                                variant="default"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Responses
                            </Button>

                            <Button
                                onClick={handleDownloadResponses}
                                className="w-full justify-start"
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Responses CSV
                            </Button>

                            <Button
                                onClick={handleDownloadTemplate}
                                className="w-full justify-start"
                                variant="outline"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Download Form Template
                            </Button>

                            <Separator className="my-4" />

                            {/* File Upload Section */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground font-medium">Upload Responses</p>
                                        <p className="text-xs text-muted-foreground">CSV files only</p>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {file && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <p className="text-sm truncate">{file.name}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 flex-shrink-0"
                                                onClick={() => setFile(null)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setFile(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                onClick={handleUploadResponses}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Upload'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
