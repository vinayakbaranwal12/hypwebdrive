import {useQuery} from '@tanstack/react-query';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {User} from '../user';
import {apiClient, queryClient} from '../../http/query-client';

export interface FetchUseUserResponse extends BackendResponse {
  user: User;
}

interface Params {
  with: string[];
}

type UserId = number | string | 'me';
const endpoint = (id: UserId) => `users/${id}`;

export function useUser(id: UserId, params?: Params) {
  return useQuery([endpoint(id)], () => fetchUser(id, params));
}

function fetchUser(id: UserId, params?: Params): Promise<FetchUseUserResponse> {
  return apiClient.get(endpoint(id), {params}).then(response => response.data);
}

export function invalidateUseUserQuery(id: UserId) {
  queryClient.invalidateQueries([endpoint(id)]);
}
