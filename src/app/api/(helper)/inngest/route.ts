import { serve } from 'inngest/next';
import inngest from '../../../src/inngest/client';
import { checkAndSendReminders } from '../../../src/inngest/functions/checkAndSendReminders';

export const { GET, POST } = serve({
  client: inngest,
  functions: [checkAndSendReminders],
}); 