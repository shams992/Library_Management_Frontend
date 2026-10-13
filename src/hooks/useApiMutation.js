import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Wraps mutations with consistent toasts + automatic cache invalidation.
 * Errors are surfaced exactly as the API returns them (never a raw stack).
 */
export const useApiMutation = ({ mutationFn, invalidate = [], successMessage, onSuccess, errorMessage, ...rest }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      (Array.isArray(invalidate) ? invalidate : [invalidate]).filter(Boolean).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });
      const message = typeof successMessage === 'function' ? successMessage(data) : successMessage ?? data?.message;
      if (message) toast.success(message);
      onSuccess?.(data, variables, context);
    },
    onError: (error) => {
      const message = errorMessage || error?.message || 'Something went wrong';
      toast.error(message, {
        description: error?.errors?.length ? error.errors.map((e) => e.message).join(' • ') : undefined,
      });
    },
    ...rest,
  });
};
