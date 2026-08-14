import React from "react";

export function InfographicRenderer({ data, focus }: { data: any; focus: string }) {
  
  // ==========================================
  // LAYOUT 1: EXAM FOCUS (NOTEBOOK STYLE)
  // ==========================================
  const renderExamFocus = () => (
    <div className="bg-[#fdfbf7] dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg shadow-xl border-2 border-slate-300 dark:border-slate-700 p-4 sm:p-8 md:p-12 relative overflow-hidden font-serif" style={{
      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(148, 163, 184, 0.2) 31px, rgba(148, 163, 184, 0.2) 32px)',
      backgroundAttachment: 'local'
    }}>
      {/* Red margin line */}
      <div className="absolute top-0 bottom-0 left-6 sm:left-12 md:left-16 w-0.5 bg-red-400/60 dark:bg-red-500/30"></div>
      
      <div className="pl-4 sm:pl-6 md:pl-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end border-b-2 border-red-500/50 pb-4 mb-6 md:mb-8 gap-4">
           <div>
             <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-indigo-900 dark:text-indigo-400 mb-2 underline decoration-wavy decoration-indigo-200">{data.title}</h1>
             <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-600 dark:text-slate-400 italic">{data.subtitle}</h2>
           </div>
           <div className="text-left md:text-right text-sm font-bold text-slate-500 border border-slate-300 p-2 rounded bg-white/50 dark:bg-black/20 self-start md:self-end">
              <p>Topic: {data.title}</p>
              <p>Focus: Exam</p>
           </div>
        </div>

        <p className="text-lg leading-loose mb-8 font-medium">
          {data.introduction}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Definitions / What is it */}
          <div className="bg-white/80 dark:bg-slate-800/80 p-6 border-l-4 border-emerald-500 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <i className="fi fi-rr-asterik"></i> Key Definitions
            </h3>
            <ul className="space-y-4">
              {data.whatIsIt?.map((item: any, i: number) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <i className={`fi ${item.icon} text-emerald-600 mt-1`}></i>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Formula / Law */}
          <div className="bg-indigo-50/80 dark:bg-indigo-900/30 p-6 border-l-4 border-indigo-500 shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-indigo-900 dark:text-indigo-300">{data.lawOrFormula?.title}</h3>
            <p className="text-sm italic mb-4 opacity-80">{data.lawOrFormula?.subtitle}</p>
            <div className="bg-white dark:bg-black/40 py-4 text-center rounded border border-indigo-200 mb-4">
              <span className="text-3xl font-bold text-indigo-800 dark:text-indigo-400">{data.lawOrFormula?.formula}</span>
            </div>
            <ul className="space-y-2 text-sm font-mono">
              {data.lawOrFormula?.variables?.map((v: any, i: number) => (
                <li key={i}><span className="font-bold text-indigo-700 dark:text-indigo-300 mr-2">{v.symbol}</span> = {v.explanation}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Facts & Applications */}
        <div className="mb-8 bg-amber-50/80 dark:bg-amber-900/20 p-6 border border-amber-200 dark:border-amber-700/50 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-amber-800 dark:text-amber-400">Important Points</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.keyFacts?.slice(0,4).map((fact: any, i: number) => (
              <div key={i} className="flex gap-3 bg-white dark:bg-slate-800 p-3 rounded border border-amber-100 dark:border-slate-700">
                <i className={`fi ${fact.icon} text-amber-500 mt-1`}></i>
                <div>
                  <h4 className="font-bold text-sm">{fact.title}</h4>
                  <p className="text-xs opacity-80">{fact.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-6 mt-8">
           <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Summary</h3>
           <p className="leading-relaxed font-medium">{data.remember?.text}</p>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // LAYOUT 2: GENERAL KNOWLEDGE (CENTRAL IMAGE)
  // ==========================================
  const renderGeneralKnowledgeFocus = () => {
    const coreConceptText = data.whatIsIt?.[0]?.text || '';
    const hasColon = coreConceptText.includes(':');
    const coreConceptTitle = hasColon ? coreConceptText.split(':')[0] : 'Core Concept';
    const coreConceptDesc = hasColon ? coreConceptText.split(':').slice(1).join(':').trim() : coreConceptText;

    return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-5 sm:p-8 md:p-14 relative overflow-hidden font-sans border border-slate-100 dark:border-slate-800/60">
      
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-sky-50 to-teal-50 dark:from-sky-900/10 dark:to-teal-900/10 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

      {/* Header Section */}
      <div className="text-center mb-10 md:mb-16 relative z-10">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">General Knowledge</span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 leading-tight">{data.title}</h1>
        <h2 className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 font-medium tracking-wide max-w-2xl mx-auto">{data.subtitle}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 mb-12">
        
        {/* Main Left Column (Core Concept & Quote) */}
        <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
          
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                   <i className="fi fi-rr-bulb text-blue-600 dark:text-blue-400 text-xl md:text-2xl"></i>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{coreConceptTitle}</h3>
             </div>
             <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
               {coreConceptDesc}
             </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl border border-indigo-100 dark:border-indigo-800/50 relative">
            <i className="fi fi-rr-quote-right absolute top-4 md:top-6 right-6 md:right-8 text-4xl md:text-6xl text-indigo-200 dark:text-indigo-800 opacity-30"></i>
            <h3 className="text-xs md:text-sm font-bold text-indigo-500 uppercase tracking-widest mb-3 md:mb-4">Notable Quote</h3>
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 italic mb-4 md:mb-6 relative z-10 leading-relaxed">
              "{data.quote?.text}"
            </p>
            <p className="text-sm md:text-base font-bold text-indigo-700 dark:text-indigo-400 relative z-10">— {data.quote?.author}</p>
          </div>

        </div>

        {/* Right Column (Grid of Facts & Applications) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                 <i className="fi fi-rr-star text-amber-600 dark:text-amber-400"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fascinating Fact</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.keyFacts?.[0]?.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                 <i className="fi fi-rr-rocket text-emerald-600 dark:text-emerald-400"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real World Application</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.applications?.[0]?.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                 <i className="fi fi-rr-magic-wand text-purple-600 dark:text-purple-400"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Did You Know?</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.didYouKnow?.description}</p>
          </div>

          <div className="bg-white dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                 <i className="fi fi-rr-book-alt text-rose-600 dark:text-rose-400"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Law / Principle</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.lawOrFormula?.subtitle}</p>
          </div>

        </div>
      </div>

    </div>
  );
  };

  // ==========================================
  // LAYOUT 3: KNOW MORE (DENSE GRID)
  // ==========================================
  const renderKnowMoreFocus = () => (
    <div className="bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 rounded-sm shadow-md border-2 border-indigo-900 dark:border-indigo-400 p-4 sm:p-6 font-sans">
      
      {/* Newspaper Header */}
      <div className="border-b-4 border-indigo-900 dark:border-indigo-400 pb-4 mb-6 text-center">
         <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-indigo-900 dark:text-indigo-300 mb-2 leading-tight">{data.title}</h1>
         <div className="flex flex-col md:flex-row justify-between md:items-center border-t border-b border-indigo-900 dark:border-indigo-400 py-1 mt-4 gap-2">
           <span className="font-bold text-xs sm:text-sm uppercase">{data.subtitle}</span>
           <span className="font-bold text-xs sm:text-sm uppercase text-indigo-600 dark:text-indigo-400">In-Depth Reference Guide</span>
         </div>
      </div>

      <p className="text-base sm:text-lg font-medium leading-relaxed mb-6 md:text-justify">
        {data.introduction}
      </p>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Box 1: Components */}
        <div className="border-2 border-indigo-900 dark:border-indigo-400 rounded overflow-hidden">
          <div className="bg-indigo-900 dark:bg-indigo-600 !text-white p-2 font-bold text-center uppercase tracking-widest text-sm">
            1. Core Components
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {data.whatIsIt?.map((item: any, i: number) => (
                <li key={i} className="text-sm pb-2 border-b border-slate-200 dark:border-slate-800 last:border-0 flex gap-2 items-start">
                  <i className={`fi ${item.icon} text-indigo-600 dark:text-indigo-400 mt-1`}></i>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Box 2: Visual */}
        <div className="border-2 border-indigo-900 dark:border-indigo-400 rounded overflow-hidden flex flex-col">
          <div className="bg-indigo-900 dark:bg-indigo-600 !text-white p-2 font-bold text-center uppercase tracking-widest text-sm">
            2. Visual Model
          </div>
          <div className="p-4 flex-1 flex items-center justify-center bg-white dark:bg-slate-900">
             <img 
               src={`https://image.pollinations.ai/prompt/${encodeURIComponent(data.centralImageUrl)}?width=400&height=400&nologo=true`} 
               alt="Model" 
               className="max-w-full h-auto max-h-[250px] object-contain"
               onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
             />
          </div>
        </div>

        {/* Box 3: Law/Formula */}
        <div className="border-2 border-indigo-900 dark:border-indigo-400 rounded overflow-hidden">
          <div className="bg-indigo-900 dark:bg-indigo-600 !text-white p-2 font-bold text-center uppercase tracking-widest text-sm">
            3. Governing Law
          </div>
          <div className="p-4">
            <h4 className="font-bold text-lg mb-2 text-indigo-800 dark:text-indigo-300 text-center">{data.lawOrFormula?.title}</h4>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 text-center text-2xl font-bold font-serif mb-4 rounded border border-indigo-200 dark:border-indigo-700">
               {data.lawOrFormula?.formula}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.lawOrFormula?.variables?.map((v: any, i: number) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                    <td className="py-2 font-bold text-indigo-700 dark:text-indigo-400 w-12 text-center border-r border-slate-200 dark:border-slate-800">{v.symbol}</td>
                    <td className="py-2 pl-3">{v.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Box 4: Facts */}
        <div className="border-2 border-indigo-900 dark:border-indigo-400 rounded overflow-hidden md:col-span-2">
          <div className="bg-indigo-900 dark:bg-indigo-600 !text-white p-2 font-bold text-center uppercase tracking-widest text-sm">
            4. Key Discoveries & Facts
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.keyFacts?.map((fact: any, i: number) => (
              <div key={i} className="flex gap-3">
                <i className={`fi ${fact.icon} text-2xl text-indigo-600 dark:text-indigo-400 shrink-0`}></i>
                <div>
                  <h4 className="font-bold text-sm">{fact.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{fact.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 5: Applications */}
        <div className="border-2 border-indigo-900 dark:border-indigo-400 rounded overflow-hidden">
          <div className="bg-indigo-900 dark:bg-indigo-600 !text-white p-2 font-bold text-center uppercase tracking-widest text-sm">
            5. Applications
          </div>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 h-full">
            <ul className="space-y-3">
              {data.applications?.map((app: any, i: number) => (
                <li key={i} className="text-sm">
                  <span className="font-bold text-indigo-800 dark:text-indigo-300 block">{app.title}</span>
                  {app.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-6 border-t-4 border-indigo-900 dark:border-indigo-400 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
         <p className="font-bold text-sm uppercase tracking-widest">"{data.quote?.text}" - {data.quote?.author}</p>
         <p className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-bold">
           FOCUS: DEEP DIVE
         </p>
      </div>
    </div>
  );

  // Return the layout based on focus
  if (focus === "Exam point of view") return renderExamFocus();
  if (focus === "General knowledge") return renderGeneralKnowledgeFocus();
  return renderKnowMoreFocus();
}
