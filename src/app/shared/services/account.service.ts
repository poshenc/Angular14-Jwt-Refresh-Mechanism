import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { User } from '@app/shared/models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('appUser')!));
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  login(username: string, password: string) {
    let body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.http.post<User>('http://localhost:8080/login', body.toString(), options)
      .pipe(
        tap((userInfo) => {
          let appUser = {
            userName: userInfo.userName,
            accessToken: userInfo.accessToken
          }
          this.userSubject.next(appUser)
          localStorage.setItem('appUser', JSON.stringify(appUser))
          localStorage.setItem('refreshToken', userInfo.refreshToken!)
        }),
        map((res) => {
          return res
        })
      )
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('appUser')
    localStorage.removeItem('refreshToken')
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    let refreshToken = localStorage.getItem('refreshToken')
    return this.http.post<any>('http://localhost:8080/api/token/refresh', refreshToken)
      .pipe(tap((tokens) => {
        let updatedUserValue = this.userValue
        updatedUserValue!.accessToken = tokens.accessToken
        this.userSubject.next(updatedUserValue)
        localStorage.setItem('appUser', JSON.stringify(updatedUserValue))
      }),
        catchError((error) => {
          this.logout()
          return of(false);
        })
      )
  }


  register(user: User) {
    return this.http.post('http://localhost:8080/api/user/register', user);
  }

  getAll() {
    return this.http.get<User[]>('http://localhost:8080/api/users');
  }

  getById(id: number) {
    return this.http.get<User>(`http://localhost:8080/api/user/${id}`);
  }

  update(id: number, params: any) {
    console.log("updating calling api", params);

    return this.http.put(`http://localhost:8080/api/user/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue?.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: number) {
    return this.http.delete(`http://localhost:8080/api/user/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue?.id) {
          this.logout();
        }
        return x;
      }));
  }
}
