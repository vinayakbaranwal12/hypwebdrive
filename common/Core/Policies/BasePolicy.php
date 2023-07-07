<?php

namespace Common\Core\Policies;

use App\User;
use Common\Auth\Roles\Role;
use Common\Core\Exceptions\AccessResponseWithAction;
use Common\Settings\Settings;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
use Illuminate\Http\Request;
use Str;

abstract class BasePolicy
{
    use HandlesAuthorization;

    public function __construct(
        protected Request $request,
        protected Settings $settings,
    ) {
    }

    protected function denyWithAction(
        $message,
        array|null $action = null,
    ): AccessResponseWithAction {
        /** @var AccessResponseWithAction $response */
        $response = AccessResponseWithAction::deny($message);
        $response->action = $action;
        return $response;
    }

    protected function storeWithCountRestriction(
        User $user,
        string $namespace,
    ): Response {
        [
            $relationName,
            $permission,
            $singularName,
            $pluralName,
        ] = $this->parseNamespace($namespace);

        // user can't create resource at all
        $response = $this->hasPermission($user, $permission);

        if ($response->denied()) {
            return $response;
        }

        // user is admin, can ignore count restriction
        if ($user->hasPermission('admin')) {
            return Response::allow();
        }

        // user does not have any restriction on maximum resource count
        $maxCount = $user->getRestrictionValue($permission, 'count');
        if (!$maxCount) {
            return Response::allow();
        }

        // check if user did not go over their max quota
        if ($user->$relationName->count() >= $maxCount) {
            $message = __('policies.quota_exceeded', [
                'resources' => $pluralName,
                'resource' => $singularName,
            ]);
            return $this->denyWithAction($message, $this->upgradeAction());
        }

        return Response::allow();
    }

    protected function hasPermission(?User $user, string $permission): Response
    {
        if ($user?->hasPermission($permission)) {
            return Response::allow();
        } elseif (
            Role::where('guests', true)
                ->first()
                ?->hasPermission($permission)
        ) {
            return Response::allow();
        }
        return Response::deny();
    }

    protected function parseNamespace(
        string $namespace,
        string $ability = 'create',
    ): array {
        // 'App\SomeModel' => 'Some_Model'
        $resourceName = Str::snake(class_basename($namespace));

        // 'Some_Model' => 'someModels'
        $relationName = Str::camel(Str::plural($resourceName));

        // 'Some_Model' => 'Some Model'
        $singularName = str_replace('_', ' ', $resourceName);

        // 'Some Model' => 'Some Models'
        $pluralName = Str::plural($singularName);

        // parent might need to override permission name. custom_domains instead of links_domains for example.
        $permissionName = $this->permissionName ?? Str::snake($relationName);

        return [
            $relationName,
            "$permissionName.$ability",
            $singularName,
            $pluralName,
        ];
    }

    protected function upgradeAction(): ?array
    {
        if ($this->settings->get('billing.enable')) {
            return ['label' => __('Upgrade'), 'action' => '/billing/pricing'];
        } else {
            return null;
        }
    }
}
