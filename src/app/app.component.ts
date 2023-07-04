import { Component } from '@angular/core';

import { User } from './shared/models';
import { AccountService } from './shared/services';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
  user?: User | null;

  constructor(private accountService: AccountService) {
    this.accountService.user.subscribe(x => this.user = x);
  }

  logout() {
    this.accountService.logout();
  }
}
