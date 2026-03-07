import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

 intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes('demo-api')) {

      const fakeResponse = new HttpResponse({
        status: 200,
        body: {
          message: 'This is a fake API response',
          data: [
            { id: 1, name: 'Parth' },
            { id: 2, name: 'Rahul' }
          ]
        }
      });

      return of(fakeResponse);
    }

    return next.handle(request);
  }

  
}
