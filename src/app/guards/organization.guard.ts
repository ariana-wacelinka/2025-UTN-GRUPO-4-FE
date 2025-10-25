import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const organizationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.keycloakUser?.role === UserRole.ORGANIZATION) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
