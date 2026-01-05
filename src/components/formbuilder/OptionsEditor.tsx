import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormField } from '@/types/form';

interface OptionsEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  disabled?: boolean;
}

export function OptionsEditor({ field, onUpdate, disabled = false }: OptionsEditorProps) {
  const [options, setOptions] = useState<Array<{ key: string; value: string }>>(
    field.options && field.options.length > 0 ? field.options : [{ key: '', value: '' }]
  );

  useEffect(() => {
    onUpdate({ options });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const addOption = () => {
    setOptions([...options, { key: '', value: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions.length > 0 ? newOptions : [{ key: '', value: '' }]);
  };

  const updateOption = (index: number, key: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { key, value };
    setOptions(newOptions);
  };

  const clearAll = () => {
    setOptions([{ key: '', value: '' }]);
  };

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Options</CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={disabled}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={option.key}
                    onChange={(e) =>
                      updateOption(index, e.target.value, option.value)
                    }
                    placeholder="Display text"
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input
                    value={option.value}
                    onChange={(e) =>
                      updateOption(index, option.key, e.target.value)
                    }
                    placeholder="Option value"
                    disabled={disabled}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(index)}
                disabled={disabled || options.length === 1}
                className="h-8 w-8 mt-6 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

