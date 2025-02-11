// ==UserScript==
// @name         OUVIDORIA - ARQUIVAR
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/ArquivarManifestacao.aspx?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Funcionando corretamente, adicionar mais textos padrões e remover NUP da duplicidade.

    // Aguarda a página carregar completamente
    window.addEventListener('load', function() {
        // Seletores dos elementos
        const motivoArquivamento = document.querySelector('label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoArquivamento"]');
        const justificativaInput = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaArquivamento');
        // Captura o número da manifestação a partir do <span> que contém o valor
        const numeroManifestacaoElement = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero');
        const numeroManifestacao = numeroManifestacaoElement ? numeroManifestacaoElement.innerText : '';

        // Verifica se o campo "Motivo do Arquivamento", "Justificativa" e "Número da Manifestação" foram encontrados na página
        if (motivoArquivamento && justificativaInput && numeroManifestacao) {
            // Criar o dropdown com as justificativas
            const justificativasBox = document.createElement('select');
            justificativasBox.setAttribute('id', 'justificativasBox');
            justificativasBox.setAttribute('name', 'justificativasBox');
            // Faz o dropdown ocupar 100% da largura do campo
            justificativasBox.style.width = '100%';
            justificativasBox.style.padding = '8px';
            justificativasBox.style.border = '1px solid #ccc';
            justificativasBox.style.borderRadius = '4px';
            // Tamanho da fonte similar ao original
            justificativasBox.style.fontSize = '14px';

            // Adicionar opções ao dropdown
            const justificativas = [
                { text: '',
                 value: '' },
                { text: '',
                 value: ``
                },
                { text: '',
                 value: ''
                },
                { text: '',
                 value: ''
                },
                { text: '',
                 value: ''
                },
                { text: '',
                 value: '' }
            ];

            // Popula o dropdown com as opções
            justificativas.forEach(justificativa => {
                const option = document.createElement('option');
                option.value = justificativa.value;
                option.text = justificativa.text;
                justificativasBox.appendChild(option);
            });

            // Criar uma label para o novo campo
            const labelJustificativa = document.createElement('label');
            labelJustificativa.setAttribute('for', 'justificativasBox');
            labelJustificativa.innerText = 'Justificativa do Arquivamento:';
            labelJustificativa.style.display = 'block';
            // Espaçamento entre a label e o campo
            labelJustificativa.style.marginTop = '50px';

            // Adicionar a label antes do dropdown
            motivoArquivamento.parentNode.appendChild(labelJustificativa);
            motivoArquivamento.parentNode.appendChild(justificativasBox);

            // Evento para inserir a justificativa selecionada no campo de justificativa
            justificativasBox.addEventListener('change', function() {
                // Insere a justificativa selecionada
                justificativaInput.value = justificativasBox.value;
            });
        }
    });
})();

