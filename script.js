// === EmailJS configuration ===
const EMAILJS_SERVICE_ID = 'service_4p1guz8';
const EMAILJS_TEMPLATE_ID = 'template_46a6kji';
const EMAILJS_PUBLIC_KEY = 'jNFc2cEpYhdLLEcYv';
const EMAILJS_TO_EMAIL = 'dev.juniorbarbosa@gmail.com';

// Substitua os valores acima pelos seus dados do EmailJS.
// service ID, template ID, public key e destinatário devem ser configurados aqui.

if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ==================== CLASSE PARA GERENCIAR O PALLET ====================

class Pallet {
    constructor(numero, quantidadePadrao, idProduto) {
        this.numero = numero;
        this.quantidadePadrao = quantidadePadrao;
        this.idProduto = idProduto;
        this.status = null; // 'ok' ou 'nao-ok'
        this.quantidadeReal = null;
    }

    getQuantidade() {
        if (this.status === 'ok') {
            return this.quantidadePadrao;
        } else if (this.status === 'nao-ok' && this.quantidadeReal !== null) {
            return parseInt(this.quantidadeReal);
        }
        return 0;
    }

    render() {
        const html = `
            <div class="bloco-pallet" data-pallet-numero="${this.numero}">
                <div class="pallet-header">
                    <span class="pallet-titulo">Pallet ${this.numero}</span>
                    <button type="button" class="btn-remover-pallet" data-produto="${this.idProduto}" data-pallet="${this.numero}">
                        ❌ Remover Pallet
                    </button>
                </div>

                <div class="pallet-content">
                    <div class="campo-status">
                        <label>Status do Pallet *</label>
                        <div class="status-opcoes">
                            <input 
                                type="radio" 
                                id="status-ok-${this.idProduto}-${this.numero}" 
                                name="status-pallet-${this.idProduto}-${this.numero}" 
                                value="ok"
                                data-produto="${this.idProduto}"
                                data-pallet="${this.numero}"
                                class="status-radio"
                                ${this.status === 'ok' ? 'checked' : ''}
                            >
                            <label for="status-ok-${this.idProduto}-${this.numero}">✅ OK</label>

                            <input 
                                type="radio" 
                                id="status-nao-ok-${this.idProduto}-${this.numero}" 
                                name="status-pallet-${this.idProduto}-${this.numero}" 
                                value="nao-ok"
                                data-produto="${this.idProduto}"
                                data-pallet="${this.numero}"
                                class="status-radio"
                                ${this.status === 'nao-ok' ? 'checked' : ''}
                            >
                            <label for="status-nao-ok-${this.idProduto}-${this.numero}">❌ NÃO OK</label>
                        </div>
                    </div>

                    ${this.status === 'ok' ? `
                        <div class="campo-quantidade">
                            <label>Quantidade Confirmada</label>
                            <div class="quantidade-confirmada">${this.quantidadePadrao} unidades</div>
                        </div>
                    ` : this.status === 'nao-ok' ? `
                        <div class="campo-quantidade">
                            <label>Quantidade Real de Caixas *</label>
                            <input 
                                type="number" 
                                min="0" 
                                value="${this.quantidadeReal || ''}"
                                data-produto="${this.idProduto}"
                                data-pallet="${this.numero}"
                                class="quantidade-real"
                                placeholder="Digite a quantidade encontrada"
                                required
                            >
                        </div>
                    ` : `
                        <div class="campo-quantidade hidden">
                            <label>Quantidade Real de Caixas *</label>
                            <input 
                                type="number" 
                                min="0" 
                                value="${this.quantidadeReal || ''}"
                                data-produto="${this.idProduto}"
                                data-pallet="${this.numero}"
                                class="quantidade-real"
                                placeholder="Digite a quantidade encontrada"
                            >
                        </div>
                    `}
                </div>
            </div>
        `;
        return html;
    }
}

// ==================== CLASSE PARA GERENCIAR O PRODUTO ====================

class Produto {
    constructor(id, codigo, descricao, nf, quantidadePadrao) {
        this.id = id;
        this.codigo = codigo;
        this.descricao = descricao;
        this.nf = nf;
        this.quantidadePadrao = quantidadePadrao;
        this.pallets = [];
        this.proximoNumeroPallet = 1;
        // Novo: controle de contagem por pacotes ou pallets
        this.tipoContagem = 'pallet'; // 'pallet' ou 'pacote'
        this.quantidadePacotes = 0;

        // Criar 1 pallet inicial
        this.pallets.push(new Pallet(1, quantidadePadrao, this.id));
        this.proximoNumeroPallet = 2;
    }

