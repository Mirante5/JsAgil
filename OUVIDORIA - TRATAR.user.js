// ==UserScript==
// @name         OUVIDORIA - TRATAR
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/TratarManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRATAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRATAR.user.js
// ==/UserScript==

(function() {
    'use strict';

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

    // Função para reanexar o botão caso ele seja removido
    function observarMudancas() {
        const observer = new MutationObserver(() => {
            if (!document.body.contains(btn)) {
                console.log('Botão desapareceu! Recriando...');
                const targetDiv = document.querySelector('#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3');
                if (targetDiv) {
                    targetDiv.appendChild(btn);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    observarMudancas();

    // Criação do botão "Adicionar dados do cidadão"
    const btn = document.createElement('input');
    btn.type = 'submit';
    btn.value = 'Importar dados do cidadão';
    btn.className = 'btn btn-sm btn-primary';
    btn.style.marginLeft = '1px';

    btn.addEventListener('mouseover', function() {
        btn.style.backgroundColor = '#015298';
    });

    btn.addEventListener('mouseout', function() {
        btn.style.backgroundColor = '#337ab7';
    });

    // Insere o botão dentro da div desejada
    const targetDiv = document.querySelector('#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3');
    if (targetDiv) {
        targetDiv.appendChild(btn);
    }

    // Adiciona evento de clique para preencher o campo de contribuição
    btn.addEventListener('click', function(event) {
        event.preventDefault();
        const documentotipo = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTipoDocPF')?.textContent || '';
        const nome = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNomePF')?.textContent || '';
        const documento = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumeroDocPF')?.textContent || '';
        const email = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtEmailPF')?.textContent || '';

        const contribuicaoField = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtContribuicao');
        if (contribuicaoField) {
            contribuicaoField.value = `Nome: ${nome}\nDocumento (${documentotipo}): ${documento}\nEmail: ${email}`;
        }
    });

    // Criação do botão "Adicionar dados do cidadão"
    const btntxtprorrogacao = document.createElement('input');
    btntxtprorrogacao.type = 'submit';
    btntxtprorrogacao.value = 'Texto de Prorrogação';
    btntxtprorrogacao.className = 'btn btn-sm btn-primary';
    btntxtprorrogacao.style.marginLeft = '1px';
    btntxtprorrogacao.style.marginTop = '5px';

    btntxtprorrogacao.addEventListener('mouseover', function() {
        btntxtprorrogacao.style.backgroundColor = '#015298';
    });

    btntxtprorrogacao.addEventListener('mouseout', function() {
        btntxtprorrogacao.style.backgroundColor = '#337ab7';
    });

    // Insere o botão dentro da div desejada
    const targetDivprorrogacao = document.querySelector('#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3');
    if (targetDivprorrogacao) {
        targetDivprorrogacao.appendChild(btntxtprorrogacao);
    }

    // Adiciona evento de clique para preencher o campo de contribuição
    btntxtprorrogacao.addEventListener('click', function(event) {
        event.preventDefault();
        const datalimite = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento')?.textContent || '';

        const contribuicaoField = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtContribuicao');
        if (contribuicaoField) {
            contribuicaoField.value = `Devido a ausência de resposta conclusiva, a presente manifestação foi prorrogada. Informamos que o novo prazo de atendimento (improrrogável) é dia ${datalimite}.`;
        }
    });
})();
