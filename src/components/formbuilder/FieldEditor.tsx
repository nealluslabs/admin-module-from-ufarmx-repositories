import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OptionsEditor } from './OptionsEditor';
import { cn } from '@/lib/utils';
import type { FormField } from '@/types/form';

interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canDelete?: boolean;
  canEdit?: boolean;
  isUpdating?: boolean;
}

export function FieldEditor({
  field,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canDelete = true,
  canEdit = true,
  isUpdating = false,
}: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(field.isExpanded ?? true);

  const transformName = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/ /g, '_')
      .toLowerCase();
  };

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handlePromptChange = (value: string) => {
    const updates: Partial<FormField> = { prompt: value || undefined };
    
    // Auto-generate field name from prompt only when creating new form (not updating)
    if (canEdit && !isUpdating && value) {
      updates.name = transformName(value);
    }
    
    updateField(updates);
  };

  const handleNameChange = (value: string) => {
    updateField({ name: value ? transformName(value) : undefined });
  };

  const typesWithOptions = ['radio', 'checkbox'];

  return (
    <Card className={cn('overflow-hidden', !isExpanded && 'border-muted')}>
      <CardHeader className="p-3 bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1">
              {onMoveUp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onMoveUp}
                  disabled={!canEdit}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              {onMoveDown && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onMoveDown}
                  disabled={!canEdit}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {field.prompt || `Field ${index + 1} (${field.key})`}
              </p>
              <p className="text-xs text-muted-foreground">{field.key}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={!canEdit}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`prompt-${field.id}`}>Prompt (Label)</Label>
            <Input
              id={`prompt-${field.id}`}
              value={field.prompt || ''}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Enter field label"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`name-${field.id}`}>Field Name (Unique)</Label>
            <Input
              id={`name-${field.id}`}
              value={field.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Auto-generated from prompt"
              disabled={!canEdit || isUpdating}
            />
            <p className="text-xs text-muted-foreground">
              {isUpdating 
                ? 'Field name cannot be changed when editing a form'
                : 'Used as the field identifier. Auto-generated from prompt.'}
            </p>
          </div>

          {typesWithOptions.includes(field.key) && (
            <OptionsEditor
              field={field}
              onUpdate={updateField}
              disabled={!canEdit || isUpdating}
            />
          )}

          <div className="space-y-3 pt-2 border-t">
            <Label>Settings</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.validations?.isRequired || false}
                  onCheckedChange={(checked) =>
                    updateField({
                      validations: {
                        ...field.validations,
                        isRequired: checked as boolean,
                      },
                    })
                  }
                  disabled={!canEdit}
                />
                <Label
                  htmlFor={`required-${field.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Required
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`readonly-${field.id}`}
                  checked={field.validations?.isReadOnly || false}
                  onCheckedChange={(checked) =>
                    updateField({
                      validations: {
                        ...field.validations,
                        isReadOnly: checked as boolean,
                      },
                    })
                  }
                  disabled={!canEdit || isUpdating}
                />
                <Label
                  htmlFor={`readonly-${field.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Read Only
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

