export function FormError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="w-full text-sm text-destructive">
      {message}
    </p>
  );
}
