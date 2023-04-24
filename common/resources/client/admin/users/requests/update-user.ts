import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {User} from '../../../auth/user';
import {BackendResponse} from '../../../http/backend-response/backend-response';
import {toast} from '../../../ui/toast/toast';
import {apiClient, queryClient} from '../../../http/query-client';
import {DatatableDataQueryKey} from '../../../datatable/requests/paginated-resources';
import {onFormQueryError} from '../../../errors/on-form-query-error';
import {message} from '../../../i18n/message';
import {useNavigate} from '../../../utils/hooks/use-navigate';
import {invalidateUseUserQuery} from '../../../auth/ui/use-user';

interface Response extends BackendResponse {
  user: User;
}

export interface UpdateUserPayload
  extends Omit<Partial<User>, 'email_verified_at'> {
  email_verified_at?: boolean;
  id: number;
}

export function useUpdateUser(form: UseFormReturn<UpdateUserPayload>) {
  const navigate = useNavigate();
  return useMutation((props: UpdateUserPayload) => updateUser(props), {
    onSuccess: (response, props) => {
      toast(message('User updated'));
      queryClient.invalidateQueries([DatatableDataQueryKey('users')]);
      invalidateUseUserQuery(props.id);
      navigate('/admin/users');
    },
    onError: r => onFormQueryError(r, form),
  });
}

function updateUser({id, ...other}: UpdateUserPayload): Promise<Response> {
  if (other.roles) {
    other.roles = other.roles.map(r => r.id) as any;
  }
  return apiClient.put(`users/${id}`, other).then(r => r.data);
}
