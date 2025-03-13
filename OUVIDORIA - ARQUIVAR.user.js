// ==UserScript==
// @name         OUVIDORIA - ARQUIVAR
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Script para executar ações específicas em elementos do SEI após clicar no link "Iniciar Processo"
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/ArquivarManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20ARQUIVAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20ARQUIVAR.user.js
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
                { text: 'Selecione uma justificativa...',
                 value: '' },
                { text: 'Duplicidade',
                 value: `Prezado(a) Senhor(a),\n\nConsiderando que sua manifestação está em duplicidade ou é semelhante a outra tratada por esta Ouvidoria, realizamos o arquivamento do presente protocolo e sugerimos que o acompanhamento de sua manifestação seja feito por NUP (NUP).\n\nAgradecemos a sua colaboração e colocamo-nos à disposição sempre que desejar falar com a Ouvidoria do Ministério da Educação.\n\nAtenciosamente,\nOuvidoria do Ministério da Educação.`
                },
                { text: 'Comunicado sem materialidade',
                 value: 'Prezado(a) Senhor(a),\n\nConsiderando que os fatos elencados não representam elementos mínimos descritivos de irregularidade ou não contêm indícios que permitam à administração pública chegar a tais elementos e, ainda, que na modalidade de comunicação de irregularidade não há a possibilidade de complementação de informação prevista no art. 16 da Portaria CGU nº 116, de 2024, arquivamos o presente protocolo. \n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nAvaliação Ouvidoria \n\nSua opinião é fundamental para nós! Queremos convidar você a compartilhar sua experiência com a Ouvidoria do MEC (OUV/MEC) e as unidades do Ministério da Educação. \n\nSua participação nos ajudará a melhorar nossos serviços e garantir que continuemos atendendo às suas necessidades da melhor forma possível. \n\nNos avalie diretamente pela Plataforma Fala.BR, leva apenas alguns minutos e seu feedback será extremamente valioso. \n\nContamos com você para fazer a diferença!'
                },
                { text: 'Falta de urbanidade',
                 value: 'Prezado(a) Senhor(a), \n\nA Ouvidoria do Ministério da Educação esclarece que, de acordo com a Lei nº 13.460, de 26 de junho de 2017, art. 8°, inciso I, são deveres do usuário “utilizar adequadamente os serviços, procedendo com urbanidade e boa-fé”. Dessa forma, os termos utilizados inviabilizam a análise de sua mensagem e, por essa razão, ela foi encerrada nesta Ouvidoria. \n\nColocamo-nos à sua disposição sempre que desejar falar com a Ouvidoria do Ministério da Educação. \n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nACESSE: https: https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria \n\nAvaliação Ouvidoria \n\nQueremos convidar você a compartilhar sua experiência com a Ouvidoria do MEC (OUV/MEC) e as unidades do Ministério da Educação. \n\nSua participação nos ajudará a melhorar nossos serviços e garantir que continuemos atendendo às suas necessidades da melhor forma possível. \n\nNos avalie diretamente pela Plataforma Fala.BR, leva apenas alguns minutos e seu feedback será extremamente valioso. \n\nContamos com você para fazer a diferença! '
                },
                { text: 'Cópia para diversos órgãos',
                 value: 'Prezado(a) Senhor(a), \n\nVerificamos que consta em sua manifestação a informação de envio de cópia para diversas instituições, as quais possuem competências para análise do assunto. Dessa forma, a Ouvidoria do Ministério da Educação não é o principal destinatário, razão pela qual encerramos sua demanda no âmbito desta Ouvidoria. \n\nColocamo-nos à sua disposição sempre que desejar falar com a Ouvidoria do Ministério da Educação. \n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nACESSE: https: https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria \n\nAvaliação Ouvidoria \n\nQueremos convidar você a compartilhar sua experiência com a Ouvidoria do MEC (OUV/MEC) e as unidades do Ministério da Educação. \n\nSua participação nos ajudará a melhorar nossos serviços e garantir que continuemos atendendo às suas necessidades da melhor forma possível. \n\nNos avalie diretamente pela Plataforma Fala.BR, leva apenas alguns minutos e seu feedback será extremamente valioso. \n\nContamos com você para fazer a diferença! '
                },
                { text: 'Perda do objeto',
                 value: 'Prezado(a) Senhor(a), \n\nInformamos que em razão de XXXXXXXXXXXXX houve a perda do objeto de sua manifestação. Assim, encerramos a sua manifestação nesta Ouvidoria. \n\nColocamo-nos à sua disposição sempre que desejar falar com a Ouvidoria do Ministério da Educação. \n\nAtenciosamente, \n\nOuvidoria do Ministério da Educação \n\nACESSE: https: https://www.gov.br/mec/pt-br/canais_atendimento/ouvidoria \n\nAvaliação Ouvidoria \n\nQueremos convidar você a compartilhar sua experiência com a Ouvidoria do MEC (OUV/MEC) e as unidades do Ministério da Educação. \n\nSua participação nos ajudará a melhorar nossos serviços e garantir que continuemos atendendo às suas necessidades da melhor forma possível.  \n\nNos avalie diretamente pela Plataforma Fala.BR, leva apenas alguns minutos e seu feedback será extremamente valioso.  \n\nContamos com você para fazer a diferença! ' }
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

