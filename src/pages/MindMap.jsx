import React from "react";
import MindMapCanvas from "../components/mindmap/MindMapCanvas";

export default function MindMapPage() {
  // This page wraps the canvas and ensures it fits within the main layout area.
  // The header is 64px (h-16 / 4rem) tall, so we calculate the remaining viewport height.
  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <MindMapCanvas />
    </div>
  );
}