import {useMutation} from '@tanstack/react-query';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../../../../http/backend-response/backend-response';
import {toast} from '../../../../ui/toast/toast';
import {onFormQueryError} from '../../../../errors/on-form-query-error';
import {message} from '../../../../i18n/message';
import {apiClient} from '../../../../http/query-client';

interface Response extends BackendResponse {}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

function UpdatePassword(payload: UpdatePasswordPayload): Promise<Response> {
  return apiClient.post('users/me/password/change', payload).then(r => r.data);
}

export function useUpdatePassword(form: UseFormReturn<UpdatePasswordPayload>) {
  return useMutation((props: UpdatePasswordPayload) => UpdatePassword(props), {
    onSuccess: () => {
      toast(message('Password changed'));
    },
    onError: r => onFormQueryError(r, form),
  });
}
