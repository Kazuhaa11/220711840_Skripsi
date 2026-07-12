<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user->loadMissing('role');

        $userRole = $user->role?->slug;

        if (!$userRole || !in_array($userRole, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki hak akses untuk fitur ini.',
                'data' => [
                    'required_roles' => $roles,
                    'current_role' => $userRole,
                ],
            ], 403);
        }

        return $next($request);
    }
}