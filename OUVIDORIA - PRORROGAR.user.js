// ==UserScript==
// @name         OUVIDORIA - PRORROGAR
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/ProrrogarManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20PRORROGAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20PRORROGAR.user.js
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
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

        console.log('Dropdown não encontrado. Criando o elemento...');

        const parentNode = motivoProrrogacaoLabel.parentNode;

        const labelJustificativa = document.createElement('label');
        labelJustificativa.setAttribute('for', 'justificativasBox');
        labelJustificativa.textContent = 'Texto de Prorrogação:';
        labelJustificativa.className = 'justificativas-label';

        const justificativasBox = document.createElement('select');
        justificativasBox.id = 'justificativasBox';
        justificativasBox.name = 'justificativasBox';
        justificativasBox.className = 'justificativas-dropdown';

        const fragment = document.createDocumentFragment();
        const justificativas = [
            { text: 'Selecione uma justificativa...', value: '' },
            { text: 'Prorrogação', value: `Prezado(a) Senhor(a),\n\n\Informamos que, em conformidade com o previsto no § 1° do art. 22 da Portaria CGU nº 116/2024, informamos que a presente manifestação foi prorrogada, devido a necessidade da Unidade organizacional para a elaboração e emissão de resposta conclusiva.\n\n\Atenciosamente, \n\n\Ouvidoria do Ministério da Educação.` }
        ];

        justificativas.forEach(({ text, value }) => {
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            fragment.appendChild(option);
        });
        justificativasBox.appendChild(fragment);

        motivoProrrogacaoLabel.parentNode.appendChild(labelJustificativa);
        motivoProrrogacaoLabel.parentNode.appendChild(justificativasBox);

        justificativasBox.addEventListener('change', function() {
            justificativaInput.value = justificativasBox.value || '';
        });

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
