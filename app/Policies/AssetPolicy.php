<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;

class AssetPolicy
{
    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Asset $asset)
    {
        return true;
    }

    public function create(User $user)
    {
        return true;
    }

    public function update(User $user, Asset $asset)
    {
        return $user->id === $asset->user_id;
    }

    public function delete(User $user, Asset $asset)
    {
        return $user->id === $asset->user_id;
    }
} 