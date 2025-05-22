(function() {
    'use strict';

    window.addEventListener('load', async function() {
        // elementos da página
        const campoEsfera = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbEsferaOuvidoriaDestino');
        const notificacaoDestinatario = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoDestinatario');
        const notificacaoSolicitante = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoSolicitante');
        const numeroManifestacaoElement = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero');
        const campoOuvidoriaDestino = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbOuvidoriaDestino');
        const numeroManifestacao = numeroManifestacaoElement ? numeroManifestacaoElement.innerText.trim() : '';

        if (!campoEsfera || !notificacaoDestinatario || !notificacaoSolicitante) {
            console.error('Campos essenciais não encontrados.');
            return;
        }

        // carrega JSON
        async function carregarConfig() {
            try {
                const url = chrome.runtime.getURL('config/text.json');
                const resp = await fetch(url);
                return await resp.json();
            } catch (e) {
                console.error('Erro ao carregar text.json:', e);
                return null;
            }
        }

        const config = await carregarConfig();
        const encaminhamentos = config && config.Encaminhar ? config.Encaminhar : {};

        // cria label e select
        const label = document.createElement('label');
        label.setAttribute('for', 'justificativasBox');
        label.textContent = 'Texto de Encaminhamento:';
        label.style.display = 'block';
        label.style.marginTop = '50px';

        const select = document.createElement('select');
        select.id = 'justificativasBox';
        select.style.width = '100%';
        select.style.padding = '8px';
        select.style.border = '1px solid #ccc';
        select.style.borderRadius = '4px';
        select.style.fontSize = '14px';

        // opção padrão
        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Selecione uma justificativa...';
        select.appendChild(optDefault);

        // popula com config.Encaminhar
        Object.entries(encaminhamentos).forEach(([chave, obj]) => {
            const opt = document.createElement('option');
            // armazena um JSON stringificado com destinatario+solicitante
            opt.value = JSON.stringify({
                destinatario: obj.destinatario,
                solicitante: obj.solicitante
                    .replace('${numeroManifestacao}', numeroManifestacao)
            });
            opt.textContent = chave;
            select.appendChild(opt);
        });

        // atualiza campos
        function atualizarTextoSolicitante() {
            if (campoOuvidoriaDestino && notificacaoSolicitante.value) {
                const textoDest = campoOuvidoriaDestino.selectedOptions[0]
                    ? campoOuvidoriaDestino.selectedOptions[0].text
                    : '';
                notificacaoSolicitante.value =
                    notificacaoSolicitante.value.replace(/\{OUVIDORIA\}/g, textoDest);
            }
        }

        function atualizarJustificativa() {
            const sel = document.getElementById('justificativasBox');
            if (!sel) return;
            const val = sel.value ? JSON.parse(sel.value) : { destinatario: '', solicitante: '' };
            const textoDest = campoOuvidoriaDestino.selectedOptions[0]
                ? campoOuvidoriaDestino.selectedOptions[0].text
                : '';
            notificacaoDestinatario.value = val.destinatario;
            notificacaoDestinatario.dispatchEvent(new Event('input', { bubbles: true }));
            notificacaoDestinatario.addEventListener('change', e => e.stopImmediatePropagation(), true);
            notificacaoSolicitante.value = val.solicitante.replace(/\{OUVIDORIA\}/g, textoDest);
        }

        // insere no DOM
        campoEsfera.parentNode.appendChild(label);
        campoEsfera.parentNode.appendChild(select);

        // listeners
        select.addEventListener('change', atualizarJustificativa);

        // observa mudanças no destino
        const obs = new MutationObserver(() => {
            atualizarTextoSolicitante();
            atualizarJustificativa();
        });
        if (campoOuvidoriaDestino) {
            obs.observe(campoOuvidoriaDestino, { childList: true, subtree: true });
        }

        // disparos iniciais
        atualizarTextoSolicitante();
        atualizarJustificativa();
    });
})();
