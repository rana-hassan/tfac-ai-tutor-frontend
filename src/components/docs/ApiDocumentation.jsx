import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Terminal, Cloud } from "lucide-react";

/**
 * Renders the API specification and related development notes.
 */
export default function ApiDocumentation() {
  const curlExample = `curl -X POST -H "Content-Type: application/json" \\
-d '{"sessionId": "optional-session-id-123"}' \\
https://your-app-url.com/api/v1/init`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          API Specification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* /init Endpoint */}
        <div>
          <h3 className="text-lg font-semibold mb-2">/init</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">POST</Badge>
            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">/api/v1/init</code>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Request Body</h4>
              <pre className="text-sm bg-slate-100 p-3 rounded-md overflow-x-auto">
{`{
  "sessionId": "string" // Optional
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Response Body (Success)</h4>
              <pre className="text-sm bg-slate-100 p-3 rounded-md overflow-x-auto">
{`{
  "sessionId": "string",
  "userProfile": "object",
  "nextLesson": "object"
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Example cURL
              </h4>
              <pre className="text-sm bg-slate-900 text-white p-3 rounded-md overflow-x-auto">
                <code>{curlExample}</code>
              </pre>
            </div>
          </div>
        </div>
        
        <hr />

        {/* HTTP/2 Note */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Note on HTTP/2
          </h3>
          <p className="text-sm text-slate-600">
            This application is HTTP/2-ready. Modern browsers will automatically upgrade connections to HTTP/2 if the server infrastructure (e.g., CDN, Load Balancer) supports it. No client-side code changes are needed to enable multiplexing. The `api.js` helper is designed to create lean, parallel-friendly requests that take full advantage of the protocol.
          </p>
        </div>
        
      </CardContent>
    </Card>
  );
}