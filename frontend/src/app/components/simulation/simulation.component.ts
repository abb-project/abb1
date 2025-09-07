import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { SimulationRow } from '../../models/dataset.model';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <h2>Real-Time Prediction Simulation</h2>
      <div class="step-indicator">Step 4 of 4</div>
    </div>

    <!-- Before Start State -->
    <div *ngIf="!hasStarted && !isLoading" class="before-start">
      <!-- Start Button -->
      <div class="start-button-section">
        <button mat-raised-button color="primary" class="start-simulation-btn" (click)="startSimulation()">
          <mat-icon>play_arrow</mat-icon>
          Start Simulation
        </button>
        <p class="start-instruction">Click 'Start Simulation' to begin streaming predictions</p>
      </div>

      <!-- Empty Charts Placeholder -->
      <div class="charts-section">
        <div class="chart-container">
          <h3 class="chart-title">Real Time Quality Predictions</h3>
          <div class="empty-chart">
            <canvas baseChart
                    [data]="emptyLineChartData"
                    [options]="lineChartOptions"
                    type="line">
            </canvas>
          </div>
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">Prediction Confidence</h3>
          <div class="empty-chart">
            <canvas baseChart
                    [data]="emptyDonutChartData"
                    [options]="donutChartOptions"
                    type="doughnut">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Empty Statistics -->
      <div class="statistics-section">
        <h3>Live Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Pass</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">Fail</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      <!-- Empty Table -->
      <div class="table-section">
        <h3>Live Prediction Stream</h3>
        <div class="empty-table">
          <table mat-table [dataSource]="emptyTableData" class="prediction-table">
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>TIME</th>
              <td mat-cell *matCellDef="let row">{{row.time}}</td>
            </ng-container>
            
            <ng-container matColumnDef="sampleId">
              <th mat-header-cell *matHeaderCellDef>SAMPLE ID</th>
              <td mat-cell *matCellDef="let row">{{row.sampleId}}</td>
            </ng-container>
            
            <ng-container matColumnDef="prediction">
              <th mat-header-cell *matHeaderCellDef>PREDICTION</th>
              <td mat-cell *matCellDef="let row">{{row.prediction}}</td>
            </ng-container>
            
            <ng-container matColumnDef="confidence">
              <th mat-header-cell *matHeaderCellDef>CONFIDENCE</th>
              <td mat-cell *matCellDef="let row">{{row.confidence}}</td>
            </ng-container>
            
            <ng-container matColumnDef="temperature">
              <th mat-header-cell *matHeaderCellDef>TEMPERATURE</th>
              <td mat-cell *matCellDef="let row">{{row.temperature}}</td>
            </ng-container>
            
            <ng-container matColumnDef="pressure">
              <th mat-header-cell *matHeaderCellDef>PRESSURE</th>
              <td mat-cell *matCellDef="let row">{{row.pressure}}</td>
            </ng-container>
            
            <ng-container matColumnDef="humidity">
              <th mat-header-cell *matHeaderCellDef>HUMIDITY</th>
              <td mat-cell *matCellDef="let row">{{row.humidity}}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="fullDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: fullDisplayedColumns;"></tr>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div *ngIf="isLoading" class="loading-container">
      <mat-spinner diameter="50" color="primary"></mat-spinner>
      <p>Loading simulation data...</p>
    </div>
    
    <!-- Active/Complete Simulation State -->
    <div *ngIf="hasStarted && !isLoading" class="simulation-active">
      <!-- Simulation Control -->
      <div class="simulation-control">
        <div *ngIf="isRunning" class="running-status">
          <mat-spinner diameter="20"></mat-spinner>
          <span>Simulation Running</span>
        </div>
        <div *ngIf="isCompleted" class="completed-status">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <span>Simulation completed</span>
        </div>
        <button mat-raised-button color="primary" (click)="restartSimulation()" *ngIf="isCompleted">
          Restart Simulation
        </button>
      </div>

      <!-- Live Charts -->
      <div class="charts-section">
        <div class="chart-container">
          <h3 class="chart-title">Real Time Quality Predictions</h3>
          <canvas baseChart
                  [data]="lineChartData"
                  [options]="lineChartOptions"
                  type="line">
          </canvas>
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">Prediction Confidence</h3>
          <canvas baseChart
                  [data]="donutChartData"
                  [options]="donutChartOptions"
                  type="doughnut">
          </canvas>
        </div>
      </div>

      <!-- Live Statistics -->
      <div class="statistics-section">
        <h3>Live Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{processedRowsCount}}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{passCount}}</div>
            <div class="stat-label">Pass</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{failCount}}</div>
            <div class="stat-label">Fail</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{averageConfidence.toFixed(0)}}%</div>
            <div class="stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      <!-- Live Prediction Table -->
      <div class="table-section">
        <h3>Live Prediction Stream</h3>
         <div class="table-container">
           <table mat-table [dataSource]="tableDataSource" class="prediction-table">
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>TIME</th>
              <td mat-cell *matCellDef="let row">{{formatTime(row.timestamp)}}</td>
            </ng-container>
            
            <ng-container matColumnDef="sampleId">
              <th mat-header-cell *matHeaderCellDef>SAMPLE ID</th>
              <td mat-cell *matCellDef="let row">SAMPLE_{{(row.rowIndex + 1).toString().padStart(3, '0')}}</td>
            </ng-container>
            
            <ng-container matColumnDef="prediction">
              <th mat-header-cell *matHeaderCellDef>PREDICTION</th>
              <td mat-cell *matCellDef="let row">
                <span [class]="getPredictionClass(row.prediction)">
                  {{row.prediction === 1 ? 'Pass' : 'Fail'}}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="confidence">
              <th mat-header-cell *matHeaderCellDef>CONFIDENCE</th>
              <td mat-cell *matCellDef="let row">{{(row.confidence * 100).toFixed(0)}}%</td>
            </ng-container>
            
            <ng-container matColumnDef="temperature">
              <th mat-header-cell *matHeaderCellDef>TEMPERATURE</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.temperature}}</td>
            </ng-container>
            
            <ng-container matColumnDef="pressure">
              <th mat-header-cell *matHeaderCellDef>PRESSURE</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.pressure}}</td>
            </ng-container>
            
            <ng-container matColumnDef="humidity">
              <th mat-header-cell *matHeaderCellDef>HUMIDITY</th>
              <td mat-cell *matCellDef="let row">{{row.sensorData?.humidity}}</td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="fullDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: fullDisplayedColumns;"></tr>
          </table>
        </div>
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

    /* Before Start State */
    .before-start {
      max-width: 1000px;
      margin: 0 auto;
    }

    .start-button-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .start-simulation-btn {
      font-size: 16px;
      font-weight: 500;
      padding: 12px 32px;
      margin-bottom: 16px;
    }

    .start-instruction {
      color: #666;
      font-size: 14px;
      margin: 16px 0 0 0;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
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

    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin: 0 0 20px 0;
      flex-shrink: 0;
    }

    .empty-chart, .chart-container canvas {
      flex: 1;
      min-height: 200px;
    }

    /* Statistics Section */
    .statistics-section {
      margin: 40px 0;
    }

    .statistics-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #2196f3;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Table Section */
    .table-section {
      margin: 40px 0;
    }

    .table-section h3 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin-bottom: 20px;
    }

     .table-container, .empty-table {
       background: white;
       border-radius: 12px;
       box-shadow: 0 2px 8px rgba(0,0,0,0.1);
       overflow: hidden;
       max-height: 400px;
       overflow-y: auto;
       position: relative;
     }
     
     .table-container::-webkit-scrollbar {
       width: 6px;
     }
     
     .table-container::-webkit-scrollbar-track {
       background: #f1f1f1;
       border-radius: 3px;
     }
     
     .table-container::-webkit-scrollbar-thumb {
       background: #c1c1c1;
       border-radius: 3px;
     }
     
     .table-container::-webkit-scrollbar-thumb:hover {
       background: #a8a8a8;
     }
    
    .prediction-table {
      width: 100%;
    }

    .prediction-table th {
      background: #f5f5f5;
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 12px;
    }

    .prediction-table td {
      font-size: 13px;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .prediction-pass {
      color: #4caf50;
      font-weight: 600;
    }
    
    .prediction-fail {
      color: #f44336;
      font-weight: 600;
    }

    /* Loading State */
    .loading-container {
      text-align: center;
      padding: 80px 40px;
    }

    .loading-container p {
      margin-top: 24px;
      color: #666;
      font-size: 16px;
    }

    /* Simulation Active State */
    .simulation-active {
      max-width: 1000px;
      margin: 0 auto;
    }

    .simulation-control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .running-status, .completed-status {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }

    .running-status {
      color: #2196f3;
    }

    .completed-status {
      color: #4caf50;
    }

    .success-icon {
      color: #4caf50;
      font-size: 20px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .charts-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .simulation-control {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SimulationComponent implements OnInit, OnDestroy {
  datasetId!: number;
  simulationData: SimulationRow[] = [];
  processedRowsData: SimulationRow[] = [];
  recentRows: SimulationRow[] = [];
  tableDataSource = new MatTableDataSource<SimulationRow>([]);
  isLoading = false;
  isRunning = false;
  isCompleted = false;
  hasStarted = false;
  currentIndex = 0;
  intervalId?: number;
  
  // Statistics
  processedRowsCount = 0;
  passCount = 0;
  failCount = 0;
  averageConfidence = 0;

  // Empty state data
  emptyTableData = [];
  
  get processedRows(): number {
    return this.processedRowsCount;
  }
  
  // Chart data
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Quality Score',
      data: [],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  };
  
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        display: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        },
        title: {
          display: true,
          text: 'Time',
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
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };
  
  donutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4caf50', '#f44336'],
      borderWidth: 0
    }]
  };
  
  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: '#666',
          usePointStyle: true
        }
      }
    }
  };
  
  displayedColumns = ['rowIndex', 'timestamp', 'prediction', 'confidence'];
  fullDisplayedColumns = ['time', 'sampleId', 'prediction', 'confidence', 'temperature', 'pressure', 'humidity'];

  // Empty chart data for before state
  emptyLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Quality Score',
      data: [],
      borderColor: '#2196f3',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.4
    }]
  };

  emptyDonutChartData: ChartData<'doughnut'> = {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [],
      backgroundColor: ['#4caf50', '#f44336'],
      borderWidth: 0
    }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.datasetId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startSimulation() {
    this.isLoading = true;
    this.hasStarted = true;
    
    this.apiService.getSimulationData(this.datasetId).subscribe({
      next: (data) => {
        this.simulationData = data;
        this.isLoading = false;
        this.runSimulation();
      },
      error: (error) => {
        console.error('Error loading simulation data:', error);
        this.snackBar.open('Failed to load simulation data', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.hasStarted = false;
      }
    });
  }

  runSimulation() {
    this.isRunning = true;
    this.currentIndex = 0;
    this.processedRowsCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.processedRowsData = [];
    this.recentRows = [];
    this.tableDataSource.data = [];
    
    this.intervalId = window.setInterval(() => {
      if (this.currentIndex < this.simulationData.length) {
        this.processNextRow();
      } else {
        this.completeSimulation();
      }
    }, 1000); // 1 second interval
  }

  processNextRow() {
    const row = this.simulationData[this.currentIndex];
    
    this.apiService.simulateStep(this.datasetId, row).subscribe({
      next: (response) => {
        const processedRow = response.row;
        this.processedRowsData.push(processedRow);
        this.processedRowsCount++;
        
        // Update statistics
        if (processedRow.prediction === 1) {
          this.passCount++;
        } else {
          this.failCount++;
        }
        
        this.updateAverageConfidence();
        this.updateCharts(processedRow);
        this.updateRecentRows(processedRow);
        
        this.currentIndex++;
      },
      error: (error) => {
        console.error('Simulation error:', error);
        this.snackBar.open('Simulation error occurred', 'Close', { duration: 3000 });
      }
    });
  }

  updateAverageConfidence() {
    if (this.processedRowsData.length > 0) {
      const totalConfidence = this.processedRowsData.reduce((sum, row) => sum + (row.confidence || 0), 0);
      this.averageConfidence = (totalConfidence / this.processedRowsData.length) * 100;
    }
  }

  updateCharts(row: SimulationRow) {
    // Update line chart with quality scores
    const labels = this.lineChartData.labels as string[];
    const confidenceData = this.lineChartData.datasets[0].data as number[];
    
    // Add new data point
    const timeLabel = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    labels.push(timeLabel);
    
    // Use confidence as quality score (75-95% range for realistic simulation)
    const qualityScore = Math.max(75, Math.min(95, (row.confidence || 0) * 100 + Math.random() * 10));
    confidenceData.push(qualityScore);
    
    // Keep only last 20 data points for better visibility
    if (labels.length > 20) {
      labels.shift();
      confidenceData.shift();
    }
    
    // Force chart update by creating new object
    this.lineChartData = {
      labels: [...labels],
      datasets: [{
        label: 'Quality Score',
        data: [...confidenceData],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    };
    
    // Update donut chart
    this.donutChartData = {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [this.passCount, this.failCount],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }]
    };
  }

  updateRecentRows(row: SimulationRow) {
    // Generate sensor data once and store it with the row
    const enhancedRow = {
      ...row,
      sensorData: {
        temperature: (20 + Math.random() * 20).toFixed(1) + '°C', // 20-40°C
        pressure: Math.floor(1000 + Math.random() * 100) + ' hPa', // 1000-1100 hPa
        humidity: (50 + Math.random() * 30).toFixed(1) + '%' // 50-80%
      }
    };
    
    this.recentRows.unshift(enhancedRow);
    if (this.recentRows.length > 10) {
      this.recentRows.pop();
    }
    
    // Update the MatTableDataSource and trigger change detection
    this.tableDataSource.data = [...this.recentRows];
    this.cdr.detectChanges();
    
    console.log('📊 Added row to table. Recent rows count:', this.recentRows.length);
    console.log('📋 Enhanced row:', enhancedRow);
    console.log('📋 Table data source updated:', this.tableDataSource.data.length, 'rows');
  }

  completeSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    this.isCompleted = true;
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
  }

  restartSimulation() {
    this.isCompleted = false;
    this.isRunning = false;
    this.processedRowsCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.averageConfidence = 0;
    this.processedRowsData = [];
    this.recentRows = [];
    this.currentIndex = 0;
    
    // Reset charts
    this.lineChartData = {
      labels: [],
      datasets: [{
        label: 'Quality Score',
        data: [],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    };
    
    this.donutChartData = {
      labels: ['Pass', 'Fail'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }]
    };
    
    this.runSimulation();
  }

  goBack() {
    this.router.navigate(['/training', this.datasetId]);
  }

  goToStart() {
    this.router.navigate(['/upload']);
  }

  formatTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  }

  getPredictionClass(prediction: number | undefined): string {
    return prediction === 1 ? 'prediction-pass' : 'prediction-fail';
  }

}
