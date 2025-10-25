import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const idToken = authService.getIdTokenFromCookie();

  if (idToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${idToken}`
      }
    });
    return next(authReq);
  }

  return next(req);
};