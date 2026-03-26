interface AdmissionSummaryDocumentArgs {
  logoDataUrl: string;
  logoPath: string;
  lines: string[];
  paymentScreenshotUrl: string;
  waURL: string;
  contactEmail: string;
  phoneNumber: string;
  timestamp: string;
}

export const fetchAdmissionSummaryLogoDataUrl = async (logoPath: string): Promise<string> => {
  const response = await fetch(logoPath, { cache: 'no-cache' });
  const blob = await response.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const buildAdmissionSummaryDocumentHtml = ({
  logoDataUrl,
  logoPath,
  lines,
  paymentScreenshotUrl,
  waURL,
  contactEmail,
  phoneNumber,
  timestamp
}: AdmissionSummaryDocumentArgs): string => {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Team4Stack Admission Form</title>
    <style>
      :root{--primary:#7c3aed;--accent:#10b981}
      body{font-family:Arial, sans-serif;padding:24px;color:#111;background:#fff}
      .header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
      .logo-container{height:48px;width:48px;border-radius:10px;background:#000;padding:4px;display:flex;align-items:center;justify-content:center}
      .logo{height:100%;width:100%;object-fit:contain;border-radius:6px}
      h1{margin:0;font-size:22px}
      .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-top:12px}
      .row{margin:8px 0}
      .label{font-weight:bold}
      img.shot{max-width:100%;height:auto;margin-top:12px;border:1px solid #ddd;border-radius:8px}
      .actions{margin-top:16px;display:flex;gap:10px}
      .btn{padding:10px 14px;border-radius:8px;border:1px solid #e5e7eb;cursor:pointer;text-decoration:none;color:#111}
      .btn-primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border:none}
      .footer{margin-top:16px;font-size:12px;color:#4b5563}
      .title{font-weight:700;font-size:18px;margin-top:6px}
    </style>
    </head><body>
    <div class='topbar'>
      <a class='btn' href='${window.location.origin}/courses' onclick='try{if(window.opener){window.opener.focus();}}catch(e){}; setTimeout(()=>window.close(),300); return true;'>Back to Courses</a>
      <button class='btn' onclick='window.close()'>Close Window</button>
    </div>
    <div id='pdf-root'>
      <div class='header'><div class='logo-container'><img class='logo' src='${logoDataUrl || logoPath}' alt='Team4Stack'/></div><div><h1>Team4Stack</h1><div class='title'>Admission Form</div></div></div>
      <div class='card'>
      ${lines.map((line) => `<div class='row'>${line.replace(/</g, '&lt;')}</div>`).join('')}
      ${paymentScreenshotUrl ? `<div class='row'><span class='label'>Payment Screenshot:</span><br/><img class='shot' src='${paymentScreenshotUrl}' /></div>` : ''}
      </div>
    </div>
    <div class='actions'>
      <button class='btn btn-primary' onclick='generatePDF()'>Download PDF</button>
      <a id='sendWA' class='btn' href='${waURL}' target='_blank' rel='noopener'>Send on WhatsApp</a>
    </div>
    <div class='footer'>Team4Stack | Email: ${contactEmail} | WhatsApp: ${phoneNumber} | Generated: ${timestamp}</div>
      <script src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'></script>
      <script src='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'></script>
      <script>
    function generatePDF(){
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p','pt','a4');
      const root = document.getElementById('pdf-root');
      pdf.html(root, {
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        margin: [20,20,40,20],
        autoPaging: 'text',
        callback(doc){
          doc.setFontSize(10);
          doc.text('Team4Stack | Email: ${contactEmail} | WhatsApp: ${phoneNumber}', 20, doc.internal.pageSize.getHeight() - 30);
          doc.text('Generated: ${timestamp}', 20, doc.internal.pageSize.getHeight() - 18);
          doc.save('Team4Stack-AdmissionForm.pdf');
        }
      });
    }
      </script>
    </body></html>`;
};
