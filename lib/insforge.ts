import { createClient } from '@insforge/sdk';

// These would typically be in .env.local
const INSFORGE_URL = 'https://8f65zx5p.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_bf483a886db9caae5e8efffe50df9bd2';

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_KEY
});
