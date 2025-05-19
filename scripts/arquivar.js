(function() {
    'use strict';

    window.addEventListener('load', function() {
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

        const parentNode = motivoArquivamentoLabel.parentNode;

        const labelJustificativa = document.createElement('label');
        labelJustificativa.setAttribute('for', 'justificativasBox');
        labelJustificativa.textContent = 'Justificativa do Arquivamento:';
        labelJustificativa.className = 'justificativas-label';

        const justificativasBox = document.createElement('select');
        justificativasBox.id = 'justificativasBox';
        justificativasBox.name = 'justificativasBox';
        justificativasBox.className = 'justificativas-dropdown';

        const fragment = document.createDocumentFragment();
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

        justificativas.forEach(({ text, value }) => {
            const option = document.createElement('option');
            option.value = value;
            option.text = text;
            fragment.appendChild(option);
        });
        justificativasBox.appendChild(fragment);

        motivoArquivamentoLabel.parentNode.appendChild(labelJustificativa);
        motivoArquivamentoLabel.parentNode.appendChild(justificativasBox);

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