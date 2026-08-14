import React from 'react';

interface LabInfographicProps {
  data: any;
}

export const LabInfographicRenderer: React.FC<LabInfographicProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-900 border-[8px] border-indigo-600 dark:border-indigo-500 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-5 rounded-bl-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-tr-full pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 text-center border-b-4 border-indigo-100 dark:border-slate-800 pb-8 mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-indigo-900 dark:text-indigo-300 mb-3 tracking-tight">
          {data.title}
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
          {data.subtitle}
        </h2>
        {data.aim && (
          <div className="mt-6 inline-block bg-indigo-50 dark:bg-indigo-950/30 px-6 py-3 rounded-full border border-indigo-100 dark:border-indigo-800">
            <p className="text-indigo-800 dark:text-indigo-200 font-bold">
              <i className="fi fi-rr-bullseye mr-2"></i> Aim: {data.aim}
            </p>
          </div>
        )}
      </header>

      {/* Main Grid: Info + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 mb-12">
        
        {/* Left Column: Apparatus & Theory */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Apparatus */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-lg w-fit">
              <i className="fi fi-rr-box-open text-indigo-500 mr-2"></i> Apparatus Needed
            </h3>
            <ul className="space-y-3">
              {data.apparatus?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start font-medium text-slate-700 dark:text-slate-300 text-sm">
                  <i className="fi fi-rr-check text-emerald-500 mt-0.5 mr-2 shrink-0"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Theory */}
          {data.theory && (
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-slate-700">
              <h3 className="text-lg font-black text-indigo-800 dark:text-indigo-300 mb-3 flex items-center">
                <i className="fi fi-rr-book-alt mr-2"></i> Theory & Principle
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                {data.theory.description}
              </p>
              {data.theory.formula && data.theory.formula !== "N/A" && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-indigo-100 dark:border-slate-700 font-mono text-center font-bold text-indigo-700 dark:text-indigo-400">
                  {data.theory.formula}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Center/Right: Central Image */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* The actual image */}
            <img 
              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(data.centralImageUrl || "lab equipment")}?width=800&height=800&nologo=true`} 
              alt="Lab Setup"
              className="w-full h-full object-contain drop-shadow-xl z-10"
            />
            {/* Orbit rings for style */}
            <div className="absolute inset-0 border-2 border-indigo-100 dark:border-slate-700 rounded-full animate-[spin_30s_linear_infinite] z-0 opacity-50"></div>
            <div className="absolute inset-12 border-2 border-dashed border-emerald-100 dark:border-slate-700 rounded-full animate-[spin_20s_linear_infinite_reverse] z-0 opacity-50"></div>
          </div>
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Experimental Setup / Conceptual Diagram</p>
        </div>
        
      </div>

      {/* Procedures Flowchart & Steps */}
      <div className="relative z-10 mb-12">
        <div className="bg-indigo-600 rounded-t-2xl p-4 flex items-center justify-center">
          <h3 className="text-xl font-black text-white flex items-center">
            <i className="fi fi-rr-settings-sliders mr-3"></i> Experimental Procedure
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl border-x border-b border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          
          {/* Visual Flowchart representation */}
          {data.flowchart && data.flowchart.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10 overflow-x-auto pb-4">
              {data.flowchart.map((fc: any, i: number) => (
                <React.Fragment key={i}>
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-center min-w-[140px] shadow-sm">
                    <span className="block text-xs font-bold text-indigo-500 mb-1">STEP {fc.step}</span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-white leading-tight">{fc.action}</span>
                  </div>
                  {i < data.flowchart.length - 1 && (
                    <i className="fi fi-rr-arrow-right text-2xl text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0"></i>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Detailed Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.procedures?.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-700">
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                </div>
                <div className="pt-2 text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Precautions Footer */}
      {data.precautions && data.precautions.length > 0 && (
        <div className="relative z-10 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-rose-700 dark:text-rose-400 mb-4 flex items-center">
            <i className="fi fi-rr-triangle-warning mr-2 text-xl"></i> Safety Precautions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.precautions.map((prec: string, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-100 dark:border-rose-800/50 flex items-start gap-3">
                <i className="fi fi-rr-shield-check text-rose-500 mt-0.5"></i>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{prec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="relative z-10 text-center mt-12 border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-6">
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          AI Generated Lab Interactive • Virtual Lab Assistant
        </p>
      </div>

    </div>
  );
};
