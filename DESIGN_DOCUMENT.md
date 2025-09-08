# MiniML - Predictive Quality Control System
## Design Document

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                       │
│                                                             │
│  • Upload Component        • Training Component             │
│  • Date Ranges Component  • Simulation Dashboard            │
│  • Chart Components       • API Service                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ 
                               │ HTTP/REST API (Port 4200 → 5000)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (.NET Core)                       │
│                                                             │
│  API Endpoints:                                             │
│  • POST /api/dataset/upload                                 │
│  • POST /api/dataset/validate-dates                         │
│  • POST /api/dataset/train/{id}                             │
│  • POST /api/dataset/simulate/{id}                          │
│  • GET  /api/dataset/simulation/{id}                        │
│  • GET  /api/dataset/{id}                                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP/REST API (Port 5000 → 8000)  
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  ML Service (FastAPI)                       │
│                                                             │
│  API Endpoints:                                             │
│  • GET  /health                                             │
│  • POST /train                                              │
│  • POST /predict                                            │
│  • GET  /models                                             │
│                                                             │
│  ML Components: XGBoost, scikit-learn, pandas               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ Database Connection
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                        │
│                                                             │
│  • Datasets Table                                           │
│  • File System Storage (CSV files)                          │
│  • Model Metadata Storage                                   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Components

#### Frontend Layer (Angular 18+)
- Upload Component: File upload with drag-and-drop and progress tracking
- Date Ranges Component: Interactive date pickers with timeline visualization
- Training Component: Model training interface with metrics visualization
- Simulation Component: Real-time prediction dashboard with live charts
- API Service: Centralized HTTP client for backend communication
- Chart Components: Chart.js integration for data visualization

#### Backend Layer (ASP.NET Core 8)
- DatasetController: RESTful API endpoints for all operations
- DatasetService: Business logic for data processing and validation
- ML Service Integration: HTTP client for ML service communication
- Entity Framework: Database ORM for data persistence
- DTOs: Data transfer objects for API communication

#### ML Service Layer (FastAPI + Python 3.13)
- Training Endpoint: Model training with XGBoost
- Prediction Endpoint: Real-time inference
- Data Processing Pipeline: Feature engineering and validation
- Model Storage: In-memory model management with cleanup
- Health Monitoring: Service status and diagnostics

#### Data Layer
- SQLite Database: Lightweight database for development
- File System: CSV file storage and management
- In-Memory Storage: Model artifacts and temporary data

---

## Data Flow Diagram

```
1. Dataset Upload
   Frontend → POST /api/dataset/upload → Backend → Parse CSV → Database
   Backend → Return metadata → Frontend

2. Date Range Validation  
   Frontend → POST /api/dataset/validate-dates → Backend → Query records → Database
   Backend → Return record counts → Frontend

3. Model Training
   Frontend → POST /api/dataset/train/{id} → Backend → POST /train → ML Service
   ML Service → Return model metrics → Backend → Frontend

4. Real-Time Simulation
   Frontend → POST /api/dataset/simulate/{id} → Backend → POST /predict → ML Service  
   ML Service → Return prediction → Backend → Frontend (Live updates)

   ┌─────────────────────────────────────────────────────────────┐
   │                     DATA FLOW DIAGRAM                       │
   └─────────────────────────────────────────────────────────────┘

STEP 1: Dataset Upload
───────────────────────
Frontend → POST /api/dataset/upload → Backend → Parse CSV → Database
                                        ↓
Frontend ← Return metadata (rows, cols, pass rate, dates) ←─────┘

STEP 2: Date Range Validation  
──────────────────────────────
Frontend → POST /api/dataset/validate-dates → Backend → Query records → Database
                                                ↓
Frontend ← Return validation result + record counts ←─────────────────┘

STEP 3: Model Training
──────────────────────
Frontend → POST /api/dataset/train/{id} → Backend → Fetch training data → Database
                                            ↓
                                          Backend → POST /train → ML Service
                                            ↓                      ↓
                                          Backend ← Model metrics ←┘
                                            ↓
                                          Backend → Save model ID → Database
                                            ↓
Frontend ← Return training metrics ←──────┘

STEP 4: Real-Time Simulation (Per Row)
───────────────────────────────────────
Frontend → POST /api/dataset/simulate/{id} → Backend → POST /predict → ML Service
                                               ↓                        ↓
Frontend ← Prediction + confidence ←──────────┘ ←─ Prediction result ←──┘
    ↓
Frontend updates live charts and table in real-time
```

### Data Flow Summary

1. Dataset Upload: CSV file → Backend parsing → Database storage → Metadata response
2. Date Validation: Date ranges → Backend validation → Database queries → Record counts
3. Model Training: Training/testing data → ML service → Model artifacts → Performance metrics
4. Real-Time Simulation: Simulation data → Row-by-row prediction → Live UI updates → Completion

---

## API Contract & Payload Structure

### Backend API (.NET Core) - Base URL: `http://localhost:5000/api`

#### 1. POST `/api/dataset/upload`
Upload CSV file for processing and metadata extraction.
- Request:
  - Content-Type: `multipart/form-data`
  - Body: CSV file as `IFormFile`
