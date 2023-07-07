<?php

namespace Common\Core\Policies;

use App\User;
use Illuminate\Auth\Access\Response;

class TagPolicy extends BasePolicy
{
    public function index(?User $user): Response
    {
        return $this->hasPermission($user, 'tags.view');
    }

    public function show(?User $user): Response
    {
        return $this->hasPermission($user, 'tags.view');
    }

    public function store(User $user): Response
    {
        return $this->hasPermission($user, 'tags.create');
    }

    public function update(User $user): Response
    {
        return $this->hasPermission($user, 'tags.update');
    }

    public function destroy(User $user): Response
    {
        return $this->hasPermission($user, 'tags.delete');
    }
}
