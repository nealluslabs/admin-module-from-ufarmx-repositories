import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormBuilderToolbar } from '@/components/formbuilder/FormBuilderToolbar';
import { FieldEditor } from '@/components/formbuilder/FieldEditor';
import { FormContainer } from '@/components/formbuilder/FormContainer';
import { AgentFilter } from '@/components/forms/AgentFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formService } from '@/services/form.service';
import { ROUTES } from '@/utils/routes';
import toast from 'react-hot-toast';
import type { FormData, FormField } from '@/types/form';

export default function AddForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: `Form ${Math.floor(Math.random() * 3000000)}`,
    description: '',
    isPublic: false,
    fields: [],
    agents: [],
  });

  useEffect(() => {
    if (location.state?.form) {
      const form = location.state.form;
      setIsUpdating(true);
      setFormFields(form.fields || []);
      setSelectedAgents(form.agents || []);
      setFormData({
        _id: form._id || form.id,
        id: form.id || form._id,
        title: form.title,
        description: form.description || '',
        isPublic: form.isPublic || false,
        fields: form.fields || [],
        agents: form.agents || [],
      });
    }
  }, [location.state]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fields: formFields.filter((f) => f.name && f.prompt),
      agents: selectedAgents,
    }));
  }, [formFields, selectedAgents]);

  const handleAddField = (field: FormField) => {
    setFormFields([...formFields, field]);
  };

  const handleUpdateField = (index: number, updatedField: FormField) => {
    const newFields = [...formFields];
    newFields[index] = updatedField;
    setFormFields(newFields);
  };

  const handleDeleteField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFormFields(newFields);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Please enter a form title');
      return false;
    }

    if (formData.fields.length === 0) {
      toast.error('Please add at least one field to the form');
      return false;
    }

    // Validate fields with options (radio/checkbox)
    const typesWithOptions = ['radio', 'checkbox'];
    const fieldsWithOptions = formData.fields.filter((f) =>
      typesWithOptions.includes(f.key)
    );

    for (const field of fieldsWithOptions) {
      if (!field.options || field.options.length === 0) {
        toast.error(
          `Field "${field.prompt || field.name || 'Untitled'}" must have at least one option`
        );
        return false;
      }

      const hasEmptyOptions = field.options.some(
        (opt) => !opt.key || opt.key.trim() === '' || !opt.value || opt.value.trim() === ''
      );

      if (hasEmptyOptions) {
        toast.error(
          `Field "${field.prompt || field.name || 'Untitled'}" has incomplete options. Please fill in all option labels and values`
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // Prepare form data for API
      const formPayload = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic || false,
        fields: formData.fields.map((field) => ({
          id: field.id,
          key: field.key,
          name: field.name,
          prompt: field.prompt,
          type: field.key,
          options: field.options,
          validations: field.validations,
        })),
        agents: selectedAgents,
      };

      if (isUpdating && formData._id) {
        await formService.updateForm(formData._id, formPayload);
        toast.success('Form updated successfully');
        navigate(ROUTES.FORM_DETAIL.replace(':id', formData._id));
      } else {
        await formService.createForm(formPayload);
        toast.success('Form created successfully');
        navigate(ROUTES.FORMS);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save form');
    }
  };

  const handleGenerate = () => {
    // TODO: Implement AI form generation
    toast('AI form generation coming soon', { icon: 'ℹ️' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {isUpdating ? 'Edit Form' : 'Create New Form'}
        </h1>
        <p className="text-muted-foreground">
          {isUpdating
            ? 'Edit your form fields and settings'
            : 'Build your form by adding fields and configuring options'}
        </p>
      </div>

      <FormBuilderToolbar
        onAddField={handleAddField}
        onSave={handleSave}
        onGenerate={handleGenerate}
        isUpdating={isUpdating}
        canAddFields={!isUpdating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Builder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter form title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter form description"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Make Form Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow all agents to access this form
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublic: checked })
                  }
                />
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label>Assign to Agents</Label>
                <AgentFilter
                  selectedAgents={selectedAgents}
                  onAgentsChange={setSelectedAgents}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              {formFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No fields added yet</p>
                  <p className="text-sm">Click "New Field" to add your first field</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formFields.map((field, index) => (
                    <FieldEditor
                      key={field.id}
                      field={field}
                      index={index}
                      onUpdate={(updatedField) =>
                        handleUpdateField(index, updatedField)
                      }
                      onDelete={() => handleDeleteField(index)}
                      onMoveUp={index > 0 ? () => handleMoveField(index, 'up') : undefined}
                      onMoveDown={
                        index < formFields.length - 1
                          ? () => handleMoveField(index, 'down')
                          : undefined
                      }
                      canDelete={!isUpdating}
                      canEdit={!isUpdating}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)]">
              {formFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Preview will appear here</p>
                  <p className="text-sm">Add fields to see the preview</p>
                </div>
              ) : (
                <FormContainer fields={formFields.filter((f): f is FormField & { name: string; prompt: string } => !!f.name && !!f.prompt)} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

