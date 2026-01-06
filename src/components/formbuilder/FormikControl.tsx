import { TextInput } from './inputfields/TextInput';
import { NumberInput } from './inputfields/NumberInput';
import { RadioButtons } from './inputfields/RadioButtons';
import { CheckBoxInput } from './inputfields/CheckBoxInput';

interface BaseFieldConfig {
  name: string;
  prompt: string;
  key?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

interface TextFieldConfig extends BaseFieldConfig {
  options?: never;
}

interface OptionsFieldConfig extends BaseFieldConfig {
  options: Array<{ key: string; value: string }>;
}

type FieldConfig = TextFieldConfig | OptionsFieldConfig;

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
      return <RadioButtons field={field as OptionsFieldConfig} />;
    case 'checkbox':
      return <CheckBoxInput field={field as OptionsFieldConfig} />;
    default:
      return null;
  }
}

