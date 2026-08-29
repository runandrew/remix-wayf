export const formErrors = {
  name: "Enter a name.",
  create: "Could not create. Try again.",
  save: "Could not save. Try again.",
} as const;

export type FormErrorKey = keyof typeof formErrors;

export function formErrorMessage(key: string | null): string | undefined {
  if (key && key in formErrors) {
    return formErrors[key as FormErrorKey];
  }
  return undefined;
}
