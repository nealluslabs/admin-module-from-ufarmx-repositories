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
  const [farmerRequiredFields, setFarmerRequiredFields] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: `Form ${Math.floor(Math.random() * 3000000)}`,
    description: '',
    isPublic: false,
    isFarmerForm: false,
    fields: [], 
    agents: [],
  });

  useEffect(() => {
    // Fetch required fields for farmer form validation
    const fetchRequiredFields = async () => {
      try {
        const fields = await formService.getFarmerFormRequiredFields();
        setFarmerRequiredFields(fields);
      } catch (error) {
        console.error('Failed to fetch required fields:', error);
      }
    };
    fetchRequiredFields();

    if (location.state?.form) {
      const form = location.state.form;
      const isDuplicate = location.state?.isDuplicate;
      
      setIsUpdating(!isDuplicate);
      setFormFields(form.fields || []);
      setSelectedAgents(form.agents || []);
      setFormData({
        _id: isDuplicate ? undefined : (form._id || form.id),
        id: isDuplicate ? undefined : (form.id || form._id),
        title: isDuplicate ? `${form.title} (Copy)` : form.title,
        description: form.description || '',
        isPublic: form.isPublic || false,
        isFarmerForm: form.isFarmerForm || false,
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

    // Re-validate farmer form when fields change
    if (formData.isFarmerForm && farmerRequiredFields.length > 0) {
      const formFieldNames = formFields
        .filter((f) => f.name && f.prompt)
        .map((f) => f.name!);
      const missingFields = farmerRequiredFields.filter(
        (requiredField) => !formFieldNames.includes(requiredField)
      );
      setValidationErrors(missingFields);
    }
  }, [formFields, selectedAgents, formData.isFarmerForm, farmerRequiredFields]);

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
    setValidationErrors([]);

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

    // Validate farmer form required fields
    if (formData.isFarmerForm) {
      const formFieldNames = formData.fields
        .filter((f) => f.name)
        .map((f) => f.name!);
      
      const missingFields = farmerRequiredFields.filter(
        (requiredField) => !formFieldNames.includes(requiredField)
      );

      if (missingFields.length > 0) {
        const errorMessage = `Farmer form is missing required fields: ${missingFields.join(', ')}`;
        setValidationErrors(missingFields);
        toast.error(errorMessage, { duration: 5000 });
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
        isFarmerForm: formData.isFarmerForm || false,
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
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save form';
      
      // Check if error contains missing fields information
      if (errorMessage.includes('missing required fields')) {
        // Extract missing fields from error message
        const match = errorMessage.match(/missing required fields: (.+)/i);
        if (match) {
          const missingFields = match[1].split(',').map((f: string) => f.trim());
          setValidationErrors(missingFields);
        }
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
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
        canAddFields={true}
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

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isFarmerForm">Farmer Creation Form</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this as the form used for creating farmers. Only one form can have this enabled.
                  </p>
                  {formData.isFarmerForm && validationErrors.length > 0 && (
                    <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm font-medium text-destructive mb-1">
                        Missing Required Fields:
                      </p>
                      <ul className="text-xs text-destructive/80 list-disc list-inside space-y-1">
                        {validationErrors.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Switch
                  id="isFarmerForm"
                  checked={formData.isFarmerForm || false}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, isFarmerForm: checked });
                    setValidationErrors([]);
                    // Re-validate when toggling
                    if (checked) {
                      setTimeout(() => {
                        const formFieldNames = formData.fields
                          .filter((f) => f.name)
                          .map((f) => f.name!);
                        const missingFields = farmerRequiredFields.filter(
                          (requiredField) => !formFieldNames.includes(requiredField)
                        );
                        if (missingFields.length > 0) {
                          setValidationErrors(missingFields);
                        }
                      }, 100);
                    }
                  }}
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
                      canEdit={true}
                      isUpdating={isUpdating}
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

