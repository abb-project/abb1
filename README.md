# IntelliInspect: Real-Time Predictive Quality Control

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![Angular](https://img.shields.io/badge/Angular-18+-red)](https://angular.io)
[![.NET](https://img.shields.io/badge/.NET-Core_8-purple)](https://dotnet.microsoft.com)
[![Python](https://img.shields.io/badge/Python-3.11+-green)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal)](https://fastapi.tiangolo.com)

**AI-powered manufacturing quality control system with real-time predictive analytics**

## Overview

IntelliInspect is a complete **real-time predictive quality control system** designed for manufacturing environments. Using machine learning and sensor data, it predicts product quality **before** defects occur, enabling proactive process optimization and significant cost savings.

### The Problem It Solves
- **Manufacturing Crisis**: Production lines with 99%+ failure rates
- **Reactive Quality Control**: Finding defects after products are made  
- **Manual Inspection**: Slow, expensive, and inconsistent human inspectors
- **Waste Costs**: Millions lost in scrapped materials and failed products

### The IntelliInspect Solution
- **Predictive Analytics**: AI predicts quality issues before they happen
- **Real-Time Processing**: 1-second prediction intervals during production
- **Live Dashboard**: Beautiful visualizations with actionable insights
- **ROI Impact**: Prevent waste by stopping bad production early

---

## Quick Start (5 Minutes)

### Prerequisites
- **Docker Desktop** installed and running
- **4GB RAM** available for containers
- **Ports Available**: 4200, 5000, 8000

### 1-Command Setup
```bash
git clone <repository-url>
cd abb1
docker compose up --build
```

### Access Your Application
- **Web Application**: http://localhost:4200
- **Backend API**: http://localhost:5000  
- **ML Service Docs**: http://localhost:8000/docs

---

## Live Demo Experience

###  Demo Video
> **Full Demo**: Watch IntelliInspect in action from upload to real-time predictions

https://github.com/user-attachments/assets/616addaa-0781-4f6c-b8c4-bbb69c652389

*Upload your demo video to GitHub Issues or Releases, then copy the generated URL here*

---

### Step 1: Upload Dataset (30 seconds)
1. **Drag & Drop** any CSV file with manufacturing sensor data
2. **Instant Analysis** - See metadata, pass rates, and time ranges
3. **Ready-to-Use Datasets** available:
   - `sample_quality_data.csv` (30 rows - quick demo)
   - `manufacturing_quality_700_rows.csv` (700 rows - realistic demo)
   - Generate custom datasets with `dataset_generator.py`

### Step 2: Configure Date Ranges (30 seconds)  
1. **Select Training Period** (70% of data for AI learning)
2. **Choose Testing Period** (15% for model validation)
3. **Pick Simulation Period** (15% for real-time demo)
4. **Validation Feedback** - Immediate confirmation of data availability

### Step 3: Train AI Model (2 minutes)
1. **Click Train** - XGBoost machine learning begins
2. **Live Progress** - Real-time training status updates
3. **Model Results** - Accuracy, precision, recall, F1-score metrics
4. **Confusion Matrix** - Detailed prediction performance analysis

### Step 4: Real-Time Simulation (2 minutes)
1. **Start Simulation** - Process data at 1-second intervals
2. **Live Charts** - Real-time line and donut chart updates  
3. **Statistics Panel** - Pass/fail counts and confidence scores
4. **Data Table** - Row-by-row predictions with timestamps

### Demo Results
```
🎯 Typical Demo Performance:
• Model Accuracy: 85-95%
• Prediction Confidence: 80-90%
• Processing Speed: <100ms per prediction
• Visual Experience: Smooth real-time animations
```

---

## System Architecture

### Technology Stack
- **Frontend**: Angular 18+ with Material Design and Chart.js
- **Backend**: ASP.NET Core 8 with Entity Framework and SQLite
- **ML Service**: Python FastAPI with XGBoost and scikit-learn  
- **Deployment**: Docker Compose with multi-service orchestration

### Service Architecture
```
Frontend (Angular) ──► Backend (.NET) ──► ML Service (Python)
     ↓                      ↓                    ↓
  Port 4200              Port 5000           Port 8000
  Material UI            REST API            XGBoost ML
  Chart.js              SQLite DB           FastAPI Docs
```

### Data Flow
1. **Upload** → CSV parsing → Database metadata
2. **Configure** → Date validation → Record counting  
3. **Train** → Feature engineering → XGBoost model
4. **Simulate** → Real-time prediction → Live dashboard

---

## Project Structure

```
abb1/
├── 📂 frontend/          # Angular 18+ application
│   ├── src/app/         # Angular components & services
│   ├── Dockerfile       # Frontend container config
│   └── package.json     # NPM dependencies
├── 📂 backend/          # ASP.NET Core 8 API
│   ├── Controllers/     # REST API endpoints
│   ├── Services/        # Business logic layer
│   ├── Models/          # Data models & DTOs
│   └── Dockerfile       # Backend container config
├── 📂 ml-service/       # Python FastAPI ML service
│   ├── main.py          # FastAPI app with XGBoost
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # ML service container config
├── 📄 docker-compose.yml           # Multi-service orchestration
├── 📄 dataset_generator.py         # Custom dataset creation tool
├── 📊 sample_quality_data.csv      # 30-row demo dataset
├── 📊 manufacturing_quality_700_rows.csv  # 700-row demo dataset
└── 📚 PROJECT_DOCUMENTATION.md     # Complete technical docs
```

---

## Dataset Generation

### Create Custom Datasets
```bash
python dataset_generator.py
```

**Interactive Options**:
- **Row Count**: 10 to 10,000+ rows
- **Time Span**: Days to spread the data over
- **Pass Rate**: Target quality percentage (0-100%)
- **Filename**: Custom output file name

### Sample Dataset Formats
```csv
timestamp,temperature,pressure,vibration,speed,quality
2025-08-07 15:43:07,77.5,2.47,0.43,1576,pass
2025-08-07 19:06:57,72.5,1.09,0.21,1406,pass
2025-08-08 04:44:19,84.5,2.29,0.45,1548,fail
```

**Sensor Patterns**:
- **Pass Conditions**: Temp 69-75°C, Pressure 1.1-1.5, Low vibration
- **Fail Conditions**: Temp >80°C, Pressure >2.0, High vibration  
- **Critical Failures**: Temp >90°C, Pressure >2.8, Excessive vibration

---

## Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker --version
docker compose version

# Restart Docker Desktop
# Kill any running containers
docker compose down
docker compose up --build
```

### Port Conflicts
```bash
# Check what's using ports
netstat -aon | findstr :4200
netstat -aon | findstr :5000
netstat -aon | findstr :8000

# Kill processes using ports (Windows)
taskkill /PID <process-id> /F
```

### Container Logs
```bash
# Check individual service logs
docker compose logs frontend-angular
docker compose logs backend-dotnet  
docker compose logs ml-service-python

# Follow real-time logs
docker compose logs -f
```

### Common Fixes
1. **Docker not running** → Start Docker Desktop
2. **Port already in use** → Kill processes or change ports
3. **Build failures** → Clear Docker cache: `docker system prune`
4. **Memory issues** → Increase Docker memory limit to 4GB

---

## Performance Optimization

### Development Mode
- **Frontend**: Live reload with `ng serve`
- **Backend**: Hot reload with `dotnet watch`
- **ML Service**: Auto-reload with `uvicorn --reload`

### Production Optimization
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for model and prediction caching
- **Load Balancing**: Multiple ML service instances
- **CDN**: Static asset delivery optimization

---

## Business Impact

### Manufacturing Crisis Scenarios

#### Scenario 1: Critical Production Failure
**Before IntelliInspect**:
- 700 parts produced → 697 failures (99.6% waste)
- Material cost: $50/part → $34,850 waste per batch
- Manual inspection finds defects after production

**After IntelliInspect**:
- Early prediction stops production at sensor alert  
- Prevent 80% of failures → Save $27,880 per batch
- ROI: System pays for itself in first week

#### Scenario 2: Quality Optimization
**Before**: 81% pass rate, unpredictable quality
**After**: 
- AI identifies optimal sensor ranges
- Process adjustments improve to 92% pass rate
- 11% quality improvement = massive cost savings

### ROI Calculator
```
Defect Prevention Value = 
  (Current Waste Cost) × (Prevention Rate) × (Production Volume)

Example: $34,850 × 0.80 × 52 weeks = $1,449,280/year saved
```

---

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone <repo-url>
cd abb1

# Backend development
cd backend
dotnet restore
dotnet run

# Frontend development  
cd frontend
npm install
ng serve

# ML service development
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

### Code Style
- **Frontend**: Angular style guide with Prettier
- **Backend**: C# conventions with EditorConfig
- **ML Service**: PEP 8 with Black formatter

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🎉 Acknowledgments

Built for hackathon demonstration of enterprise-level software engineering with immediate business impact.

**Technologies**: Angular, ASP.NET Core, Python FastAPI, XGBoost, Docker, Material Design, Chart.js

---

<div align="center">

**🚀 Ready to revolutionize manufacturing quality control?**

[**Start Demo**](http://localhost:4200) | [**View Documentation**](./PROJECT_DOCUMENTATION.md) | [**Generate Dataset**](./dataset_generator.py)

**Built with ❤️ for smarter manufacturing**

</div>
