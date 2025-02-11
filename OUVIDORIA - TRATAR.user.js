// ==UserScript==
// @name         OUVIDORIA - TRATAR
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/TratarManifestacao.aspx?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função auxiliar para clicar em um elemento, se ele existir
    function clickElementById(id) {
        const element = document.getElementById(id);
        if (element) {
            element.click();
            console.log(`Elemento com ID '${id}' clicado.`);
        } else {
            console.warn(`Elemento com ID '${id}' não encontrado.`);
        }
    }
    // Realiza as ações desejadas
    clickElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_tituloPanelObservacoes');

})();
