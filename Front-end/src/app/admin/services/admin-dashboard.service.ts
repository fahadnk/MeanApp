// src/app/admin/services/admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private base = `${environment.apiUrl}/admin/dashboard`;

  // Cache for observables
  private cache: any = {
    taskStats: null,
    userStats: null,
    managers: null,
    teams: null
  };

  private cacheTTL = 30 * 1000; // 30 seconds
  private cacheTime: any = {};

  constructor(private http: HttpClient) {}

  // -------------------------------
  // Get Task Stats with caching
  // -------------------------------
  getTaskStats(): Observable<any> {
    const now = Date.now();
    if (this.cache.taskStats && now - (this.cacheTime.taskStats || 0) < this.cacheTTL) {
      return of(this.cache.taskStats);
    }

    return this.http.get(`${this.base}/task-stats`).pipe(
      tap(res => {
        this.cache.taskStats = res;
        this.cacheTime.taskStats = Date.now();
      }),
      shareReplay(1)
    );
  }

  // -------------------------------
  // Get User Stats with caching
  // -------------------------------
  getUserStats(): Observable<any> {
    const now = Date.now();
    if (this.cache.userStats && now - (this.cacheTime.userStats || 0) < this.cacheTTL) {
      return of(this.cache.userStats);
    }

    return this.http.get(`${this.base}/user-stats`).pipe(
      tap(res => {
        this.cache.userStats = res;
        this.cacheTime.userStats = Date.now();
      }),
      shareReplay(1)
    );
  }

  // -------------------------------
  // Get Managers List with caching
  // -------------------------------
  getManagers(): Observable<any> {
    const now = Date.now();
    if (this.cache.managers && now - (this.cacheTime.managers || 0) < this.cacheTTL) {
      return of(this.cache.managers);
    }

    return this.http.get(`${this.base}/managers`).pipe(
      tap(res => {
        this.cache.managers = res;
        this.cacheTime.managers = Date.now();
      }),
      shareReplay(1)
    );
  }

  // -------------------------------
  // Get Teams with caching
  // -------------------------------
  getTeams(): Observable<any> {
    const now = Date.now();
    if (this.cache.teams && now - (this.cacheTime.teams || 0) < this.cacheTTL) {
      return of(this.cache.teams);
    }

    return this.http.get(`${this.base}/teams`).pipe(
      tap(res => {
        this.cache.teams = res;
        this.cacheTime.teams = Date.now();
      }),
      shareReplay(1)
    );
  }

  // -------------------------------
  // Clear cache manually if needed
  // -------------------------------
  clearCache() {
    this.cache = {
      taskStats: null,
      userStats: null,
      managers: null,
      teams: null
    };
    this.cacheTime = {};
  }
}
