
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type FormResponse } from '@/services/response.service';
import { Loader2 } from 'lucide-react';

interface ResponseEditorProps {
    response: FormResponse;
    onSave: (data: Record<string, any>) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

export function ResponseEditor({ response, onSave, onCancel, isSaving }: ResponseEditorProps) {
    const fields = response.form?.fields || [];
    const defaultValues = response.responseObject || {};

    const { register, handleSubmit } = useForm({
        defaultValues
    });

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
                {fields.map((field: any, index: number) => (
                    <div key={index} className="space-y-2">
                        <Label htmlFor={field.name}>
                            {index + 1}. {field.prompt || field.label || field.name}
                        </Label>

                        {/* Simple Dynamic Field Rendering */}
                        {(field.key === 'text' || !field.key) && (
                            <Input
                                id={field.name}
                                {...register(field.name)}
                                placeholder="Enter Answer"
                            />
                        )}
                        {field.key === 'number' && (
                            <Input
                                id={field.name}
                                type="number"
                                {...register(field.name)}
                                placeholder="Enter Number"
                            />
                        )}
                        {field.key === 'gps' && (
                            <Input
                                id={field.name}
                                {...register(field.name)}
                                placeholder="lat, lng"
                            />
                        )}

                        {/* Fallback for other types to Input for now (Radio, Checkbox could be complex strings in DB) */}
                        {['radio', 'checkbox', 'image'].includes(field.key) && (
                            <Input
                                id={field.name}
                                {...register(field.name)}
                                placeholder={`Enter ${field.key} value`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 sticky bottom-4 bg-background p-4 border-t">
                <Button variant="outline" type="button" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
