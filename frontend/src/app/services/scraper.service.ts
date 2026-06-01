import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  oriflameUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ScraperService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8001/api';

  scrapeCategory(categoryUrl: string): Observable<ScrapedProduct[]> {
    return this.http.post<ScrapedProduct[]>(`${this.apiUrl}/scraper/scrape`, { url: categoryUrl });
  }

  getScrapeStatus(): Observable<{ status: string; count: number }> {
    return this.http.get<{ status: string; count: number }>(`${this.apiUrl}/scraper/status`);
  }

  importProducts(products: ScrapedProduct[]): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(`${this.apiUrl}/scraper/import`, { products });
  }
}
