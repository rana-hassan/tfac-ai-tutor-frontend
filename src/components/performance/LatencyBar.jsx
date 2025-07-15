import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

/**
 * LatencyBar - Performance monitoring header that changes color based on response times
 * Sticky header that turns orange (>500ms) or red (>1s) to surface latency issues
 */
export default function LatencyBar({ latency = 0, isConnected = true, className = "" }) {
  const [status, setStatus] = useState("good");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (latency > 1000) {
      setStatus("critical");
      setShowWarning(true);
    } else if (latency > 500) {
      setStatus("warning");
      setShowWarning(true);
    } else {
      setStatus("good");
      setShowWarning(false);
    }
  }, [latency]);

  const getStatusStyles = () => {
    switch (status) {
      case "critical":
        return "bg-red-500/90 text-white border-red-400";
      case "warning":
        return "bg-orange-500/90 text-white border-orange-400";
      default:
        return "bg-green-500/90 text-white border-green-400";
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    if (status === "critical") return <AlertTriangle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  // Only show bar when there are performance issues or connection problems
  if (!showWarning && isConnected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 border-b backdrop-blur-sm ${getStatusStyles()} ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          {getStatusIcon()}
          {!isConnected && "Connection lost - attempting to reconnect..."}
          {isConnected && status === "critical" && `Slow response (${latency}ms) - checking connection...`}
          {isConnected && status === "warning" && `Response time: ${latency}ms`}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}