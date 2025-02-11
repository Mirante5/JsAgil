// ==UserScript==
// @name         OUVIDORIA - TRATAR/TRIAR
// @namespace    http://tampermonkey.net/
// @version      8.5
// @description  Ajusta a exibição de prazos e categoria, permite configurar a quantidade de itens.
// @author       Lucas
// @match        *://*falabr.cgu.gov.br/Manifestacao/TratarManifestacoes*
// @match        *://*falabr.cgu.gov.br/Manifestacao/TriarManifestacoes*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // Ajustar datas de vencimento, verificar se as cores de identificação estão corretas e por fim programar: forçar abrir em outra aba quando clicado no NUP.

    // Função para ajustar o número de registros por página
    function ajustarTamanhoPagina(qtdItens) {
        const input = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_txtTamanhoPagina');
        const botao = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_btnAlterarTamanhoPagina');
        if (input && botao) {
            input.value = qtdItens;
            botao.click();
        }
    }

// Função para ajustar as datas corretamente
function ajustarData(dataString, dias) {
    let partes = dataString.split('/');
    if (partes.length !== 3) return null;

    let data = new Date(partes[2], partes[1] - 1, partes[0]);
    data.setDate(data.getDate() - dias);

    // Se cair no sábado, antecipa para sexta
    if (data.getDay() === 6) data.setDate(data.getDate() - 1);
    // Se cair no domingo, antecipa para sexta
    if (data.getDay() === 0) data.setDate(data.getDate() - 2);

    return data.toLocaleDateString('pt-BR');
}

// Função para ajustar as datas corretamente
function reajustarData(dataString, dias) {
    let partes = dataString.split('/');
    if (partes.length !== 3) return null;

    let data = new Date(partes[2], partes[1] - 1, partes[0]);
    data.setDate(data.getDate() - dias);

    // Se cair no sábado, antecipa para sexta
    if (data.getDay() === 6) data.setDate(data.getDate() - 1);
    // Se cair no domingo, antecipa para sexta
    if (data.getDay() === 0) data.setDate(data.getDate() + 1);

    return data.toLocaleDateString('pt-BR');
}

