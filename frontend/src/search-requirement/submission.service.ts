import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  private apiUrl = 'http://localhost:3000/submissions'; // API endpoint

  constructor(private http: HttpClient) {}

  // Method to fetch submissions with optional filter and pagination
  getSubmissions(filter: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    // Set up query parameters
    const params = new HttpParams()
      .set('filter', filter)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Make the HTTP GET request
    return this.http.get(this.apiUrl, { params });
  }
}
