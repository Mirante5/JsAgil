// ==UserScript==
// @name         SEI (Autopreechido)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://sei.mec.gov.br/*
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/SEI%20(Autopreechido).user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/SEI%20(Autopreechido).user.js
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

    // Função para definir o valor de um campo de texto, se ele existir
    function setValueById(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`Valor definido para o campo com ID '${id}': ${value}`);
        } else {
            console.warn(`Campo com ID '${id}' não encontrado.`);
        }
    }

    // Função para selecionar a opção no <select>
    function selectOptionByIdAndValue(selectId, value) {
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            selectElement.value = value; // Define o valor selecionado
            selectElement.dispatchEvent(new Event('change')); // Dispara o evento 'change'
            console.log(`Opção com value="${value}" selecionada no <select> com ID '${selectId}'.`);
        } else {
            console.warn(`Elemento <select> com ID '${selectId}' não encontrado.`);
        }
    }

    // Função para monitorar alterações no DOM
    function waitForElement(selector, callback) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect(); // Para de observar o DOM
                    callback(element); // Executa a função quando o elemento é encontrado
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Espera pelo carregamento do <select> e seleciona a opção
    waitForElement('#selHipoteseLegal', () => {
        selectOptionByIdAndValue('selHipoteseLegal', '33');
        selectOptionByIdAndValue('selTextoPadrao', '4515');
    });

    // Função para aplicar estilo de fundo amarelo
    function applyYellowBackgroundToTD() {
        const tdElement = document.querySelector('td a[href*="controlador.php?acao=procedimento_gerar&acao_origem=procedimento_escolher_tipo&acao_retorno=procedimento_escolher_tipo&id_tipo_procedimento=100001809&infra_sistema=100000100&infra_unidade_atual=110000618&infra_hash="]'); // Alvo do link
        if (tdElement) {
            tdElement.closest('td').style.backgroundColor = 'yellow'; // Aplica o fundo amarelo no <td>
            tdElement.click();
            console.log('Fundo amarelo aplicado no <td>.');
        } else {
            console.warn('Elemento <td> não encontrado.');
        }
    }

    // Obtém a data atual no formato DD/MM/AAAA
    function getCurrentDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    }
    // Realiza as ações desejadas
    // > Seleciona Pedidos, Ofercimentos...
    setValueById('chkInfraItem', '100001809');

    // > Protocolo Opções
    clickElementById('optProtocoloManual');

    // Protocolo Data
    setValueById('txtDtaGeracaoInformar', getCurrentDate());
    setValueById('txtDataElaboracao', getCurrentDate());

    //>  Nível de Acesso Opções
    clickElementById('optPublico');
    clickElementById('optTextoPadrao');
    clickElementById('optNato');
    clickElementById('optDataCerta')
    clickElementById('chkSinEnviarEmailNotificacao')

    // Aplica o estilo de fundo amarelo
    applyYellowBackgroundToTD();
    TESTE
})();
