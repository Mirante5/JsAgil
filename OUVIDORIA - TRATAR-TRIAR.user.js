// ==UserScript==
// @name         OUVIDORIA - TRATAR/TRIAR
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Ajusta a exibição de prazos e categoria, permite configurar a quantidade de itens.
// @author       Lucas
// @match        *://*falabr.cgu.gov.br/Manifestacao/TratarManifestacoes*
// @match        *://*falabr.cgu.gov.br/Manifestacao/TriarManifestacoes*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRATAR-TRIAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRATAR-TRIAR.user.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Ajusta o número de registros por página
    function ajustarItensPorPagina(qtdItens) {
        const input = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_txtTamanhoPagina');
        const botao = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_btnAlterarTamanhoPagina');
        if (input && botao) {
            input.value = qtdItens;
            botao.click();
        }
    }

    // Ajusta as cores de fundo das manifestações com base na situação
    function ajustarCoresDeSituacao() {
        const cores = {
            "Complementação Solicitada": { fundo: "yellow", texto: "black" },
            "Complementada": { fundo: "green", texto: "white" },
            "Prorrogada": { fundo: "red", texto: "white" }
        };

        document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']").forEach(span => {
            let situacao = span.textContent.trim();
            if (cores[situacao]) {
                span.style.backgroundColor = cores[situacao].fundo;
                span.style.color = cores[situacao].texto;
                span.style.padding = "3px 5px";
                span.style.borderRadius = "5px";
                span.style.display = "inline-block";
            }
        });
    }

    // Lista de feriados fixos (adicione mais se necessário)
    const feriados = [
        "01/01/2025", // Confraternização Universal
        "03/03/2025", // Carnaval
        "04/03/2025", // Carnaval
        "18/04/2025", // Sexta-feira Santa
        "21/04/2025", // Tiradentes
        "01/05/2025", // Dia do Trabalho
        "19/06/2025", // Corpus Christi
        "28/10/2025", // Dia do Servidor Publico
        "20/11/2025", // Consciencia Negra
        "25/12/2025" // Natal
    ].map(data => {
        let partes = data.split('/');
        return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
    });

    // Função para verificar se uma data é feriado
    function ehFeriado(data) {
        return feriados.includes(data.getTime());
    }

    // Ajusta a data, garantindo que caia em um dia útil
    function ajustarDataTramitar(dataString, dias) {
        let partes = dataString.split('/');
        if (partes.length !== 3) return null;

        let data = new Date(partes[2], partes[1] - 1, partes[0]);
        data.setDate(data.getDate() + dias);

        // Se cair no sábado ou domingo, ajusta para sexta-feira
        if (data.getDay() === 6) data.setDate(data.getDate() - 1);
        if (data.getDay() === 0) data.setDate(data.getDate() + 1);

        return data; // Retorna como um objeto Date
    }

    // Função para contar apenas dias úteis, ignorando feriados
    function calcularDiasUteis(dataInicio, dataFim) {
        let diasUteis = 0;
        let dataAtual = new Date(dataInicio);

        while (dataAtual < dataFim) {
            dataAtual.setDate(dataAtual.getDate() + 1);
            let diaSemana = dataAtual.getDay();
            if (diaSemana !== 0 && diaSemana !== 6 && !ehFeriado(dataAtual)) {
                diasUteis++;
            }
        }

        return diasUteis;
    }

    // Função para ajustar data garantindo que caia em um dia útil e não seja feriado
    function ajustarDataParaDiaUtil(dataString, dias) {
        let partes = dataString.split('/');
        if (partes.length !== 3) return null;

        let data = new Date(partes[2], partes[1] - 1, partes[0]);
        let diasUteisContados = 0;

        while (diasUteisContados < Math.abs(dias)) {
            data.setDate(data.getDate() + (dias > 0 ? 1 : -1));
            let diaSemana = data.getDay();
            if (diaSemana !== 0 && diaSemana !== 6 && !ehFeriado(data)) {
                diasUteisContados++;
            }
        }

        // Se cair em um feriado, ajusta para o próximo dia útil
        while (ehFeriado(data) || data.getDay() === 0 || data.getDay() === 6) {
            data.setDate(data.getDate() + 1);
        }

        return data; // Retorna como um objeto Date
    }

    // Adiciona informações de prazo nas manifestações
    function adicionarInformacoesDePrazo() {
        document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblPrazoResposta']").forEach((span, index) => {
            let prazo = span.textContent.trim();
            if (!prazo || prazo.includes("Primeira Prorrogação")) return;

            const prazoData = ajustarDataParaDiaUtil(prazo, 0);
            const cobrancaData = ajustarDataParaDiaUtil(prazo, -5);
            const cobrancaImprorrogavelData = ajustarDataParaDiaUtil(prazo, -2);
            const improrrogavelData = ajustarDataParaDiaUtil(prazo, 31);
            const tramitarData = ajustarDataTramitar(prazo, -10);


            if (!tramitarData || !cobrancaData || !improrrogavelData || !cobrancaImprorrogavelData) return;

            // Calcula corretamente os dias úteis entre a cobrança e a prorrogação
            let diasUteisCobranca = calcularDiasUteis(cobrancaData, prazoData);
            let diasUteisCobrancaImprorrogavel = calcularDiasUteis(cobrancaImprorrogavelData, prazoData);

            // Obtenha a situação do item correspondente (usando o mesmo index)
            const situacaoSpan = document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']")[index];
            const situacao = situacaoSpan ? situacaoSpan.textContent.trim() : "";

            // Lógica para verificar a situação e exibir o conteúdo apropriado
            if (situacao === "Prorrogada") {
                // Exibe somente a primeira prorrogação e a cobrança
                span.innerHTML = `
                <b>${tramitarData.toLocaleDateString('pt-BR')}</b><br>
                Cobrança em:<b> ${cobrancaImprorrogavelData.toLocaleDateString('pt-BR')} </b> [${diasUteisCobrancaImprorrogavel} dias úteis]<br>
                Prazo Final em:<b> ${prazoData.toLocaleDateString('pt-BR')} </b>
            `;
        } else {
            // Exibe todos os prazos
            span.innerHTML = `
                <b>${tramitarData.toLocaleDateString('pt-BR')}</b><br>
                Cobrança em:<b> ${cobrancaData.toLocaleDateString('pt-BR')} </b> [${diasUteisCobranca} dias úteis]<br>
                Prorrogar em:<b> ${prazoData.toLocaleDateString('pt-BR')} </b><br>
                Improrrogável em:<b> ${improrrogavelData.toLocaleDateString('pt-BR')} </b>
            `;
        }
    });
}

    //remove opção de clicar
    function removerHrefLinksEspecificos() {
        document.querySelectorAll('[id^="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lnkNumero_"]').forEach(link => {
            link.removeAttribute('href');
        // Adiciona evento de clique para copiar o texto
        link.addEventListener('click', () => {
            navigator.clipboard.writeText(link.textContent.trim())
                .then(() => {
                    let msg = document.querySelector('#msg-copiado');
                    if (!msg) {
                        msg = document.createElement('div');
                        msg.id = 'msg-copiado';
                        msg.style.position = 'absolute';
                        msg.style.top = '100%';
                        msg.style.left = '50%';
                        msg.style.transform = 'translateX(-50%)';
                        msg.style.background = 'black';
                        msg.style.color = 'white';
                        msg.style.padding = '5px';
                        msg.style.borderRadius = '5px';
                        msg.style.fontSize = '12px';
                        msg.style.whiteSpace = 'nowrap';
                        link.appendChild(msg);
                    }
                    msg.textContent = 'Texto copiado!';
                    setTimeout(() => msg.remove(), 250);
                })
                .catch(err => console.error('Erro ao copiar:', err));
        }, { once: true });
    });
}

    // Observa mudanças na página para reaplicar modificações
    const observer = new MutationObserver(() => {
        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            removerHrefLinksEspecificos();
            adicionarInformacoesDePrazo();
            ajustarCoresDeSituacao();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Cria o ícone de engrenagem
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
            const painel = document.getElementById('configPanel');
            painel.style.display = painel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // Cria o painel de configurações
    function criarPainelDeConfiguracao() {
        const painel = document.createElement('div');
        painel.id = 'configPanel';
        painel.style.cssText = `
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
        painel.innerHTML = `
            <h3>Configurações</h3>

            <p>Funcionalidade: <span id="statusFuncionalidade">Ativado</span></p>
            <button id="mudarFuncionalidade">Mudar</button><br><br>

            <label for="qtdItens">Itens por página: </label>
            <input type="number" id="qtdItens" value="${localStorage.getItem('qtdItens') || 10}" max="50" min="15" /><br><br>

            <button id="salvarConfig">Salvar Itens por página</button>
        `;
        document.body.appendChild(painel);

        document.getElementById('mudarFuncionalidade').addEventListener('click', () => {
            const statusFuncionalidade = document.getElementById('statusFuncionalidade');
            const isAtivado = statusFuncionalidade.textContent === 'Ativado';
            statusFuncionalidade.textContent = isAtivado ? 'Desativado' : 'Ativado';

            localStorage.setItem('funcionalidadesAtivadas', !isAtivado);

            if (isAtivado) {
                document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblPrazoResposta']").forEach(span => {
                    span.innerHTML = span.textContent; // Remove modificações de prazo
                });
                document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']").forEach(span => {
                    span.removeAttribute('style'); // Remove as cores de fundo
                });
            }

            setTimeout(() => location.reload(), 500); // Recarregar a página
        });

        document.getElementById('salvarConfig').addEventListener('click', () => {
            const qtdItens = parseInt(document.getElementById('qtdItens').value);
            localStorage.setItem('qtdItens', qtdItens);
            ajustarItensPorPagina(qtdItens);

            if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
                adicionarInformacoesDePrazo();
                ajustarCoresDeSituacao();
            }
        });

        const funcionalidadesAtivadas = localStorage.getItem('funcionalidadesAtivadas') !== 'false';
        document.getElementById('statusFuncionalidade').textContent = funcionalidadesAtivadas ? 'Ativado' : 'Desativado';
        document.getElementById('qtdItens').disabled = !funcionalidadesAtivadas;
    }

    // Função principal
    function executar() {
        const qtdItens = localStorage.getItem('qtdItens') || 10;
        ajustarItensPorPagina(qtdItens);
        criarIconeEngrenagem();
        criarPainelDeConfiguracao();

        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            adicionarInformacoesDePrazo();
            ajustarCoresDeSituacao();
        }
    }

    let chart = null;
    const storageKey = 'graficoPrioridades';

    function salvarGraficoNoLocalStorage(dadosNovos) {
        // Inicializa com estrutura padrão se não houver dados salvos
        let dadosSalvos = recuperarDadosDoLocalStorage() || { demandasPorData: {}, totalDemandasPorData: {}, data: new Date().toISOString() };
        let dataAtual = new Date().toISOString().split('T')[0]; // e.g., "2023-10-05"
        let horaAtualStr = new Date().getHours().toString(); // e.g., "10"

        // Garantir que demandasPorData exista
        if (!dadosSalvos.demandasPorData) {
            dadosSalvos.demandasPorData = {};
        }
        // Garantir que totalDemandasPorData exista
        if (!dadosSalvos.totalDemandasPorData) {
            dadosSalvos.totalDemandasPorData = {};
        }

        // Garantir que os objetos para a data atual estejam inicializados
        if (!dadosSalvos.demandasPorData[dataAtual]) {
            dadosSalvos.demandasPorData[dataAtual] = {};
        }
        if (!dadosSalvos.totalDemandasPorData[dataAtual]) {
            dadosSalvos.totalDemandasPorData[dataAtual] = {};
        }

        const demandasHora = dadosNovos.demandasPorHora[horaAtualStr];
        if (demandasHora) {
            dadosSalvos.demandasPorData[dataAtual][horaAtualStr] = demandasHora;
        }
        dadosSalvos.totalDemandasPorData[dataAtual][horaAtualStr] = dadosNovos.totalDemandas;

        dadosSalvos.data = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(dadosSalvos));
    }

    function recuperarDadosDoLocalStorage() {
        const dados = localStorage.getItem(storageKey);
        return dados ? JSON.parse(dados) : null;
    }

    function contarDemandasPorHoraECategoria() {
        let horaAtual = new Date().getHours().toString();
        const demandasPorHora = { [horaAtual]: { critica: 0, alta: 0, media: 0, baixa: 0, semclass: 0 } };

        document.querySelectorAll('button').forEach(button => {
            const texto = button.innerHTML.trim().toLowerCase();

            if (texto.includes('crítica')) demandasPorHora[horaAtual].critica++;
            else if (texto.includes('alta')) demandasPorHora[horaAtual].alta++;
            else if (texto.includes('média')) demandasPorHora[horaAtual].media++;
            else if (texto.includes('baixa')) demandasPorHora[horaAtual].baixa++;
            else if (texto.includes('prioridade') || texto.includes('sem classificação')) demandasPorHora[horaAtual].semclass++;
        });

        return demandasPorHora;
    }

    function pegarTotalDemandas() {
        const totalElement = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_TotalItemsLabel');
        return totalElement ? parseInt(totalElement.innerText.trim()) || 0 : 0;
    }

    function criarGrafico(demandasPorData, totalDemandasPorData) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.position = 'fixed';
        canvas.style.top = '100px';
        canvas.style.right = '5px';
        canvas.style.zIndex = '1000';
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');

        const dataAtual = new Date().toISOString().split('T')[0];
        const demandasHoje = demandasPorData[dataAtual] || {};
        const totalHoje = totalDemandasPorData[dataAtual] || {};
        const horas = Array.from({ length: 24 }, (_, i) => i.toString()); // "0" to "23"
        const categorias = ['critica', 'alta', 'media', 'baixa', 'semclass'];

        const data = categorias.map(categoria => horas.map(hora => demandasHoje[hora]?.[categoria] || 0));

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas.map(hora => `${hora}:00`),
                datasets: categorias.map((categoria, index) => ({
                    label: categoria.charAt(0).toUpperCase() + categoria.slice(1),
                    data: data[index],
                    borderColor: ['red', 'yellow', 'green', 'blue', 'purple'][index],
                    fill: false,
                    tension: 0.1
                })).concat([{
                    label: 'Total de Demandas',
                    data: horas.map(hora => totalHoje[hora] || 0),
                    borderColor: 'black',
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5]
                }])
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Demandas por Hora e Categoria - ' + dataAtual }
                },
                scales: {
                    x: { title: { display: true, text: 'Hora' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Número de Demandas' } }
                }
            }
        });
    }

    function atualizarGrafico() {
        const totalDemandas = pegarTotalDemandas();
        const demandasPorHora = contarDemandasPorHoraECategoria();
        salvarGraficoNoLocalStorage({ demandasPorHora, totalDemandas });
        const dadosSalvos = recuperarDadosDoLocalStorage();
        if (!chart) {
            criarGrafico(dadosSalvos.demandasPorData, dadosSalvos.totalDemandasPorData);
        } else {
            const dataAtual = new Date().toISOString().split('T')[0];
            const demandasHoje = dadosSalvos.demandasPorData[dataAtual] || {};
            const totalHoje = dadosSalvos.totalDemandasPorData[dataAtual] || {};
            const horas = Array.from({ length: 24 }, (_, i) => i.toString());
            const categorias = ['critica', 'alta', 'media', 'baixa', 'semclass'];
            const data = categorias.map(categoria => horas.map(hora => demandasHoje[hora]?.[categoria] || 0));
            categorias.forEach((categoria, index) => {
                chart.data.datasets[index].data = data[index];
            });
            chart.data.datasets[5].data = horas.map(hora => totalHoje[hora] || 0);
            chart.update();
        }
    }

    function verificarMudancaDeHora() {
        let ultimaHora = new Date().getHours();

        setInterval(() => {
            let horaAtual = new Date().getHours();

            if (horaAtual !== ultimaHora) {
                console.log(`Mudança de hora detectada: ${ultimaHora} -> ${horaAtual}`);
                atualizarGrafico();
                ultimaHora = horaAtual;
            }
        }, 60000); // Verifica a cada minuto
    }

    const observer1 = new MutationObserver(() => {
        atualizarGrafico();
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    async function init() {
        setTimeout(() => { atualizarGrafico(); }, 2000);
        verificarMudancaDeHora();
    }

    setTimeout(init, 10000);

    // Aguardar o carregamento da página
    function aguardarCarregamento() {
        return new Promise(resolve => {
            const intervalo = setInterval(() => {
                if (document.body) {
                    clearInterval(intervalo);
                    resolve();
                }
            }, 500);
        });
    }

    aguardarCarregamento().then(executar);
})();
