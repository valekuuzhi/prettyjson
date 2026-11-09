export interface SampleItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const JSON_SAMPLES: SampleItem[] = [
  {
    id: 'api-response',
    name: 'GitHub API Response',
    description: 'Real-world REST API payload with nested user and repository meta',
    content: `{
  "id": 98451203,
  "node_id": "MDEwOlJlcG9zaXRvcnk5ODQ1MTIwMw==",
  "name": "prettyjson",
  "full_name": "developer/prettyjson",
  "private": false,
  "owner": {
    "login": "developer",
    "id": 102938,
    "avatar_url": "https://avatars.githubusercontent.com/u/102938?v=4",
    "site_admin": false
  },
  "html_url": "https://github.com/developer/prettyjson",
  "description": "Fast, private developer tool for formatting and validating JSON.",
  "stargazers_count": 1420,
  "watchers_count": 1420,
  "language": "TypeScript",
  "has_issues": true,
  "has_projects": true,
  "has_downloads": true,
  "archived": false,
  "disabled": false,
  "license": {
    "key": "mit",
    "name": "MIT License",
    "spdx_id": "MIT"
  },
  "topics": ["json", "formatter", "developer-tool", "react"],
  "stats": {
    "subscribers": 48,
    "forks": 112,
    "open_issues": 3
  }
}`,
  },
  {
    id: 'nested-config',
    name: 'Application Config',
    description: 'Deeply nested configurations with various primitive and composite types',
    content: `{
  "$schema": "https://json.schemastore.org/appsettings.json",
  "app": {
    "name": "PrettyJSON Service",
    "version": "1.0.0",
    "environment": "production",
    "debug": false,
    "telemetry": null
  },
  "server": {
    "host": "127.0.0.1",
    "port": 8080,
    "ssl": {
      "enabled": true,
      "certPath": "/etc/ssl/certs/bundle.crt",
      "keyPath": "/etc/ssl/private/server.key",
      "ciphers": [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256"
      ]
    },
    "rateLimiting": {
      "windowMs": 60000,
      "maxRequests": 1000
    }
  },
  "features": {
    "treeView": true,
    "errorPointer": true,
    "offlineMode": true,
    "maxPayloadBytes": 10485760
  }
}`,
  },
  {
    id: 'geojson',
    name: 'GeoJSON FeatureCollection',
    description: 'Standard geographical spatial features with coordinate arrays',
    content: `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "properties": {
        "name": "San Francisco",
        "elevation": 16,
        "isCapital": false,
        "tags": ["coastal", "bay-area"]
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-0.1278, 51.5074]
      },
      "properties": {
        "name": "London",
        "elevation": 11,
        "isCapital": true,
        "tags": ["europe", "thames"]
      }
    }
  ]
}`,
  },
  {
    id: 'edge-cases',
    name: 'Special & Escaped Strings',
    description: 'Quotes, newlines, unicode emojis, and edge case JSON primitives',
    content: `{
  "escaped_quote": "He said, \\"Hello World!\\"",
  "path_with_slashes": "C:\\\\Program Files\\\\Node\\\\node.exe",
  "unicode_symbols": "\\u00A9 2026 \\u2122 PrettyJSON",
  "multiline_simulated": "Line 1\\nLine 2\\tTabbed",
  "numbers": {
    "integer": 42,
    "negative": -1337,
    "decimal": 3.14159265359,
    "scientific_e_plus": 1.23e+10,
    "scientific_e_minus": 4.56e-8
  },
  "boolean_states": [true, false],
  "null_placeholder": null,
  "empty_structures": {
    "empty_object": {},
    "empty_array": []
  }
}`,
  },
];
