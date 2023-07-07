import {ReactElement} from 'react';
import {LoginPage} from '../auth/ui/login-page';
import {GuestRoute} from '../auth/guards/guest-route';
import {RegisterPage} from '../auth/ui/register-page';
import {useSettings} from '../core/settings/use-settings';

interface DynamicHomepageProps {
  homepageResolver?: (type?: string) => ReactElement;
}
export function DynamicHomepage({homepageResolver}: DynamicHomepageProps) {
  const {homepage} = useSettings();
  if (homepage?.type === 'loginPage') {
    return (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    );
  }

  if (homepage?.type === 'registerPage') {
    return (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    );
  }

  return homepageResolver?.(homepage?.type) || null;
}
