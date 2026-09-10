import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  if (!environment.useRemoteApi) {
    return true;
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/admin/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  return true;
};
