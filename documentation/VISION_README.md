# FinAssist Vision — Image Intelligence Overview

## Overview

The FinAssist Vision capability analyzes images, charts, and tables embedded in financial documents. It combines classical computer vision with LLM prompts to generate visual insights that complement the textual analysis pipeline.

## Features

### Chart Analysis
- Automatic detection of charts inside PDFs
- Specialized processing for bar, line, and pie charts
- Extraction of trends and quantitative values
- Delivery of finance-relevant narratives

### Table Analysis
- Recognition of tabular layouts
- Extraction of structured financial metrics
- Highlighting of KPIs such as ROI, NAV, and growth
- Clean, hierarchical responses

### General Image Analysis
- Contextual descriptions of graphics, photos, and diagrams
- Object and logo detection
- Explanations aligned with the document’s business context

## Installation

### 1. Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Environment
```bash
# .env
OPENROUTER_API_KEY=your_api_key_here
```

### 3. Tests
```bash
python backend/tests/test_vision.py
```

## Usage

### Document Upload
1. Drag and drop PDFs into the interface.
2. Detected images are queued for analysis automatically.
3. Ask questions about the visual content inside the chat.

### Example Questions
```
What do the charts on page 3 show?
How do the tables summarize performance?
Describe the trends visible in this document.
What do the pie charts represent?
```

### Example Responses
```
Chart Analysis — Page 3

Chart 1 (top left):
- Type: bar chart
- Data: quarterly revenue Q1-Q4 2023
- Trend: 15% growth from Q1 to Q4
- Insight: Q4 accelerates eight percentage points over Q3

Chart 2 (bottom right):
- Type: pie chart
- Data: investment allocation by sector
- Insight: Technology 45%, Finance 30%, Healthcare 25%
```

## Technical Architecture

### Processing Pipeline
```
PDF upload -> Image extraction -> Type detection -> Optimization -> Vision API -> Cache -> Response
```

### Core Components

#### 1. PDF Extraction (`utils/pdf.py`)
```python
def extract_pdf_text_images_and_pages(pdf_bytes):
    # Extract text and images
    # Classify image types automatically
    # Optimize payloads for downstream analysis
```

#### 2. Vision Analysis (`utils/vision.py`)
```python
class VisionAnalyzer:
    def describe_chart(image_bytes)
    def describe_table(image_bytes)
    def describe_image(image_bytes)
```

#### 3. API Integration (`app.py`)
```python
if p.get('images'):
    for img in p['images']:
        analysis = analyze_image_from_pdf(img, p['page'])
```

## Metrics and Performance

### Intelligent Cache
- Automatically persists responses
- Avoids redundant API calls
- Keeps memory usage predictable

### Image Optimization
- Progressive compression (90% down to 70%)
- Automatic resizing up to 1,200 px
- Maximum payload size of 800 KB

### Error Handling
- Automatic retry with up to three attempts
- Exponential backoff between retries
- OCR fallback if the vision model fails
- Configurable timeout (30 seconds)

## Supported Documents

### Financial Reports
- Performance charts
- Metric tables
- Allocation diagrams

### Investment Presentations
- Slides with charts
- Tabular datasets
- Infographics

### Regulatory Filings
- Compliance tables
- Risk metrics
- Process flows

## Intelligent Detection

### Classification Algorithm
```python
def analyze_image_type(image_bytes):
    # OpenCV metrics
    # Pixel density
    # Color variance
    # Line/rectangle detection
    # Probability scoring
```

### Confidence Scores
- `> 0.6`: confirmed chart
- `> 0.3`: potential chart
- `< 0.3`: general image

## Monitoring

### Statistics Endpoint
```bash
GET /vision/stats
```

### Sample Response
```json
{
    "api_calls": 15,
    "cache_size": 8,
    "cache_hits": 3,
    "processing_time": 2.3
}
```

### Sample Logs
```
Processing file: financial-report.pdf
Extracting PDF with images...
Analyzing three images on page 2...
Image optimized: 245760 -> 156432 bytes
Calling vision API (attempt 1/3)...
Vision API succeeded (call #15)
```

## Advanced Configuration

### Environment Variables
```bash
OPENROUTER_API_KEY=your_key
VISION_CACHE_FILE=vision_cache.json
MAX_RETRIES=3
REQUEST_TIMEOUT=30
```

### Performance Parameters
```python
MAX_IMAGE_SIZE_KB = 800
COMPRESSION_QUALITIES = [90, 85, 80, 75]
API_TIMEOUT = 30
```

## Future Work

### Local Models
- Integrate BLIP-2 for offline analysis
- Reduce dependency on external APIs
- Improve data confidentiality

### Advanced Analytics
- Corporate logo recognition
- Signature detection
- Structured data extraction

### Optimizations
- Redis-backed cache
- Smarter compression heuristics
- Parallelized analysis pipelines

## Testing

### Full Test Script
```bash
python backend/tests/test_vision.py
```

### Covered Scenarios
- Module imports
- Vision API call
- PDF extraction with images
- Vision statistics
- Cache persistence

## Support

### Debug Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Diagnostics
```bash
pip list | grep -E "(opencv|numpy|pillow)"
curl -X GET http://localhost:5002/vision/stats
```

---

FinAssist Vision is ready to interpret financial documents with consistent, explainable, and production-ready image intelligence.