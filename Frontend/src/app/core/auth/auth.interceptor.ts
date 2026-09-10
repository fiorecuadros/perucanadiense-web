import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const isApi = req.url.startsWith(environment.apiUrl);

  if (token && isApi) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      const expired =
        err.status === 401 ||
        (err.status === 403 && String(err.error?.message || '').includes('Token inválido'));

      if (environment.useRemoteApi && expired && isApi && !req.url.includes('/auth/login')) {
        sessionStorage.removeItem('token');
        window.location.href = '/admin/login';
      }

      return throwError(() => err);
    }),
  );
};
