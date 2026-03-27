interface AdmissionSummaryDocumentArgs {
  logoDataUrl: string;
  logoPath: string;
  lines: string[];
  paymentScreenshotUrl: string;
  applicationNumber?: string;
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
  applicationNumber,
  waURL,
  contactEmail,
  phoneNumber,
  timestamp
}: AdmissionSummaryDocumentArgs): string => {
  const sanitizedRows = lines
    .map((line) => line.replace(/</g, '&lt;'))
    .map((line) => {
      const splitIndex = line.indexOf(':')
      if (splitIndex === -1) {
        return { label: '', value: line }
      }
      const label = line.slice(0, splitIndex).trim()
      const value = line.slice(splitIndex + 1).trim()
      return { label, value }
    })
    .filter((row) => !row.label.toLowerCase().includes('payment screenshot'))
  const applicantName =
    sanitizedRows.find((row) => row.label.toLowerCase() === 'name')?.value || 'Applicant'

  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Team4Stack Admission Form</title>
    <style>
      :root{--primary:#6d28d9;--accent:#06b6d4;--ink:#0f172a;--muted:#6b7280;--border:#e5e7eb;--bg:#f8fafc}
      *{box-sizing:border-box}
      body{font-family:Inter, Segoe UI, Arial, sans-serif;margin:0;color:var(--ink);background:var(--bg)}
      .page{width:794px;min-height:1123px;margin:0 auto;padding:26px 30px 34px;position:relative}
      .topbar{display:flex;justify-content:flex-end;gap:8px;margin-bottom:14px}
      .header{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:18px;text-align:center}
      .logo-container{height:66px;width:66px;border-radius:20px;background:transparent;padding:7px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 20px rgba(15,23,42,0.08);border:1px solid #e2e8f0}
      .logo{height:100%;width:100%;object-fit:contain;border-radius:8px;filter:grayscale(1) brightness(0) contrast(1.2)}
      h1{margin:0;font-size:24px}
      .subtitle{font-weight:700;font-size:18px;margin-top:4px;color:#0f172a}
      .app-no{margin-top:6px;font-size:12px;font-weight:700;color:#334155;letter-spacing:.08em;text-transform:uppercase}
      .card{border:2px solid #e2e8f0;border-radius:20px;padding:22px;background:#fff;box-shadow:0 18px 45px rgba(15,23,42,0.08)}
      .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .row{padding:10px 12px;border:1px solid #f1f5f9;border-radius:12px;background:#f8fafc}
      .label{font-weight:700;font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:.04em}
      .value{margin-top:4px;font-size:14px;color:#111827;word-break:break-word}
      .link{color:#0ea5e9;text-decoration:none;font-weight:600}
      .link:hover{text-decoration:underline}
      .layout{display:grid;grid-template-columns:1.1fr 0.9fr;gap:18px;align-items:start}
      .shot-wrap{padding:14px;border-radius:18px;border:1px dashed #cbd5f5;background:#f8fafc}
      img.shot{width:100%;max-height:210px;object-fit:contain;border:1px solid #e2e8f0;border-radius:14px;background:#fff}
      .team-logo{height:64px;width:64px;border-radius:18px;border:1px solid #e2e8f0;object-fit:contain;background:#fff}
      .stamp{margin-top:14px;width:190px;height:190px;position:relative}
      .stamp svg{width:100%;height:100%}
      .stamp text{font-family:Inter,Segoe UI,Arial,sans-serif;font-weight:800;letter-spacing:.22em;text-transform:uppercase;fill:rgba(15,23,42,0.8)}
      .stamp .ring{stroke:rgba(15,23,42,0.65);stroke-width:3;fill:transparent}
      .stamp .ring-dashed{stroke:rgba(15,23,42,0.4);stroke-width:2;fill:transparent;stroke-dasharray:4 6}
      .stamp .center-logo{width:58px;height:58px;border-radius:16px;border:1px solid #e2e8f0;object-fit:contain;filter:grayscale(1) brightness(0) contrast(1.2);background:#fff}
      .stamp .center-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;flex-direction:column}
      .stamp .center-label{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#0f172a}
      .details{margin-top:14px;border:1px dashed #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc}
      .details h4{margin:0 0 8px 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#475569}
      .details p{margin:4px 0;font-size:12px;color:#0f172a}
      .actions{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
      .btn{padding:10px 14px;border-radius:10px;border:1px solid var(--border);cursor:pointer;text-decoration:none;color:#111;background:#fff;font-weight:600}
      .btn-primary{background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;border:none}
      .footer{margin-top:20px;font-size:12px;color:var(--muted)}
      @media print{.topbar,.actions{display:none}}
      @media (max-width:860px){.page{width:100%;min-height:auto;padding:20px}.layout{grid-template-columns:1fr}.stamp{width:140px;height:140px}}
      @media (max-width:640px){.grid,.layout{grid-template-columns:1fr}}
    </style>
    </head><body>
    <div class='page'>
      <div class='topbar'>
        <a class='btn' href='${window.location.origin}/courses' onclick='try{if(window.opener){window.opener.focus();}}catch(e){}; setTimeout(()=>window.close(),300); return true;'>Back to Courses</a>
        <button class='btn' onclick='window.close()'>Close Window</button>
      </div>
      <div id='pdf-root'>
        <div class='header'>
          <div class='logo-container'><img class='logo' src='${logoDataUrl || logoPath}' alt='Team4Stack'/></div>
          <div>
            <h1>Team4Stack</h1>
            <div class='subtitle'>Admission Form</div>
            ${applicationNumber ? `<div class='app-no'>Application No: ${applicationNumber}</div>` : ''}
          </div>
        </div>
        <div class='card'>
          <div class='layout'>
            <div>
              <div class='grid'>
                <div class='row'><div class='label'>Application Date</div><div class='value'>${timestamp}</div></div>
                ${sanitizedRows
                  .map(
                    (row) =>
                      `<div class='row'><div class='label'>${row.label || 'Info'}</div><div class='value'>${row.value || '-'}</div></div>`
                  )
                  .join('')}
              </div>
            </div>
            <div>
              <div class='shot-wrap'>
                <div class='label'>Payment Screenshot</div>
                ${
                  paymentScreenshotUrl
                    ? `<img class='shot' src='${paymentScreenshotUrl}' alt='Payment Screenshot' />`
                    : `<div class='value' style='margin-top:8px'>No screenshot attached.</div>`
                }
              </div>
              <div class='stamp'>
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <defs>
                    <path id="outerCircle" d="M100,18 a82,82 0 1,1 0,164 a82,82 0 1,1 0,-164" />
                    <path id="innerCircle" d="M100,30 a70,70 0 1,1 0,140 a70,70 0 1,1 0,-140" />
                  </defs>
                  <circle class="ring" cx="100" cy="100" r="86"></circle>
                  <circle class="ring-dashed" cx="100" cy="100" r="72"></circle>
                  <text font-size="11">
                    <textPath href="#outerCircle" startOffset="50%" text-anchor="middle">
                      ${applicantName.toUpperCase()} • TEAM4STACK
                    </textPath>
                  </text>
                  <text font-size="12">
                    <textPath href="#innerCircle" startOffset="50%" text-anchor="middle">
                      ADMISSION VERIFIED • APPROVED
                    </textPath>
                  </text>
                </svg>
                <div class="center-wrap">
                  <img class="center-logo" src="${logoDataUrl || logoPath}" alt="Team4Stack"/>
                  <div class="center-label">STAMP</div>
                </div>
              </div>
              <div class='details'>
                <h4>Team4Stack Details</h4>
                <p>Email: ${contactEmail}</p>
                <p>WhatsApp: ${phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='actions'>
        <button class='btn btn-primary' onclick='downloadPNG()'>Download PNG</button>
        <a id='sendWA' class='btn' href='${waURL}' target='_blank' rel='noopener'>Send on WhatsApp</a>
      </div>
      <div class='footer'>Team4Stack | Email: ${contactEmail} | WhatsApp: ${phoneNumber} | Generated: ${timestamp}</div>
      </div>
      <script src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'></script>
      <script>
    async function downloadPNG(){
      const root = document.getElementById('pdf-root');
      const canvas = await html2canvas(root, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'Team4Stack-AdmissionForm.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
      </script>
    </body></html>`;
};
