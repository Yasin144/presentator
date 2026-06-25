import React, { useState, useEffect, useRef } from 'react';
import { SectionLabel, PillButton, ProgressBar, FieldDisplay, SegmentedToggle, TextInput } from './Primitives';
import { ErrorCard } from './ErrorCard';
import { ErrorTable } from './ErrorTable';
import { AnswerKeyTable } from './AnswerKeyTable';
import { extractTextFromPDF } from '../../services/pdfService';
import { forensicAuditPage } from '../../services/aiService';
import { downloadExcelReport, downloadPdfReport } from '../../services/reportService';
import './error-checker.css';

export default function ErrorCheckerApp() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditLog, setAuditLog] = useState([]);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Idle');
  const [viewMode, setViewMode] = useState('cards');
  const [exportState, setExportState] = useState('idle');
  
  // Settings
  const [auditMode, setAuditMode] = useState('deep');
  const [customRules, setCustomRules] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering state
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ name: f.name, base64: (ev.target?.result).split(',')[1] });
      setAuditLog([]);
      setProgress(0);
      setStatusMsg('Ready for audit');
    };
    reader.readAsDataURL(f);
  };

  const runFullAudit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setAuditLog([]);
    setProgress(0);

    try {
      setStatusMsg('Extracting PDF Content...');
      const pages = await extractTextFromPDF(file.base64);
      
      const results = [];
      for (let i = 0; i < pages.length; i++) {
        setStatusMsg(`Forensic Analysis: Page ${i + 1}/${pages.length}...`);
        const { errors, answerKeys } = await forensicAuditPage(pages[i], i + 1, auditMode, customRules);
        
        // Add unique IDs and initial status to errors
        const preparedErrors = (errors || []).map((err, idx) => ({
          ...err,
          id: `err-${i + 1}-${idx}-${Date.now()}`,
          status: 'pending'
        }));

        results.push({ pageNumber: i + 1, errors: preparedErrors, answerKeys, checked: true });
        setAuditLog([...results]);
        setProgress(((i + 1) / pages.length) * 100);
      }
      setStatusMsg('Audit Complete');
    } catch (err) {
      setError('Audit pipeline failed. Verify PDF integrity.');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateErrorStatus = (errorId, newStatus) => {
    setAuditLog(prev => prev.map(page => ({
      ...page,
      errors: page.errors.map(err => err.id === errorId ? { ...err, status: newStatus } : err)
    })));
  };

  const handleExport = async (type) => {
    if (auditLog.length === 0) return;
    setExportState('working');
    try {
      if (type === 'excel') await downloadExcelReport(file?.name || 'Audit_Report', auditLog);
      else await downloadPdfReport(file?.name || 'Audit_Report', auditLog);
      setExportState('done');
      setTimeout(() => setExportState('idle'), 2000);
    } catch (e) {
      setError('Export failed.');
      setExportState('idle');
    }
  };

  const filteredAuditLog = React.useMemo(() => {
    return auditLog.map(page => ({
      ...page,
      errors: page.errors.filter(err => {
        const matchSeverity = filterSeverity === 'All' || err.severity === filterSeverity;
        const matchCategory = filterCategory === 'All' || err.category === filterCategory;
        const matchStatus = filterStatus === 'All' || err.status === filterStatus;
        const matchSearch = searchTerm === '' || 
          err.incorrectText.toLowerCase().includes(searchTerm.toLowerCase()) || 
          err.issueFound.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchSeverity && matchCategory && matchStatus && matchSearch;
      })
    })).filter(page => page.errors.length > 0 || viewMode === 'answers');
  }, [auditLog, filterSeverity, filterCategory, filterStatus, searchTerm, viewMode]);

  const summary = React.useMemo(() => {
    const totalPages = auditLog.length;
    const pagesWithErrors = auditLog.filter(p => p.errors.length > 0).length;
    const allErrors = auditLog.flatMap(p => p.errors);
    const totalErrors = allErrors.length;
    const verifiedErrors = allErrors.filter(e => e.status === 'accepted').length;
    
    const criticalCount = allErrors.filter(e => e.severity === 'Critical').length;
    const majorCount = allErrors.filter(e => e.severity === 'Major').length;
    const minorCount = allErrors.filter(e => e.severity === 'Minor').length;

    const breakdown = {};
    allErrors.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + 1;
    });

    const score = Math.max(0, 100 - (criticalCount * 15) - (majorCount * 8) - (minorCount * 2));
    let verdict = 'Major Revision Required';
    if (score >= 95) verdict = 'Publication Ready';
    else if (score >= 85) verdict = 'Minor Corrections Required';
    else if (score >= 70) verdict = 'Moderate Revision Required';

    return { totalPages, pagesWithErrors, totalErrors, verifiedErrors, criticalCount, majorCount, minorCount, qualityScore: score, verdict, categoryBreakdown: breakdown };
  }, [auditLog]);

  return (
    <div id="error-checker-root" className="flex h-full w-full bg-[#0e0e0e] text-white overflow-hidden animate-fade-in" style={{ fontFamily: "'Google Sans Text', sans-serif" }}>
      <input type="file" ref={fileInputRef} onChange={handleFile} accept="application/pdf" className="hidden" />

      {/* Sidebar Controls */}
      <div className="w-[300px] border-r border-white/10 flex flex-col p-[10px] py-[12px] gap-[24px] flex-shrink-0 dark-scrollbar overflow-y-auto bg-[#0e0e0e]">
        <div className="flex flex-col gap-2">
          <SectionLabel>Document Input</SectionLabel>
          <PillButton variant="outline" icon={<span className="material-symbols-outlined text-[18px]">upload_file</span>} onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
            {file ? 'Replace PDF' : 'Upload PDF'}
          </PillButton>
          {file && <FieldDisplay label="Current File" value={file.name} className="mt-1" />}
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Audit Configuration</SectionLabel>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-white/30 uppercase font-bold px-2">Analysis Mode</p>
            <SegmentedToggle 
              value={auditMode} 
              onChange={(v) => setAuditMode(v)}
              items={[
                { value: 'standard', label: 'Fast' },
                { value: 'deep', label: 'Deep' },
                { value: 'creative', label: 'Style' }
              ]}
            />
            <p className="text-[10px] text-white/30 uppercase font-bold px-2 mt-2">Custom Audit Rules</p>
            <TextInput 
              value={customRules} 
              onChange={setCustomRules} 
              placeholder="e.g. Flag inconsistency in brand naming..." 
            />
          </div>
        </div>

        {file && (
          <div className="flex flex-col gap-2">
            <SectionLabel>Action</SectionLabel>
            <PillButton variant="solid" icon={<span className="material-symbols-outlined text-[18px]">policy</span>} onClick={runFullAudit} disabled={isProcessing}>
              {isProcessing ? 'Auditing...' : 'Start Audit'}
            </PillButton>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{statusMsg}</p>
            <ProgressBar progress={progress} />
          </div>
        )}

        {auditLog.length > 0 && !isProcessing && (
          <div className="flex flex-col gap-6 mt-2 bg-[#0e0e0e]">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
              <span className={`text-4xl font-black ${summary.qualityScore >= 85 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.round(summary.qualityScore)}%
              </span>
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Score Index</span>
              <p className="text-[10px] text-white/60 mt-2 text-center leading-tight">{summary.verdict}</p>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Category Insights</SectionLabel>
              <div className="flex flex-col gap-1 px-2">
                {Object.entries(summary.categoryBreakdown).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40">{cat}</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
              <SectionLabel>Export Forensic Report</SectionLabel>
              <div className="flex gap-1.5 px-1">
                <PillButton 
                  variant="outline" 
                  icon={<span className="material-symbols-outlined text-[18px]">table_chart</span>}
                  onClick={() => handleExport('excel')}
                  disabled={exportState === 'working'}
                >
                  {exportState === 'working' ? '...' : 'Excel'}
                </PillButton>
                <PillButton 
                  variant="outline" 
                  icon={<span className="material-symbols-outlined text-[18px]">description</span>}
                  onClick={() => handleExport('pdf')}
                  disabled={exportState === 'working'}
                >
                  {exportState === 'working' ? '...' : 'PDF'}
                </PillButton>
              </div>
              {exportState === 'done' && (
                <p className="text-[10px] text-green-400 font-bold px-2 text-center animate-pulse">Report Downloaded ✓</p>
              )}
              {error && (
                <p className="text-[10px] text-red-400 font-bold px-2 text-center">{error}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Review Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0e0e0e]">
        {auditLog.length > 0 && !isProcessing && (
          <div className="px-8 py-6 flex flex-col gap-4 border-b border-white/10 bg-[#0e0e0e]/80 backdrop-blur-sm z-20">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h2 className="text-lg font-black uppercase tracking-tighter text-white">Forensic Worklist</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  {summary.verifiedErrors} / {summary.totalErrors} Verified
                </p>
              </div>
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 shadow-inner">
                <button onClick={() => setViewMode('cards')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'cards' ? 'bg-[#969696] text-black' : 'text-white/40'}`}>Cards</button>
                <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-[#969696] text-black' : 'text-white/40'}`}>Grid</button>
                <button onClick={() => setViewMode('answers')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'answers' ? 'bg-[#969696] text-black' : 'text-white/40'}`}>Answers</button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="text" 
                placeholder="Search error content..." 
                className="search-input flex-1 min-w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Spelling">Spelling</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Question-Answer Mismatch">Mismatches</option>
                  <option value="Wrong Answer Key">Wrong Keys</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 dark-scrollbar bg-[#0e0e0e]">
          {auditLog.length === 0 && !isProcessing && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 bg-[#0e0e0e]">
              <span className="material-symbols-outlined text-[80px] mb-4 text-white">analytics</span>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Forensic Auditor Pro</h1>
              <p className="text-[11px] max-w-sm mt-2 font-medium uppercase tracking-widest leading-relaxed text-white">
                Upload your document and define custom rules for deep forensic proofreading and logical auditing.
              </p>
            </div>
          )}

          <div className={`${viewMode === 'cards' ? 'max-w-2xl mx-auto' : 'w-full'} flex flex-col gap-6 pb-24`}>
            {viewMode === 'cards' && filteredAuditLog.map(page => (
              page.errors.map((err) => (
                <ErrorCard 
                  key={err.id} 
                  pageNumber={page.pageNumber} 
                  error={err} 
                  onStatusChange={(status) => updateErrorStatus(err.id, status)}
                />
              ))
            ))}
            {viewMode === 'table' && <ErrorTable auditLog={filteredAuditLog} onStatusChange={updateErrorStatus} />}
            {viewMode === 'answers' && <AnswerKeyTable auditLog={auditLog} />}
          </div>
        </div>
      </div>
    </div>
  );
}
