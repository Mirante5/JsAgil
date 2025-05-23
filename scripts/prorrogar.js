(function () {
    'use strict';

    window.addEventListener('load', async function () {
        const SELECT_ID = 'justificativasBox';

        // Elementos base
        const motivoProrrogacaoLabel = document.querySelector('label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoProrrogacao"]');
        const justificativaInput = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaProrrogacao');

        if (!motivoProrrogacaoLabel || !justificativaInput) {
            console.error('Elementos necessários não encontrados na página.');
            return;
        }

        if (document.getElementById(SELECT_ID)) {
            console.log('Dropdown já existe na página.');
            return;
        }

        // Função para carregar JSON de configuração
        async function carregarConfig() {
            try {
                const url = chrome.runtime.getURL('config/text.json');
                const resp = await fetch(url);
                return await resp.json();
            } catch (e) {
                console.error('Erro ao carregar config/text.json:', e);
                return null;
            }
        }

        // Cria dropdown com justificativas
        function criarDropdown(prorrogacoes) {
            const label = document.createElement('label');
            label.setAttribute('for', SELECT_ID);
            label.textContent = 'Texto de Prorrogação:';
            label.className = 'justificativas-label';

            const select = document.createElement('select');
            select.id = SELECT_ID;
            select.name = SELECT_ID;
            select.className = 'justificativas-dropdown';

            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = 'Selecione uma justificativa...';
            select.appendChild(optDefault);

            Object.entries(prorrogacoes).forEach(([titulo, texto]) => {
                const opt = document.createElement('option');
                opt.value = texto;
                opt.textContent = titulo;
                select.appendChild(opt);
            });

            return { label, select };
        }

        // Estilo customizado (uma vez só)
        function aplicarEstiloDropdown() {
            if (document.querySelector('.justificativas-styles')) return;

            const style = document.createElement('style');
            style.className = 'justificativas-styles';
            style.textContent = `
                .justificativas-label {
                    display: block;
                    margin-top: 50px;
                }
                .justificativas-dropdown {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                }
            `;
            document.head.appendChild(style);
        }

        // Insere elementos e lógica no DOM
        const config = await carregarConfig();
        const prorrogacoes = config?.Prorrogacao || {};

        const { label, select } = criarDropdown(prorrogacoes);
        const container = motivoProrrogacaoLabel.parentNode;
        container.appendChild(label);
        container.appendChild(select);

        select.addEventListener('change', () => {
            justificativaInput.value = select.value || '';
        });

        aplicarEstiloDropdown();
        console.log('Dropdown e label criados com sucesso no DOM.');
    });
})();
