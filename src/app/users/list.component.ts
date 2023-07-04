import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/shared/services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
  users?: any[];

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.accountService.getAll()
      .pipe(first())
      .subscribe(users => {
        console.log(users);

        this.users = users
      });
  }

  deleteUser(id: number | undefined) {
    const user = this.users!.find(x => x.id === id);
    user!.isDeleting = true;
    if (id) {
      this.accountService.delete(id)
        .pipe(first())
        .subscribe(() => this.users = this.users!.filter(x => x.id !== id));
    }
  }
}
