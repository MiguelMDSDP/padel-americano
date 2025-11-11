import { toast } from "sonner";

/**
 * Custom hook to use Sonner toast with a similar API to the old toast system
 */
export function useToastCustom() {
  return {
    toast: (message: string) => toast(message),
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
    loading: (message: string) => toast.loading(message),
    promise: toast.promise,
    dismiss: toast.dismiss,
  };
}
