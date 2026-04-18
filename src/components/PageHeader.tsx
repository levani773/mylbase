import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex items-center justify-between mb-10 pb-6 border-b border-zinc-900">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight italic font-serif leading-none mb-2">{title}</h1>
        <div className="flex items-center gap-3">
           <div className="h-px w-6 bg-blue-500/40"></div>
           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">{action}</div>
    </div>
  );
};
