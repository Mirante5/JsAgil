(function() {
    'use strict';

    // IDs dos elementos necessários
    const TARGET_DIV_ID = '#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_UpdatePanel3';
    const CONTRIBUICAO_ID = 'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtContribuicao';

    // Função para aguardar o carregamento da página e dos elementos necessários
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

    // Função para criar os botões dinamicamente
    function criarBotoes() {
        // Botão 1
        const btn = document.createElement('input');
        btn.type = 'submit';
        btn.value = 'Importar dados do cidadão';
        btn.className = 'btn btn-sm btn-primary';
        btn.style.marginLeft = '1px';

        btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#015298');
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#337ab7');

        btn.addEventListener('click', function(event) {
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

        // Botão 2
        const btntxtprorrogacao = document.createElement('input');
        btntxtprorrogacao.type = 'submit';
        btntxtprorrogacao.value = 'Texto de Prorrogação';
        btntxtprorrogacao.className = 'btn btn-sm btn-primary';
        btntxtprorrogacao.style.marginLeft = '1px';
        btntxtprorrogacao.style.marginTop = '5px';

        btntxtprorrogacao.addEventListener('mouseover', () => btntxtprorrogacao.style.backgroundColor = '#015298');
        btntxtprorrogacao.addEventListener('mouseout', () => btntxtprorrogacao.style.backgroundColor = '#337ab7');

        btntxtprorrogacao.addEventListener('click', function(event) {
            event.preventDefault();
            const datalimite = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento')?.textContent || '';
            const contribuicaoField = document.getElementById(CONTRIBUICAO_ID);
            if (contribuicaoField) {
                contribuicaoField.value = `Devido a ausência de resposta conclusiva, a presente manifestação foi prorrogada. Informamos que o novo prazo de atendimento (improrrogável) é dia ${datalimite}.`;
            }
        });

        return [btn, btntxtprorrogacao];
    }

    // Função para inserir/recriar os botões
    function inserirBotoes() {
        const targetDiv = document.querySelector(TARGET_DIV_ID);
        if (!targetDiv) return;

        // Remove botões antigos se existirem
        Array.from(targetDiv.querySelectorAll('.btn-cidadao, .btn-prorrogacao')).forEach(el => el.remove());

        const [btn, btntxtprorrogacao] = criarBotoes();
        btn.classList.add('btn-cidadao');
        btntxtprorrogacao.classList.add('btn-prorrogacao');
        targetDiv.appendChild(btn);
        targetDiv.appendChild(btntxtprorrogacao);
    }

    // Observa mudanças para recriar os botões se necessário
    function observarMudancas() {
        const observer = new MutationObserver(() => {
            const targetDiv = document.querySelector(TARGET_DIV_ID);
            const btn = targetDiv?.querySelector('.btn-cidadao');
            const btn2 = targetDiv?.querySelector('.btn-prorrogacao');
            if (!btn || !btn2) {
                inserirBotoes();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Inicialização
    esperarElementos().then(() => {
        inserirBotoes();
        observarMudancas();
    });

})();