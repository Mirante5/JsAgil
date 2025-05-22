(function () {
    'use strict';

    window.addEventListener('load', async function () {
        const motivoProrrogacaoLabel = document.querySelector('label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoProrrogacao"]');
        const justificativaInput = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaProrrogacao');

        if (!motivoProrrogacaoLabel || !justificativaInput) {
            console.error('Elementos necessários não encontrados na página.');
            return;
        }

        if (document.getElementById('justificativasBox')) {
            console.log('Dropdown já existe na página.');
            return;
        }

        // Carrega texto do JSON
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

        const config = await carregarConfig();
        const prorrogacoes = config?.Prorrogacao || {};

        const labelJustificativa = document.createElement('label');
        labelJustificativa.setAttribute('for', 'justificativasBox');
        labelJustificativa.textContent = 'Texto de Prorrogação:';
        labelJustificativa.className = 'justificativas-label';

        const justificativasBox = document.createElement('select');
        justificativasBox.id = 'justificativasBox';
        justificativasBox.name = 'justificativasBox';
        justificativasBox.className = 'justificativas-dropdown';

        // opções
        const fragment = document.createDocumentFragment();
        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Selecione uma justificativa...';
        fragment.appendChild(optDefault);

        Object.entries(prorrogacoes).forEach(([titulo, texto]) => {
            const opt = document.createElement('option');
            opt.value = texto;
            opt.textContent = titulo;
            fragment.appendChild(opt);
        });

        justificativasBox.appendChild(fragment);

        // Insere elementos
        const parentNode = motivoProrrogacaoLabel.parentNode;
        parentNode.appendChild(labelJustificativa);
        parentNode.appendChild(justificativasBox);

        justificativasBox.addEventListener('change', () => {
            justificativaInput.value = justificativasBox.value || '';
        });

        // Estilo
        if (!document.querySelector('.justificativas-styles')) {
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

        console.log('Dropdown e label criados com sucesso no DOM.');
    });
})();
