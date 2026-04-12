import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';


// const isNeonLocal = process.env.NEON_LOCAL === 'true';

// if (isNeonLocal) {
//   const neonLocalHost = process.env.NEON_LOCAL_HOST || 'localhost';
//   const neonLocalPort = process.env.NEON_LOCAL_PORT || '5432';

//   neonConfig.fetchEndpoint = `http://${neonLocalHost}:${neonLocalPort}/sql`;
//   neonConfig.useSecureWebSocket = false;
//   neonConfig.poolQueryViaFetch = true;
// }
if(process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not configured');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
