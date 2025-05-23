(function () {
    'use strict';

    const TARGET_DIV_SELECTOR = '#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3';
    const INPUT_CONTRIBUICAO_ID = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtContribuicao';
    const CONFIG_PATH = 'config/text.json';

    // Aguarda elementos essenciais estarem disponíveis
    function esperarElementos() {
        return new Promise(resolve => {
            const check = () => {
                const panel = document.querySelector(TARGET_DIV_SELECTOR);
                const contribInput = document.getElementById(INPUT_CONTRIBUICAO_ID);
                if (panel && contribInput) resolve();
                else setTimeout(check, 300);
            };
            check();
        });
    }

    // Carrega o arquivo de configuração JSON
    async function carregarConfig() {
        try {
            const url = chrome.runtime.getURL(CONFIG_PATH);
            const resp = await fetch(url);
            return await resp.json();
        } catch (err) {
            console.error('Erro ao carregar config/text.json:', err);
            return {};
        }
    }

    // Cria os botões dinamicamente
    function criarBotoes(contexto) {
        const btnImportar = criarBotao({
            label: 'Importar dados do cidadão',
            classes: ['btn-cidadao'],
            onClick: importarDadosCidadao
        });

        const btnProrrogacao = criarBotao({
            label: 'Texto de Prorrogação',
            classes: ['btn-prorrogacao'],
            style: { marginTop: '5px' },
            onClick: () => inserirTextoProrrogacao(contexto)
        });

        return [btnImportar, btnProrrogacao];
    }

    // Helper: cria elemento input[type=submit] estilizado
    function criarBotao({ label, classes = [], style = {}, onClick }) {
        const btn = document.createElement('input');
        btn.type = 'submit';
        btn.value = label;
        btn.classList.add('btn', 'btn-sm', 'btn-primary', ...classes);
        Object.assign(btn.style, { marginLeft: '1px', ...style });
        btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#015298');
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#337ab7');
        btn.addEventListener('click', e => { e.preventDefault(); onClick(); });
        return btn;
    }

    // Lógica de importação de dados do cidadão para o campo contribuição
    function importarDadosCidadao() {
        const tipoDoc = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTipoDocPF')?.textContent.trim() || '';
        const nome = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNomePF')?.textContent.trim() || '';
        const documento = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumeroDocPF')?.textContent.trim() || '';
        const email = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtEmailPF')?.textContent.trim() || '';
        const field = document.getElementById(INPUT_CONTRIBUICAO_ID);
        if (field) {
            field.value = `Nome: ${nome}\nDocumento (${tipoDoc}): ${documento}\nEmail: ${email}`;
        }
    }

    // Insere texto de prorrogação pré-configurado
    function inserirTextoProrrogacao({ mensagens }) {
        const prazo = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento')?.textContent.trim() || '';
        const texto = (mensagens?.prorrogacao || '').replace('{datalimite}', prazo);
        const field = document.getElementById(INPUT_CONTRIBUICAO_ID);
        if (field) field.value = texto;
    }

    // Insere botões no painel alvo
    function inserirBotoes(contexto) {
        const panel = document.querySelector(TARGET_DIV_SELECTOR);
        if (!panel) return;
        panel.querySelectorAll('.btn-cidadao, .btn-prorrogacao').forEach(el => el.remove());
        const [btn1, btn2] = criarBotoes(contexto);
        panel.append(btn1, btn2);
    }

    // Observa mudanças no DOM para reinserir botões, se necessário
    function observarMudancas(contexto) {
        new MutationObserver(() => {
            const panel = document.querySelector(TARGET_DIV_SELECTOR);
            if (!panel?.querySelector('.btn-cidadao')) inserirBotoes(contexto);
        }).observe(document.body, { childList: true, subtree: true });
    }

    // Inicialização após todos elementos estarem disponíveis
    esperarElementos().then(async () => {
        const config = await carregarConfig();
        inserirBotoes({ mensagens: config.mensagens });
        observarMudancas({ mensagens: config.mensagens });
    });
})();
