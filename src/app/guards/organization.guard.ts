import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const organizationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('=== ORGANIZATION GUARD CALLED ===');
  console.log('User is logged in: ', authService.isLoggedIn());
  
  if (!authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  return authService.waitForUserLoad().pipe(
    map(() => {
      console.log('User logged: ', authService.keycloakUser);
      console.log('User role: ', authService.keycloakUser?.role);
      
      if (authService.keycloakUser?.role === UserRole.ORGANIZATION) {
        return true;
      }
      
      router.navigate(['/']);
      return false;
    })
  );
};
