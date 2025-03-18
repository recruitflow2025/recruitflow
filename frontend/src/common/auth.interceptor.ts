import { HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and modify it as needed
  const authReq = req.clone({
    withCredentials: true // Example: Include credentials in the request
  });

  // Pass on the modified request
  return next(authReq);
};