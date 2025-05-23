(function () {
    'use strict';

    window.addEventListener('load', async function () {
        const labelForMotivo = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoArquivamento';
        const inputJustificativaId = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaArquivamento';
        const numeroManifestacaoId = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero';

        const motivoArquivamentoLabel = document.querySelector(`label[for="${labelForMotivo}"]`);
        const justificativaInput = document.getElementById(inputJustificativaId);
        const numeroManifestacaoElement = document.getElementById(numeroManifestacaoId);
        const numeroManifestacao = numeroManifestacaoElement?.innerText || '';

        if (!motivoArquivamentoLabel || !justificativaInput || !numeroManifestacaoElement) {
            console.error('Elementos necessários não encontrados na página.');
            return;
        }

        if (document.getElementById('justificativasBox')) {
            console.log('Dropdown já existe na página.');
            return;
        }

        console.log('Dropdown não encontrado. Criando o elemento...');

        criarDropdownJustificativas(motivoArquivamentoLabel, justificativaInput, numeroManifestacao);
    });

    async function carregarConfig() {
        try {
            const url = chrome.runtime.getURL('config/text.json');
            const resp = await fetch(url);
            return await resp.json();
        } catch (e) {
            console.error('Erro ao carregar text.json:', e);
            return null;
        }
    }

    async function criarDropdownJustificativas(labelElemento, inputJustificativa, numeroManifestacao) {
        const config = await carregarConfig();

        const labelJustificativa = document.createElement('label');
        labelJustificativa.setAttribute('for', 'justificativasBox');
        labelJustificativa.textContent = 'Justificativa do Arquivamento:';
        labelJustificativa.className = 'justificativas-label';

        const justificativasBox = document.createElement('select');
        justificativasBox.id = 'justificativasBox';
        justificativasBox.name = 'justificativasBox';
        justificativasBox.className = 'justificativas-dropdown';

        const fragment = document.createDocumentFragment();

        const opcaoDefault = document.createElement('option');
        opcaoDefault.value = '';
        opcaoDefault.textContent = 'Selecione uma justificativa...';
        fragment.appendChild(opcaoDefault);

        if (config?.Arquivar) {
            Object.entries(config.Arquivar).forEach(([key, texto]) => {
                const option = document.createElement('option');
                option.value = texto.replace('{datalimite}', numeroManifestacao);
                option.textContent = key;
                fragment.appendChild(option);
            });
        } else {
            console.warn('Nenhuma justificativa encontrada em config.Arquivar');
        }

        justificativasBox.appendChild(fragment);
        labelElemento.parentNode.appendChild(labelJustificativa);
        labelElemento.parentNode.appendChild(justificativasBox);

        justificativasBox.addEventListener('change', function () {
            inputJustificativa.value = justificativasBox.value || '';
        });

        inserirEstilos();

        console.log('Dropdown e label criados com sucesso no DOM.');
    }

    function inserirEstilos() {
        if (document.querySelector('.justificativas-styles')) return;

        const style = document.createElement('style');
        style.className = 'justificativas-styles';
        style.textContent = `
            .justificativas-label {
                display: block;
                margin-top: 20px;
                font-weight: bold;
            }
            .justificativas-dropdown {
                width: 100%;
                padding: 6px;
                margin-top: 4px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }
})();
