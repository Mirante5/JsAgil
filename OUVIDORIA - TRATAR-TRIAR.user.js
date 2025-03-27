// ==UserScript==
// @name         OUVIDORIA - TRATAR/TRIAR (Aprimorado)
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Ajusta a exibição de prazos e categoria, com menu de configuração estilizado e gráfico com toggle.
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

    /* =====================================================
       CSS Dinâmico para o Menu de Configuração e Gráfico
    ====================================================== */
    const style = document.createElement('style');
    style.textContent = `
        /* Painel de configuração */
        #configPanel {
            position: fixed;
            top: 10%;
            right: 10px;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 10000;
            width: 320px;
            font-family: sans-serif;
            display: none;
        }
        #configPanel h3 {
            margin-top: 0;
            text-align: center;
        }
        #configPanel label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        #configPanel input[type="number"] {
            width: 100%;
            padding: 5px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        #configPanel button {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: none;
            border-radius: 5px;
            background: #007BFF;
            color: white;
            font-size: 14px;
            cursor: pointer;
        }
        #configPanel button:hover {
            background: #0056b3;
        }
        /* Ícone de engrenagem */
        #gearIcon {
            position: fixed;
            bottom: 15px;
            right: 15px;
            width: 50px;
            height: 50px;
            background: #007BFF;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            font-size: 24px;
            z-index: 10000;
        }
        /* Container do gráfico */
        #chartContainer {
            position: fixed;
            top: 350px;
            right: 1px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            display: none;
            width: 390px;
        }
        #chartHeader {
            background: #007BFF;
            color: white;
            padding: 5px;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        #chartHeader span {
            font-weight: bold;
        }
        #chartHeader button {
            background: transparent;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
        }
        #chartContent {
            padding: 10px;
        }
    `;
    document.head.appendChild(style);

    /* =====================================================
       CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
    ====================================================== */
    const feriados = [
        "01/01/2025", "03/03/2025", "04/03/2025", "18/04/2025", "21/04/2025",
        "01/05/2025", "19/06/2025", "28/10/2025", "20/11/2025", "25/12/2025"
    ].map(data => {
        const [dia, mes, ano] = data.split('/');
        return new Date(ano, mes - 1, dia).getTime();
    });
    const coresSituacao = {
        "Complementação Solicitada": { fundo: "yellow", texto: "black" },
        "Complementada": { fundo: "green", texto: "white" },
        "Prorrogada": { fundo: "red", texto: "white" }
    };
    const storageKey = 'graficoPrioridades';
    let chart = null;

    /* =====================================================
       FUNÇÕES DE UTILIDADE
    ====================================================== */
    const ehFeriado = data => feriados.includes(data.getTime());

    const ajustarData = (dataStr, dias, paraDiaUtil = false) => {
        const partes = dataStr.split('/');
        if (partes.length !== 3) return null;
        let data = new Date(partes[2], partes[1] - 1, partes[0]);
        if (!paraDiaUtil) {
            data.setDate(data.getDate() + dias);
            // Se cair no sábado ou domingo, ajusta para sexta ou segunda
            if (data.getDay() === 6) data.setDate(data.getDate() - 1);
            if (data.getDay() === 0) data.setDate(data.getDate() + 1);
        } else {
            let diasUteis = 0;
            const incremento = dias > 0 ? 1 : -1;
            while (diasUteis < Math.abs(dias)) {
                data.setDate(data.getDate() + incremento);
                if (data.getDay() !== 0 && data.getDay() !== 6 && !ehFeriado(data)) {
                    diasUteis++;
                }
            }
            while (data.getDay() === 0 || data.getDay() === 6 || ehFeriado(data)) {
                data.setDate(data.getDate() + 1);
            }
        }
        return data;
    };

    const calcularDiasUteis = (inicio, fim) => {
        let diasUteis = 0;
        let data = new Date(inicio);
        while (data < fim) {
            data.setDate(data.getDate() + 1);
            if (data.getDay() !== 0 && data.getDay() !== 6 && !ehFeriado(data)) {
                diasUteis++;
            }
        }
        return diasUteis;
    };

    /* =====================================================
       FUNÇÕES DE AJUSTE DE INTERFACE
    ====================================================== */
    const ajustarItensPorPagina = qtdItens => {
        const input = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_txtTamanhoPagina');
        const botao = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_btnAlterarTamanhoPagina');
        if (input && botao) {
            input.value = qtdItens;
            botao.click();
        }
    };

    const ajustarCoresDeSituacao = () => {
        document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']")
            .forEach(span => {
                const situacao = span.textContent.trim();
                if (coresSituacao[situacao]) {
                    Object.assign(span.style, {
                        backgroundColor: coresSituacao[situacao].fundo,
                        color: coresSituacao[situacao].texto,
                        padding: "3px 5px",
                        borderRadius: "5px",
                        display: "inline-block"
                    });
                }
            });
    };

    const adicionarInformacoesDePrazo = () => {
        document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblPrazoResposta']")
            .forEach((span, index) => {
                const prazo = span.textContent.trim();
                if (!prazo || prazo.includes("Primeira Prorrogação")) return;

                const prazoData = ajustarData(prazo, 0, true);
                const cobrancaData = ajustarData(prazo, -5, true);
                const improrrogavelData = ajustarData(prazo, 31, true);
                const tramitarData = ajustarData(prazo, -10); // Ajuste simples para tramitar

                if (!tramitarData || !cobrancaData || !improrrogavelData) return;

                const diasUteisCobranca = calcularDiasUteis(cobrancaData, prazoData);
                // Utilizando o mesmo cálculo para cobrança "improrrogável" – se necessário, ajuste conforme regra
                const situacaoSpan = document.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lblSituacaoManifestacao']")[index];
                const situacao = situacaoSpan ? situacaoSpan.textContent.trim() : "";

                if (situacao === "Prorrogada") {
                    span.innerHTML = `
                        <b>${tramitarData.toLocaleDateString('pt-BR')}</b><br>
                        Cobrança em: <b>${cobrancaData.toLocaleDateString('pt-BR')}</b> [${diasUteisCobranca} dias úteis]<br>
                        Prazo Final: <b>${prazoData.toLocaleDateString('pt-BR')}</b>
                    `;
                } else {
                    span.innerHTML = `
                        <b>${tramitarData.toLocaleDateString('pt-BR')}</b><br>
                        Cobrança em: <b>${cobrancaData.toLocaleDateString('pt-BR')}</b> [${diasUteisCobranca} dias úteis]<br>
                        Prorrogar em: <b>${prazoData.toLocaleDateString('pt-BR')}</b><br>
                        Improrrogável: <b>${improrrogavelData.toLocaleDateString('pt-BR')}</b>
                    `;
                }
            });
    };

    const removerHrefLinksEspecificos = () => {
        document.querySelectorAll('[id^="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_lvwTriagem_lnkNumero_"]')
            .forEach(link => {
                link.removeAttribute('href');
                link.addEventListener('click', () => {
                    navigator.clipboard.writeText(link.textContent.trim())
                        .then(() => {
                            let msg = link.querySelector('#msg-copiado');
                            if (!msg) {
                                msg = document.createElement('div');
                                msg.id = 'msg-copiado';
                                Object.assign(msg.style, {
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'black',
                                    color: 'white',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap'
                                });
                                link.appendChild(msg);
                            }
                            msg.textContent = 'Texto copiado!';
                            setTimeout(() => msg.remove(), 250);
                        })
                        .catch(err => console.error('Erro ao copiar:', err));
                }, { once: true });
            });
    };

    /* =====================================================
       PAINEL DE CONFIGURAÇÃO E ÍCONE
    ====================================================== */
    const criarIconeEngrenagem = () => {
        const gearIcon = document.createElement('div');
        gearIcon.id = 'gearIcon';
        gearIcon.innerHTML = "&#9881;";
        document.body.appendChild(gearIcon);

        gearIcon.addEventListener('click', () => {
            const painel = document.getElementById('configPanel');
            painel.style.display = painel.style.display === 'none' ? 'block' : 'none';
        });
    };

    const criarPainelDeConfiguracao = () => {
        const painel = document.createElement('div');
        painel.id = 'configPanel';
        painel.innerHTML = `
            <h3>Configurações</h3>
            <div style="margin-bottom:10px;">
                <label>Funcionalidades</label>
                <button id="toggleFuncionalidades">Habilitar</button>
            </div>
            <div style="margin-bottom:10px;">
                <label>Itens por página</label>
                <input type="number" id="qtdItens" value="${localStorage.getItem('qtdItens') || 10}" min="15" max="50">
            </div>
            <button id="salvarConfig">Salvar Configurações</button>
        `;
        document.body.appendChild(painel);

        // Atualiza o texto do botão de toggle conforme o estado salvo
        const funcionalidadesAtivadas = localStorage.getItem('funcionalidadesAtivadas') !== 'false';
        document.getElementById('toggleFuncionalidades').textContent = funcionalidadesAtivadas ? 'Desabilitar' : 'Habilitar';

        // Evento de toggle das funcionalidades
        document.getElementById('toggleFuncionalidades').addEventListener('click', () => {
            const btn = document.getElementById('toggleFuncionalidades');
            const ativado = btn.textContent === 'Desabilitar';
            btn.textContent = ativado ? 'Habilitar' : 'Desabilitar';
            localStorage.setItem('funcionalidadesAtivadas', !ativado);
        });

        // Salva configurações e aplica
        document.getElementById('salvarConfig').addEventListener('click', () => {
            const qtdItens = parseInt(document.getElementById('qtdItens').value, 10);
            localStorage.setItem('qtdItens', qtdItens);
            ajustarItensPorPagina(qtdItens);
            if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
                adicionarInformacoesDePrazo();
                ajustarCoresDeSituacao();
            }
            alert('Configurações salvas!');
        });
    };

    /* =====================================================
       FUNÇÕES DO GRÁFICO COM TOGGLE
    ====================================================== */
    const criarContainerDoGrafico = () => {
        const container = document.createElement('div');
        container.id = 'chartContainer';
        container.innerHTML = `
            <div id="chartHeader">
                <span>Demandas por Hora</span>
                <button id="fecharGrafico">&times;</button>
            </div>
            <div id="chartContent">
                <canvas id="graficoCanvas" width="390" height="400"></canvas>
            </div>
        `;
        document.body.appendChild(container);

        // Evento para fechar o gráfico
        document.getElementById('fecharGrafico').addEventListener('click', () => {
            container.style.display = 'none';
        });
    };

    // Função para abrir/reabrir o gráfico (cria se ainda não existir)
    const toggleGrafico = () => {
        let container = document.getElementById('chartContainer');
        if (!container) {
            criarContainerDoGrafico();
            container = document.getElementById('chartContainer');
        }
        container.style.display = container.style.display === 'none' || container.style.display === '' ? 'block' : 'none';
    };

    /* =====================================================
       FUNÇÕES DE GRÁFICO (salvar, contar e atualizar)
    ====================================================== */
    const salvarGraficoNoLocalStorage = dadosNovos => {
        const dadosSalvos = recuperarDadosDoLocalStorage() || { demandasPorData: {}, totalDemandasPorData: {} };
        const dataAtual = new Date().toISOString().split('T')[0];
        const horaAtual = new Date().getHours().toString();

        dadosSalvos.demandasPorData[dataAtual] = dadosSalvos.demandasPorData[dataAtual] || {};
        dadosSalvos.totalDemandasPorData[dataAtual] = dadosSalvos.totalDemandasPorData[dataAtual] || {};

        if (dadosNovos.demandasPorHora[horaAtual]) {
            dadosSalvos.demandasPorData[dataAtual][horaAtual] = dadosNovos.demandasPorHora[horaAtual];
        }
        dadosSalvos.totalDemandasPorData[dataAtual][horaAtual] = dadosNovos.totalDemandas;
        dadosSalvos.data = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(dadosSalvos));
    };

    const recuperarDadosDoLocalStorage = () => {
        const dados = localStorage.getItem(storageKey);
        return dados ? JSON.parse(dados) : null;
    };

    const contarDemandasPorHoraECategoria = () => {
        const horaAtual = new Date().getHours().toString();
        const demandas = { [horaAtual]: { critica: 0, alta: 0, media: 0, baixa: 0, semclass: 0 } };
        document.querySelectorAll('button').forEach(button => {
            const txt = button.innerHTML.trim().toLowerCase();
            if (txt.includes('crítica')) demandas[horaAtual].critica++;
            else if (txt.includes('alta')) demandas[horaAtual].alta++;
            else if (txt.includes('média')) demandas[horaAtual].media++;
            else if (txt.includes('baixa')) demandas[horaAtual].baixa++;
            else if (txt.includes('prioridade') || txt.includes('sem classificação')) demandas[horaAtual].semclass++;
        });
        return demandas;
    };

    const pegarTotalDemandas = () => {
        const totalEl = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_pagTriagem_ctl03_TotalItemsLabel');
        return totalEl ? parseInt(totalEl.innerText.trim(), 10) || 0 : 0;
    };

