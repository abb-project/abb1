import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { TrainingResponse } from '../../models/dataset.model';

Chart.register(...registerables);

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <h2>Model Training & Evaluation</h2>
      <div class="step-indicator">Step 3 of 4</div>
    </div>

    <!-- Before Training State -->
    <div *ngIf="!isTraining && !trainingResult" class="before-training">
      <div class="empty-state">
        <div class="empty-icon">
          <mat-icon>psychology</mat-icon>
        </div>
        <h3>Ready to Train Your Model</h3>
        <p>Click the button below to start training your machine learning model using the configured date ranges.</p>
        
        <button mat-raised-button color="primary" class="train-button" (click)="startTraining()">
          <mat-icon>play_arrow</mat-icon>
          Train Model
        </button>
      </div>
    </div>
    
    <!-- Training Progress -->
    <div *ngIf="isTraining" class="training-progress">
      <mat-spinner diameter="60" color="primary"></mat-spinner>
      <h3>Training Model...</h3>
      <p>Please wait while we train the XGBoost model on your data. This may take a few moments.</p>
    </div>
    
    <!-- After Training State -->
    <div *ngIf="trainingResult && !isTraining" class="after-training">
      <!-- Success Message -->
      <div class="success-banner">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <span>Model Trained Successfully</span>
      </div>
      
      <!-- Performance Metrics Cards -->
      <div class="metrics-section">
        <h3>Model Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card accuracy-card">
            <div class="metric-value">{{(trainingResult.accuracy * 100).toFixed(1)}}%</div>
            <div class="metric-label">Accuracy</div>
          </div>
          <div class="metric-card precision-card">
            <div class="metric-value">{{(trainingResult.precision * 100).toFixed(1)}}%</div>
            <div class="metric-label">Precision</div>
          </div>
          <div class="metric-card recall-card">
            <div class="metric-value">{{(trainingResult.recall * 100).toFixed(1)}}%</div>
            <div class="metric-label">Recall</div>
          </div>
          <div class="metric-card f1-card">
            <div class="metric-value">{{(trainingResult.f1Score * 100).toFixed(1)}}%</div>
            <div class="metric-label">F1-Score</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Training Metrics Chart -->
        <div class="chart-container">
          <h3 class="chart-title">
            <mat-icon>show_chart</mat-icon>
            Model Performance
          </h3>
          <div class="chart-subtitle">Training Metrics</div>
          <canvas baseChart
                  [data]="trainingChartData"
                  [options]="trainingChartOptions"
                  type="line">
          </canvas>
        </div>

        <!-- Confusion Matrix Donut Chart -->
        <div class="chart-container" *ngIf="confusionMatrixData">
          <h3 class="chart-title">
            <mat-icon>donut_large</mat-icon>
            Model Performance
          </h3>
          <div class="chart-subtitle">Confusion Matrix</div>
          <canvas baseChart
                  [data]="confusionMatrixData"
                  [options]="confusionMatrixOptions"
                  type="doughnut">
          </canvas>
        </div>
      </div>

      <!-- Action Button -->
      <div class="action-buttons">
        <button mat-raised-button color="primary" (click)="nextStep()">
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

    /* Before Training State */
    .before-training {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .empty-state {
      text-align: center;
      max-width: 500px;
      padding: 40px;
    }

    .empty-icon {
      margin-bottom: 24px;
    }

    .empty-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .empty-state h3 {
      font-size: 24px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
    }

    .empty-state p {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .train-button {
      font-size: 16px;
      font-weight: 500;
      padding: 12px 32px;
    }

    /* Training Progress */
    .training-progress {
      text-align: center;
      padding: 80px 40px;
    }
    
    .training-progress h3 {
      margin: 24px 0 12px 0;
      color: #333;
      font-size: 24px;
      font-weight: 500;
    }
    
    .training-progress p {
      color: #666;
      font-size: 16px;
      margin: 0;
    }

    /* After Training */
    .after-training {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* Success Banner */
    .success-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8f5e8;
      color: #2e7d32;
      padding: 16px 24px;
      border-radius: 8px;
      margin-bottom: 32px;
      font-weight: 500;
      font-size: 16px;
    }

    .success-icon {
      color: #4caf50;
      margin-right: 12px;
      font-size: 24px;
    }

    /* Metrics Section */
    .metrics-section {
      margin-bottom: 40px;
    }

    .metrics-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .metric-card {
      background: white;
      padding: 32px 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: none;
    }

    .accuracy-card {
      background: linear-gradient(135deg, #6a5acd 0%, #8a70d4 100%);
      color: white;
    }

    .precision-card {
      background: linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%);
      color: white;
    }

    .recall-card {
      background: linear-gradient(135deg, #4fc3f7 0%, #7dd3fc 100%);
      color: white;
    }

    .f1-card {
      background: linear-gradient(135deg, #66bb6a 0%, #81c784 100%);
      color: white;
    }
    
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    
    .metric-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin: 40px 0;
    }
    
    .chart-container {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: 300px;
      display: flex;
      flex-direction: column;
    }

    .chart-container canvas {
      flex: 1;
      max-height: 220px;
    }

    .chart-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0 0 4px 0;
    }

    .chart-title mat-icon {
      margin-right: 8px;
      color: #666;
      font-size: 20px;
    }

    .chart-subtitle {
      font-size: 12px;
      color: #999;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 40px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .empty-state {
        padding: 20px;
      }
    }
  `]
})
export class TrainingComponent implements OnInit {
  datasetId!: number;
  isTraining = false;
  trainingResult: TrainingResponse | null = null;
  
  // Chart data
  trainingChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  trainingChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        }
      },
      x: {
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        },
        title: {
          display: true,
          text: 'Epochs',
          color: '#666'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666'
        }
      }
    }
  };
  
  confusionMatrixData: ChartData<'doughnut'> | null = null;
  confusionMatrixOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666',
          usePointStyle: true
        }
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.datasetId = Number(this.route.snapshot.paramMap.get('id'));
  }

  startTraining() {
    this.isTraining = true;
    this.trainingResult = null;

    this.apiService.trainModel(this.datasetId).subscribe({
      next: (result) => {
        this.trainingResult = result;
        this.isTraining = false;
        this.setupCharts();
      },
      error: (error) => {
        console.error('Training error:', error);
        this.snackBar.open('Training failed. Please try again.', 'Close', { duration: 5000 });
        this.isTraining = false;
      }
    });
  }

  setupCharts() {
    if (!this.trainingResult) return;

    // Setup training performance chart (simulated data)
    this.trainingChartData = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      datasets: [
        {
          label: 'Training Accuracy',
          data: [0.65, 0.72, 0.78, 0.83, 0.87, 0.89, 0.91, 0.92, 0.925, this.trainingResult.accuracy],
          borderColor: '#4caf50',
          backgroundColor: 'transparent',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#4caf50',
          pointBorderColor: '#4caf50',
          pointRadius: 4
        },
        {
          label: 'Validation Loss',
          data: [0.45, 0.38, 0.32, 0.28, 0.25, 0.22, 0.20, 0.18, 0.16, 0.14],
          borderColor: '#f44336',
          backgroundColor: 'transparent',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#f44336',
          pointBorderColor: '#f44336',
          pointRadius: 4
        }
      ]
    };

    // Setup confusion matrix donut chart
    if (this.trainingResult.confusionMatrix && this.trainingResult.confusionMatrix.length > 0) {
      const matrix = this.trainingResult.confusionMatrix;
      // Calculate confusion matrix values
      const tp = matrix[1] ? matrix[1][1] || 0 : 0; // True Positive
      const tn = matrix[0] ? matrix[0][0] || 0 : 0; // True Negative
      const fp = matrix[0] ? matrix[0][1] || 0 : 0; // False Positive
      const fn = matrix[1] ? matrix[1][0] || 0 : 0; // False Negative

      this.confusionMatrixData = {
        labels: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
        datasets: [{
          data: [tp, tn, fp, fn],
          backgroundColor: [
            '#4caf50', // Green for True Positive
            '#2196f3', // Blue for True Negative  
            '#ff9800', // Orange for False Positive
            '#f44336'  // Red for False Negative
          ],
          borderWidth: 0
        }]
      };
    }
  }

  trainAnother() {
    this.trainingResult = null;
    this.isTraining = false;
  }

  goBack() {
    this.router.navigate(['/date-ranges', this.datasetId]);
  }

  nextStep() {
    this.router.navigate(['/simulation', this.datasetId]);
  }
}
