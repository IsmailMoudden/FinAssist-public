// Configuration PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Ajout : import du module IndexedDB
import { savePDF, getPDF, getAllPDFs, deletePDF } from './idb.js';

class FinAssistCopilot {
    constructor() {
        this.documents = [];
        this.currentDocument = null;
        this.currentPdf = null;
        this.currentScaleMultiplier = 1.0;
        this.zoomStep = 0.2;
        this.split = null;
        this.contextDocs = [];
        this.pagesRendered = 0; // <--- Ajouté pour le rendu progressif
        this.pagesPerBatch = 2; // <--- Nombre de pages à charger à chaque scroll
        this.initialPages = 3; // <--- Nombre de pages au début
        this.isRendering = false; // <--- Pour éviter les doubles chargements
        this.init();
    }
    
    async init() {
        await this.restoreLocalPDFs(); // Nouvelle méthode pour restaurer les PDF locaux
        this.renderDocumentsList();
        this.setupEventListeners();
        this.setupSplitView();
        this.addWelcomeMessage();
    }

    async restoreLocalPDFs() {
        // Charge tous les PDF stockés dans IndexedDB et les ajoute à this.documents
        const pdfs = await getAllPDFs();
        for (const { id, file } of pdfs) {
            const fileUrl = URL.createObjectURL(file);
            this.documents.unshift({
                id,
                name: file.name || 'Local PDF',
                filename: fileUrl,
                isLocal: true,
                _file: file
            });
        }
    }
    
