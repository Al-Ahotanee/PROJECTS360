import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => { const token = typeof localStorage !== 'undefined' ? localStorage.getItem('p360_token') : null; return next(token ? req.clone({ setHeaders:{ Authorization:`Bearer ${token}` } }) : req); };
