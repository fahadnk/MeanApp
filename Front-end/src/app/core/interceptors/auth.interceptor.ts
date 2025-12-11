import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader-service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  constructor(
    private auth: AuthService,
    private loader: LoaderService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    // Increment counter and show loader
    this.activeRequests++;
    this.loader.show();

    let modifiedReq = req;

    if (token) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(modifiedReq).pipe(
      finalize(() => {
        // Decrement counter and hide loader only when no active requests
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loader.hide();
        }
      })
    );
  }
}
