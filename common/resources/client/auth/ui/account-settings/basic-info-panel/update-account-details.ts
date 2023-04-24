import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {toast} from '../../../../ui/toast/toast';
import {BackendResponse} from '../../../../http/backend-response/backend-response';
import {onFormQueryError} from '../../../../errors/on-form-query-error';
import {User} from '../../../user';
import {message} from '../../../../i18n/message';
import {apiClient} from '../../../../http/query-client';

interface Response extends BackendResponse {}

interface Payload {
  first_name?: string;
  last_name?: string;
}

export function useUpdateAccountDetails(form: UseFormReturn<Partial<User>>) {
  return useMutation((props: Payload) => updateAccountDetails(props), {
    onSuccess: () => {
      toast(message('Updated account details'));
    },
    onError: r => onFormQueryError(r, form),
  });
}

function updateAccountDetails(payload: Payload): Promise<Response> {
  return apiClient.put('users/me', payload).then(r => r.data);
}
