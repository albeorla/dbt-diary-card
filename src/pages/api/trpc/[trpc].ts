import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { createNextApiHandler } from '@trpc/server/adapters/next';

import { env } from '~/env';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

// export API handler
const handler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
        }
      : undefined,
});

export default function trpcHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): void | Promise<void> {
  return (handler as unknown as NextApiHandler)(req, res) as unknown as void | Promise<void>;
}