    renderDocumentsList() {
        const documentsList = document.getElementById('documents-list');
        documentsList.innerHTML = '';
        this.documents.forEach((doc, idx) => {
            const docElement = document.createElement('div');
            docElement.className = 'doc-card';
            docElement.innerHTML = `
                <span class="doc-emoji">📄</span>
                <span class="doc-title" title="${doc.name}">${doc.name.length > 32 ? doc.name.slice(0, 29) + '…' : doc.name}</span>
                <button class="ml-2" title="Supprimer" data-idx="${idx}">&times;</button>
            `;
            // Click to load document
            docElement.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                this.loadDocument(doc);
                // Highlight selected
                Array.from(documentsList.children).forEach(el => el.classList.remove('selected'));
                docElement.classList.add('selected');
            });
            // Click to delete document
            docElement.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteDocument(idx);
            });
            // DRAGGABLE
            docElement.setAttribute('draggable', 'true');
            docElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', doc.id);
                docElement.classList.add('dragging');
            });
            docElement.addEventListener('dragend', () => {
                docElement.classList.remove('dragging');
            });
            documentsList.appendChild(docElement);
        });
    }
    
    setupEventListeners() {
        // Correction : utiliser le bon textarea et bouton
        const chatTextarea = document.getElementById('chat-textarea');
        const sendButton = document.getElementById('send-button');
        const typingIndicator = document.getElementById('typing-indicator');
        const badgeZone = document.getElementById('chat-doc-context');

        // Nouvelle fonction d'envoi de message
        const sendMessage = async () => {
            if (!chatTextarea) return;
            const message = chatTextarea.value.trim();
            if (!message) return;
            this.addChatMessage('user', message);
            chatTextarea.value = '';

            // Ajoute l'indicateur "FinAssist is typing..." en bas du chat
            this.addTypingIndicator();

            // Utiliser la vraie variable contextDocs du scope global
            // (et non window.contextDocs)
            if (!Array.isArray(this.contextDocs) || this.contextDocs.length === 0) {
                this.removeTypingIndicator();
                this.addChatMessage('ai', '❌ Please add at least one document to the context (drag a document into the chat bar).');
                return;
            }

            // Préparer les fichiers à envoyer
            const formData = new FormData();
            formData.append('question', message);
            let hasValidFile = false;
            for (const doc of this.contextDocs) {
                if (doc.isLocal) {
                    let fileToSend = doc._file;
                    if (!fileToSend) {
                        // Si _file absent (après refresh), on le récupère depuis IndexedDB
                        fileToSend = await getPDF(doc.id);
                    }
                    if (fileToSend) {
                        formData.append('files', fileToSend, doc.name);
                        hasValidFile = true;
                    } else {
                        this.removeTypingIndicator();
                        this.addChatMessage('ai', `❌ The local file "${doc.name}" is not available anymore. Please re-upload it.`);
                    }
                } else if (doc.filename) {
                    try {
                        const response = await fetch(doc.filename);
                        const blob = await response.blob();
                        let fileName = doc.name;
                        if (!fileName.toLowerCase().endsWith('.pdf')) {
                            fileName = (doc.filename.split('/').pop() || 'document.pdf');
                        }
                        formData.append('files', blob, fileName);
                        hasValidFile = true;
                    } catch (e) {
                        this.removeTypingIndicator();
                        this.addChatMessage('ai', `❌ Could not fetch static document "${doc.name}".`);
                    }
                }
            }
            if (!hasValidFile) {
                this.removeTypingIndicator();
                return;
            }
            // Appel au backend
            try {
                const resp = await fetch('/ask', {
                    method: 'POST',
                    body: formData
                });
                this.removeTypingIndicator();
                if (!resp.ok) {
                    const data = await resp.json().catch(() => ({}));
                    const extra = data.message ? ` ${data.message}` : '';
                    this.addChatMessage('ai', `❌ Error: ${data.error || 'Server error.'}${extra}`);
                } else {
                    const data = await resp.json();
                    this.addChatMessage('ai', data.answer || 'No answer received.');
                }
            } catch (err) {
                this.removeTypingIndicator();
                this.addChatMessage('ai', `❌ Network error: ${err}`);
            }
        };

        if (sendButton) sendButton.addEventListener('click', sendMessage);
        if (chatTextarea) chatTextarea.addEventListener('keypress', (e) => e.key === 'Enter' && !e.shiftKey && sendMessage());

        const zoomInBtn = document.getElementById('zoom-in-btn');
        const zoomOutBtn = document.getElementById('zoom-out-btn');
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());

        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (event) => {
                this.handleFileUpload(event);
            });
        }
    }

    setupSplitView() {
        this.split = Split(['#sidebar-left', '#viewer-main', '#sidebar-right'], {
            sizes: [14, 54, 32],
            minSize: [160, 320, 260],
            gutterSize: 10,
            cursor: 'col-resize',
            onDragEnd: () => {
                if (this.currentPdf) {
                    this.renderAllPages();
                }
            }
        });
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        let firstDoc = null;
        for (const file of files) {
            if (file.type !== 'application/pdf') {
                this.showError('Veuillez sélectionner uniquement des fichiers PDF.');
                continue;
            }
            if (file.size > 20 * 1024 * 1024) { // 20 Mo
                this.showError('Le fichier est trop volumineux (max 20 Mo).');
                continue;
            }
            const id = `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
            await savePDF(id, file); // Sauvegarde dans IndexedDB
            const fileUrl = URL.createObjectURL(file);
            const newDoc = {
                id,
                name: file.name,
                filename: fileUrl,
                isLocal: true,
                _file: file
            };
            this.documents.unshift(newDoc);
            if (!firstDoc) firstDoc = newDoc;
        }
        this.renderDocumentsList();
        if (firstDoc) this.loadDocument(firstDoc);
        event.target.value = '';
    }

    zoomIn() {
        if (!this.currentPdf) return;
        this.currentScaleMultiplier = parseFloat((this.currentScaleMultiplier + this.zoomStep).toFixed(2));
        this.renderAllPages();
    }

    zoomOut() {
        if (!this.currentPdf || this.currentScaleMultiplier <= 0.4) return;
        this.currentScaleMultiplier = parseFloat((this.currentScaleMultiplier - this.zoomStep).toFixed(2));
        this.renderAllPages();
    }
    
    updateZoomLevelText() {
        const zoomLevelText = document.getElementById('zoom-level-text');
        if (zoomLevelText) {
            zoomLevelText.textContent = `${Math.round(this.currentScaleMultiplier * 100)}%`;
        }
    }
    
    async loadDocument(doc) {
        // Si doc local mais plus de _file (après refresh), erreur explicite
        if (doc.isLocal && !doc._file) {
            this.displayErrorInViewer('This local file is not available anymore. Please re-upload the document.');
            this.showError('Local file not available after refresh.');
            return;
        }
        this.currentDocument = doc;
        this.showLoading(true);
        this.hideWelcomeMessage();
        // Reset state for new document
        this.currentPdf = null;
        this.currentScaleMultiplier = 1.0;
        this.pagesRendered = 0; // <--- Reset du compteur de pages
        const pdfPagesContainer = document.getElementById('pdf-pages');
        if (pdfPagesContainer) pdfPagesContainer.innerHTML = '';
        document.getElementById('zoom-controls').classList.add('hidden');
        try {
            await this.loadRealPDF(doc);
            document.getElementById('zoom-controls').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Error loading document.');
            this.displayErrorInViewer('Could not load the PDF document. Please check the file path and the console for errors.');
            this.showLoading(false);
        }
    }
    
    async loadRealPDF(doc) {
        try {
            const loadingTask = pdfjsLib.getDocument(doc.filename);
            const pdf = await loadingTask.promise;
            this.currentPdf = pdf;
            this.pagesRendered = 0; // <--- Reset ici aussi
            await this.renderNextPages(this.initialPages); // <--- Charge les 3 premières pages
            this.setupScrollLoading(); // <--- Ajoute l'écouteur de scroll
            this.addChatMessage('ai', `📊 Document loaded! I can help you analyze this ${doc.name.toLowerCase()}. Ask me about key insights, financial metrics, or business implications.`);
        } catch (e) {
            this.displayErrorInViewer('Could not load the PDF document. Please check the file path and the console for errors.');
            this.showError('Error loading document.');
            this.showLoading(false);
        }
    }

    async renderAllPages() {
        if (!this.currentPdf) return;
        const pdfPagesContainer = document.getElementById('pdf-pages');
        const container = document.getElementById('pdf-container');
        const containerWidth = container.clientWidth - 32; // Subtract padding (p-4 -> 1rem * 2)
        const dpr = window.devicePixelRatio || 1;
        pdfPagesContainer.innerHTML = '';
        this.showLoading(true);
        const fragment = document.createDocumentFragment();
        for (let pageNum = 1; pageNum <= Math.min(this.currentPdf.numPages, 5); pageNum++) {
            const page = await this.currentPdf.getPage(pageNum);
            const originalViewport = page.getViewport({ scale: 1.0 });
            const fitScale = containerWidth / originalViewport.width;
            const finalScale = fitScale * this.currentScaleMultiplier * dpr;
            const viewport = page.getViewport({ scale: finalScale });
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page-container card-3d';
            pageContainer.style.width = `${viewport.width / dpr}px`;
            pageContainer.style.height = `${viewport.height / dpr}px`;
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width / dpr}px`;
            canvas.style.height = `${viewport.height / dpr}px`;
            pageContainer.appendChild(canvas);
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.setProperty('--scale-factor', finalScale);
            pageContainer.appendChild(textLayerDiv);
            fragment.appendChild(pageContainer);
            // Render canvas and text layer
            page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            });
            page.getTextContent().then(textContent => {
                pdfjsLib.renderTextLayer({
                    textContentSource: textContent,
                    container: textLayerDiv,
                    viewport: viewport,
                });
            });
        }
        pdfPagesContainer.appendChild(fragment);
        this.updateZoomLevelText();
        this.showLoading(false);
    }
    
    async renderNextPages(count) {
        if (!this.currentPdf || this.isRendering) return;
        this.isRendering = true;
        const pdfPagesContainer = document.getElementById('pdf-pages');
        const container = document.getElementById('pdf-container');
        const containerWidth = container.clientWidth - 32;
        const dpr = window.devicePixelRatio || 1;
        const fragment = document.createDocumentFragment();
        const start = this.pagesRendered + 1;
        const end = Math.min(this.currentPdf.numPages, this.pagesRendered + count);
        for (let pageNum = start; pageNum <= end; pageNum++) {
            const page = await this.currentPdf.getPage(pageNum);
            const originalViewport = page.getViewport({ scale: 1.0 });
            const fitScale = containerWidth / originalViewport.width;
            const finalScale = fitScale * this.currentScaleMultiplier * dpr;
            const viewport = page.getViewport({ scale: finalScale });
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page-container card-3d';
            pageContainer.style.width = `${viewport.width / dpr}px`;
            pageContainer.style.height = `${viewport.height / dpr}px`;
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = `${viewport.width / dpr}px`;
            canvas.style.height = `${viewport.height / dpr}px`;
            pageContainer.appendChild(canvas);
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.setProperty('--scale-factor', finalScale);
            pageContainer.appendChild(textLayerDiv);
            fragment.appendChild(pageContainer);
            // Render canvas and text layer
            page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            });
            page.getTextContent().then(textContent => {
                pdfjsLib.renderTextLayer({
                    textContentSource: textContent,
                    container: textLayerDiv,
                    viewport: viewport,
                });
            });
        }
        pdfPagesContainer.appendChild(fragment);
        this.pagesRendered = end;
        this.updateZoomLevelText();
        this.isRendering = false;
        this.showLoading(false);
    }

    setupScrollLoading() {
        const container = document.getElementById('pdf-container');
        if (!container) return;
        // Supprime les anciens écouteurs si besoin
        if (this._scrollHandler) {
            container.removeEventListener('scroll', this._scrollHandler);
        }
        this._scrollHandler = async () => {
            if (!this.currentPdf) return;
            // Si déjà en train de charger ou tout est chargé, on ne fait rien
            if (this.isRendering || this.pagesRendered >= this.currentPdf.numPages) return;
            // Si on est proche du bas (100px)
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
                this.showLoading(true);
                await this.renderNextPages(this.pagesPerBatch);
            }
        };
        container.addEventListener('scroll', this._scrollHandler);
    }
    
    displayErrorInViewer(message) {
        const pdfPagesContainer = document.getElementById('pdf-pages');
        pdfPagesContainer.innerHTML = `
            <div class="text-center py-20 text-gray-400 card-3d bg-surseoir-panel rounded-2xl p-8">
                <div class="text-3xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold text-surseoir-text mb-2">Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        const isUser = sender === 'user';
        messageElement.className = `message-appear ${isUser ? 'user-message' : 'ai-message'}`;
        if (isUser) {
            // Avatar SVG orange, légèrement plus bas
            messageElement.innerHTML = `
                <div class="message-row user-row">
                    <div class="message-content user-content">
                        <div class="message-text">${this.escapeHtml(message)}</div>
                    </div>
                    <div class="message-avatar user-avatar">
                        <svg class="user-avatar-svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style="display:block; position:relative; top:6px;">
                          <circle cx="16" cy="12" r="6" fill="#FFF3E0" stroke="#FF9900" stroke-width="2"/>
                          <ellipse cx="16" cy="24" rx="9" ry="5" fill="none" stroke="#FF9900" stroke-width="2"/>
                        </svg>
                    </div>
                </div>
            `;
        } else {
            // Avatar robot SVG minimaliste à gauche, bulle à droite
            const formattedMessage = this.formatAIResponse(message);
            messageElement.innerHTML = `
                <div class="message-row ai-row">
                    <div class="message-avatar ai-avatar">
                        <svg class="ai-avatar-svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style="display:block; position:relative; top:6px;">
                          <rect x="7" y="13" width="18" height="12" rx="6" fill="#FFF3E0" stroke="#FF9900" stroke-width="2"/>
                          <circle cx="13" cy="19" r="2" fill="#FF9900"/>
                          <circle cx="19" cy="19" r="2" fill="#FF9900"/>
                          <rect x="12" y="25" width="8" height="2" rx="1" fill="#FF9900"/>
                          <rect x="14.5" y="9" width="3" height="4" rx="1.5" fill="#FF9900"/>
                        </svg>
                    </div>
                    <div class="message-content ai-content">
                        <div class="message-text">${formattedMessage}</div>
                    </div>
                </div>
            `;
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    formatAIResponse(message) {
        // 1. Supprimer tous les titres Markdown (##, ###, etc.)
        message = message.replace(/^#+\s*(.*)$/gm, '');

        // 2. Remplacer les listes à puces markdown par <ul><li>...</li></ul>
        // On regroupe les lignes commençant par - ou •
        message = message.replace(/((?:^[-•]\s.*\n?)+)/gm, function(list) {
            const items = list.trim().split('\n').map(line =>
                line.replace(/^[-•]\s*/, '').trim()
            ).filter(Boolean);
            if (items.length === 0) return '';
            return '<ul>' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
        });

        // 3. Remplacer les listes numérotées markdown par <ol><li>...</li></ol>
        message = message.replace(/((?:^\d+\.\s.*\n?)+)/gm, function(list) {
            const items = list.trim().split('\n').map(line =>
                line.replace(/^\d+\.\s*/, '').trim()
            ).filter(Boolean);
            if (items.length === 0) return '';
            return '<ol>' + items.map(item => `<li>${item}</li>`).join('') + '</ol>';
        });

        // 4. Titres en gras sur une ligne seule
        message = message.replace(/\*\*(.+?)\*\*/g, '<div class="doc-title-block">$1</div>');

        // 5. Nettoyer les sauts de ligne multiples
        message = message.replace(/\n{2,}/g, '<div class="section-break"></div>');
        message = message.replace(/\n/g, '<br>');

        // 6. Emojis spéciaux
        message = message.replace(/(📊|📈|💡|⚠️|✅|❌)/g, '<span class="emoji-highlight">$1</span>');

        // 7. Échapper le HTML restant pour éviter les injections
        const div = document.createElement('div');
        div.innerHTML = message;
        return div.innerHTML;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    addWelcomeMessage() {
        this.addChatMessage('ai', '👋 Hello! I am your FinAssist AI. I can help you analyze business documents, financial reports, and provide insights. Select a document to begin!');
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.classList.toggle('hidden', !show);
    }
    
    hideWelcomeMessage() {
        document.getElementById('welcome-message').classList.add('hidden');
    }
    
    showError(message) {
        this.addChatMessage('ai', `❌ ${message}`);
    }

    async deleteDocument(idx) {
        const doc = this.documents[idx];
        if (doc.isLocal) {
            await deletePDF(doc.id); // Supprime aussi dans IndexedDB
            URL.revokeObjectURL(doc.filename);
        }
        // If the deleted doc is currently loaded, clear viewer
        if (this.currentDocument && this.currentDocument.id === doc.id) {
            this.currentDocument = null;
            this.currentPdf = null;
            document.getElementById('pdf-pages').innerHTML = '';
            document.getElementById('zoom-controls').classList.add('hidden');
            document.getElementById('welcome-message').classList.remove('hidden');
        }
        this.documents.splice(idx, 1);
        this.renderDocumentsList();
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        // Ne pas ajouter plusieurs indicateurs
        if (chatMessages.querySelector('.ai-typing-indicator')) return;
        const typingElement = document.createElement('div');
        typingElement.className = 'message-appear ai-message ai-typing-indicator';
        typingElement.innerHTML = `
            <div class="message-row ai-row">
                <div class="message-avatar ai-avatar">
                    <svg class="ai-avatar-svg" width="32" height="32" viewBox="0 0 32 32" fill="none" style="display:block; position:relative; top:6px;">
                      <rect x="7" y="13" width="18" height="12" rx="6" fill="#FFF3E0" stroke="#FF9900" stroke-width="2"/>
                      <circle cx="13" cy="19" r="2" fill="#FF9900"/>
                      <circle cx="19" cy="19" r="2" fill="#FF9900"/>
                      <rect x="12" y="25" width="8" height="2" rx="1" fill="#FF9900"/>
                      <rect x="14.5" y="9" width="3" height="4" rx="1.5" fill="#FF9900"/>
                    </svg>
                </div>
                <div class="message-content ai-content">
                    <div class="message-text">
                        <span class="typing-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                        <span style="margin-left:8px;">FinAssist is typing</span>
                    </div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typing = chatMessages.querySelector('.ai-typing-indicator');
        if (typing) typing.remove();
    }
}

