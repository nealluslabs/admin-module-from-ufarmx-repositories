import { Field } from 'formik';
import { InputContainer } from '../InputContainer';
import { InputLabel } from '../InputLabel';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

interface CheckBoxInputProps {
  field: FieldConfig;
}

export function CheckBoxInput({ field }: CheckBoxInputProps) {
  const { options, name, prompt } = field;

  return (
    <InputContainer>
      <InputLabel text={prompt} htmlFor={name} />
      <Field name={name}>
        {({ field: formikField, meta, form }: any) => {
          const handleChange = (optionValue: string, checked: boolean) => {
            const currentValue = formikField.value || [];
            if (checked) {
              form.setFieldValue(name, [...currentValue, optionValue]);
            } else {
              form.setFieldValue(
                name,
                currentValue.filter((val: string) => val !== optionValue)
              );
            }
          };

          return (
            <div className="flex flex-col gap-2">
              {options.map((option) => {
                const isChecked = (formikField.value || []).includes(option.value);
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${name}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleChange(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`${name}-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.key}
                    </Label>
                  </div>
                );
              })}
              {meta.error && meta.touched && (
                <p className="text-sm text-destructive">{meta.error}</p>
              )}
            </div>
          );
        }}
      </Field>
    </InputContainer>
  );
}

