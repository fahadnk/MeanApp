// src/app/core/services/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private base = `${environment.apiUrl}/teams`;

  constructor(private http: HttpClient) {}

  // list all teams (admin) or teams visible to user
  list(params: { page?: number; limit?: number } = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get(this.base, { params: httpParams });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(payload: { name: string }): Observable<any> {
    return this.http.post(this.base, payload);
  }

  addMember(teamId: string, userId: string): Observable<any> {
    return this.http.post(`${this.base}/${teamId}/members`, { userId });
  }

  removeMember(teamId: string, userId: string): Observable<any> {
    return this.http.post(`${this.base}/${teamId}/members/remove`, { userId });
  }

  delete(teamId: string): Observable<any> {
    return this.http.delete(`${this.base}/${teamId}`);
  }

  // admin-only helper to assign user to team directly
  assignUserToTeam(userId: string, teamId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/users/${userId}/assign-team`, { teamId });
  }

  removeUserFromTeamAdmin(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/users/${userId}/remove-team`, {});
  }
}
