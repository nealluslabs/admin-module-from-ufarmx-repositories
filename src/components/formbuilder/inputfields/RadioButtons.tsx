import { Field } from 'formik';
import { InputContainer } from '../InputContainer';
import { InputLabel } from '../InputLabel';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Option {
  key: string;
  value: string;
}

interface FieldConfig {
  name: string;
  prompt: string;
  options: Option[];
  key?: string;
  type?: string;
  required?: boolean;
}

interface RadioButtonsProps {
  field: FieldConfig;
}

export function RadioButtons({ field }: RadioButtonsProps) {
  const { options, name, prompt } = field;

  return (
    <InputContainer>
      <InputLabel text={prompt} htmlFor={name} />
      <Field name={name}>
        {({ field: formikField, meta }: any) => (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${name}-${option.value}`}
                    {...formikField}
                    value={option.value}
                    checked={formikField.value === option.value}
                    onChange={() => formikField.onChange({ target: { name, value: option.value } })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.key}
                  </Label>
                </div>
              ))}
            </div>
            {meta.error && meta.touched && (
              <p className="text-sm text-destructive">{meta.error}</p>
            )}
          </div>
        )}
      </Field>
    </InputContainer>
  );
}