const criarGrafico = (demandasPorData, totalDemandasPorData) => {
    let canvas = document.getElementById('graficoCanvas');
    if (!canvas) {
        console.warn('Canvas do gráfico não encontrado, criando container...');
        criarContainerDoGrafico();
        canvas = document.getElementById('graficoCanvas');
        if (!canvas) {
            console.error('Falha ao criar o canvas do gráfico.');
            return;
        }
    }
    try {
        const ctx = canvas.getContext('2d');
        const dataAtual = new Date().toISOString().split('T')[0];
        const demandasHoje = demandasPorData[dataAtual] || {};
        const totalHoje = totalDemandasPorData[dataAtual] || {};
        const horas = Array.from({ length: 24 }, (_, i) => i.toString());
        const categorias = ['critica', 'alta', 'media', 'baixa', 'semclass'];
        const datasets = categorias.map((categoria, idx) => ({
            label: categoria.charAt(0).toUpperCase() + categoria.slice(1),
            data: horas.map(hora => (demandasHoje[hora] ? demandasHoje[hora][categoria] : 0)),
            borderColor: ['red', 'orange', 'yellow', 'green', 'gray'][idx],
            fill: false,
            tension: 0.1
        }));
        datasets.push({
            label: 'Total de Demandas',
            data: horas.map(hora => totalHoje[hora] || 0),
            borderColor: 'black',
            fill: false,
            tension: 0.1,
            borderDash: [5, 5]
        });

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas.map(hora => `${hora}:00`),
                datasets
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: true },
                    title: { display: true, text: 'Demandas por Hora - ' + dataAtual }
                },
                scales: {
                    x: { title: { display: true, text: 'Hora' } },
                    y: { beginAtZero: true, title: { display: true, text: 'Número de Demandas' } }
                }
            }
        });
    } catch (err) {
        console.error('Erro ao criar o gráfico:', err);
    }
};


    const atualizarGrafico = () => {
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

            categorias.forEach((categoria, idx) => {
                chart.data.datasets[idx].data = horas.map(hora => (demandasHoje[hora] ? demandasHoje[hora][categoria] : 0));
            });
            chart.data.datasets[5].data = horas.map(hora => totalHoje[hora] || 0);
            chart.update();
        }
    };

    const verificarMudancaDeHora = () => {
        let ultimaHora = new Date().getHours();
        setInterval(() => {
            const horaAtual = new Date().getHours();
            if (horaAtual !== ultimaHora) {
                console.log(`Mudança de hora: ${ultimaHora} -> ${horaAtual}`);
                atualizarGrafico();
                ultimaHora = horaAtual;
            }
        }, 60000);
    };

    /* =====================================================
       OBSERVADOR DE MUTAÇÕES
    ====================================================== */
    const observer = new MutationObserver(() => {
        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            removerHrefLinksEspecificos();
            adicionarInformacoesDePrazo();
            ajustarCoresDeSituacao();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    /* =====================================================
       FUNÇÃO PRINCIPAL
    ====================================================== */
    const executar = () => {
        const qtdItens = localStorage.getItem('qtdItens') || 10;
        ajustarItensPorPagina(qtdItens);
        criarIconeEngrenagem();
        criarPainelDeConfiguracao();

        // Cria botão para toggle do gráfico
        const btnGrafico = document.createElement('button');
        btnGrafico.textContent = 'Exibir Gráfico';
        Object.assign(btnGrafico.style, {
            position: 'fixed',
            bottom: '80px',
            right: '15px',
            padding: '10px 15px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: '10000'
        });
        btnGrafico.addEventListener('click', () => {
            toggleGrafico();
            // Atualiza o texto do botão conforme o estado do gráfico
            btnGrafico.textContent = btnGrafico.textContent === 'Exibir Gráfico' ? 'Fechar Gráfico' : 'Exibir Gráfico';
        });
        document.body.appendChild(btnGrafico);

        if (localStorage.getItem('funcionalidadesAtivadas') !== 'false') {
            adicionarInformacoesDePrazo();
            ajustarCoresDeSituacao();
        }
    };

    const aguardarCarregamento = () =>
        new Promise(resolve => {
            const intervalo = setInterval(() => {
                if (document.body) {
                    clearInterval(intervalo);
                    resolve();
                }
            }, 500);
        });

    /* =====================================================
       INIT & ATUALIZAÇÃO DO GRÁFICO
    ====================================================== */
    const init = () => {
        setTimeout(atualizarGrafico, 2000);
        verificarMudancaDeHora();
    };

    aguardarCarregamento().then(() => {
        executar();
        setTimeout(init, 10000);
    });
})();
