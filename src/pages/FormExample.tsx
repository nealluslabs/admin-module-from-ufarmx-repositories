import { FormContainer } from '@/components/formbuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Example usage of FormContainer
export default function FormExample() {
  const exampleFields = [
    {
      name: 'firstName',
      prompt: 'First Name',
      key: 'text',
      placeholder: 'Enter your first name',
    },
    {
      name: 'age',
      prompt: 'Age',
      key: 'number',
      placeholder: 'Enter your age',
    },
    {
      name: 'gender',
      prompt: 'Gender',
      key: 'radio',
      options: [
        { key: 'Male', value: 'male' },
        { key: 'Female', value: 'female' },
        { key: 'Other', value: 'other' },
      ],
    },
    {
      name: 'interests',
      prompt: 'Interests',
      key: 'checkbox',
      options: [
        { key: 'Technology', value: 'tech' },
        { key: 'Sports', value: 'sports' },
        { key: 'Music', value: 'music' },
        { key: 'Travel', value: 'travel' },
      ],
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    alert('Form submitted! Check console for values.');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Form Builder Example</CardTitle>
            <CardDescription>
              This is an example of using the FormContainer component with Formik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormContainer fields={exampleFields} onSubmit={handleSubmit}>
              <div className="mt-6 flex justify-end">
                <Button type="submit">Submit Form</Button>
              </div>
            </FormContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

