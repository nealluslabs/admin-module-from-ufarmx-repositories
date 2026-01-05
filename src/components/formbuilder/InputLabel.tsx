import { Label } from '@/components/ui/label';

interface InputLabelProps {
  text: string;
  htmlFor: string;
}

export function InputLabel({ text, htmlFor }: InputLabelProps) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {text}
    </Label>
  );
}