    adicionarPallet() {
        const pallet = new Pallet(this.proximoNumeroPallet, this.quantidadePadrao, this.id);
        this.pallets.push(pallet);
        this.proximoNumeroPallet++;
        return pallet;
    }

    removerPallet(numero) {
        this.pallets = this.pallets.filter(p => p.numero !== numero);
        this.pallets.forEach((pallet, index) => {
            pallet.numero = index + 1;
        });
        this.proximoNumeroPallet = this.pallets.length + 1;
    }

    obterPallet(numero) {
        return this.pallets.find(p => p.numero === numero);
    }

    calcularQuantidadeTotal() {
        if (this.tipoContagem === 'pacote') {
            return this.quantidadePacotes * this.quantidadePadrao;
        }
        return this.pallets.reduce((total, pallet) => {
            return total + pallet.getQuantidade();
        }, 0);
    }

    render() {
        const palletHtml = this.pallets.map(pallet => pallet.render()).join('');

        const html = `
            <div class="bloco-produto" data-produto-id="${this.id}">
                <div class="bloco-produto-header">
                    <div>
                        <div class="bloco-produto-title">📦 Produto: ${this.codigo} - ${this.descricao}</div>
                        <div class="bloco-produto-subtitle">NF: ${this.nf}</div>
                    </div>
                    <button type="button" class="btn-remover-produto" data-produto="${this.id}">
                        ❌ Remover Produto
                    </button>
                </div>

                <div class="produto-info">
                    <div class="info-item">
                        <label>Código do Produto</label>
                        <div class="info-value" data-produto="${this.id}">${this.codigo}</div>
                    </div>
                    <div class="info-item">
                        <label>Descrição do Produto</label>
                        <div class="info-value" data-produto="${this.id}">${this.descricao}</div>
                    </div>
                    <div class="info-item">
                        <label>Número da Nota Fiscal (NF)</label>
                        <div class="info-value" data-produto="${this.id}">${this.nf}</div>
                    </div>
                    <div class="info-item">
                        <label>Quantidade Padrão</label>
                        <div class="info-value" data-produto="${this.id}">${this.quantidadePadrao} unidades</div>
                    </div>
                    <!-- NOVA SEÇÃO: Forma de Contagem -->
                    <div class="info-item">
                        <label>Forma de Contagem</label>
                        <select class="contagem-select" data-produto="${this.id}">
                            <option value="pallet" ${this.tipoContagem === 'pallet' ? 'selected' : ''}>Por Pallets</option>
                            <option value="pacote" ${this.tipoContagem === 'pacote' ? 'selected' : ''}>Por Pacotes</option>
                        </select>
                    </div>
                    ${this.tipoContagem === 'pacote' ? `
                    <div class="info-item">
                        <label>Quantidade de Pacotes</label>
                        <input type="number" min="0" value="${this.quantidadePacotes}" data-produto="${this.id}" class="quantidade-pacotes-input" placeholder="Ex: 50">
                    </div>
                    ` : ''}
                </div>

                ${this.tipoContagem === 'pallet' ? `
                <div class="container-pallets">
                    <div class="pallets-header">
                        <h4>Pallets (${this.pallets.length})</h4>
                    </div>
                    <div class="lista-pallets" data-produto-pallets="${this.id}">
                        ${palletHtml}
                    </div>
                    <div class="pallets-footer">
                        <button type="button" class="btn-adicionar-pallet" data-produto="${this.id}">
                            ➕ Adicionar Pallet
                        </button>
                    </div>
                </div>
                ` : `
                <div class="container-pacotes">
                    <p style="margin-top: 12px; color: #334155;">Contagem por pacotes: ${this.quantidadePacotes} pacote(s) × ${this.quantidadePadrao} unidades</p>
                </div>
                `}

                <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px;">
                    <strong>Total do Produto:</strong>
                    <span class="total-produto" data-produto="${this.id}" style="font-size: 1.2rem; color: #10b981; margin-left: 10px;">
                        ${this.calcularQuantidadeTotal()} unidades
                    </span>
                </div>
            </div>
        `;
        return html;
    }
}

// ==================== CLASSE PRINCIPAL DO FORMULÁRIO ====================

class FormularioConferencia {
    constructor() {
        this.formulario = document.getElementById('formulario-conferencia');
        this.containerProdutos = document.getElementById('container-produtos');
        this.resumoGeral = document.getElementById('resumo-geral');
        this.btnFinalizar = document.getElementById('btn-finalizar-conferencia');
        this.modalConfirmacao = document.getElementById('modal-confirmacao');
        this.btnConfirmarEnvio = document.getElementById('btn-confirmar-envio');
        this.btnCancelarEnvio = document.getElementById('btn-cancelar-envio');
        this.fotoInput = document.getElementById('foto-carreta');
        this.fotoPreview = document.getElementById('foto-preview');
        this.dataConferencia = document.getElementById('data-conferencia');
        this.fotoDataUrl = null;
        this.fotoBase64 = null;

        this.produtos = [];
        this.proximoIdProduto = 1;

        this.inicializar();
    }

