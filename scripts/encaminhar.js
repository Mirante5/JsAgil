(function () {
    'use strict';

    window.addEventListener('load', async function () {
        const SELECT_ID = 'justificativasBox';

        // Obtenção de elementos
        const campoEsfera = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbEsferaOuvidoriaDestino');
        const notificacaoDestinatario = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoDestinatario');
        const notificacaoSolicitante = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtNotificacaoSolicitante');
        const campoOuvidoriaDestino = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbOuvidoriaDestino');
        const numeroManifestacao = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero')?.innerText.trim() || '';

        if (!campoEsfera || !notificacaoDestinatario || !notificacaoSolicitante) {
            console.error('Campos essenciais não encontrados.');
            return;
        }

        // Carrega JSON externo
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

        // Cria label e dropdown
        function criarDropdown(encaminhamentos) {
            const label = document.createElement('label');
            label.setAttribute('for', SELECT_ID);
            label.textContent = 'Texto de Encaminhamento:';
            Object.assign(label.style, {
                display: 'block',
                marginTop: '50px'
            });

            const select = document.createElement('select');
            select.id = SELECT_ID;
            Object.assign(select.style, {
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
            });

            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = 'Selecione uma justificativa...';
            select.appendChild(optDefault);

            Object.entries(encaminhamentos).forEach(([chave, obj]) => {
                const option = document.createElement('option');
                option.value = JSON.stringify({
                    destinatario: obj.destinatario,
                    solicitante: obj.solicitante.replace('${numeroManifestacao}', numeroManifestacao)
                });
                option.textContent = chave;
                select.appendChild(option);
            });

            return { label, select };
        }

        function atualizarTextoSolicitante() {
            if (campoOuvidoriaDestino && notificacaoSolicitante.value) {
                const textoDest = campoOuvidoriaDestino.selectedOptions[0]?.text || '';
                notificacaoSolicitante.value = notificacaoSolicitante.value.replace(/\{OUVIDORIA\}/g, textoDest);
            }
        }

        function atualizarJustificativa() {
            const select = document.getElementById(SELECT_ID);
            if (!select || !select.value) return;

            const val = JSON.parse(select.value);
            const textoDest = campoOuvidoriaDestino?.selectedOptions[0]?.text || '';

            notificacaoDestinatario.value = val.destinatario;
            notificacaoDestinatario.dispatchEvent(new Event('input', { bubbles: true }));
            notificacaoDestinatario.addEventListener('change', e => e.stopImmediatePropagation(), true);

            notificacaoSolicitante.value = val.solicitante.replace(/\{OUVIDORIA\}/g, textoDest);
        }

        // Processa a configuração e insere elementos no DOM
        const config = await carregarConfig();
        const encaminhamentos = config?.Encaminhar || {};

        const { label, select } = criarDropdown(encaminhamentos);
        campoEsfera.parentNode.appendChild(label);
        campoEsfera.parentNode.appendChild(select);

        select.addEventListener('change', atualizarJustificativa);

        // Observa mudanças no destino
        if (campoOuvidoriaDestino) {
            new MutationObserver(() => {
                atualizarTextoSolicitante();
                atualizarJustificativa();
            }).observe(campoOuvidoriaDestino, { childList: true, subtree: true });
        }

        // Dispara atualizações iniciais
        atualizarTextoSolicitante();
        atualizarJustificativa();
    });
})();
