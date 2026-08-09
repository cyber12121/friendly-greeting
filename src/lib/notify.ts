import { toast } from 'sonner';

/**
 * Single place to surface AI failures to the learner.
 * The app keeps working with local fallback content, but the user is told.
 */
export function notifyAiFallback(what: string) {
  toast('Offline practice mode', {
    description: `The AI coach couldn't be reached for ${what}. You're seeing built-in practice content instead.`,
  });
}

export function notifyError(message: string) {
  toast.error(message);
}
