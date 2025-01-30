# Backpressure Worker

A flexible Cloudflare Worker for dynamically calculating system backpressure based on configurable queries.

> 💡 **Backpressure** is a flow control mechanism that prevents overload by regulating data production based on the system’s capacity to process it.

## Handling Backpressure

In distributed systems, excessive load can degrade performance or cause failures. To mitigate this, the Backpressure Worker implements:

- **Rate limiting**: Restricts incoming requests to prevent overload.
- **Queueing & buffering**: Temporarily stores excess data to smooth out spikes.
- **Adaptive load shedding**: Drops lower-priority requests when under stress.

Proper backpressure handling ensures system reliability, prevents resource exhaustion, and improves overall stability.

## Overview

The Backpressure Worker enables you to:

- Define multiple query types for monitoring system load
- Calculate backpressure based on configurable thresholds
- Gracefully handle partial query failures
- Cache and track query results using Workers KV
- Visualize metrics via an interactive dashboard

## Prerequisites

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## Installation

### 1. Create a KV Namespace

```bash
npx wrangler kv:namespace create BACKPRESSURE_KV
```

### 2. Update `wrangler.json`

```json
{
  "kv_namespaces": [
    {
      "binding": "BACKPRESSURE_KV",
      "id": "your-production-namespace-id",
      "preview_id": "your-preview-namespace-id"
    }
  ]
}
```

### 3. Configure Queries in Environment Variables

```json
{
  "vars": {
    "Queries": [
      {
        "name": "example-kv",
        "type": "workers-kv",
        "warn": 500,
        "emergency": 900
      }
    ]
  }
}
```

### 4. (Optional) Update KV Value for Testing

```
npx wrangler kv:key put --binding=BACKPRESSURE_KV "backpressure_kv_queries/example-kv" "600"
```

## Deployment

```bash
npx wrangler deploy
```

## API Endpoints

The worker exposes the following endpoints:

- `GET /` - Returns the current backpressure value
- `GET /ui` - Real-time visualization dashboard
- `GET /cache` - Retrieves the complete cache history
- `GET /queries` - Returns the configured queries

## Visualization Dashboard

The built-in monitoring dashboard provides real-time visualization of system metrics, including:

- Line charts showing historical trends per metric
- Warning and emergency threshold indicators
- Auto-refresh every 60 seconds
- Time-based filtering via URL parameters (`start` and `end`)
- Responsive design with mobile support

### URL Parameters

The dashboard supports time-based filtering with the following parameters:

- `start`: Unix timestamp for the start of the time range
- `end`: Unix timestamp for the end of the time range

**Example:** `/ui?start=1706313600000&end=1706400000000`

## Caching Mechanism

The worker caches query results using Workers KV:

- Updates cache every 60 seconds
- Maintains historical time-series data
- Falls back to cached values on query failures

## Query Configuration

### Required Fields

- `name`: Unique identifier for the query
- `type`: Query type handler identifier
- `warn`: Warning threshold value
- `emergency`: Emergency threshold value
- `curve`: Throttling curve exponential factor (default: 4)

## Backpressure Calculation

### Value Ranges

- **Normal Operation**: Value ≤ `warn` (0% throttling)
- **Degraded Performance**: `warn` < value < `emergency` (partial throttling)
- **Emergency State**: Value ≥ `emergency` (100% throttling)

### Calculation Formula

```typescript
throttlePercent = 1 - Math.exp(-curve * loadFactor);
loadFactor =
  (currentValue - warningThreshold) / (emergencyThreshold - warningThreshold);
```

The final backpressure percentage is calculated as:

```typescript
1 - Math.max(...throttlePercents);
```

## Error Handling

- Graceful fallback to cached values on query failures
- JSON error responses with descriptive messages
- HTTP 500 status code for internal errors
- Console error logging for debugging

## Adding Custom Query Types

### 1. Implement a Query Handler

```typescript
interface QueryHandler {
  refresh(query: BackpressureQuery): Promise<number>;
}

class MyCustomQueryHandler implements QueryHandler {
  async refresh(query: BackpressureQuery): Promise<number> {
    // Implement query logic
    return value;
  }
}
```

### 2. Register the Handler in `src/queries.ts`

```typescript
export function getQueryHandler(type: string): QueryHandler {
  // Add your handler here
}
```
