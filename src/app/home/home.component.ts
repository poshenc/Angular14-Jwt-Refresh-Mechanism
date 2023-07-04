import { Component } from '@angular/core';

import { User } from '@app/shared/models';
import { AccountService } from '@app/shared/services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  user: User | null;

  constructor(private accountService: AccountService) {
    this.user = this.accountService.userValue;
  }
}
