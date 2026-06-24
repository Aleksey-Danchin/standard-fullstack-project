import axios from 'axios';
import type { PublicUser } from '__prisma/types/public-user';
import { axiosLimitter } from './axiosLimitter';

export async function fetchUsers(): Promise<PublicUser[]> {
  const { data } = await axiosLimitter(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await axios.get<PublicUser[]>('/api/users')
  });

  return data;
}
