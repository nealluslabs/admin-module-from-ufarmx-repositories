import { TextInput } from './inputfields/TextInput';
import { NumberInput } from './inputfields/NumberInput';
import { RadioButtons } from './inputfields/RadioButtons';
import { CheckBoxInput } from './inputfields/CheckBoxInput';

interface FieldConfig {
  name: string;
  prompt: string;
  key: string;
  type?: string;
  options?: Array<{ key: string; value: string }>;
  required?: boolean;
  placeholder?: string;
}

interface FormikControlProps {
  type: string;
  field: FieldConfig;
}

export function FormikControl({ type, field }: FormikControlProps) {
  if (!field.name) {
    return null;
  }

  switch (type) {
    case 'text':
      return <TextInput field={field} />;
    case 'number':
      return <NumberInput field={field} />;
    case 'radio':
      return <RadioButtons field={field} />;
    case 'checkbox':
      return <CheckBoxInput field={field} />;
    default:
      return null;
  }
}

