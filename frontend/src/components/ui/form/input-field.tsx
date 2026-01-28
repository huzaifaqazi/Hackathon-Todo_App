import * as React from "react";
import { Label } from "../label";
import { Input } from "../input";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          ref={ref}
          className={error ? `${className} border-red-500` : className}
          {...props}
        />
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
InputField.displayName = "InputField";

export { InputField };