// Initialisation Split.js (unique, global, protégé)
document.addEventListener('DOMContentLoaded', function() {
    if (window.splitInstance && window.splitInstance.destroy) {
        window.splitInstance.destroy();
    }
    window.splitInstance = Split(['#sidebar-left', '#viewer-main', '#sidebar-right'], {
        sizes: [14, 54, 32],
        minSize: [160, 320, 260],
        gutterSize: 10,
        cursor: 'col-resize',
        onDragEnd: () => {
            // Optionnel : re-render PDF si besoin
        }
    });
    // Dark mode toggle (une seule fois)
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-toggle-icon');
    function setTheme(mode) {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.innerHTML = `<svg width='22' height='22' fill='none' viewBox='0 0 24 24'><path d='M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z' stroke='url(#moonOrange)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/><defs><linearGradient id='moonOrange' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#FFB347'/><stop offset='100%' stop-color='#FF6600'/></linearGradient></defs></svg>`;
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            themeIcon.innerHTML = `<svg width='22' height='22' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='5' fill='url(#sunOrange)'/><path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' stroke='url(#sunOrange)' stroke-width='2' stroke-linecap='round'/><defs><linearGradient id='sunOrange' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#FFB347'/><stop offset='100%' stop-color='#FF6600'/></linearGradient></defs></svg>`;
        }
    }
    const userTheme = localStorage.getItem('theme');
    if (userTheme === 'dark' || (!userTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }
    // Initialiser l'app principale (une seule fois)
    if (!window.finAssistInstance) {
        window.finAssistInstance = new FinAssistCopilot();
    }

    // --- DRAG & DROP CONTEXTUEL À LA COPILOT/CURSOR ---
    // --- 1. Toujours réserver la zone badge ---
    const badgeZone = document.getElementById('chat-doc-context');
    badgeZone.classList.add('doc-context-empty'); // invisible à vide

    // --- PERSISTENCE CONTEXTE ---
    // Sauvegarder le contexte dans localStorage
    function saveContextDocs() {
        // On ne sauvegarde que les docs statiques (pas isLocal)
        const toSave = (window.finAssistInstance && window.finAssistInstance.contextDocs || []).filter(d => !d.isLocal).map(d => d.id);
        localStorage.setItem('finassist_context_docs', JSON.stringify(toSave));
    }
    // Restaurer le contexte au chargement
    function restoreContextDocs() {
        const saved = localStorage.getItem('finassist_context_docs');
        if (!saved) return;
        try {
            const ids = JSON.parse(saved);
            if (!Array.isArray(ids)) return;
            if (window.finAssistInstance && window.finAssistInstance.documents) {
                // On ne restaure que les docs uploadés (isLocal)
                window.finAssistInstance.contextDocs = window.finAssistInstance.contextDocs.filter(d => d.isLocal);
            }
        } catch {}
    }
    // Appeler la restauration au chargement
    restoreContextDocs();

    // --- 2. Empêcher tout drop sur le textarea ---
    const chatTextarea = document.getElementById('chat-textarea');
    if (chatTextarea) {
        chatTextarea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        chatTextarea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    // --- 3. Barre d'input = seule zone droppable ---
    const chatInputBar = document.getElementById('chat-input-bar');
    if (chatInputBar) {
        chatInputBar.addEventListener('dragover', (e) => {
            e.preventDefault();
            chatInputBar.classList.add('border-dashed', 'border-2', 'border-finassist-accent2');
        });
        chatInputBar.addEventListener('dragleave', () => {
            chatInputBar.classList.remove('border-dashed', 'border-2', 'border-finassist-accent2');
        });
        chatInputBar.addEventListener('drop', (e) => {
            e.preventDefault();
            chatInputBar.classList.remove('border-dashed', 'border-2', 'border-finassist-accent2');
            const docId = e.dataTransfer.getData('text/plain');
            if (!docId) return;
            const doc = window.finAssistInstance && window.finAssistInstance.documents.find(d => d.id === docId);
            if (!doc) return;
            if (window.finAssistInstance.contextDocs.some(d => d.id === docId)) return;
            window.finAssistInstance.contextDocs.push(doc);
            saveContextDocs();
            renderBadges();
        });
    }

    // --- 4. Affichage des badges ---x
    function renderBadges() {
        const docs = window.finAssistInstance && window.finAssistInstance.contextDocs || [];
        badgeZone.innerHTML = docs.map((doc, i) =>
            `<span class="doc-pill${doc.isLocal && !doc._file ? ' doc-pill-unavailable' : ''}">
                <span class="doc-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <rect x="4" y="3" width="16" height="18" rx="2" fill="#fff" fill-opacity="0.18"/>
                        <rect x="7" y="7" width="10" height="2" rx="1" fill="#fff" fill-opacity="0.7"/>
                        <rect x="7" y="11" width="7" height="2" rx="1" fill="#fff" fill-opacity="0.7"/>
                    </svg>
                </span>
                <span class='doc-name'>${doc.name}</span>
                ${doc.isLocal && !doc._file ? '<span style="color:#fff;background:#FF6600;padding:2px 8px;border-radius:8px;font-size:0.85em;margin-left:6px;">Unavailable</span>' : ''}
                <button class="remove-doc" title="Remove" data-idx="${i}">&times;</button>
            </span>`
        ).join('');
        if (docs.length === 0) {
            badgeZone.classList.add('doc-context-empty');
        } else {
            badgeZone.classList.remove('doc-context-empty');
        }
        // Suppression de badge
        badgeZone.querySelectorAll('.remove-doc').forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                window.finAssistInstance.contextDocs.splice(idx, 1);
                saveContextDocs();
                renderBadges();
            };
        });
    }

    // Afficher les badges au chargement (après restauration)
    renderBadges();

    // --- DROP ZONE INDEPENDANTE ---
    const dropZone = document.getElementById('doc-drop-zone');
    if (dropZone) {
        // Affiche la zone au dragenter/dragover
        let dragCounter = 0;
        dropZone.innerHTML = '';
        function showDropZone() {
            dropZone.classList.add('active');
            dropZone.innerHTML = `<span class='drop-text'><span class='drop-icon'>📄</span>Drop document here to add context</span>`;
        }
        function hideDropZone() {
            dropZone.classList.remove('active');
            dropZone.innerHTML = '';
        }
        // Drag events sur toute la fenêtre pour activer la zone
        document.addEventListener('dragenter', (e) => {
            dragCounter++;
            showDropZone();
        });
        document.addEventListener('dragleave', (e) => {
            dragCounter--;
            if (dragCounter <= 0) {
                hideDropZone();
                dragCounter = 0;
            }
        });
        document.addEventListener('dragover', (e) => {
            if (dropZone) showDropZone();
        });
        // Drop sur la zone
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            hideDropZone();
            dragCounter = 0;
            const docId = e.dataTransfer.getData('text/plain');
            if (!docId) return;
            const doc = window.finAssistInstance && window.finAssistInstance.documents.find(d => d.id === docId);
            if (!doc) return;
            if (window.finAssistInstance.contextDocs.some(d => d.id === docId)) return;
            window.finAssistInstance.contextDocs.push(doc);
            renderBadges();
        });
    }
}); 

