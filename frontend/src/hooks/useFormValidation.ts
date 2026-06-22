import { useState } from "react";

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (
    fields: Record<string, string>,
    validators: Record<string, (value: string) => string | null>
  ): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    for (const [field, value] of Object.entries(fields)) {
      const validator = validators[field];
      if (validator) {
        const error = validator(value);
        if (error) {
          newErrors[field] = error;
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const clearAll = () => setErrors({});

  return { errors, validate, clearError, clearAll };
}
