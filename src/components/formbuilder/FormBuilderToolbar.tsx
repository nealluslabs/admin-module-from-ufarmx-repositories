import { useState } from 'react';
import { Plus, Save, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INPUT_TYPES } from '@/utils/InputTypes';
import { cn } from '@/lib/utils';
import type { FormField } from '@/types/form';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderToolbarProps {
  onAddField: (field: FormField) => void;
  onSave: () => void;
  onGenerate?: () => void;
  isUpdating?: boolean;
  canAddFields?: boolean;
}

export function FormBuilderToolbar({
  onAddField,
  onSave,
  onGenerate,
  isUpdating = false,
  canAddFields = true,
}: FormBuilderToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddField = (fieldType: string) => {
    const field: FormField = {
      id: uuidv4(),
      key: fieldType,
      type: INPUT_TYPES[fieldType]?.name || fieldType,
      isExpanded: true,
      validations: {},
    };
    onAddField(field);
    setIsOpen(false);
  };

  if (isUpdating) {
    return (
      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="italic">
            Form has responses. You can only edit existing fields, not add new ones.
          </p>
        </div>
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Update Form
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-3">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={!canAddFields}>
              <Plus className="w-4 h-4 mr-2" />
              New Field
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {Object.entries(INPUT_TYPES).map(([key, config]) => {
              const IconComponent = config.Icon;
              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleAddField(key)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {IconComponent && <IconComponent className="w-4 h-4" />}
                  <span>{config.name}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {onGenerate && (
          <Button variant="outline" onClick={onGenerate}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Form
          </Button>
        )}
      </div>

      <Button onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />
        Save Form
      </Button>
    </div>
  );
}

