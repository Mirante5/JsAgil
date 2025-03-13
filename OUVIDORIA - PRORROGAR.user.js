// ==UserScript==
// @name         OUVIDORIA - PRORROGAR
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/ProrrogarManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20PRORROGAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20PRORROGAR.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Aguarda a página carregar completamente
    window.addEventListener('load', function() {
        // Seletores dos elementos
        const motivoProrrogacao = document.querySelector('label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoProrrogacao"]');
        const justificativaInput = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaProrrogacao');

        if (motivoProrrogacao && justificativaInput) {
            // Criar o dropdown com as justificativas
            const justificativasBox = document.createElement('select');
            justificativasBox.setAttribute('id', 'justificativasBox');
            justificativasBox.style.width = '100%';
            justificativasBox.style.padding = '8px';
            justificativasBox.style.border = '1px solid #ccc';
            justificativasBox.style.borderRadius = '4px';
            justificativasBox.style.fontSize = '14px';

            // Opções do dropdown
            const justificativas = [
                { text: 'Selecione uma justificativa...', value: '' },
                { text: 'Prorrogação', value: `Prezado(a) Senhor(a),\n\n\Informamos que, em conformidade com o previsto no § 1° do art. 22 da Portaria CGU nº 116/2024, informamos que a presente manifestação foi prorrogada, devido a necessidade da Unidade organizacional para a elaboração e emissão de resposta conclusiva.\n\n\Atenciosamente, \n\n\Ouvidoria do Ministério da Educação.` }
            ];

            // Popula o dropdown
            justificativas.forEach(justificativa => {
                const option = document.createElement('option');
                option.value = justificativa.value;
                option.text = justificativa.text;
                justificativasBox.appendChild(option);
            });

            // Criar e inserir a label antes do dropdown
            const labelJustificativa = document.createElement('label');
            labelJustificativa.setAttribute('for', 'justificativasBox');
            labelJustificativa.innerText = 'Texto de Prorrogação:';
            labelJustificativa.style.display = 'block';
            labelJustificativa.style.marginTop = '50px';

            // Adicionar elementos à página
            motivoProrrogacao.parentNode.appendChild(labelJustificativa);
            motivoProrrogacao.parentNode.appendChild(justificativasBox);

            // Evento para inserir justificativa no campo correto
            justificativasBox.addEventListener('change', function() {
                justificativaInput.value = justificativasBox.value;
            });
        }
    });
})();
