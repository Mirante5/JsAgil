// ==UserScript==
// @name         OUVIDORIA - TRAMITAR
// @namespace    http://tampermonkey.net/
// @version      2.75
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
        let data = new Date(partes[2], partes[1] - 1, partes[0]); // no formato YYYY-MM-DD sem ser UTC

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
            campoTextoTramitar.value =`À ${campoTags.value} \n\n` +
                              `Senhores pontos focais,  \n\n` +
                              `Encaminhamos a presente manifestação por entendermos tratar-se de matéria afeta a essa Unidade.\n\n` +
                              `Quanto ao tratamento das demandas de Ouvidoria, orientamos que a resposta siga por meio desta Plataforma, até do dia ${calcularDataMenosDezDias()} (20 dias) contendo informações a respeito da possibilidade ou impossibilidade de atendimento da presente manifestação, bem como a forma e os meios para contato do cidadão com a Unidade técnica responsável pela demanda. Em caso de impossibilidade de atendimento dentro do prazo previsto, a manifestação poderá ser prorrogada por igual período, mediante apresentação expressa de justificativa, nos termos do Decreto nº 9492/18 e portaria MEC 1.053/2022.\n\n` +
                              `Ante o exposto, desde já, solicitamos que a resposta disponibilizada, seja redigida em linguagem simples/cidadã, clara, sem siglas ou tecnicismos e concisa, de maneira a possibilitar a compreensão da mensagem pelo receptor, e por fim, recomendamos que observe o previsto no artigo 19 da Portaria da Controladoria-Geral da União n° 581 de 9 de março de 2021.\n\n` +
                              `Art. 19. Na elaboração de respostas conclusivas às manifestações, as unidades do SisOuv observarão o seguinte conteúdo mínimo:\n\n` +
                              `I - no caso de elogio, informação sobre o seu encaminhamento e cientificação ao agente público ou ao responsável pelo serviço público prestado, e à sua chefia imediata;\n\n` +
                              `II - no caso de reclamação, informação objetiva acerca da análise do fato apontado;\n\n` +
                              `III - no caso de solicitação, informação sobre a possibilidade, a forma e o meio de atendimento à solicitação;\n\n` +
                              `IV - no caso de sugestão, manifestação do gestor sobre a possibilidade de sua adoção, informando o período estimado de tempo necessário à sua implementação, quando couber; e\n\n` +
                              `V - no caso de denúncia, informação sobre o seu encaminhamento às unidades apuratórias competentes ou sobre o seu arquivamento.\n\n` +
                              `Em caso de dúvidas favor contatar: lucasmiranda@mec.gov.br\n\n` +
                              `Caso a manifestação tenha sido encaminhada de forma equivocada a essa Unidade, favor restituí-la à Ouvidoria imediatamente.\n\n` +
                              `Atenciosamente,\n\n` +
                              `Ouvidoria do Ministério da Educação`;

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
                        <option value="">Escolha uma Secretaria</option>
                        <option value="SESU">Secretaria de Educação Superior - SESu</option>
                        <option value="SERES">Secretaria de Regulação e Supervisão da Educação Superior - SERES</option>
                        <option value="SETEC">Secretaria de Educação Profissional e Tecnológica - SETEC</option>
                        <option value="SEB">Secretaria de Educação Básica - SEB</option>
                        <option value="SASE">Secretaria de Articulação Intersetorial e com os Sistemas de Ensino - SASE</option>
                        <option value="SECADI">Secretaria de Educação Continuada, Alfabetização, Diversidade e Inclusão - SECADI</option>
                        <option value="STIC">Subsecretaria de Tecnologia da Informação e Comunicação - STIC</option>
                        <option value="SPO">Subsecretaria de Planejamento e Orçamento - SPO</option>
                        <option value="SGA">Subsecretaria de Gestão Administrativa - SGA</option>
                        <option value="SE">Secretaria Executiva - SE</option>
                        <option value="COR">Corregedoria - COR</option>
                        <option value="CONJUR">Consultoria Jurídica - CONJUR</option>
                        <option value="AECI">Assessoria Especial de Controle Interno - AECI</option>
                        <option value="GM">Gabinete do Ministro - GM</option>
                        <option value="CNE">Conselho Nacional de Educação - CNE</option>
                        <option value="SEGAPE">Inovação e Avaliação de Políticas Educacionais (Segape)</option>
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
                SESU: ["GRECE MARIA SOUSA CARDOSO", "HELOISA SANTOS OLIVEIRA", "ELIZABETH RODRIGUES MARTINS ROCHA SILVA", "KENYA REIS SILVA DIAS"],
                SERES: ["OTAVIO PEREIRA DE CARVALHO", "WILLIAN PEREIRA JUNIOR", "JESSICA DA SILVA FERREIRA PEREIRA", "JHENYFER DA SILVA SOARES"],
                SETEC: ["MARINA RAMOS VASCONCELOS RADA", "KATARINA EZILDA FERREIRA SANTIAGO", "NAYARA DE PADUA RESENDE"],
                SEB: ["PAULA GOMES FRANCA", "ELMA CLARA QUEIROZ RAMOS SIQUEIRA"],
                SASE: ["IVONE COSTA DE OLIVEIRA", "ROGERIO DE JESUS COSTA SOUSA"],
                SECADI: ["ANTONIO DE MELO SANTOS", "ROBSON RODRIGUES DE OLIVEIRA"],
                STIC: ["BRUNO CORREA MIRANDA", "RAPHAEL ZERLOTTINI DOS REIS"],
                SPO: ["LUCIANA NUNES DE OLIVEIRA", "JUNIA LAGOEIRO DUTRA NEHME"],
                SGA: ["HEDER SILVA E NORONHA", "ANTÔNIO FRANCISCO DE SOUZA", "FERNANDA DIAS FERNANDES", "Antonio Weverson Gomes dos Santos"],
                SE: ["MARCOS GONZAGA DE LIMA", "ANA CRISTINA SOUZA DA SILVA"],
                COR: ["FABRIZIA DE LIMA", "LUIZA DALVA RODRIGUES PAIVA", "FERNANDO COSTA DE ALMEIDA", "RAFAEL COELHO DE SOUSA", "RAQUEL GUERRA LOPES DOS SANTOS", "ILA DELAHIS JANSEN VALENTE OLIVEIRA", "MARIA DE FÁTIMA SANTOS VIANA"],
                CONJUR: ["AMANDA PRICILA ESTRELA BIZINOTO FELTRIM", "THIAGO RAFAEL FAGUNDES", "MARIA DAS DORES BATISTA "],
                AECI: ["RUTH MARIANA LIMA CORDEIRO"],
                GM: ["GISELE CUNHA NEVES", "MAIARA ROSA DE SOUZA RIBEIRO", "LUCIANA PEREIRA GOMES BORGES DE OLIVEIRA"],
                CNE: ["DANIEL ARAGAO PARENTE VALENTIM", "MARCELA ARAUJO BASILIO FRANCA PAVETITS", "LUCIANA PEREIRA GOMES BORGES DE OLIVEIRA"],
                SEGAPE: ["Cláudia Rezende Medeiros Passsetto", "VALERIA DA COSTA RODRIGUES ALVES DE LIMA VIEIRA "]
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
