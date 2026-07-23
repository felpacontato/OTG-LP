import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
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
    title: 'Comprovante aprovado',
    description: 'O valor foi identificado e está dentro do mínimo exigido para liberar o acesso.',
  },
  below_minimum: {
    title: 'Valor abaixo do mínimo',
    description: `O valor encontrado é menor que ${formatCurrency(CONFIG.minPixAmount)}.`,
  },
  low_confidence: {
    title: 'Não deu para conferir com segurança',
    description: 'Tente novamente com uma imagem mais nítida, sem cortes e com o valor do Pix bem visível.',
  },
  unrecognized: {
    title: 'Não conseguimos identificar o comprovante',
    description: 'Confira se a imagem mostra um comprovante Pix legível e envie novamente.',
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
      setError('Não foi possível conferir esse arquivo. Escolha outra imagem e tente novamente.');
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
      setError('Escolha a imagem do comprovante antes de continuar.');
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
          : 'Não conseguimos ler essa imagem. Tente um print mais nítido do comprovante.',
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
        <p>Conteúdo para maiores de 18 anos. Jogue com responsabilidade. Não existe garantia de lucro.</p>
      </aside>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="OTG LP Factory — início">
          OTG LP Factory
        </a>
        <nav aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#privacidade">Privacidade</a>
          <a className="header-cta" href="#validacao">Enviar comprovante</a>
        </nav>
      </header>

      <section id="inicio" className="hero" aria-labelledby="page-title">
        <div className="hero__content">
          <h1 id="page-title">Envie seu comprovante e libere seu acesso ao Grupo VIP.</h1>
          <p className="hero__copy">
            Faça o upload do comprovante Pix. Assim que o valor for identificado e aprovado, o botão de entrada no WhatsApp será liberado.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#validacao">Enviar comprovante</a>
            <span className="hero__note">Valor mínimo: {formatCurrency(CONFIG.minPixAmount)}</span>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <video className="hero__video" autoPlay muted loop playsInline preload="metadata">
            <source src="/assets/hero-live-wallpaper.mp4" type="video/mp4" />
          </video>
          <div className="hero__video-overlay" />
        </div>
      </section>

      <section className="trust" aria-label="Como funciona o acesso">
        <article>
          <UploadCloud size={24} />
          <strong>Envio simples</strong>
          <span>Escolha uma imagem nítida do comprovante e inicie a conferência.</span>
        </article>
        <article>
          <Sparkles size={24} />
          <strong>Resultado na hora</strong>
          <span>O sistema identifica o valor do Pix e informa se ele atende ao mínimo.</span>
        </article>
        <article>
          <ShieldCheck size={24} />
          <strong>Acesso após aprovação</strong>
          <span>Quando o comprovante for aprovado, o botão para entrar no grupo será liberado.</span>
        </article>
      </section>

      <section id="validacao" className="validator" aria-labelledby="validator-title">
        <div className="section-heading">
          <p className="eyebrow">Envio do comprovante</p>
          <h2 id="validator-title">Envie o comprovante do Pix</h2>
          <span>Use uma imagem nítida, sem cortes e com o valor da transferência visível.</span>
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
                <strong>Arraste a imagem aqui ou clique para escolher</strong>
                <small>PNG, JPG ou WebP — até {formatBytes(CONFIG.maxUploadBytes)}</small>
              </span>
            )}
          </label>

          <div className="panel" aria-live="polite">
            <div className="panel__head">
              <FileImage size={22} />
              <div>
                <strong>{file ? file.name : 'Nenhum arquivo selecionado'}</strong>
                <span>{file ? `${formatBytes(file.size)} · ${file.type}` : 'Escolha uma imagem para começar'}</span>
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
              {status === 'processing' ? `Conferindo comprovante · ${progress}%` : 'Conferir comprovante'}
            </button>

            {status === 'processing' && (
              <div className="progress" aria-label={`Progresso da conferência: ${progress}%`}>
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
                  <div><dt>Confiança da leitura</dt><dd>{result.ocrConfidence}%</dd></div>
                  <div><dt>Resultado da conferência</dt><dd>{result.effectiveConfidence}%</dd></div>
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
              <p className="message message--warning">O comprovante foi aprovado, mas o WhatsApp ainda não foi configurado.</p>
            )}

            {status === 'approved' && CONFIG.whatsappUrl && !whatsappUrl && (
              <p className="message message--warning">O comprovante foi aprovado, mas o link do WhatsApp está inválido.</p>
            )}

            <p className="panel__disclaimer">
              A conferência da imagem não substitui a confirmação bancária do pagamento.
            </p>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="steps" aria-labelledby="steps-title">
        <div className="section-heading">
          <p className="eyebrow">Como funciona</p>
          <h2 id="steps-title">Como liberar seu acesso</h2>
        </div>
        <div className="steps__grid">
          <article><span>01</span><h3>Envie a imagem</h3><p>Escolha um print nítido do comprovante Pix.</p></article>
          <article><span>02</span><h3>Aguarde a conferência</h3><p>O valor e as informações principais serão identificados.</p></article>
          <article><span>03</span><h3>Entre no grupo</h3><p>Se estiver tudo certo, o acesso pelo WhatsApp será liberado.</p></article>
        </div>
      </section>

      <section id="privacidade" className="privacy" aria-labelledby="privacy-title">
        <div>
          <p className="eyebrow">Privacidade</p>
          <h2 id="privacy-title">Seu comprovante não fica armazenado</h2>
        </div>
        <div className="privacy__copy">
          <p>A imagem é usada somente durante a conferência e não é salva por esta página.</p>
          <p>Não enviamos a imagem nem os dados do comprovante para o Meta Pixel ou Google Analytics.</p>
          <p>A conferência da imagem não substitui a confirmação bancária do pagamento.</p>
        </div>
      </section>

      <section className="responsible" aria-labelledby="responsible-title">
        <AlertTriangle size={28} />
        <div>
          <h2 id="responsible-title">Jogue com responsabilidade</h2>
          <p>Conteúdo exclusivo para maiores de 18 anos. Apostas envolvem risco e não existe garantia de lucro ou resultado.</p>
        </div>
      </section>

      <footer>
        <strong>OTG LP Factory</strong>
        <span>Envio e conferência de comprovante Pix para acesso ao Grupo VIP.</span>
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