function updateChatDocContext() {
    const ctxDiv = document.getElementById('chat-doc-context');
    const docs = window.finAssistInstance && window.finAssistInstance.contextDocs || [];
    ctxDiv.innerHTML = docs.map((doc, i) =>
        `<span class="doc-pill${doc.isLocal && !doc._file ? ' doc-pill-unavailable' : ''}">
            <span class="doc-icon">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <rect x="4" y="3" width="16" height="18" rx="2" fill="#fff" fill-opacity="0.18"/>
                    <rect x="7" y="7" width="10" height="2" rx="1" fill="#fff" fill-opacity="0.7"/>
                    <rect x="7" y="11" width="7" height="2" rx="1" fill="#fff" fill-opacity="0.7"/>
                </svg>
            </span>
            <span class='doc-name'>${doc.name}</span>
            ${doc.isLocal && !doc._file ? '<span style="color:#fff;background:#FF6600;padding:2px 8px;border-radius:8px;font-size:0.85em;margin-left:6px;">Unavailable</span>' : ''}
            <button class="remove-doc" title="Remove" data-idx="${i}">&times;</button>
        </span>`
    ).join('');
    if (docs.length === 0) {
        ctxDiv.classList.add('doc-context-empty');
    } else {
        ctxDiv.classList.remove('doc-context-empty');
    }
    // Remove doc on click
    ctxDiv.querySelectorAll('.remove-doc').forEach(btn => {
        btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            window.finAssistInstance.contextDocs.splice(idx, 1);
            updateChatDocContext();
            saveContextDocs();
            renderBadges();
        };
    });
} 