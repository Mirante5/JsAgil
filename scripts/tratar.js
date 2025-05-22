(function () {
    'use strict';

    const TARGET_DIV_ID = '#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3';
    const CONTRIBUICAO_ID = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtContribuicao';

//replicar carregarconfig();
    async function carregarConfig() {
        const url = chrome.runtime.getURL('config/text.json');
        try {
            const response = await fetch(url);
            const config = await response.json();
            return config;
        } catch (error) {
            console.error('Erro ao carregar config.json:', error);
            return null;
        }
    }  
    function esperarElementos() {
        return new Promise(resolve => {
            const check = () => {
                const targetDiv = document.querySelector(TARGET_DIV_ID);
                const contribuicaoField = document.getElementById(CONTRIBUICAO_ID);
                if (targetDiv && contribuicaoField) {
                    resolve();
                } else {
                    setTimeout(check, 300);
                }
            };
            check();
        });
    }

    function criarBotoes(config) {
        const mensagemProrrogacao = config?.mensagens?.prorrogacao || 'Mensagem padrão de prorrogação.';

        // Botão 1: Importar dados do cidadão
        const btn = document.createElement('input');
        btn.type = 'submit';
        btn.value = 'Importar dados do cidadão';
        btn.className = 'btn btn-sm btn-primary';
        btn.style.marginLeft = '1px';
        btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#015298');
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#337ab7');

        btn.addEventListener('click', function (event) {
            event.preventDefault();
            const documentotipo = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTipoDocPF')?.textContent || '';
            const nome = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNomePF')?.textContent || '';
            const documento = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumeroDocPF')?.textContent || '';
            const email = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtEmailPF')?.textContent || '';
            const contribuicaoField = document.getElementById(CONTRIBUICAO_ID);
            if (contribuicaoField) {
                contribuicaoField.value = `Nome: ${nome}\nDocumento (${documentotipo}): ${documento}\nEmail: ${email}`;
            }
        });

        // Botão 2: Texto de prorrogação
        const btntxtprorrogacao = document.createElement('input');
        btntxtprorrogacao.type = 'submit';
        btntxtprorrogacao.value = 'Texto de Prorrogação';
        btntxtprorrogacao.className = 'btn btn-sm btn-primary';
        btntxtprorrogacao.style.marginLeft = '1px';
        btntxtprorrogacao.style.marginTop = '5px';
        btntxtprorrogacao.addEventListener('mouseover', () => btntxtprorrogacao.style.backgroundColor = '#015298');
        btntxtprorrogacao.addEventListener('mouseout', () => btntxtprorrogacao.style.backgroundColor = '#337ab7');

        btntxtprorrogacao.addEventListener('click', function (event) {
            event.preventDefault();
            const datalimite = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento')?.textContent || '';
            const contribuicaoField = document.getElementById(CONTRIBUICAO_ID);
            if (contribuicaoField) {
                contribuicaoField.value = mensagemProrrogacao.replace('{datalimite}', datalimite);
            }
        });

        return [btn, btntxtprorrogacao];
    }

    function inserirBotoes(config) {
        const targetDiv = document.querySelector(TARGET_DIV_ID);
        if (!targetDiv) return;

        // Remove botões antigos se existirem
        Array.from(targetDiv.querySelectorAll('.btn-cidadao, .btn-prorrogacao')).forEach(el => el.remove());

        const [btn, btntxtprorrogacao] = criarBotoes(config);
        btn.classList.add('btn-cidadao');
        btntxtprorrogacao.classList.add('btn-prorrogacao');
        targetDiv.appendChild(btn);
        targetDiv.appendChild(btntxtprorrogacao);
    }

    function observarMudancas(config) {
        const observer = new MutationObserver(() => {
            const targetDiv = document.querySelector(TARGET_DIV_ID);
            const btn = targetDiv?.querySelector('.btn-cidadao');
            const btn2 = targetDiv?.querySelector('.btn-prorrogacao');
            if (!btn || !btn2) {
                inserirBotoes(config);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    esperarElementos().then(async () => {
        const config = await carregarConfig();
        inserirBotoes(config);
        observarMudancas(config);
    });

})();
