import {useForm} from 'react-hook-form';
import {useId} from 'react';
import {Form} from '../../../../ui/forms/form';
import {AccountSettingsPanel} from '../account-settings-panel';
import {FormTextField} from '../../../../ui/forms/input-field/text-field/text-field';
import {UpdatePasswordPayload, useUpdatePassword} from './update-password';
import {Button} from '../../../../ui/buttons/button';
import {Trans} from '../../../../i18n/trans';

export function ChangePasswordPanel() {
  const form = useForm<UpdatePasswordPayload>();
  const formId = useId();
  const updatePassword = useUpdatePassword(form);
  return (
    <AccountSettingsPanel
      title={<Trans message="Update password" />}
      actions={
        <Button
          type="submit"
          form={formId}
          variant="flat"
          color="primary"
          disabled={!form.formState.isValid || updatePassword.isLoading}
        >
          <Trans message="Update password" />
        </Button>
      }
    >
      <Form
        form={form}
        id={formId}
        onSubmit={newValues => {
          updatePassword.mutate(newValues, {
            onSuccess: () => {
              form.reset();
            },
          });
        }}
      >
        <FormTextField
          className="mb-24"
          name="current_password"
          label={<Trans message="Current password" />}
          type="password"
          required
        />
        <FormTextField
          className="mb-24"
          name="new_password"
          label={<Trans message="New password" />}
          type="password"
          required
        />
        <FormTextField
          name="new_password_confirmation"
          label={<Trans message="Confirm password" />}
          type="password"
          required
        />
      </Form>
    </AccountSettingsPanel>
  );
}
