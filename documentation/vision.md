# Vision (Image Analysis)

## File: `utils/vision.py`

### Purpose
Deliver robust image analysis with caching, error tolerance, and specialized logic for charts, tables, and general visuals found inside financial documents.

### Implementation Overview

#### `VisionAnalyzer` class
```python
class VisionAnalyzer:
    def __init__(self):
        self.cache = self._load_cache()
        self.api_calls_count = 0
```

#### Primary Methods
- `describe_image(image_bytes)`: general-purpose analysis
- `describe_chart(image_bytes)`: chart-specific interpretation
- `describe_table(image_bytes)`: table-specific extraction
- `get_vision_stats()`: usage and cache metrics

### Advanced Capabilities

#### 1. Intelligent Cache
- Persists responses in `vision_cache.json`
- Skips redundant API calls when hashes match
- Keeps memory footprint predictable

#### 2. Image Optimization
- Progressive compression from 90% down to 70% quality
- Automatic resizing with a 1,200 px cap
- Rejects images above 800 KB after optimization

#### 3. Resilient Error Handling
- Automatic retry (up to three attempts)
- Exponential backoff between retries
- OCR fallback when the vision response fails
- Configurable timeout (30 seconds)

#### 4. Image Type Detection
```python
def analyze_image_type(image_bytes):
    # Returns chart, possible_chart, or image
    # Relies on OpenCV metrics
```

### Pipeline Integration

#### PDF Extraction with Images
```python
# utils/pdf.py
def extract_pdf_text_images_and_pages(pdf_bytes):
    # Extract text and images
    # Auto-detect type per image
    # Optimize payloads
```

#### Application Flow
```python
# app.py
if img_data['type'] == 'chart':
    analysis = describe_chart(img_data['data'])
    return f"[Chart page {page_num}] {analysis}"
```

### Specialized Analysis Types

#### Charts
- OpenCV-based detection with density and edge metrics
- Handles bar, line, and pie charts
- Extracts trends and numeric highlights
- Emphasizes financially relevant commentary

#### Tables
- Detects horizontal and vertical lines
- Reconstructs structured cells
- Surfaces KPIs (ROI, NAV, growth, etc.)

#### General Images
- Produces contextual descriptions
- Calls attention to visual cues tied to finance

### Performance Metrics

#### Chart Detection
```python
def calculate_chart_metrics(img_array):
    # Non-white pixel density
    # Color variance
    # Count of straight lines (axes)
    # Count of rectangles (bars)
```

#### Probability Score
- `> 0.6`: confirmed chart
- `> 0.3`: possible chart
- `< 0.3`: general image

### Configuration

#### Environment Variable
```bash
OPENROUTER_API_KEY=your_api_key
```

#### Tunable Parameters
```python
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30
VISION_CACHE_FILE = "vision_cache.json"
```

### API Endpoints

#### `GET /vision/stats`
Returns:
```json
{
    "api_calls": 15,
    "cache_size": 8,
    "cache_hits": 3
}
```

### Usage Example

#### Prompt: "What do the charts show?"
```
Chart Analysis

Chart 1 (page 3):
- Type: bar chart
- Data: quarterly revenue Q1-Q4 2023
- Trend: 15% growth from Q1 to Q4
- Note: Q4 accelerates eight percentage points over Q3

Chart 2 (page 5):
- Type: pie chart
- Data: investment allocation
- Insight: Technology 45%, Finance 30%, Healthcare 25%
```

### Future Work

#### Local Models
- Integrate BLIP-2 or equivalent
- Reduce dependency on hosted APIs
- Improve confidentiality posture

#### Advanced Analysis
- Corporate logo detection
- Signature verification
- Structured table extraction

#### Optimizations
- Redis cache
- Smarter compression strategy
- Parallel processing of image batches

### Testing

#### Test Script
```bash
python backend/tests/test_vision.py
```

#### Covered Scenarios
- Module imports
- Vision API call
- PDF extraction with images
- Vision statistics
- Cache persistence

### Monitoring

#### Sample Logs
```
Processing file: financial-report.pdf
Extracting PDF with images...
Analyzing three images on page 2...
Image optimized: 245760 -> 156432 bytes
Calling vision API (attempt 1/3)...
Vision API succeeded (call #15)
```

#### Tracked Metrics
- Processing time per document
- Number of analyzed images
- Cache hit ratio
- Estimated API cost