import { Form, Formik } from 'formik';
import { FormikControl } from './FormikControl';

interface FieldConfig {
  name: string;
  prompt: string;
  key: string;
  type?: string;
  options?: Array<{ key: string; value: string }>;
  required?: boolean;
  placeholder?: string;
}

type FormValues = Record<string, any>;

interface FormContainerProps {
  fields: FieldConfig[];
  initialValues?: FormValues;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  enableReinitialize?: boolean;
  children?: React.ReactNode;
}

export function FormContainer({
  fields,
  initialValues,
  onSubmit,
  enableReinitialize = true,
  children,
}: FormContainerProps) {
  // Generate initial values from fields if not provided
  const getInitialValues = (): FormValues => {
    if (initialValues) {
      return initialValues;
    }

    const values: FormValues = {};
    fields.forEach((field) => {
      if (field.name) {
        if (field.key === 'checkbox') {
          values[field.name] = [];
        } else {
          values[field.name] = '';
        }
      }
    });
    return values;
  };

  const handleSubmit = (values: FormValues) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Formik
      initialValues={getInitialValues()}
      onSubmit={handleSubmit}
      enableReinitialize={enableReinitialize}
    >
      {() => (
        <Form>
          {fields.map(
            (field) =>
              field.name && (
                <FormikControl key={field.name} type={field.key} field={field} />
              )
          )}
          {children}
        </Form>
      )}
    </Formik>
  );
}