- Response:
  - 200 OK:
    ```json
    {
      "datasetId": 1,
      "fileName": "sample_data.csv",
      "totalRows": 700,
      "totalColumns": 5,
      "passRate": 0.81,
      "earliestTimestamp": "2025-08-07T15:43:07Z",
      "latestTimestamp": "2025-09-06T23:52:54Z"
    }
    ```
  - 400 Bad Request: Invalid file format
  - 500 Internal Server Error: Processing failed

#### 2. POST `/api/dataset/validate-dates`
Validate date ranges for training/testing/simulation.
- Request:
  ```json
  {
    "datasetId": 1,
    "trainingStartDate": "2025-08-07T00:00:00Z",
    "trainingEndDate": "2025-08-21T23:59:59Z",
    "testingStartDate": "2025-08-22T00:00:00Z",
    "testingEndDate": "2025-08-28T23:59:59Z",
    "simulationStartDate": "2025-08-29T00:00:00Z",
    "simulationEndDate": "2025-09-06T23:59:59Z"
  }
  ```
- Response:
  - 200 OK (Valid):
    ```json
    {
      "isValid": true,
      "errorMessage": null,
      "trainingRecordCount": 490,
      "testingRecordCount": 105,
      "simulationRecordCount": 105
    }
    ```
  - 400 Bad Request (Invalid):
    ```json
    {
      "isValid": false,
      "errorMessage": "Training start date must be before end date",
      "trainingRecordCount": 0,
      "testingRecordCount": 0,
      "simulationRecordCount": 0
    }
    ```

#### 3. POST `/api/dataset/train/{datasetId}`
Trigger model training using configured date ranges.
- Request: No body required (uses stored date ranges)
- Response:
  - 200 OK:
    ```json
    {
      "modelId": "550e8400-e29b-41d4-a716-446655440000",
      "accuracy": 0.95,
      "precision": 0.92,
      "recall": 0.88,
      "f1Score": 0.90,
      "confusionMatrix": [[45, 5], [3, 47]]
    }
    ```
  - 400 Bad Request: Date ranges not set or insufficient data
  - 404 Not Found: Dataset not found
  - 500 Internal Server Error: Training failed

#### 4. GET `/api/dataset/simulation/{datasetId}`
Get all simulation data for the specified dataset.
- Request: No body
- Response:
  - 200 OK:
    ```json
    [
      {
        "rowIndex": 0,
        "timestamp": "2025-08-29T10:15:30Z",
        "prediction": 1,
        "confidence": 0.85,
        "data": {
          "temperature": 25.5,
          "pressure": 1013.2,
          "humidity": 60.0
        }
      }
    ]
    ```

#### 5. POST `/api/dataset/simulate/{datasetId}`
Simulate a single prediction step.
- Request:
  ```json
  {
    "rowIndex": 0,
    "timestamp": "2025-08-29T10:15:30Z",
    "prediction": 0,
    "confidence": 0.0,
    "data": {
      "temperature": 25.5,
      "pressure": 1013.2,
      "humidity": 60.0
    }
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "row": {
        "rowIndex": 0,
        "timestamp": "2025-08-29T10:15:30Z",
        "prediction": 1,
        "confidence": 0.85,
        "data": {
          "temperature": 25.5,
          "pressure": 1013.2,
          "humidity": 60.0
        }
      },
      "isCompleted": false
    }
    ```
  - 400 Bad Request: Model not trained
  - 404 Not Found: Dataset not found

#### 6. GET `/api/dataset/{datasetId}`
Get dataset metadata.
- Response: Same as upload response format

### ML Service API (FastAPI) - Base URL: `http://localhost:8000`

#### 1. GET `/health`
Health check endpoint.
- Response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-01-27T10:15:30Z"
  }
  ```

#### 2. POST `/train`
Train a machine learning model.
- Request:
  ```json
  {
    "dataset_id": "1",
    "training_data": [
      {"temperature": 25.5, "pressure": 1013.2, "humidity": 60.0, "quality": "pass"}
    ],
    "testing_data": [
      {"temperature": 24.8, "pressure": 1012.8, "humidity": 58.5, "quality": "fail"}
    ]
  }
  ```
- Response:
  ```json
  {
    "model_id": "550e8400-e29b-41d4-a716-446655440000",
    "accuracy": 0.95,
    "precision": 0.92,
    "recall": 0.88,
    "f1_score": 0.90,
    "confusion_matrix": [[45, 5], [3, 47]]
  }
  ```

#### 3. POST `/predict`
Make a prediction using a trained model.
- Request:
  ```json
  {
    "model_id": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "temperature": 25.5,
      "pressure": 1013.2,
      "humidity": 60.0
    }
  }
  ```
- Response:
  ```json
  {
    "prediction": 1,
    "confidence": 0.85
  }
  ```

#### 4. GET `/models`
List all trained models.
- Response:
  ```json
  {
    "models": [
      {
        "model_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2025-01-27T10:15:30Z",
        "feature_count": 3
      }
    ]
  }
  ```

