// ==UserScript==
// @name         OUVIDORIA - ENCAMINHAR
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Adiciona justificativas e atualiza texto de solicitante com base no selectize
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/EncaminharManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20ENCAMINHAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20ENCAMINHAR.user.js
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        // Seleciona o campo "Esfera"
        const campoEsfera = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbEsferaOuvidoriaDestino');

        // Seleciona os campos de notificação
        const notificacaoDestinatario = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoDestinatario');
        const notificacaoSolicitante = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoSolicitante');

        // Obtém o número da manifestação
        const numeroManifestacaoElement = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero');
        const numeroManifestacao = numeroManifestacaoElement ? numeroManifestacaoElement.innerText.trim() : '';

        // Seleciona o campo "Ouvidoria Destino" (selectize)
        const campoOuvidoriaDestino = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbOuvidoriaDestino');

        // Função para atualizar o texto do solicitante com o valor selecionado do selectize
        function atualizarTextoSolicitante() {
            if (notificacaoSolicitante && campoOuvidoriaDestino) {
                // Obtém o valor selecionado no selectize
                const textoDestino = campoOuvidoriaDestino.selectedOptions[0] ? campoOuvidoriaDestino.selectedOptions[0].text : '';

                // Verifica se o solicitante já possui texto, caso contrário, não altera
                if (notificacaoSolicitante.value) {
                    // Substitui o marcador {OUVIDORIA} no texto do solicitante
                    notificacaoSolicitante.value = notificacaoSolicitante.value.replace("{OUVIDORIA}", textoDestino);
                }
            }
        }

        // Função para atualizar a justificativa e integrar o valor do selectize
        function atualizarJustificativa() {
            const justificativasBox = document.getElementById('justificativasBox');
            if (justificativasBox && notificacaoDestinatario && notificacaoSolicitante) {
                const selectedValue = JSON.parse(justificativasBox.value);

                // Obtém o texto da Ouvidoria
                const textoDestino = campoOuvidoriaDestino.selectedOptions[0] ? campoOuvidoriaDestino.selectedOptions[0].text : '';

                // Atualiza a justificativa do destinatário
                notificacaoDestinatario.value = selectedValue.destinatario;

                // Atualiza a justificativa do solicitante com o texto da Ouvidoria
                const textoSolicitante = selectedValue.solicitante.replace("{OUVIDORIA}", textoDestino);
                notificacaoSolicitante.value = textoSolicitante;
            }
        }

        // Verifica se os campos essenciais estão presentes na página
        if (campoEsfera && notificacaoDestinatario && notificacaoSolicitante) {
            // Criar a label para o novo campo de justificativas
            const labelJustificativa = document.createElement('label');
            labelJustificativa.setAttribute('for', 'justificativasBox');
            labelJustificativa.innerText = 'Texto de Encaminhamento:';
            labelJustificativa.style.display = 'block';
            labelJustificativa.style.marginTop = '50px';

            // Criar o dropdown com as justificativas
            const justificativasBox = document.createElement('select');
            justificativasBox.setAttribute('id', 'justificativasBox');
            justificativasBox.setAttribute('name', 'justificativasBox');
            justificativasBox.style.width = '100%';
            justificativasBox.style.padding = '8px';
            justificativasBox.style.border = '1px solid #ccc';
            justificativasBox.style.borderRadius = '4px';
            justificativasBox.style.fontSize = '14px';

            // Opções de justificativas
            const justificativas = [
                {
                    text: 'Selecione uma justificativa...',
                    value: { destinatario: '', solicitante: '' }
                },
                {
                    text: 'Encaminhamento em geral',
                    value: {
                        destinatario: `Prezado(a) Ouvidor(a), \n\nInformamos que esta Ouvidoria do Ministério da Educação recebeu a presente \n\ndemanda, que trata sobre tema relacionado à competência dessa instituição. \n\nDessa forma, encaminhamos a manifestação e encerramos o seu tratamento. Em caso de dúvida ou encaminhamento indevido, entrar em contato pelo e-mail \n\nouvidoria@mec.gov.br ou pelo telefone (61) 2022-2595. \n\nAgradecemos o acolhimento da demanda e colocamo-nos à disposição para outros esclarecimentos.\n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nACESSE: https: https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria `,
                        solicitante: `Prezado(a) Senhor(a), \n\nA Ouvidoria do Ministério da Educação agradece o seu contato! \n\nInformamos que sua manifestação foi encaminhada para a unidade de ouvidoria do {OUVIDORIA}, responsável pelas providências requeridas. \n\nCaso seja de seu interesse, poderá acompanhar a manifestação por meio do Número Único de Protocolo ${numeroManifestacao} já gerado no Fala.BR e enviado ao seu e-mail. \n\nAgradecemos a sua colaboração e colocamo-nos à disposição sempre que desejar falar com a Ouvidoria do Ministério da Educação. \n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nACESSE: https: https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria \n\nAvaliação Ouvidoria \n\nQueremos convidar você a compartilhar sua experiência com a Ouvidoria do MEC (OUV/MEC) e as unidades do Ministério da Educação. \n\nSua participação nos ajudará a melhorar nossos serviços e garantir que continuemos atendendo às suas necessidades da melhor forma possível.  \n\nNos avalie diretamente pela Plataforma Fala.BR, leva apenas alguns minutos e seu feedback será extremamente valioso.  \n\nContamos com você para fazer a diferença! \n\n`
                    }
                }
            ];

            // Adiciona as opções ao dropdown
            justificativas.forEach(justificativa => {
                const option = document.createElement('option');
                option.value = JSON.stringify(justificativa.value);
                option.text = justificativa.text;
                justificativasBox.appendChild(option);
            });

            // Adiciona o evento de mudança para atualizar os campos de justificativa
            justificativasBox.addEventListener('change', function() {
                atualizarJustificativa();
            });

            // Insere a label e o dropdown após o campo de Esfera
            campoEsfera.parentNode.appendChild(labelJustificativa);
            campoEsfera.parentNode.appendChild(justificativasBox);

            // Atualiza o texto do solicitante e destinatário ao carregar a página
            atualizarTextoSolicitante();

            // Atualiza a justificativa ao carregar
            atualizarJustificativa();

            // Adiciona um observador para monitorar alterações no campo "Ouvidoria Destino"
            const observer = new MutationObserver(function() {
                atualizarTextoSolicitante();
                atualizarJustificativa();
            });

            const config = { attributes: true, childList: true, subtree: true };
            observer.observe(campoOuvidoriaDestino, config);
        }
    });
})();
