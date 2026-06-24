/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import axios from 'axios';
import pLimit from 'p-limit';
import { apiConfig } from './config';

const limit = pLimit(apiConfig.concurrency);
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
});

apiClient.defaults.adapter = (config) =>
  limit(() => defaultAdapter(config));
