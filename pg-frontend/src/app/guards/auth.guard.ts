import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        return true;
    }

    // Not logged in, redirect to welcome page
    router.navigate(['/']);
    return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        // Already logged in, redirect to home
        router.navigate(['/home']);
        return false;
    }

    return true;
};
