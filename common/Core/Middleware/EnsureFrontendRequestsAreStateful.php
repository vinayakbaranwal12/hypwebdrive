<?php

namespace Common\Core\Middleware;

use Illuminate\Support\Str;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as LaravelMiddleware;

class EnsureFrontendRequestsAreStateful extends LaravelMiddleware
{
    public static function fromFrontend($request): bool
    {
        $domain =
            $request->headers->get('referer') ?:
            $request->headers->get('origin');

        // make sure api calls from api docs page are not considered stateful to avoid 419 errors on POST requests
        if (
            !is_null($domain) &&
            Str::is(config('app.url') . '/api-docs*', $domain)
        ) {
            return false;
        }

        // todo: allow both www and non-www versions of url

        return parent::fromFrontend($request);
    }
}
