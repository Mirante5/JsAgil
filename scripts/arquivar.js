(function() {
    'use strict';

    window.addEventListener('load', async function() {
        const motivoArquivamentoLabel = document.querySelector('label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoArquivamento"]');
        const justificativaInput = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaArquivamento');
        const numeroManifestacaoElement = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero');
        const numeroManifestacao = numeroManifestacaoElement ? numeroManifestacaoElement.innerText : '';

        if (!motivoArquivamentoLabel || !justificativaInput || !numeroManifestacaoElement) {
            console.error('Elementos necessários não encontrados na página.');
            return;
        }

        if (document.getElementById('justificativasBox')) {
            console.log('Dropdown já existe na página.');
            return;
        }

        console.log('Dropdown não encontrado. Criando o elemento...');

        // 1) Cria label e select
        const labelJustificativa = document.createElement('label');
        labelJustificativa.setAttribute('for', 'justificativasBox');
        labelJustificativa.textContent = 'Justificativa do Arquivamento:';
        labelJustificativa.className = 'justificativas-label';

        const justificativasBox = document.createElement('select');
        justificativasBox.id = 'justificativasBox';
        justificativasBox.name = 'justificativasBox';
        justificativasBox.className = 'justificativas-dropdown';

// 2) Carrega os arquivos JSON de configuração
async function carregarConfig() {
    const baseUrl = chrome.runtime.getURL('config/');

    try {
        const [textoResponse, pontosFocaisResponse] = await Promise.all([
            fetch(baseUrl + 'text.json'),
            fetch(baseUrl + 'pontosfocais.json')
        ]);

        const texto = await textoResponse.json();
        const pontosFocais = await pontosFocaisResponse.json();

        return { texto, pontosFocais };
    } catch (error) {
        console.error('Erro ao carregar arquivos de configuração:', error);
        return null;
    }
}


        const config = await carregarConfig();
        const fragment = document.createDocumentFragment();

        // 3) Opção padrão
        const opcaoDefault = document.createElement('option');
        opcaoDefault.value = '';
        opcaoDefault.textContent = 'Selecione uma justificativa...';
        fragment.appendChild(opcaoDefault);

        // 4) Se tiver config e config.Arquivar, popula a lista
        if (config && config.Arquivar) {
            for (const [key, texto] of Object.entries(config.Arquivar)) {
                const option = document.createElement('option');
                option.value = texto.replace('{datalimite}', numeroManifestacao); // ou outro placeholder, se precisar
                option.textContent = key;
                fragment.appendChild(option);
            }
        } else {
            console.warn('Nenhuma justificativa encontrada em config.Arquivar');
        }

        justificativasBox.appendChild(fragment);

        // 5) Insere no DOM
        motivoArquivamentoLabel.parentNode.appendChild(labelJustificativa);
        motivoArquivamentoLabel.parentNode.appendChild(justificativasBox);

        // 6) Ao mudar a seleção, atualiza o campo de justificativa
        justificativasBox.addEventListener('change', function() {
            justificativaInput.value = justificativasBox.value || '';
        });

        // 7) Insere estilos (só uma vez)
        if (!document.querySelector('.justificativas-styles')) {
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

        console.log('Dropdown e label criados com sucesso no DOM.');
    });
})();
