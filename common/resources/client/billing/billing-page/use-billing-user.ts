import {invalidateUseUserQuery, useUser} from '../../auth/ui/use-user';

export function useBillingUser() {
  const query = useUser('me', {
    with: ['subscriptions.product', 'subscriptions.price'],
  });

  const subscription = query.data?.user.subscriptions?.[0];

  return {subscription, isLoading: query.isLoading, user: query.data?.user};
}

export function invalidateBillingUserQuery() {
  invalidateUseUserQuery('me');
}
