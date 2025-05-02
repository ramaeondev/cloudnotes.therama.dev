import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService, private readonly router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const user = await this.supabase.getUser();
    return user ? true : this.router.createUrlTree(['/signin']);
  }
}
