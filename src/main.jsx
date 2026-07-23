import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { CONFIG, SUPPORTED_FILE_TYPES } from './config.js';
import { formatBytes, validateFileSignature, validateSelectedFile } from './fileValidation.js';
import { formatCurrency, OcrError, runReceiptOcr, validatePixText } from './pixValidator.js';
import { initTracking, trackBeginCheckout, trackPageView, trackPurchase } from './tracking.js';
import { buildWhatsAppUrl, createValidationId } from './validationId.js';
import './tokens.css';
import './styles.css';

const STATUS_COPY = {
  approved: {
    title: 'Validação visual aprovada',
    description: 'O comprovante foi identificado e o valor atende ao mínimo da oferta.',
  },
  below_minimum: {
    title: 'Valor abaixo do mínimo',
    description: `O valor identificado não atingiu ${formatCurrency(CONFIG.minPixAmount)}.`,
  },
  low_confidence: {
    title: 'Leitura com baixa confiança',
    description: 'Envie um print mais nítido, sem cortes e com o valor do Pix visível.',
  },
  unrecognized: {
    title: 'Comprovante não reconhecido',
    description: 'Não encontramos evidências suficientes de um comprovante Pix legível.',
  },
};

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [validationId, setValidationId] = useState('');
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const validationIdsRef = useRef(new Map());

  useEffect(() => {
    initTracking(CONFIG);
    trackPageView();
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const whatsappUrl = useMemo(() => {
    if (status !== 'approved' || !result?.approved || !validationId || !CONFIG.whatsappUrl) return '';
    return buildWhatsAppUrl(CONFIG.whatsappUrl, {
      validationId,
      amount: result.amount,
    });
  }, [result, status, validationId]);

  async function selectFile(selected) {
    abortRef.current?.abort();
    setError('');
    setResult(null);
    setValidationId('');
    setProgress(0);

    const metadataCheck = validateSelectedFile(selected, CONFIG.maxUploadBytes);
    if (!metadataCheck.valid) {
      setFile(null);
      setStatus('error');
      setError(metadataCheck.message);
      return;
    }

    try {
      const signatureCheck = await validateFileSignature(selected);
      if (!signatureCheck.valid) {
        setFile(null);
        setStatus('error');
        setError(signatureCheck.message);
        return;
      }
    } catch {
      setFile(null);
      setStatus('error');
      setError('Não foi possível verificar o conteúdo do arquivo.');
      return;
    }

    setFile(selected);
    setStatus('selected');
  }

  function onFileChange(event) {
    void selectFile(event.target.files?.[0]);
  }

  function onDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dropzone--active');
    trackBeginCheckout();
    void selectFile(event.dataTransfer.files?.[0]);
  }

  function onUploadIntent() {
    if (status !== 'processing') trackBeginCheckout();
  }

  function onDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dropzone--active');
  }

  function onDragLeave(event) {
    event.currentTarget.classList.remove('dropzone--active');
  }

  function removeFile() {
    abortRef.current?.abort();
    setFile(null);
    setResult(null);
    setValidationId('');
    setStatus('idle');
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function analyzeReceipt() {
    if (!file) {
      setStatus('error');
      setError('Selecione o comprovante antes de iniciar a análise.');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('processing');
    setError('');
    setResult(null);
    setProgress(0);

    try {
      const ocr = await runReceiptOcr(file, setProgress, {
        timeoutMs: CONFIG.ocrTimeoutMs,
        signal: controller.signal,
      });
      const validation = validatePixText(
        ocr.text,
        CONFIG.minPixAmount,
        ocr.confidence,
        CONFIG.minOcrConfidence,
      );
      const nextValidationId = getValidationIdForFile(file, validationIdsRef.current);

      setResult(validation);
      setValidationId(nextValidationId);
      setStatus(validation.status);

      if (validation.approved) {
        trackPurchase({
          validationId: nextValidationId,
          amount: validation.amount,
          currency: validation.currency,
        });
      }
    } catch (exception) {
      if (exception instanceof OcrError && exception.code === 'aborted') return;
      setStatus('error');
      setError(
        exception instanceof OcrError && exception.code === 'timeout'
          ? exception.message
          : 'Não foi possível ler essa imagem. Tente um print mais nítido do comprovante.',
      );
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  const resultCopy = result ? STATUS_COPY[result.status] : null;

  return (
    <main>
      <aside className="compliance-bar" aria-label="Aviso de responsabilidade">
        <span>18+</span>
        <p>Conteúdo para maiores de 18 anos. Jogue com responsabilidade. Não há garantia de lucro.</p>
      </aside>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="OTG LP Factory — início">
          OTG LP Factory
        </a>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#privacidade">Privacidade</a>
          <a className="header-cta" href="#validacao">Validar comprovante</a>
        </nav>
      </header>

      <section id="inicio" className="hero" aria-labelledby="page-title">
        <div className="hero__content">
          <p className="eyebrow">Acesso condicionado à validação visual</p>
          <h1 id="page-title">Envie seu comprovante e solicite acesso ao Grupo VIP.</h1>
          <p className="hero__copy">
            A leitura automática identifica as informações essenciais da imagem e libera o próximo passo quando o valor atende ao mínimo da oferta.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#validacao">Validar comprovante</a>
            <span className="hero__note">Valor mínimo: {formatCurrency(CONFIG.minPixAmount)}</span>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="signal signal--one" />
          <div className="signal signal--two" />
          <div className="receipt">
            <span>PIX</span>
            <strong>Validação inteligente</strong>
            <small>OCR local + regras auditáveis</small>
          </div>
        </div>
      </section>

      <section className="trust" aria-label="Diferenciais">
        <article>
          <ShieldCheck size={24} />
          <strong>Acesso condicionado</strong>
          <span>O WhatsApp é exibido somente após a validação positiva.</span>
        </article>
        <article>
          <Sparkles size={24} />
          <strong>Leitura automatizada</strong>
          <span>OCR identifica instituição, valor, moeda e confiança da leitura.</span>
        </article>
        <article>
          <LockKeyhole size={24} />
          <strong>Processamento local</strong>
          <span>A imagem é processada no navegador e não é armazenada pelo projeto.</span>
        </article>
      </section>

      <section id="validacao" className="validator" aria-labelledby="validator-title">
        <div className="section-heading">
          <p className="eyebrow">Validação</p>
          <h2 id="validator-title">Envie uma imagem do comprovante Pix</h2>
          <span>Use um print nítido, sem cortes e com o valor principal visível.</span>
        </div>

        <div className="workspace">
          <label
            className="dropzone"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              ref={inputRef}
              type="file"
              accept={SUPPORTED_FILE_TYPES.join(',')}
              onChange={onFileChange}
              onClick={onUploadIntent}
              onKeyDown={onUploadIntent}
              disabled={status === 'processing'}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Prévia do comprovante selecionado" />
            ) : (
              <span className="dropzone__empty">
                <UploadCloud size={38} />
                <strong>Arraste a imagem ou clique para escolher</strong>
                <small>PNG, JPG ou WebP · até {formatBytes(CONFIG.maxUploadBytes)}</small>
              </span>
            )}
          </label>

          <div className="panel" aria-live="polite">
            <div className="panel__head">
              <FileImage size={22} />
              <div>
                <strong>{file ? file.name : 'Nenhum arquivo selecionado'}</strong>
                <span>{file ? `${formatBytes(file.size)} · ${file.type}` : 'Aguardando imagem'}</span>
              </div>
            </div>

            {file && status !== 'processing' && (
              <div className="file-actions">
                <button className="text-button" type="button" onClick={() => inputRef.current?.click()}>
                  <RefreshCw size={16} /> Trocar
                </button>
                <button className="text-button text-button--danger" type="button" onClick={removeFile}>
                  <Trash2 size={16} /> Remover
                </button>
              </div>
            )}

            <button
              className="button button--primary"
              type="button"
              onClick={analyzeReceipt}
              disabled={!file || status === 'processing'}
            >
              {status === 'processing' ? `Analisando imagem · ${progress}%` : 'Analisar comprovante'}
            </button>

            {status === 'processing' && (
              <div className="progress" aria-label={`Progresso da leitura: ${progress}%`}>
                <span style={{ width: `${progress}%` }} />
              </div>
            )}

            {error && (
              <div className="message message--error" role="alert">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            )}

            {result && resultCopy && (
              <div className={`result-card result-card--${result.status}`}>
                <div className="result-card__title">
                  {result.approved ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                  <div>
                    <strong>{resultCopy.title}</strong>
                    <span>{resultCopy.description}</span>
                  </div>
                </div>

                <dl className="result-grid">
                  <div><dt>Instituição</dt><dd>{result.institution || 'Não identificada'}</dd></div>
                  <div><dt>Valor</dt><dd>{result.amount !== null ? formatCurrency(result.amount) : 'Não identificado'}</dd></div>
                  <div><dt>Moeda</dt><dd>{result.currency || 'Não identificada'}</dd></div>
                  <div><dt>Confiança OCR</dt><dd>{result.ocrConfidence}%</dd></div>
                  <div><dt>Confiança combinada</dt><dd>{result.effectiveConfidence}%</dd></div>
                  <div><dt>Código</dt><dd>{validationId}</dd></div>
                </dl>

                <ul className="reasons">
                  {result.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            )}

            {status === 'approved' && whatsappUrl && (
              <a className="button button--whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Entrar no Grupo VIP
              </a>
            )}

            {status === 'approved' && !CONFIG.whatsappUrl && (
              <p className="message message--warning">Validação aprovada, mas o WhatsApp ainda não foi configurado.</p>
            )}

            {status === 'approved' && CONFIG.whatsappUrl && !whatsappUrl && (
              <p className="message message--warning">Validação aprovada, mas a URL do WhatsApp está inválida.</p>
            )}

            <p className="panel__disclaimer">
              A análise identifica elementos visuais da imagem. Ela não confirma liquidação bancária nem autenticidade do pagamento.
            </p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="steps" aria-labelledby="steps-title">
        <div className="section-heading">
          <p className="eyebrow">Como funciona</p>
          <h2 id="steps-title">Três passos, sem promessas enganosas</h2>
        </div>
        <div className="steps__grid">
          <article><span>01</span><h3>Selecione a imagem</h3><p>O navegador verifica formato, tamanho e assinatura do arquivo.</p></article>
          <article><span>02</span><h3>Aguarde a leitura</h3><p>O OCR procura indícios de Pix e interpreta o valor com regras contextuais.</p></article>
          <article><span>03</span><h3>Receba o resultado</h3><p>O acesso só aparece quando a validação visual atende aos critérios configurados.</p></article>
        </div>
      </section>

      <section id="privacidade" className="privacy" aria-labelledby="privacy-title">
        <div>
          <p className="eyebrow">Privacidade</p>
          <h2 id="privacy-title">A imagem permanece no seu navegador</h2>
        </div>
        <div className="privacy__copy">
          <p>O comprovante é processado localmente pelo Tesseract.js e não é enviado a um servidor deste projeto nem armazenado permanentemente.</p>
          <p>Os eventos de analytics não recebem imagem, nome, telefone, banco, chave Pix, conteúdo OCR ou outros dados pessoais.</p>
          <p>Para uma operação financeira real, a validação visual deve ser complementada por conciliação com PSP ou instituição bancária.</p>
        </div>
      </section>

      <section className="responsible" aria-labelledby="responsible-title">
        <AlertTriangle size={28} />
        <div>
          <h2 id="responsible-title">Jogue com responsabilidade</h2>
          <p>Conteúdo exclusivo para maiores de 18 anos. Apostas envolvem risco. Não existe garantia de lucro, retorno ou resultado financeiro.</p>
        </div>
      </section>

      <footer>
        <strong>OTG LP Factory</strong>
        <span>Teste técnico · Opção A · Validação visual de comprovante Pix</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

function getValidationIdForFile(file, cache) {
  const key = [file.name, file.type, file.size, file.lastModified].join(':');
  if (!cache.has(key)) cache.set(key, createValidationId());
  return cache.get(key);
}
