// ==UserScript==
// @name         OUVIDORIA - TRAMITAR
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Preenche a data automaticamente, adiciona uma aba de resposta e pontos focais, e preenche automaticamente os campos relacionados às secretarias.
// @author       Lucas
// @match        https://falabr.cgu.gov.br/Manifestacao/TramitarManifestacao.aspx?*
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRAMITAR.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20TRAMITAR.user.js
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
                `Em caso de dúvidas por favor entrar em contato no telefone: (61) 2022-2595\n\n` +
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
        <button id="autotramitar" type="button">Tramitar</button>
    </div>
`;

        // Função para exibir os nomes relacionados à secretaria selecionada
        function exibirNomes() {
            const nomesSecretaria = document.getElementById('nomesSecretaria');
            const listaSecretarias = {
                SESU: ["Secretaria de Educação Superior- GABINETE/SESU","GRECE MARIA SOUSA CARDOSO", "HELOISA SANTOS OLIVEIRA", "ELIZABETH RODRIGUES MARTINS ROCHA SILVA", "KENYA REIS SILVA DIAS"],
                SERES: ["Secretaria de Regulação e Supervisão da Educação Superior- SERES","WALDO ERICO DE CASTRO NETO", "YURI SOUSA LIMA", "JAQUELINE DE SOUZA ARAUJO FRANCO", "ARACYARA DA CONCEICAO DO NASCIMENTO", "PRISCILLA SOARES DOS SANTOS"],
                SETEC: ["Secretaria de Educação Profissional e Tecnológica- SETEC","MARINA RAMOS VASCONCELOS RADA", "KATARINA EZILDA FERREIRA SANTIAGO", "NAYARA DE PADUA RESENDE"],
                SEB: ["Secretaria de Educação Básica- SEB","TANIA REGINA LUDOVICO CORREIA BATISTA", "ELMA CLARA QUEIROZ RAMOS SIQUEIRA", "PAULA GOMES FRANCA", "KAROLYNNE DE ARAUJO MOREIRA"],
                SASE: ["Secretaria de Articulação com os Sistemas de Ensino- SASE","IVONE COSTA DE OLIVEIRA", "ROGERIO DE JESUS COSTA SOUSA"],
                SECADI: ["Secretaria de Educação Continuada, Alfabetização de Jovens e Adultos, Diversidade e Inclusão- SECADI","ANTONIO DE MELO SANTOS", "ROBSON RODRIGUES DE OLIVEIRA"],
                STIC: ["Subsecretaria de Tecnologia da Informação e Comunicação- STIC","BRUNO CORREA MIRANDA", "RAPHAEL ZERLOTTINI DOS REIS"],
                SPO: ["Subsecretaria de Planejamento e Orçamento- SPO","LUCIANA NUNES DE OLIVEIRA", "JUNIA LAGOEIRO DUTRA NEHME"],
                SGA: ["Subsecretaria de Gestão Administrativa - SGA", "ANTÔNIO FRANCISCO DE SOUZA", "FERNANDA DIAS FERNANDES", "Antonio Weverson Gomes dos Santos", "MARLAN FERREIRA DIAS"],
                SE: ["Secretaria-Executiva- SE","MARCOS GONZAGA DE LIMA", "ANA CRISTINA SOUZA DA SILVA"],
                COR: ["Corregedoria-COR","FABRIZIA DE LIMA", "LUIZA DALVA RODRIGUES PAIVA", "FERNANDO COSTA DE ALMEIDA", "RAFAEL COELHO DE SOUSA", "RAQUEL GUERRA LOPES DOS SANTOS", "ILA DELAHIS JANSEN VALENTE OLIVEIRA", "MARIA DE FÁTIMA SANTOS VIANA"],
                CONJUR: ["Consultoria Jurídica- CONJUR","AMANDA PRICILA ESTRELA BIZINOTO FELTRIM", "THIAGO RAFAEL FAGUNDES"],
                AECI: ["Assessoria Especial de Controle Interno- AECI","RUTH MARIANA LIMA CORDEIRO"],
                GM: ["Gabinete do Ministro - GM","GISELE CUNHA NEVES", "MAIARA ROSA DE SOUZA RIBEIRO", "MARIANA NUNES TEODORO"],
                CNE: ["Conselho Nacional de Educação- CNE","DANIEL ARAGAO PARENTE VALENTIM","MARCELA ARAUJO BASILIO FRANCA PAVETITS","LUCIANA PEREIRA GOMES BORGES DE OLIVEIRA"],
                SEGAPE: ["Secretaria de Gestão da Informação, Inovação e Avaliação de Políticas Educacionais (Segape)","Cláudia Rezende Medeiros Passsetto", "VALERIA DA COSTA RODRIGUES ALVES DE LIMA VIEIRA"]

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

        function autotramitar() {
            document.getElementById("autotramitar").addEventListener("click", function () {
                let select = document.getElementById("secretariasList");
                let secretariaSelecionada = select.value;
                let nomesSecretaria = {
                SESU: ["Secretaria de Educação Superior- GABINETE/SESU","GRECE MARIA SOUSA CARDOSO", "HELOISA SANTOS OLIVEIRA", "ELIZABETH RODRIGUES MARTINS ROCHA SILVA", "KENYA REIS SILVA DIAS"],
                SERES: ["Secretaria de Regulação e Supervisão da Educação Superior- SERES","WALDO ERICO DE CASTRO NETO", "YURI SOUSA LIMA", "JAQUELINE DE SOUZA ARAUJO FRANCO", "ARACYARA DA CONCEICAO DO NASCIMENTO", "PRISCILLA SOARES DOS SANTOS"],
                SETEC: ["Secretaria de Educação Profissional e Tecnológica- SETEC","MARINA RAMOS VASCONCELOS RADA", "KATARINA EZILDA FERREIRA SANTIAGO", "NAYARA DE PADUA RESENDE"],
                SEB: ["Secretaria de Educação Básica- SEB","TANIA REGINA LUDOVICO CORREIA BATISTA", "ELMA CLARA QUEIROZ RAMOS SIQUEIRA", "PAULA GOMES FRANCA", "KAROLYNNE DE ARAUJO MOREIRA"],
                SASE: ["Secretaria de Articulação com os Sistemas de Ensino- SASE","IVONE COSTA DE OLIVEIRA", "ROGERIO DE JESUS COSTA SOUSA"],
                SECADI: ["Secretaria de Educação Continuada, Alfabetização de Jovens e Adultos, Diversidade e Inclusão- SECADI","ANTONIO DE MELO SANTOS", "ROBSON RODRIGUES DE OLIVEIRA"],
                STIC: ["Subsecretaria de Tecnologia da Informação e Comunicação- STIC","BRUNO CORREA MIRANDA", "RAPHAEL ZERLOTTINI DOS REIS"],
                SPO: ["Subsecretaria de Planejamento e Orçamento- SPO","LUCIANA NUNES DE OLIVEIRA", "JUNIA LAGOEIRO DUTRA NEHME"],
                SGA: ["Subsecretaria de Gestão Administrativa - SGA", "ANTÔNIO FRANCISCO DE SOUZA", "FERNANDA DIAS FERNANDES", "Antonio Weverson Gomes dos Santos", "MARLAN FERREIRA DIAS"],
                SE: ["Secretaria-Executiva- SE","MARCOS GONZAGA DE LIMA", "ANA CRISTINA SOUZA DA SILVA"],
                COR: ["Corregedoria-COR","FABRIZIA DE LIMA", "LUIZA DALVA RODRIGUES PAIVA", "FERNANDO COSTA DE ALMEIDA", "RAFAEL COELHO DE SOUSA", "RAQUEL GUERRA LOPES DOS SANTOS", "ILA DELAHIS JANSEN VALENTE OLIVEIRA", "MARIA DE FÁTIMA SANTOS VIANA"],
                CONJUR: ["Consultoria Jurídica- CONJUR","AMANDA PRICILA ESTRELA BIZINOTO FELTRIM", "THIAGO RAFAEL FAGUNDES"],
                AECI: ["Assessoria Especial de Controle Interno- AECI","RUTH MARIANA LIMA CORDEIRO"],
                GM: ["Gabinete do Ministro - GM","GISELE CUNHA NEVES", "MAIARA ROSA DE SOUZA RIBEIRO", "MARIANA NUNES TEODORO"],
                CNE: ["Conselho Nacional de Educação- CNE","DANIEL ARAGAO PARENTE VALENTIM","MARCELA ARAUJO BASILIO FRANCA PAVETITS","LUCIANA PEREIRA GOMES BORGES DE OLIVEIRA"],
                SEGAPE: ["Secretaria de Gestão da Informação, Inovação e Avaliação de Políticas Educacionais (Segape)","Cláudia Rezende Medeiros Passsetto", "VALERIA DA COSTA RODRIGUES ALVES DE LIMA VIEIRA"]
                };

                let nomes = nomesSecretaria[secretariaSelecionada] || [];
                if (nomes.length === 0) {
                    alert("Selecione uma secretaria válida!");
                    return;
                }

                // Função para verificar os nomes já adicionados na tabela
                function getNomesNaTabela() {
                    let tabela = document.getElementById("ConteudoForm_ConteudoGeral_ConteudoFormComAjax_grdUsuariosUnidades");
                    if (!tabela) return [];

                    let nomesNaTabela = [];
                    let spans = tabela.querySelectorAll("span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_grdUsuariosUnidades_lblNomeItem']");

                    spans.forEach(span => {
                        let nomeCorrigido = span.textContent.trim().replace(" (Unidade)", "");
                        nomesNaTabela.push(nomeCorrigido);
                    });

                    return nomesNaTabela;
                }

                // Função para adicionar um nome
                function adicionarNome(index = 0) {
                    if (index >= nomes.length) {
                        alert("Todos os nomes foram verificados e adicionados!");
                        return;
                    }

                    let nomesNaTabela = getNomesNaTabela();
                    let nome = nomes[index];

                    // Se o nome já foi adicionado, passa para o próximo
                    if (nomesNaTabela.includes(nome)) {
                        console.log(`Nome já existe: ${nome}`);
                        adicionarNome(index + 1); // Chama a função recursivamente para o próximo nome
                        return;
                    }

                    let input = document.getElementById("selectize_0");
                    let botaoAdicionar = document.getElementById("ConteudoForm_ConteudoGeral_ConteudoFormComAjax_btnIncluirUsuario");

                    if (!input || !botaoAdicionar) {
                        alert("Erro: Elementos necessários não encontrados.");
                        return;
                    }

                    input.click();
                    input.value = nome;

                    let eventInput = new Event("input", { bubbles: true });
                    input.dispatchEvent(eventInput);

                    setTimeout(() => {
                        let eventEnter = new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, which: 13, bubbles: true });
                        input.dispatchEvent(eventEnter);

                        // Clica no botão para adicionar o nome
                        botaoAdicionar.click(); // Clica no botão para adicionar o nome

                        // Espera a página carregar e aguarda um tempo extra antes de continuar o próximo
                        setTimeout(() => {
                            adicionarNome(index + 1); // Chama a função recursivamente para o próximo nome
                        }, 3000); // Aguarda 3 segundos para garantir que o AJAX tenha terminado
                    }, 500); // Aguarda 500ms para "Enter" ser disparado
                }

                // Começa o processo de adicionar os nomes
                adicionarNome();
            });
        }


        // Adiciona o painel no local correto
        const container = document.querySelector('.col-md-6.col-md-push-6.hidden-print');
        if (container) {
            container.insertBefore(painel, container.firstChild);
        }

        // Configura eventos
        document.getElementById('secretariasList').addEventListener('change', exibirNomes);
        autotramitar(); // Chama a função para adicionar evento ao botão

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
