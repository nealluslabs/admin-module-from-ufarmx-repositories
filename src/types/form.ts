export interface FormField {
  id: string;
  key: string; // 'text', 'number', 'radio', 'checkbox'
  type?: string;
  name?: string;
  prompt?: string;
  options?: Array<{ key: string; value: string }>;
  validations?: {
    isRequired?: boolean;
    isReadOnly?: boolean;
  };
  isExpanded?: boolean;
}

export interface FormData {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  isPublic?: boolean;
  isFarmerForm?: boolean;
  fields: FormField[];
  agents?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormGenerationInput {
  formAim: string;
  numberOfQuestions: number;
}

