import {useForm} from 'react-hook-form';
import {Fragment, ReactNode} from 'react';
import {
  ConnectSocialPayload,
  useConnectSocialWithPassword,
} from '../requests/connect-social-with-password';
import {useDialogContext} from '../../ui/overlays/dialog/dialog-context';
import {Dialog} from '../../ui/overlays/dialog/dialog';
import {DialogHeader} from '../../ui/overlays/dialog/dialog-header';
import {DialogBody} from '../../ui/overlays/dialog/dialog-body';
import {Form} from '../../ui/forms/form';
import {FormTextField} from '../../ui/forms/input-field/text-field/text-field';
import {DialogFooter} from '../../ui/overlays/dialog/dialog-footer';
import {Button} from '../../ui/buttons/button';
import {SocialService, useSocialLogin} from '../requests/use-social-login';
import {IconButton} from '../../ui/buttons/icon-button';
import {GoogleIcon} from '../../icons/social/google';
import {FacebookIcon} from '../../icons/social/facebook';
import {TwitterIcon} from '../../icons/social/twitter';
import {DialogTrigger} from '../../ui/overlays/dialog/dialog-trigger';
import {Trans} from '../../i18n/trans';
import {useNavigate} from '../../utils/hooks/use-navigate';
import {useAuth} from '../use-auth';
import {useTrans} from '../../i18n/use-trans';
import {message} from '../../i18n/message';
import {useSettings} from '../../core/settings/use-settings';

interface SocialAuthSectionProps {
  dividerMessage: ReactNode;
}
export function SocialAuthSection({dividerMessage}: SocialAuthSectionProps) {
  const {trans} = useTrans();
  const {social, registration} = useSettings();
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {loginWithSocial, requestingPassword, setIsRequestingPassword} =
    useSocialLogin();

  const allSocialsDisabled =
    !social?.google?.enable &&
    !social?.facebook?.enable &&
    !social?.twitter?.enable;

  if (registration.disable || allSocialsDisabled) {
    return null;
  }

  const handleSocialLogin = async (service: SocialService) => {
    const e = await loginWithSocial(service);
    if (e?.status === 'SUCCESS' || e?.status === 'ALREADY_LOGGED_IN') {
      navigate(getRedirectUri(), {replace: true});
    }
  };

  return (
    <Fragment>
      <div className="relative text-center my-20 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-1 before:w-full before:bg-divider">
        <span className="bg-paper relative z-10 px-10 text-sm text-muted">
          {dividerMessage}
        </span>
      </div>
      <div className="flex items-center justify-center gap-14">
        {social?.google?.enable ? (
          <IconButton
            variant="outline"
            radius="rounded"
            aria-label={trans(message('Sign in with google'))}
            onClick={() => {
              handleSocialLogin('google');
            }}
          >
            <GoogleIcon viewBox="0 0 48 48" />
          </IconButton>
        ) : null}
        {social?.facebook?.enable ? (
          <IconButton
            variant="outline"
            radius="rounded"
            aria-label={trans(message('Sign in with facebook'))}
            onClick={() => {
              handleSocialLogin('facebook');
            }}
          >
            <FacebookIcon className="text-facebook" />
          </IconButton>
        ) : null}
        {social?.twitter?.enable ? (
          <IconButton
            variant="outline"
            radius="rounded"
            aria-label={trans(message('Sign in with twitter'))}
            onClick={() => {
              handleSocialLogin('twitter');
            }}
          >
            <TwitterIcon className="text-twitter" />
          </IconButton>
        ) : null}
      </div>
      <DialogTrigger
        type="modal"
        isOpen={requestingPassword}
        onOpenChange={setIsRequestingPassword}
      >
        <RequestPasswordDialog />
      </DialogTrigger>
    </Fragment>
  );
}

function RequestPasswordDialog() {
  const form = useForm<ConnectSocialPayload>();
  const {formId} = useDialogContext();
  const connect = useConnectSocialWithPassword(form);
  return (
    <Dialog>
      <DialogHeader>
        <Trans message="Password required" />
      </DialogHeader>
      <DialogBody>
        <div className="text-sm text-muted mb-30">
          <Trans message="An account with this email address already exists. If you want to connect the two accounts, enter existing account password." />
        </div>
        <Form
          form={form}
          id={formId}
          onSubmit={payload => {
            connect.mutate(payload);
          }}
        >
          <FormTextField
            autoFocus
            name="password"
            type="password"
            required
            label={<Trans message="Password" />}
          />
        </Form>
      </DialogBody>
      <DialogFooter>
        <Button variant="text">
          <Trans message="Cancel" />
        </Button>
        <Button
          type="submit"
          form={formId}
          variant="flat"
          color="primary"
          disabled={connect.isLoading}
        >
          <Trans message="Connect" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
