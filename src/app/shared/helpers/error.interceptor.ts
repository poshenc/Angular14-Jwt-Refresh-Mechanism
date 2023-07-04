import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/shared/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([403].includes(err.status) && this.accountService.userValue) {
        this.accountService.logout();
      }

      if (err.status === 401 && err.error.errorMessage === "Bad credentials") {
        return throwError(() => "Bad credentials");
      }

      const error = err.error?.message || err.statusText;
      console.error(err);
      return throwError(() => error);
    }))
  }

}

