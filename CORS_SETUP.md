# CORS Configuration Guide

CORS (Cross-Origin Resource Sharing) must be configured on the **backend server** (localhost:8080), not the React frontend.

## Frontend Configuration (Already Done ✅)

The React app has been updated to include CORS-friendly fetch options:
```javascript
{
  method: 'POST',
  headers: {
    'Accept': 'application/json',
  },
  credentials: 'include',
  mode: 'cors',
}
```

## Backend Configuration (Required on localhost:8080)

Configure your backend server to allow requests from the React app. Here are examples for common frameworks:

### Python Flask
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

@app.route('/v1/cursive/<extension>', methods=['POST'])
def cursive(extension):
    # Your code here
    pass
```

### Python FastAPI
```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/v1/cursive/{extension}")
async def cursive(extension: str, file: UploadFile):
    # Your code here
    pass
```

### Node.js Express
```javascript
const cors = require('cors');

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.post('/v1/:type/:extension', (req, res) => {
  // Your code here
});
```

### Node.js with Fastify
```javascript
const fastify = require('fastify');
const cors = require('@fastify/cors');

const app = fastify();

app.register(cors, {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
});

app.post('/v1/:type/:extension', async (request, reply) => {
  // Your code here
});
```

### Go (Chi Router)
```go
import "github.com/go-chi/cors"

router.Use(cors.Handler(cors.Options{
  AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
  AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
  AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
  AllowCredentials: true,
}))

router.Post("/v1/{type}/{extension}", handleUpload)
```

### Java Spring Boot
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/v1/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:3001")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Common CORS Configuration Parameters

- **Allow Origins**: List of frontend URLs allowed to access your API
  - `http://localhost:3000` - Vite dev server (primary)
  - `http://localhost:3001` - Fallback port
  - `*` - Allow all origins (not recommended for production)

- **Allow Methods**: HTTP methods the frontend can use
  - POST (for file uploads)
  - GET (for retrieving data)

- **Allow Headers**: Request headers the frontend can send
  - `Content-Type` (automatically handled for FormData)
  - `Accept`

- **Allow Credentials**: Whether to include cookies/auth headers
  - Set to `true` if your API requires authentication

## Testing CORS Setup

After configuring your backend, test with curl:

```bash
curl -X POST \
  -H "Accept: application/json" \
  -F "file=@yourfile.pdf" \
  http://localhost:8080/v1/cursive/pdf
```

If you get a CORS error in the browser console, the backend's CORS configuration needs adjustment.

## Troubleshooting

**Error: "No 'Access-Control-Allow-Origin' header"**
- Backend CORS is not configured
- Check that the origin URL matches exactly (including port)

**Error: "Credentials mode is 'include' but Access-Control-Allow-Credentials is missing"**
- Backend needs `allow_credentials: true` in CORS config

**Error: "Method POST is not allowed"**
- Backend CORS config doesn't include POST in allowed methods
