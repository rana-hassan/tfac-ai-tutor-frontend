import React from "react";
import DevNotes from "../components/rpg/DevNotes";
import ApiDocumentation from "../components/docs/ApiDocumentation";

/**
 * DevDocs Page - RPG System Documentation
 * Access this page during development to view implementation details
 * Remove this page in production builds
 */
export default function DevDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <ApiDocumentation />
        <DevNotes />
      </div>
    </div>
  );
}