// Modifica os prazos corretamente
function adicionarInformacoesPrazo() {
    document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblPrazoResposta']").forEach(span => {
        let prazoAtual = span.textContent.trim();
        if (!prazoAtual || prazoAtual.includes("Primeira Prorrogação")) return;

        let primeiraProrrogacao = ajustarData(prazoAtual, 10);
        if (!primeiraProrrogacao) return;

        let cobranca = reajustarData(primeiraProrrogacao, 5); // Cobrança 5 dias antes do prazoAtual
        if (!cobranca) return;

        let improrrogavel = ajustarData(prazoAtual, -31); // Prazo improrrogável 31 dias depois
        if (!improrrogavel) return;

        span.innerHTML = `
            <b> ${prazoAtual} </b><br>
            Cobrança em:<b> ${cobranca} </b><br>
            Prorrogar em:<b> ${primeiraProrrogacao} </b><br>
            Improrrogável em:<b> ${improrrogavel} </b>
        `;
    });
}

    // Ajusta cores de fundo corretamente
    function ajustarCoresSituacao() {
        document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']").forEach(span => {
            let situacao = span.textContent.trim();
            let cores = {
                "Complementação Solicitada": { fundo: "yellow", texto: "black" },
                "Complementada": { fundo: "green", texto: "white" },
                "Prorrogada": { fundo: "red", texto: "white" }
            };

            if (cores[situacao]) {
                span.style.backgroundColor = cores[situacao].fundo;
                span.style.color = cores[situacao].texto;
                span.style.padding = "3px 5px";
                span.style.borderRadius = "5px";
                span.style.display = "inline-block";
            }
        });
    }

    // Monitora alterações na página e reaplica as modificações
    const observer = new MutationObserver(() => {
        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            adicionarInformacoesPrazo();
            ajustarCoresSituacao();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Criar ícone da engrenagem
    function criarIconeEngrenagem() {
        const gearIcon = document.createElement('div');
        gearIcon.id = 'gearIcon';
        gearIcon.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            background-color: #007BFF;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            font-size: 24px;
        `;
        gearIcon.innerHTML = "&#9881;";
        document.body.appendChild(gearIcon);

        gearIcon.addEventListener('click', () => {
            const panel = document.getElementById('configPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Função para criar o painel de configuração
    function criarPainelConfiguracao() {
        const panel = document.createElement('div');
        panel.id = 'configPanel';
        panel.style.cssText = `
            position: fixed;
            top: 10%;
            right: 10px;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            display: none;
            z-index: 9999;
            width: 300px;
            max-width: 90%;
        `;
        panel.innerHTML = `
            <h3>Configurações</h3>

            <p>Funcionalidade: <span id="statusFuncionalidade">Ativado</span></p>
            <button id="mudarFuncionalidade">Mudar</button><br><br>

            <label for="qtdItens">Itens por página: </label>
            <input type="number" id="qtdItens" value="${localStorage.getItem('qtdItens') || 10}" max="50" min="15" /><br><br>

            <button id="salvarConfig">Salvar Itens por página</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('mudarFuncionalidade').addEventListener('click', () => {
            const statusFuncionalidade = document.getElementById('statusFuncionalidade');
            const isAtivado = statusFuncionalidade.textContent === 'Ativado';

            // Mudar o status para 'Desativado' ou 'Ativado'
            statusFuncionalidade.textContent = isAtivado ? 'Desativado' : 'Ativado';

            // Salvar o estado em localStorage
            localStorage.setItem('funcionalidadesAtivadas', !isAtivado);

            // Desabilitar as funcionalidades ou permitir o ajuste de itens
            if (isAtivado) {
                // Se for desativado, remover datas e cores
                document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblPrazoResposta']").forEach(span => {
                    span.innerHTML = span.textContent; // Remove qualquer modificação de prazo
                });
                document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']").forEach(span => {
                    span.removeAttribute('style'); // Remove as cores de fundo
                });
            }

            // Atualizar a página ou aplicar as mudanças sem recarregar
            setTimeout(() => {
                location.reload(); // Recarregar a página para aplicar mudanças
            }, 500);
        });

        document.getElementById('salvarConfig').addEventListener('click', () => {
            const qtdItens = parseInt(document.getElementById('qtdItens').value);
            localStorage.setItem('qtdItens', qtdItens);
            ajustarTamanhoPagina(qtdItens);

            // Aplicar as funcionalidades se estiverem ativadas
            const funcionalidadesAtivadas = localStorage.getItem('funcionalidadesAtivadas') !== 'false';
            if (funcionalidadesAtivadas) {
                adicionarInformacoesPrazo();
                ajustarCoresSituacao();
            }
        });

        // Definir o estado inicial
        const funcionalidadesAtivadas = localStorage.getItem('funcionalidadesAtivadas') !== 'false';
        const statusFuncionalidade = document.getElementById('statusFuncionalidade');
        statusFuncionalidade.textContent = funcionalidadesAtivadas ? 'Ativado' : 'Desativado';
        document.getElementById('qtdItens').disabled = !funcionalidadesAtivadas;
    }

    // Função principal
    function main() {
        const qtdItensSalvo = localStorage.getItem('qtdItens') || 10;
        ajustarTamanhoPagina(qtdItensSalvo);
        criarIconeEngrenagem();
        criarPainelConfiguracao();
        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            adicionarInformacoesPrazo();
            ajustarCoresSituacao();
        }
    }

    // Espera o carregamento da página antes de executar
    function esperarCarregamentoPagina() {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (document.body) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 500);
        });
    }

    // Executa o script
    esperarCarregamentoPagina().then(main);

})();
