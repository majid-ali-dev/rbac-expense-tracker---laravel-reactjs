<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(LoginRequest $request): array
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['roles.permissions']),
            'token' => $token,
        ];
    }

    public function register(RegisterRequest $request): array
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign default member role
        $role = Role::where('name', 'member')->first();
        if ($role) {
            $user->roles()->attach($role->id);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['roles.permissions']),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function getUserWithRoles(User $user): User
    {
        return $user->load(['roles.permissions']);
    }
}
