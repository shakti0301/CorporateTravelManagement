import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userData = localStorage.getItem('currentUser');

  if (!userData) {
    alert('You must be logged in to access this page.');
    window.location.href = '/';
    return false;
  }
  const user = JSON.parse(userData);
  const userRole = user.role.toLowerCase();

  const allowedRoles: string[] =
    route.data?.['roles']?.map((r: string) => r.toLowerCase()) ??
    (route.data?.['role'] ? [route.data['role'].toLowerCase()] : []);

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    alert('You do not have permission to access this page.');
    window.location.href = '/';
    return false;
  }

  return true;
};
