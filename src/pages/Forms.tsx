import { useEffect, useState, useMemo } from 'react';
import { FormBlock } from '@/components/forms/FormBlock';
import { FormsTopbar } from '@/components/forms/FormsTopbar';
import { DeleteFormDialog } from '@/components/forms/DeleteFormDialog';
import { formService, type Form } from '@/services/form.service';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    loadForms();
  }, []);

  const filteredForms = useMemo(() => {
    if (selectedAgents.length === 0) {
      return forms;
    }
    return forms.filter((form) => {
      const assignedAgents = form.assignedAgents || [];
      return selectedAgents.some((agentId) => assignedAgents.includes(agentId));
    });
  }, [forms, selectedAgents]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const data = await formService.getForms();
      setForms(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (form: Form) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;

    try {
      setIsDeleting(true);
      const formId = formToDelete._id || formToDelete.id;
      if (!formId) {
        throw new Error('Form ID not found');
      }
      await formService.deleteForm(formId);
      toast.success('Form deleted successfully');
      setDeleteDialogOpen(false);
      setFormToDelete(null);
      await loadForms();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Forms</h1>
        <p className="text-muted-foreground">Manage your forms and view responses</p>
      </div>

      <FormsTopbar selectedAgents={selectedAgents} onAgentsChange={setSelectedAgents} />

      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {selectedAgents.length > 0 ? 'No forms found for selected agents' : 'No forms found'}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedAgents.length > 0 
              ? 'Try selecting different agents or clear the filter' 
              : 'Create your first form to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {filteredForms.map((form) => (
            <FormBlock key={form._id || form.id} form={form} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      <DeleteFormDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        form={formToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

