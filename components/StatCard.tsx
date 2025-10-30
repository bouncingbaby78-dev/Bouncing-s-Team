
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 text-center transition-all duration-300 hover:bg-slate-700/50">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-cyan-400">
        {value}
        <span className="text-lg text-slate-300 ml-1">{unit}</span>
      </p>
    </div>
  );
};

export default StatCard;