    inicializar() {
        // Event listeners principais
        this.btnAdicionarProdutoBottom = document.getElementById('btn-adicionar-produto-bottom');
        if (this.btnAdicionarProdutoBottom) {
            this.btnAdicionarProdutoBottom.addEventListener('click', (e) => {
                e.preventDefault();
                this.adicionarProduto();
            });
        }

        this.formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            this.mostrarConfirmacaoFinalizacao();
        });

        this.formulario.addEventListener('reset', () => {
            setTimeout(() => this.atualizarEstadoAcoes(), 0);
        });

        this.formulario.addEventListener('input', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' && target.type === 'text' && !target.readOnly) {
                target.value = target.value.toUpperCase();
            }
            if (target.tagName === 'TEXTAREA' && !target.readOnly) {
                target.value = target.value.toUpperCase();
            }
        });

        if (this.btnConfirmarEnvio) {
            this.btnConfirmarEnvio.addEventListener('click', async () => {
                this.fecharConfirmacaoFinalizacao();
                await this.enviarEmailComPdf();
            });
        }

        if (this.btnCancelarEnvio) {
            this.btnCancelarEnvio.addEventListener('click', () => {
                this.fecharConfirmacaoFinalizacao();
            });
        }

        this.fotoInput.addEventListener('change', () => {
            this.exibirPreviewFoto();
        });

        this.btnRemoverFoto = document.getElementById('btn-remover-foto');
        if (this.btnRemoverFoto) {
            this.btnRemoverFoto.addEventListener('click', () => {
                this.removerFoto();
            });
        }

        if (this.dataConferencia) {
            this.dataConferencia.value = new Date().toISOString().slice(0, 10);
            this.dataConferencia.addEventListener('change', () => {
                this.atualizarEstadoAcoes();
                this.limparIndicadoresErroCabecalho();
            });
        }

        const tipoOperacao = document.getElementById('tipo-operacao');
        const nomeConferente = document.getElementById('nome-conferente');
        if (tipoOperacao) {
            tipoOperacao.addEventListener('change', () => {
                this.atualizarEstadoAcoes();
                this.limparIndicadoresErroCabecalho();
            });
        }
        if (nomeConferente) {
            nomeConferente.addEventListener('input', () => {
                this.atualizarEstadoAcoes();
                this.limparIndicadoresErroCabecalho();
            });
        }

        this.atualizarEstadoAcoes();

        // Event delegation para botões dinâmicos
        this.containerProdutos.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remover-produto')) {
                e.preventDefault();
                const idProduto = e.target.dataset.produto;
                this.removerProduto(parseInt(idProduto));
            }

            if (e.target.classList.contains('btn-adicionar-pallet')) {
                e.preventDefault();
                const idProduto = e.target.dataset.produto;
                this.adicionarPallet(parseInt(idProduto));
            }

            if (e.target.classList.contains('btn-remover-pallet')) {
                e.preventDefault();
                const idProduto = e.target.dataset.produto;
                const numeroPallet = parseInt(e.target.dataset.pallet);
                this.removerPallet(parseInt(idProduto), numeroPallet);
            }
        });

        // Event delegation para mudanças de status e quantidade
        this.containerProdutos.addEventListener('change', (e) => {
            if (e.target.classList.contains('status-radio')) {
                const idProduto = parseInt(e.target.dataset.produto);
                const numeroPallet = parseInt(e.target.dataset.pallet);
                const status = e.target.value;

                this.atualizarStatusPallet(idProduto, numeroPallet, status);
                this.renderizarProduto(idProduto);
                this.atualizarResumo();
            }

            if (e.target.classList.contains('quantidade-real')) {
                const idProduto = parseInt(e.target.dataset.produto);
                const numeroPallet = parseInt(e.target.dataset.pallet);
                const quantidade = e.target.value;

                this.atualizarQuantidadeReal(idProduto, numeroPallet, quantidade);
                this.renderizarProduto(idProduto);
                this.atualizarResumo();
            }

            // NOVA: Mudança na forma de contagem
            if (e.target.classList.contains('contagem-select')) {
                const idProduto = parseInt(e.target.dataset.produto);
                const tipoContagem = e.target.value;
                const produto = this.produtos.find(p => p.id === idProduto);
                if (produto) {
                    produto.tipoContagem = tipoContagem;
                    produto.quantidadePacotes = produto.quantidadePacotes || 0;

                    if (tipoContagem === 'pacote') {
                        produto.pallets = [];
                        produto.proximoNumeroPallet = 1;
                    } else if (tipoContagem === 'pallet' && produto.pallets.length === 0) {
                        produto.pallets.push(new Pallet(1, produto.quantidadePadrao, produto.id));
                        produto.proximoNumeroPallet = 2;
                    }

                    this.renderizarProduto(idProduto);
                    this.atualizarResumo();
                }
            }

            if (e.target.classList.contains('quantidade-pacotes-input')) {
                const idProduto = parseInt(e.target.dataset.produto);
                const quantidadePacotes = parseInt(e.target.value) || 0;
                const produto = this.produtos.find(p => p.id === idProduto);
                if (produto) {
                    produto.quantidadePacotes = quantidadePacotes;
                    this.renderizarProduto(idProduto);
                    this.atualizarResumo();
                }
            }
        });
    }

    adicionarProduto() {
        if (!this.validarCabecalho()) return;

        // Solicitar dados do novo produto
        const codigo = prompt('Digite o Código do Produto (ex: FW00906):');
        if (!codigo || codigo.trim() === '') return;

        const descricao = prompt('Digite a Descrição do Produto (ex: Wap Robô Aspirador RAW2400):');
        if (!descricao || descricao.trim() === '') return;

        const nf = prompt('Digite o Número da Nota Fiscal:');
        if (!nf || nf.trim() === '') return;

        const quantidadeStr = prompt('Digite a Quantidade Padrão por Pallet / Pacote (ex: 100):');
        if (!quantidadeStr || isNaN(quantidadeStr)) {
            alert('Quantidade inválida!');
            return;
        }

        const quantidade = parseInt(quantidadeStr);

        // Criar novo produto
        const produto = new Produto(
            this.proximoIdProduto,
            codigo.trim().toUpperCase(),
            descricao.trim().toUpperCase(),
            nf.trim().toUpperCase(),
            quantidade
        );
        this.produtos.push(produto);
        this.proximoIdProduto++;

        this.renderizar();
    }

    removerProduto(idProduto) {
        if (!this.validarCabecalho()) return;
        if (confirm('Tem certeza que deseja remover este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== idProduto);
            this.renderizar();
        }
    }

    adicionarPallet(idProduto) {
        if (!this.validarCabecalho()) return;
        const produto = this.produtos.find(p => p.id === idProduto);
        if (produto) {
            produto.adicionarPallet();
            this.renderizarProduto(idProduto);
            this.atualizarResumo();
        }
    }

    removerPallet(idProduto, numeroPallet) {
        if (!this.validarCabecalho()) return;
        const produto = this.produtos.find(p => p.id === idProduto);
        if (produto && confirm(`Tem certeza que deseja remover o Pallet ${numeroPallet}?`)) {
            produto.removerPallet(numeroPallet);
            this.renderizarProduto(idProduto);
            this.atualizarResumo();
        }
    }

    atualizarStatusPallet(idProduto, numeroPallet, status) {
        const produto = this.produtos.find(p => p.id === idProduto);
        if (produto) {
            const pallet = produto.obterPallet(numeroPallet);
            if (pallet) {
                pallet.status = status;
                if (status === 'ok') {
                    pallet.quantidadeReal = null;
                }
            }
        }
    }

    atualizarQuantidadeReal(idProduto, numeroPallet, quantidade) {
        const produto = this.produtos.find(p => p.id === idProduto);
        if (produto) {
            const pallet = produto.obterPallet(numeroPallet);
            if (pallet) {
                pallet.quantidadeReal = quantidade ? parseInt(quantidade) : null;
            }
        }
    }

    renderizar() {
        if (this.produtos.length === 0) {
            this.containerProdutos.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.</p>';
        } else {
            this.containerProdutos.innerHTML = this.produtos.map(p => p.render()).join('');
        }

        this.atualizarResumo();
    }

    renderizarProduto(idProduto) {
        const produto = this.produtos.find(p => p.id === idProduto);
        const elementoProduto = document.querySelector(`[data-produto-id="${idProduto}"]`);

        if (produto && elementoProduto) {
            elementoProduto.outerHTML = produto.render();
        }
    }

    atualizarResumo() {
        const produtosAtivos = this.produtos.filter(produto => produto.calcularQuantidadeTotal() > 0);

        if (produtosAtivos.length === 0) {
            this.resumoGeral.innerHTML = '<p class="resumo-empty">Nenhum produto adicionado</p>';
            return;
        }

        const itemsResumo = produtosAtivos.map(produto => {
            const total = produto.calcularQuantidadeTotal();
            return `
                <div class="resumo-item">
                    <span class="resumo-codigo">${produto.codigo} - ${produto.descricao}</span>
                    <span class="resumo-quantidade">→ ${total} unidades</span>
                </div>
            `;
        }).join('');

        this.resumoGeral.innerHTML = itemsResumo;
    }

    exibirPreviewFoto() {
        const arquivo = this.fotoInput.files[0];
        if (arquivo) {
            const leitor = new FileReader();
            leitor.onload = (evento) => {
                this._originalDataUrl = evento.target.result;

                this.comprimirImagem(this._originalDataUrl, (dataUrlComprimida) => {
                    this.fotoDataUrl = dataUrlComprimida;
                    const [, base64] = this.fotoDataUrl.split(',');
                    this.fotoBase64 = base64 || null;
                    this.fotoPreview.innerHTML = `<img src="${this.fotoDataUrl}" alt="Foto da Carreta">`;
                    this.fotoPreview.classList.remove('empty');
                    this.btnRemoverFoto.hidden = false;
                });
            };
            leitor.readAsDataURL(arquivo);
        }
    }

    /**
     * Redimensiona e comprime uma imagem antes de enviar ao EmailJS.
     * O resultado final é garantido < 500 KB, evitando o erro 413 (payload muito grande).
     * Aplica até 4 tentativas decrescentes de dimensão e qualidade JPEG.
     * @param {string} src                    Data URL original
     * @param {(result: string) => void} cb   Data URL comprimida entregue ao callback
     * @param {number} [tentativa=0]          Número da tentativa (0 a 3)
     */
    comprimirImagem(src, cb, tentativa = 0) {
        const CONFIG = [
            { largura: 1280, qualidade: 0.80 },
            { largura: 1024, qualidade: 0.55 },
            { largura:  768, qualidade: 0.35 },
            { largura:  512, qualidade: 0.15 },
        ];
        const cfg = CONFIG[tentativa] || CONFIG[3];

        const img = new Image();
        img.onload = () => {
            let w = img.naturalWidth;
            let h = img.naturalHeight;

            if (w > cfg.largura || h > cfg.largura) {
                const escala = cfg.largura / Math.max(w, h);
                w = Math.round(w * escala);
                h = Math.round(h * escala);
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            canvas.toBlob(
                (blob) => {
                    if (!blob) { cb(src); return; }

                    if (blob.size > 500 * 1024 && tentativa < CONFIG.length - 1) {
                        // Ainda está grande → próxima tentativa (dimensões menores + qualidade menor)
                        this.comprimirImagem(src, cb, tentativa + 1);
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => cb(e.target.result);
                    reader.readAsDataURL(blob);
                },
                'image/jpeg',
                cfg.qualidade
            );
        };
        img.onerror = () => cb(src);
        img.src = src;
    }

    removerFoto() {
        this.fotoInput.value = '';
        this.fotoDataUrl = null;
        this.fotoBase64 = null;
        this.fotoPreview.innerHTML = '';
        this.fotoPreview.classList.add('empty');
        this.btnRemoverFoto.hidden = true;
    }

    formatarDataPtBr(dataIso) {
        if (!dataIso) return null;
        const [year, month, day] = dataIso.split('-');
        return `${day}/${month}/${year}`;
    }

    limparIndicadoresErroCabecalho() {
        ['tipo-operacao', 'nome-conferente', 'data-conferencia'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const grupo = elemento.closest('.form-group');
                if (grupo) {
                    grupo.classList.remove('field-error');
                    const mensagem = grupo.querySelector('.error-message');
                    if (mensagem) {
                        mensagem.textContent = '';
                    }
                }
            }
        });
    }

    marcarCampoErro(id, mensagemTexto = 'Este campo é obrigatório.') {
        const elemento = document.getElementById(id);
        if (elemento) {
            const grupo = elemento.closest('.form-group');
            if (grupo) {
                grupo.classList.add('field-error');
                const mensagem = grupo.querySelector('.error-message');
                if (mensagem) {
                    mensagem.textContent = mensagemTexto;
                }
            }
            elemento.focus();
        }
    }

    camposCabecalhoValidos() {
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        const nomeConferenteInput = document.getElementById('nome-conferente');
        const dataConferenciaInput = document.getElementById('data-conferencia');

        if (!tipoOperacao) {
            return false;
        }

        if (!nomeConferenteInput.value.trim()) {
            return false;
        }

        if (!dataConferenciaInput || !dataConferenciaInput.value) {
            return false;
        }

        return true;
    }

    validarCabecalho() {
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        const nomeConferenteInput = document.getElementById('nome-conferente');
        const dataConferenciaInput = document.getElementById('data-conferencia');

        if (!tipoOperacao) {
            this.limparIndicadoresErroCabecalho();
            this.marcarCampoErro('tipo-operacao', 'Este campo é obrigatório.');
            alert('❌ Por favor, selecione o Tipo de Operação antes de prosseguir.');
            return false;
        }

        if (!nomeConferenteInput.value.trim()) {
            this.limparIndicadoresErroCabecalho();
            this.marcarCampoErro('nome-conferente', 'Este campo é obrigatório.');
            alert('❌ Por favor, digite o Nome do Conferente antes de prosseguir.');
            return false;
        }

        if (!dataConferenciaInput || !dataConferenciaInput.value) {
            this.limparIndicadoresErroCabecalho();
            this.marcarCampoErro('data-conferencia', 'Este campo é obrigatório.');
            alert('❌ Por favor, preencha a Data antes de prosseguir.');
            return false;
        }

        return true;
    }

    validarFormulario() {
        if (!this.validarCabecalho()) {
            return false;
        }

        const nomeConferenteInput = document.getElementById('nome-conferente');
        nomeConferenteInput.value = nomeConferenteInput.value.toUpperCase();
        const nomeConferente = nomeConferenteInput.value.trim();

        if (this.produtos.length === 0) {
            alert('❌ Por favor, adicione pelo menos um produto');
            return false;
        }

        // Verificar se todos os produtos estão completos
        for (const produto of this.produtos) {
            if (produto.tipoContagem === 'pacote') {
                if (!produto.quantidadePacotes || produto.quantidadePacotes <= 0) {
                    alert(`❌ Por favor, informe a Quantidade de Pacotes para o Produto ${produto.codigo}`);
                    return false;
                }
                continue;
            }

            for (const pallet of produto.pallets) {
                if (!pallet.status) {
                    alert(`❌ Por favor, defina o status do Pallet ${pallet.numero} do Produto ${produto.codigo}`);
                    return false;
                }

                if (pallet.status === 'nao-ok' && (pallet.quantidadeReal === null || pallet.quantidadeReal === '')) {
                    alert(`❌ Por favor, informe a Quantidade Real de Caixas para o Pallet ${pallet.numero} do Produto ${produto.codigo}`);
                    return false;
                }
            }
        }

        return true;
    }

    atualizarEstadoAcoes() {
        // Mantém os botões ativos para que a validação seja sempre executada
        // no clique e os alertas possam ser exibidos quando o cabeçalho estiver incompleto.
        const valido = this.camposCabecalhoValidos();
        if (valido) {
            this.limparIndicadoresErroCabecalho();
        }
    }

    mostrarConfirmacaoFinalizacao() {
        if (!this.validarFormulario()) {
            return;
        }

        if (this.modalConfirmacao) {
            this.modalConfirmacao.classList.remove('hidden');
        }
    }

    fecharConfirmacaoFinalizacao() {
        if (this.modalConfirmacao) {
            this.modalConfirmacao.classList.add('hidden');
        }
    }

    reiniciarFormulario() {
        this.formulario.reset();
        this.produtos = [];
        this.proximoIdProduto = 1;
        this.fotoInput.value = '';
        this.fotoDataUrl = null;
        this.fotoBase64 = null;
        this.fotoPreview.innerHTML = '';
        this.fotoPreview.classList.add('empty');
        if (this.btnRemoverFoto) {
            this.btnRemoverFoto.hidden = true;
        }
        if (this.dataConferencia) {
            this.dataConferencia.value = new Date().toISOString().slice(0, 10);
        }
        this.limparIndicadoresErroCabecalho();
        this.renderizar();
        this.atualizarEstadoAcoes();
    }

    gerarCorpoEmailParaEmailJS(dados) {
        let linhas = [
            'Relatório da conferência logística.',
            '',
            `Conferente: ${dados.nomeConferente}`,
            `Operação: ${dados.tipoOperacao}`,
            `Data: ${dados.data}`,
            `Data/Hora: ${dados.dataHora}`,
            '',
            'Resumo dos produtos:',
        ];

        dados.resumoFinal.forEach((produto, index) => {
            linhas.push(`${index + 1}. ${produto['codigo']} - ${produto['descricao']} | NF: ${produto.nf} | Total: ${produto.total} caixas`);
            (produto.pallets || []).forEach((pallet) => {
                linhas.push(`   - Pallet ${pallet.numero}: ${pallet.status.toUpperCase()} — ${pallet.quantidade} caixas`);
            });
        });

        if (dados.fotoCarreta) {
            linhas.push('', `Foto da carreta finalizada: ${dados.fotoCarreta}`);
        }

        return linhas.join('\n');
    }

    finalizarConferencia() {
        if (!this.validarFormulario()) {
            return;
        }

        // Coletar dados finais
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        const nomeConferente = document.getElementById('nome-conferente').value;

        const resumoFinal = this.produtos.map(produto => {
            return {
                codigo: produto.codigo,
                descricao: produto.descricao,
                nf: produto.nf,
                total: produto.calcularQuantidadeTotal(),
                pallets: produto.pallets.map(p => ({
                    numero: p.numero,
                    status: p.status,
                    quantidade: p.getQuantidade()
                }))
            };
        });

        const dados = {
            tipoOperacao,
            nomeConferente,
            data: this.dataConferencia ? this.formatarDataPtBr(this.dataConferencia.value) : null,
            dataHora: new Date().toLocaleString('pt-BR'),
            resumoFinal,
            fotoCarreta: this.fotoInput.files[0] ? this.fotoInput.files[0].name : null
        };

        // Exibir resultado
        console.log('📋 Dados da Conferência:', dados);
        alert(`✅ Conferência finalizada com sucesso!\n\n📊 Resumo:\n- Conferente: ${nomeConferente}\n- Operação: ${tipoOperacao}\n- Data: ${dados.data}\n- Data/Hora: ${dados.dataHora}\n\nVerifique o console para detalhes completos.`);

        // Aqui você pode enviar os dados para um servidor
        // this.enviarDados(dados);
    }

    obterDadosConferencia() {
        const tipoOperacao = document.getElementById('tipo-operacao').value;
        const nomeConferente = document.getElementById('nome-conferente').value.trim();
        const dataConferencia = this.dataConferencia ? this.formatarDataPtBr(this.dataConferencia.value) : null;

        const resumoFinal = this.produtos.map(produto => ({
            codigo: produto.codigo,
            descricao: produto.descricao,
            nf: produto.nf,
            total: produto.calcularQuantidadeTotal(),
            pallets: produto.pallets.map(p => ({
                numero: p.numero,
                status: p.status,
                quantidade: p.getQuantidade()
            }))
        }));

        return {
            tipoOperacao,
            nomeConferente,
            data: dataConferencia,
            dataHora: new Date().toLocaleString('pt-BR'),
            resumoFinal,
            fotoCarreta: this.fotoInput.files[0] ? this.fotoInput.files[0].name : null,
            fotoDataUrl: this.fotoDataUrl,
            fotoBase64: this.fotoBase64
        };
    }

    async gerarPdfEBaixar() {
        if (!this.validarFormulario()) {
            alert('❌ Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
            return;
        }

        const dados = this.obterDadosConferencia();
        try {
            const blob = await this.gerarPdf(dados);
            const filename = `conferencia-logistica-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
            this.downloadPdf(blob, filename);
            alert('✅ PDF gerado e baixado com sucesso. Agora você pode anexá-lo ao e-mail.');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('❌ Falha ao gerar o PDF. Verifique o console para mais detalhes.');
        }
    }

    async enviarEmailComPdf() {
        if (!this.validarFormulario()) return;

        if (!window.emailjs) {
            alert('❌ EmailJS não está carregado. Verifique se o SDK foi incluído corretamente.');
            return;
        }

        if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID' ||
            !EMAILJS_TEMPLATE_ID || EMAILJS_TEMPLATE_ID === 'YOUR_EMAILJS_TEMPLATE_ID' ||
            !EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY' ||
            !EMAILJS_TO_EMAIL || EMAILJS_TO_EMAIL === 'DESTINATARIO@EXEMPLO.COM') {
            alert('❌ Configure suas credenciais EmailJS em script.js antes de enviar.');
            return;
        }

        const dados = this.obterDadosConferencia();
        const templateParams = {
            from_name: dados.nomeConferente,
            message: this.gerarCorpoEmailParaEmailJS(dados),
            data: dados.data,
            data_hora: dados.dataHora,
            foto_data_url: dados.fotoDataUrl || '',
        };

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            alert('✅ Relatório enviado com sucesso. O formulário será reiniciado.');
            this.reiniciarFormulario();
        } catch (error) {
            console.error('Erro EmailJS:', error);
            alert('❌ Falha ao enviar o e-mail via EmailJS. Verifique suas credenciais e tente novamente.');
        }
    }

    async gerarPdf(dados) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 14;
        let y = 20;

        doc.setFontSize(16);
        doc.text('Conferência Logística', margin, y);
        y += 10;

        doc.setFontSize(11);
        doc.text(`Operação: ${dados.tipoOperacao}`, margin, y);
        y += 7;
        doc.text(`Conferente: ${dados.nomeConferente}`, margin, y);
        y += 7;
        doc.text(`Data/Hora: ${dados.dataHora}`, margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.text('Resumo dos Produtos', margin, y);
        y += 8;
        doc.setFontSize(10);

        dados.resumoFinal.forEach((produto, index) => {
            const produtoLinha = `${index + 1}. ${produto.codigo} - ${produto.descricao} | NF: ${produto.nf} | Total: ${produto.total} caixas`;
            doc.text(produtoLinha, margin, y);
            y += 6;

            produto.pallets.forEach(pallet => {
                const palletLinha = `   - Pallet ${pallet.numero}: ${pallet.status.toUpperCase()} | ${pallet.quantidade} caixas`;
                doc.text(palletLinha, margin + 4, y);
                y += 6;
            });

            y += 2;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        });

        if (dados.fotoCarreta) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(11);
            doc.text(`Foto da carreta finalizada: ${dados.fotoCarreta}`, margin, y);
        }

        return doc.output('blob');
    }

    downloadPdf(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    }

    enviarDados(dados) {
        // Exemplo de como enviar para um servidor (descomente para usar)
        /*
        fetch('/api/conferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
        .then(response => response.json())
        .then(data => {
            alert('Dados enviados com sucesso!');
        })
        .catch(error => console.error('Erro:', error));
        */
    }
}

// ==================== UTILITÁRIOS BASE64 ====================

const Base64 = {
    /**
     * Converte uma string de texto para Base64 (UTF-8).
     * @param {string} texto
     * @returns {string|null} string codificada em Base64 ou null em erro
     */
    encodeText(texto) {
        if (texto === null || texto === undefined) return null;
        try {
            return btoa(unescape(encodeURIComponent(texto)));
        } catch {
            return null;
        }
    },

    /**
     * Decodifica uma string Base64 (UTF-8) para texto.
     * @param {string} base64Str
     * @returns {string|null} texto decodificado ou null em erro
     */
    decodeText(base64Str) {
        if (!base64Str) return null;
        try {
            return decodeURIComponent(escape(atob(base64Str)));
        } catch {
            return null;
        }
    },

    /**
     * Converte um ArrayBuffer para string Base64.
     * @param {ArrayBuffer} buffer
     * @returns {string}
     */
    encodeBuffer(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Converte uma string Base64 para ArrayBuffer.
     * @param {string} base64Str
     * @returns {ArrayBuffer|null}
     */
    decodeBuffer(base64Str) {
        if (!base64Str) return null;
        try {
            const binary = atob(base64Str);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes.buffer;
        } catch {
            return null;
        }
    },

    /**
     * Lê um arquivo e retorna o conteúdo codificado em Base64.
     * @param {File} arquivo
     * @returns {Promise<string|null>}
     */
    async encodeFile(arquivo) {
        if (!arquivo) return null;
        return new Promise((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = (evento) => {
                const dataUrl = evento.target.result;
                const [, base64] = dataUrl.split(',');
                resolve(base64 || null);
            };
            leitor.onerror = () => reject(leitor.error);
            leitor.readAsDataURL(arquivo);
        });
    },

    /**
     * Decodifica Base64 para Blob.
     * @param {string} base64Str
     * @param {string} tipoMime
     * @returns {Blob|null}
     */
    decodeToBlob(base64Str, tipoMime = 'application/octet-stream') {
        const buffer = this.decodeBuffer(base64Str);
        if (!buffer) return null;
        return new Blob([buffer], { type: tipoMime });
    },

    /**
     * Valida se uma string é um Base64 válido.
     * @param {string} str
     * @returns {boolean}
     */
    isValid(str) {
        if (!str) return false;
        try {
            return btoa(atob(str)) === str;
        } catch {
            return false;
        }
    },

    /**
     * Obtém o tipo MIME de uma string Base64 (via Data URL).
     * @param {string} dataUrl
     * @returns {string|null}
     */
    getMimeType(dataUrl) {
        if (!dataUrl) return null;
        const match = dataUrl.match(/^data:([^;,]+)/);
        return match ? match[1] : null;
    },

    /**
     * Extrai o Base64 puro de uma Data URL.
     * @param {string} dataUrl
     * @returns {string|null}
     */
    extractFromDataUrl(dataUrl) {
        if (!dataUrl) return null;
        const idx = dataUrl.indexOf(',');
        return idx >= 0 ? dataUrl.slice(idx + 1) : null;
    },

    /**
     * Monta uma Data URL a partir de MIME + Base64.
     * @param {string} mimeType
     * @param {string} base64
     * @returns {string}
     */
    buildDataUrl(mimeType, base64) {
        return `data:${mimeType || 'application/octet-stream'};base64,${base64}`;
    }
};

// ==================== INICIALIZAR AO CARREGAR A PÁGINA ====================

document.addEventListener('DOMContentLoaded', () => {
    const formulario = new FormularioConferencia();
});
