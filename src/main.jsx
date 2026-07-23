import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, FileImage, LockKeyhole, ShieldCheck, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import { CONFIG, SUPPORTED_FILE_TYPES } from './config';
import { runReceiptOcr, validatePixText } from './pixValidator';
import { initTracking, trackEvent } from './tracking';
import './tokens.css';
import './styles.css';

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [ocr, setOcr] = useState(null);

  useEffect(() => {
    initTracking(CONFIG);
    trackEvent('lp_view');
  }, []);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const verdict = useMemo(() => {
    if (!ocr?.text) return null;
    return validatePixText(ocr.text, CONFIG.minPixAmount);
  }, [ocr]);

  function onFileChange(event) {
    const selected = event.target.files?.[0];
    setError('');
    setOcr(null);
    setProgress(0);

    if (!selected) return;
    if (!SUPPORTED_FILE_TYPES.includes(selected.type)) {
      setError('Envie uma imagem PNG, JPG ou WEBP do comprovante.');
      return;
    }

    setFile(selected);
    trackEvent('receipt_selected', { type: selected.type, size: selected.size });
  }

  async function analyzeReceipt() {
    if (!file) {
      setError('Envie o comprovante antes de iniciar a validação.');
      return;
    }

    setStatus('processing');
    setError('');
    setProgress(0);
    trackEvent('receipt_analysis_started');

    try {
      const result = await runReceiptOcr(file, setProgress);
      setOcr(result);
      const validation = validatePixText(result.text, CONFIG.minPixAmount);
      setStatus(validation.approved ? 'approved' : 'rejected');
      trackEvent(validation.approved ? 'receipt_approved' : 'receipt_rejected', {
        amount: validation.amount,
        score: validation.score,
      });
    } catch (exception) {
      setStatus('idle');
      setError('Não consegui ler essa imagem. Tente um print mais nítido do comprovante.');
      trackEvent('receipt_analysis_failed', { message: exception.message });
    }
  }

  function openWhatsApp() {
    trackEvent('whatsapp_released');
    window.open(CONFIG.whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero__content">
          <p className="brand">OTG LP Factory</p>
          <h1 id="page-title">Grupo VIP com acesso liberado por Pix validado</h1>
          <p className="hero__copy">
            Envie o comprovante, aguarde a leitura automática e receba o botão de entrada somente quando o valor for aprovado.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#validacao">
              Validar comprovante
            </a>
            <span className="hero__note">Mínimo: R$ {CONFIG.minPixAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="signal signal--one" />
          <div className="signal signal--two" />
          <div className="receipt">
            <span>PIX</span>
            <strong>Validação inteligente</strong>
            <small>OCR + regras de decisão</small>
          </div>
        </div>
      </section>

      <section className="trust">
        <div>
          <ShieldCheck size={24} />
          <strong>Bloqueio condicional</strong>
          <span>WhatsApp aparece apenas após aprovação.</span>
        </div>
        <div>
          <Sparkles size={24} />
          <strong>Leitura automatizada</strong>
          <span>OCR identifica termos Pix, valor e banco.</span>
        </div>
        <div>
          <LockKeyhole size={24} />
          <strong>Sem chave exposta</strong>
          <span>Protótipo roda sem credenciais sensíveis.</span>
        </div>
      </section>

      <section id="validacao" className="validator" aria-labelledby="validator-title">
        <div className="validator__intro">
          <p>Validação</p>
          <h2 id="validator-title">Envie o comprovante Pix</h2>
          <span>Para melhor resultado, use print nítido com data, valor e identificação Pix visíveis.</span>
        </div>

        <div className="workspace">
          <label className="dropzone">
            <input type="file" accept={SUPPORTED_FILE_TYPES.join(',')} onChange={onFileChange} />
            {previewUrl ? (
              <img src={previewUrl} alt="Prévia do comprovante enviado" />
            ) : (
              <span className="dropzone__empty">
                <UploadCloud size={34} />
                Escolher imagem do comprovante
              </span>
            )}
          </label>

          <div className="panel">
            <div className="panel__head">
              <FileImage size={22} />
              <span>{file ? file.name : 'Nenhum arquivo selecionado'}</span>
            </div>

            <button className="button button--primary" type="button" onClick={analyzeReceipt} disabled={status === 'processing'}>
              {status === 'processing' ? `Lendo imagem ${progress}%` : 'Analisar comprovante'}
            </button>

            {error && <p className="message message--error">{error}</p>}

            {verdict && (
              <div className={`verdict verdict--${verdict.approved ? 'approved' : 'rejected'}`}>
                {verdict.approved ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                <div>
                  <strong>{verdict.approved ? 'Comprovante aprovado' : 'Revisão necessária'}</strong>
                  <span>Confiança da validação: {verdict.score}%</span>
                </div>
              </div>
            )}

            {verdict && (
              <ul className="reasons">
                {verdict.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}

            <button className="button button--whatsapp" type="button" onClick={openWhatsApp} disabled={!verdict?.approved}>
              Entrar no Grupo VIP
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
