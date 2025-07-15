import React from 'react';
import { motion } from 'framer-motion';
import HexCell from './HexCell';

export default function HexGrid({ competencies }) {
  if (!competencies || competencies.length === 0) {
    return <div className="text-center text-slate-500 py-12">No competencies found for this learning path.</div>;
  }
  
  // Basic grid layout logic (can be improved for more complex dependency lines)
  const renderGrid = () => {
    let rows = [];
    let currentRow = [];
    let itemsInRow = 3; // Adjust for responsiveness
    
    competencies.forEach((comp, index) => {
      currentRow.push(comp);
      if (currentRow.length === itemsInRow || index === competencies.length - 1) {
        rows.push(currentRow);
        currentRow = [];
      }
    });

    return rows.map((row, rowIndex) => (
      <div 
        key={rowIndex} 
        className="flex justify-center gap-2 mb-[-2rem]"
        style={{ marginLeft: rowIndex % 2 === 1 ? '4rem' : '0' }}
      >
        {row.map((comp, compIndex) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (rowIndex * itemsInRow + compIndex) * 0.1 }}
          >
            <HexCell competency={comp} />
          </motion.div>
        ))}
      </div>
    ));
  };
  
  return (
    <div className="relative flex flex-col items-center">
      {renderGrid()}
    </div>
  );
}