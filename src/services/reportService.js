import { Flow } from 'flow-sdk';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Sanitize a filename for safe download */
function sanitize(name, ext) {
  return `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
}

export async function downloadExcelReport(filename, auditLog) {
  const errorData = auditLog.flatMap(page => 
    page.errors.map(err => ({
      'PDF Page No.': page.pageNumber,
      'Section / Question No.': err.questionNo,
      'Error Type': err.category,
      'Original Text': err.incorrectText,
      'Issue Found': err.issueFound,
      'Suggested Correction': err.correctVersion,
      'Severity': err.severity
    }))
  );

  const answerData = auditLog.flatMap(page => 
    page.answerKeys.map(ak => ({
      'Question No.': ak.questionNo,
      'Correct Answer': ak.correctAnswer,
      'Page No.': ak.pageNumber
    }))
  );

  const wb = XLSX.utils.book_new();
  
  // Errors Sheet with AutoFilter
  const wsErrors = XLSX.utils.json_to_sheet(errorData);
  if (errorData.length > 0) {
    const range = XLSX.utils.decode_range(wsErrors['!ref'] || 'A1');
    wsErrors['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
  }
  XLSX.utils.book_append_sheet(wb, wsErrors, 'Audit Errors');

  // Answers Sheet with AutoFilter
  const wsAnswers = XLSX.utils.json_to_sheet(answerData);
  if (answerData.length > 0) {
    const range = XLSX.utils.decode_range(wsAnswers['!ref'] || 'A1');
    wsAnswers['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
  }
  XLSX.utils.book_append_sheet(wb, wsAnswers, 'Answer Key');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const base64 = btoa(String.fromCharCode(...new Uint8Array(excelBuffer)));

  await Flow.download({
    base64,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    filename: sanitize(filename, 'xlsx')
  });
}

function applyAutoTable(pdfDoc, options) {
  if (typeof autoTable === 'function') {
    autoTable(pdfDoc, options);
  } else if (autoTable && typeof autoTable.default === 'function') {
    autoTable.default(pdfDoc, options);
  } else if (typeof pdfDoc.autoTable === 'function') {
    pdfDoc.autoTable(options);
  } else {
    console.error('jspdf-autotable was not loaded correctly.');
  }
}

export async function downloadPdfReport(filename, auditLog) {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  // Title
  doc.setFontSize(18);
  doc.text('Forensic Audit Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);

  // Errors Table
  doc.setFontSize(14);
  doc.text('Audit Error Log', 14, 40);
  
  const errorRows = auditLog.flatMap(page => 
    page.errors.map(err => [
      page.pageNumber,
      err.questionNo,
      err.category,
      err.incorrectText,
      err.issueFound,
      err.correctVersion
    ])
  );

  applyAutoTable(doc, {
    startY: 45,
    head: [['PDF Page No.', 'Section / Question No.', 'Error Type', 'Original Text', 'Issue Found', 'Suggested Correction']],
    body: errorRows,
    theme: 'grid',
    styles: { fontSize: 8, overflow: 'linebreak' },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 }
  });

  // Answer Key Table
  doc.addPage();
  doc.setFontSize(14);
  doc.text('CHOOSE THE CORRECT ANSWERS – Answer Key', 14, 20);

  const answerRows = auditLog.flatMap(page => 
    page.answerKeys.map(ak => [ak.questionNo, ak.correctAnswer, ak.pageNumber])
  );

  applyAutoTable(doc, {
    startY: 25,
    head: [['Question No.', 'Correct Answer', 'Page No.']],
    body: answerRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 }
  });

  const pdfBase64 = doc.output('datauristring').split(',')[1];

  await Flow.download({
    base64: pdfBase64,
    mimeType: 'application/pdf',
    filename: sanitize(filename, 'pdf')
  });
}
