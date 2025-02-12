// ==UserScript==
// @name         OUVIDORIA - TRAMITAR
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Preenche a data automaticamente, adiciona uma aba de resposta e pontos focais, e preenche automaticamente os campos relacionados às secretarias.
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/TramitarManifestacao.aspx?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //Funcionando quase corretamente, falta apenas quando a pagina é atualizada manter a lista selecionada, auto tramitar e criar uma interface de edição do texto.

    // Função para calcular a data -10 dias corridos ajustando finais de semana
    function calcularDataMenosDezDias() {
        // Obtém o texto dentro da <span>
        let dataTexto = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento').innerText.trim();

        // Converte o texto para um objeto Date (supondo que esteja no formato DD/MM/YYYY)
        let partes = dataTexto.split('/');
        let data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`); // Converte para YYYY-MM-DD

        if (isNaN(data)) {
            console.error("Data inválida!");
            return "Data inválida";
        }

        // Subtrai 10 dias
        data.setDate(data.getDate() - 10);

        // Ajuste se cair em fim de semana
        if (data.getDay() === 6) { // Sábado -> Volta para sexta
            data.setDate(data.getDate() - 1);
        } else if (data.getDay() === 0) { // Domingo -> Avança para segunda
            data.setDate(data.getDate() + 1);
        }

        // Retorna no formato DD/MM/YYYY
        return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    }

    window.addEventListener('load', function() {
        // Insere a data calculada no campo correto
        const campoData = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtDataTratamento');
        if (campoData) {
            campoData.value = calcularDataMenosDezDias();
        }

        // Insere o texto no campo de Tags
        const campoTags = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTags');
        const campoTextoTramitar = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtMensagem');
        if (campoTextoTramitar) {
            campoTextoTramitar.value =`${campoTags.value}`;

            // Força o estilo do campo de mensagem
            campoTextoTramitar.style.width = "515px";
            campoTextoTramitar.style.height = "1036px";
        }

        // Criação de uma nova div (painel)
        const painel = document.createElement('div');
        painel.style.display = 'block';
        painel.style.marginBottom = '20px';
        painel.style.padding = '15px';
        painel.style.backgroundColor = '#fff';
        painel.style.border = '1px solid #ddd';
        painel.style.borderRadius = '4px';

        // Estrutura do painel com a ListBox para selecionar a Secretaria
        painel.innerHTML = `
            <div style="color: #333; background-color: #f5f5f5; border-color: #ddd; padding: 10px 15px; border-bottom: 1px solid transparent; border-top-left-radius: 3px; border-top-right-radius: 3px; box-sizing: border-box; display: block; unicode-bidi: isolate;">
                <h4 class="panel-title" style="margin: 0;">Pontos Focais</h4>
            </div>
            <div>
                <dt>Selecione a Secretaria</dt>
                <dd>
                    <select id="secretariasList" style="width: 100%; padding: 8px; margin-bottom: 10px;">
                        <option value=""></option>
                        <option value="Exemplo">Exemplo</option>
                    </select>
                </dd>

                <dt>Nome(s) relacionado(s)</dt>
                <dd>
                    <ul id="nomesSecretaria" style="list-style-type: none; padding-left: 0;">
                        <!-- Nomes serão exibidos aqui -->
                    </ul>
                </dd>
            </div>
        `;

        // Função para exibir os nomes relacionados à secretaria selecionada
        function exibirNomes() {
            const nomesSecretaria = document.getElementById('nomesSecretaria');
            const listaSecretarias = {
                Exemplo: ["A", "B", "C", "D"],
                Exemplo: ["1", "2", "3", "4"],
            };

            const secretariaSelecionada = document.getElementById('secretariasList').value;
            nomesSecretaria.innerHTML = ''; // Limpa a lista de nomes

            if (secretariaSelecionada && listaSecretarias[secretariaSelecionada]) {
                listaSecretarias[secretariaSelecionada].forEach(nome => {
                    const li = document.createElement('li');
                    li.textContent = nome;
                    nomesSecretaria.appendChild(li);
                });
            }
        }

        // Adiciona o painel como a primeira div dentro da classe especificada
        const container = document.querySelector('.col-md-6.col-md-push-6.hidden-print');
        if (container) {
            container.insertBefore(painel, container.firstChild);
        }

        // Adiciona o evento de seleção para exibir os nomes
        const selectSecretarias = document.getElementById('secretariasList');
        if (selectSecretarias) {
            selectSecretarias.addEventListener('change', exibirNomes);
            const secretariaSalva = localStorage.getItem('secretariaSelecionada');
            if (secretariaSalva) {
                selectSecretarias.value = secretariaSalva;
                exibirNomes(secretariaSalva);
            }
        selectSecretarias.addEventListener('change', function() {
                const secretariaSelecionada = this.value;
                localStorage.setItem('secretariaSelecionada', secretariaSelecionada);
                exibirNomes(secretariaSelecionada);
            });
        }
    });
})();
