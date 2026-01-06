import { useNavigate } from 'react-router-dom';
import { FiEdit } from 'react-icons/fi';
import { AiOutlineFolderView, AiOutlineEye, AiOutlineDelete } from 'react-icons/ai';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/utils/routes';
import type { Form } from '@/services/form.service';
import { cn } from '@/lib/utils';

interface FormBlockProps {
  form: Form;
  onDelete: (form: Form) => void;
}

export function FormBlock({ form, onDelete }: FormBlockProps) {
  const navigate = useNavigate();
  const maxLength = 100;
  const formId = form._id || form.id || '';

  const truncatedDescription = form.description
    ? form.description.length > maxLength
      ? `${form.description.substring(0, maxLength)}...`
      : form.description
    : '';

  const handleViewForm = () => {
    navigate(ROUTES.FORM_DETAIL.replace(':id', formId));
  };

  const handleEditForm = () => {
    navigate(ROUTES.ADD_FORM, {
      state: { form },
    });
  };

  const handleViewResponses = () => {
    navigate(ROUTES.RESPONSES, {
      state: { formId },
    });
  };

  const actions = [
    {
      icon: <AiOutlineEye className="w-5 h-5" />,
      label: 'View Form',
      onClick: handleViewForm,
    },
    {
      icon: <FiEdit className="w-5 h-5" />,
      label: 'Edit Form',
      onClick: handleEditForm,
    },
    {
      icon: <AiOutlineFolderView className="w-5 h-5" />,
      label: 'View Responses',
      onClick: handleViewResponses,
    },
    {
      icon: <AiOutlineDelete className="w-5 h-5" />,
      label: 'Delete Form',
      onClick: () => onDelete(form),
      variant: 'destructive' as const,
    },
  ];

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="line-clamp-2 text-lg font-bold">{form.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {truncatedDescription || 'No description'}
        </p>
      </CardContent>
      <CardFooter className="bg-primary/5 p-3 gap-1 border-t">
        {actions.map((action, index) => (
          <div
            key={index}
            className="group relative flex-1 flex items-center justify-center cursor-pointer hover:bg-white rounded-md p-2 transition-all duration-200 hover:flex-[1.2]"
            onClick={action.onClick}
            title={action.label}
          >
            <div className={cn(
              'text-lg transition-colors',
              action.variant === 'destructive' 
                ? 'text-destructive group-hover:text-destructive' 
                : 'text-primary group-hover:text-primary'
            )}>
              {action.icon}
            </div>
            <span className="hidden group-hover:inline-block absolute left-full ml-2 text-xs font-medium whitespace-nowrap bg-background border rounded px-2 py-1 shadow-sm z-10">
              {action.label}
            </span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}

