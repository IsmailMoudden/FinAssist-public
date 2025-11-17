# Production Architecture & Improvements

## Objective
Modernize the current demo (OpenRouter API, simulated vision, local storage) into a hardened, scalable platform that runs local vision and language models on a dedicated VPS.

---

## 1. Target Architecture

- **Backend**
  - VPS running Ubuntu or Debian
  - Python API (Flask or FastAPI)
  - Local LLM (for example Llama.cpp, Ollama, vLLM, or Hugging Face Transformers)
  - Local vision model (BLIP, Donut, TrOCR, PaddleOCR)
  - On-prem PDF, OCR, and vision processing
  - File storage on disk or in a database
- **Frontend**
  - React, Vue, or the current HTML+JS client
  - Authentication and user management
  - Optional cloud sync

---

## 2. Technical Implementation Roadmap

### a) Server Deployment
- Provision a VPS (OVH, Scaleway, Hetzner, etc.)
- Install Python, Node.js, and optionally Docker
- Deploy the Flask/FastAPI service with gunicorn and nginx

### b) Local LLM
- Install an open-source model (Llama 2, Mistral, Phi, etc.) via Ollama, vLLM, or Transformers
- Update the API to call the local model instead of OpenRouter
- Fine-tune with financial corpora when needed (Hugging Face, LoRA, QLoRA)
- Manage GPU/CPU memory based on model size

### c) Local Vision Model
- Install BLIP, Donut, TrOCR, or PaddleOCR as required
- Adapt `describe_image` to call the local model (Transformers runtime or REST microservice)
- Handle pre/post-processing with OpenCV and Pillow

### d) PDF/OCR Extraction
- Keep the existing PyPDF2 and pytesseract logic while adding automatic OCR fallback for scanned pages
- Add table extraction (Camelot, Tabula)

### e) Storage and Security
- Persist files on disk or through PostgreSQL/S3
- Add JWT authentication and granular permissions
- Encrypt sensitive data at rest and in transit

---

## 3. Alignment With the Current Implementation

- **Flask API**: already exists and only needs extended endpoints for local models
- **PDF/OCR**: reusable; add automatic OCR fallback
- **Vision**: replace mocks with the production-ready analyzer in `utils/vision.py`
- **LLM**: swap OpenRouter calls for local inference inside `/ask` in `app.py`
- **Frontend**: keep the current layout but migrate to a Tailwind build pipeline for production
- **Storage**: IndexedDB serves local needs; add backend syncing for multi-user scenarios

---

## 4. Key Considerations
- **Server resources**: size RAM/CPU/GPU for target models
- **Security**: enforce authentication, encryption, and monitoring
- **Scalability**: plan for model orchestration (Kubernetes, Ray, etc.)
- **Maintainability**: implement logging, monitoring, and CI/CD

---

## 5. Next-Level Initiatives
- Integrate a workflow orchestrator (Airflow, Prefect)
- Add a semantic search engine (Qdrant, Weaviate)
- Publish a documented REST API
- Deliver an admin portal for user and log management