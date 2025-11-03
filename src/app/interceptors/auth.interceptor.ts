import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('=== AUTH INTERCEPTOR CALLED ===');
  const authService = inject(AuthService);

  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('=== LOGIN OR REGISTER REQUEST, SENDING ORIGINAL REQ ===');
    return next(req);
  }

  if (req.url.includes('grade-processor')) {
    console.log('=== GRADE PROCESSOR REQUEST, SENDING ORIGINAL REQ ===');
    return next(req);
  }

  const idToken = authService.getIdTokenFromCookie();
  console.log('=== ID TOKEN FROM COOKIE ===');
  if (idToken) {
    console.log('=== ID TOKEN FOUND ===');
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${idToken}`,
        Accept: 'application/json',
      },
    });
    console.log('=== AUTH REQ ===');
    console.log(JSON.stringify(clonedReq, null, 2));
    return next(clonedReq);
  }
  console.log('=== NO ID TOKEN FOUND, SENDING ORIGINAL REQ ===');
  return next(req);
};
