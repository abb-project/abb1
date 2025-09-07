import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { Dataset } from '../../models/dataset.model';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <h2>Upload Dataset</h2>
      <div class="step-indicator">Step 1 of 4</div>
    </div>
      
    <div *ngIf="!dataset && !isUploading" class="upload-section">
      <p class="instruction-text">Click to select a CSV file or drag and drop</p>
      
      <div class="upload-area" (click)="fileInput.click()" 
           (dragover)="onDragOver($event)" 
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.drag-over]="isDragOver">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p class="upload-text">Drop your CSV file here or click to browse</p>
        <small class="upload-hint">Only CSV files are supported</small>
      </div>
      
      <input #fileInput type="file" accept=".csv" (change)="onFileSelected($event)" style="display: none;">
    </div>
    
    <div *ngIf="isUploading" class="loading-container">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Processing your dataset...</p>
    </div>
    
    <div *ngIf="dataset && !isUploading" class="results-section">
      <!-- Metadata Card -->
      <div class="metadata-card-container">
        <div class="metadata-grid">
          <!-- CSV File -->
          <div class="metadata-item">
            <div class="metadata-icon">
              <mat-icon>description</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">CSV File</div>
              <div class="metadata-value">{{dataset.fileName}}</div>
              <div class="metadata-subtext">{{getFileSize()}}</div>
            </div>
          </div>

          <!-- Records -->
          <div class="metadata-item">
            <div class="metadata-icon">
              <mat-icon>storage</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Records</div>
              <div class="metadata-value">{{dataset.totalRows | number}}</div>
            </div>
          </div>

          <!-- Columns -->
          <div class="metadata-item">
            <div class="metadata-icon">
              <mat-icon>view_column</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Columns</div>
              <div class="metadata-value">{{dataset.totalColumns}}</div>
            </div>
          </div>

          <!-- Pass Rate -->
          <div class="metadata-item">
            <div class="metadata-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Pass Rate</div>
              <div class="metadata-value">{{(dataset.passRate * 100).toFixed(0)}}%</div>
            </div>
          </div>

          <!-- Date Range -->
          <div class="metadata-item">
            <div class="metadata-icon">
              <mat-icon>date_range</mat-icon>
            </div>
            <div class="metadata-content">
              <div class="metadata-label">Date Range</div>
              <div class="metadata-value">{{formatDateRange()}}</div>
              <div class="metadata-subtext">{{formatDateRangeSub()}}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Next Button -->
      <div class="next-button-container">
        <button mat-raised-button color="primary" class="next-button" (click)="nextStep()">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-header h2 {
      font-size: 24px;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .step-indicator {
      background: #2196f3;
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .instruction-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .upload-section {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 60px 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
    }
    
    .upload-area:hover, .upload-area.drag-over {
      border-color: #2196f3;
      background: #f8fbff;
    }
    
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
      margin-bottom: 16px;
    }

    .upload-text {
      color: #666;
      font-size: 16px;
      margin: 16px 0 8px 0;
    }

    .upload-hint {
      color: #999;
      font-size: 12px;
    }
    
    .loading-container {
      text-align: center;
      padding: 80px 40px;
    }
    
    .loading-container p {
      margin-top: 24px;
      color: #666;
      font-size: 16px;
    }

    .results-section {
      max-width: 900px;
      margin: 0 auto;
    }

    .metadata-card-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
      margin-bottom: 30px;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .metadata-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border-radius: 8px;
      background: #fafafa;
      border-left: 4px solid #e0e0e0;
    }

    .metadata-icon {
      background: #f0f0f0;
      border-radius: 8px;
      padding: 8px;
      flex-shrink: 0;
    }

    .metadata-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #666;
    }

    .metadata-content {
      flex: 1;
      min-width: 0;
    }

    .metadata-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .metadata-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
      word-break: break-all;
    }

    .metadata-subtext {
      font-size: 11px;
      color: #999;
    }

    .next-button-container {
      text-align: right;
    }

    .next-button {
      font-size: 14px;
      font-weight: 500;
      padding: 8px 24px;
      border-radius: 6px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .metadata-grid {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class UploadComponent {
  dataset: Dataset | null = null;
  isUploading = false;
  isDragOver = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.snackBar.open('Please select a CSV file', 'Close', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    this.dataset = null;

    this.apiService.uploadDataset(file).subscribe({
      next: (dataset) => {
        this.dataset = dataset;
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.snackBar.open('Upload failed. Please try again.', 'Close', { duration: 5000 });
        this.isUploading = false;
      }
    });
  }

  uploadAnother() {
    this.dataset = null;
  }

  nextStep() {
    if (this.dataset) {
      this.router.navigate(['/date-ranges', this.dataset.datasetId]);
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  formatDateRange(): string {
    if (!this.dataset?.earliestTimestamp || !this.dataset?.latestTimestamp) return 'N/A';
    const start = new Date(this.dataset.earliestTimestamp).toLocaleDateString();
    return start;
  }

  formatDateRangeSub(): string {
    if (!this.dataset?.earliestTimestamp || !this.dataset?.latestTimestamp) return '';
    const start = new Date(this.dataset.earliestTimestamp);
    const end = new Date(this.dataset.latestTimestamp);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `to ${end.toLocaleDateString()}`;
  }

  getFileSize(): string {
    // Estimate file size based on rows/columns for display
    if (!this.dataset) return '';
    const estimatedSize = Math.round((this.dataset.totalRows * this.dataset.totalColumns * 10) / 1024);
    return estimatedSize > 1024 ? `${(estimatedSize/1024).toFixed(1)} MB` : `${estimatedSize} KB`;
  }
}
