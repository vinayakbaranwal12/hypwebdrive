import {Navbar} from '../../../ui/navigation/navbar/navbar';
import {useUser} from '../use-user';
import {ProgressCircle} from '../../../ui/progress/progress-circle';
import {SocialLoginPanel} from './social-login-panel';
import {BasicInfoPanel} from './basic-info-panel/basic-info-panel';
import {ChangePasswordPanel} from './change-password-panel/change-password-panel';
import {LocalizationPanel} from './localization-panel';
import {AccessTokenPanel} from './access-token-panel/access-token-panel';
import {DangerZonePanel} from './danger-zone-panel/danger-zone-panel';
import {Trans} from '../../../i18n/trans';
import {StaticPageTitle} from '../../../seo/static-page-title';
import {Fragment} from 'react';

export function AccountSettingsPage() {
  const {data, isLoading} = useUser('me', {
    with: ['roles', 'social_profiles', 'tokens'],
  });
  return (
    <div className="bg-alt flex flex-col h-full">
      <StaticPageTitle>
        <Trans message="Account Settings" />
      </StaticPageTitle>
      <Navbar className="flex-shrink-0" menuPosition="account-settings-page" />
      <div className="flex-auto overflow-auto">
        <div className="container mx-auto my-24 px-24">
          <h1 className="text-3xl">
            <Trans message="Account settings" />
          </h1>
          <div className="mb-40 text-muted text-base">
            <Trans message="View and update your account details, profile and more." />
          </div>
          {isLoading || !data ? (
            <ProgressCircle
              className="my-80"
              aria-label="Loading user.."
              isIndeterminate
            />
          ) : (
            <Fragment>
              <BasicInfoPanel user={data.user} />
              <SocialLoginPanel user={data.user} />
              <ChangePasswordPanel />
              <LocalizationPanel user={data.user} />
              <AccessTokenPanel user={data.user} />
              <DangerZonePanel />
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
