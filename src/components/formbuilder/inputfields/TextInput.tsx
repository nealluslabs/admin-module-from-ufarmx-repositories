import { Field } from 'formik';
import { Input } from '@/components/ui/input';
import { InputContainer } from '../InputContainer';
import { InputLabel } from '../InputLabel';

interface FieldConfig {
  name: string;
  prompt: string;
  key?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

interface TextInputProps {
  field: FieldConfig;
}

export function TextInput({ field }: TextInputProps) {
  return (
    <InputContainer>
      <InputLabel text={field.prompt} htmlFor={field.name} />
      <Field name={field.name}>
        {({ field: formikField, meta }: any) => (
          <>
            <Input
              id={field.name}
              type="text"
              placeholder={field.placeholder}
              {...formikField}
              className={meta.error && meta.touched ? 'border-destructive' : ''}
            />
            {meta.error && meta.touched && (
              <p className="text-sm text-destructive">{meta.error}</p>
            )}
          </>
        )}
      </Field>
    </InputContainer>
  );
}

