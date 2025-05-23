(function() {
  'use strict';

  // Configurações e dados carregados do JSON
  let listaSecretariasEpontosFocais = {};
  let mensagensConfig = null;
  /**
   * Carrega o arquivo de configuração JSON com os pontos focais
   */
  async function carregarConfig() {
    try {
      const url = chrome.runtime.getURL('config/pontosfocais.json');
      const resp = await fetch(url);
      listaSecretariasEpontosFocais = await resp.json();
      console.log('Config carregado:', listaSecretariasEpontosFocais);
    } catch (error) {
      console.error('Erro ao carregar pontosfocais.json:', error);
    }
  }

  async function carregarMensagens() {
  try {
    const url = chrome.runtime.getURL('config/text.json');
    const resp = await fetch(url);
    mensagensConfig = await resp.json();
    console.log('Mensagens carregadas:', mensagensConfig);
  } catch (error) {
    console.error('Erro ao carregar text.json:', error);
  }
}

  /**
   * Calcula a data de hoje menos dez dias corridos, ajustando para não cair em fim de semana
   * @returns {string} Data formatada DD/MM/YYYY
   */
  function calcularDataMenosDezDias() {
    const spanPrazo = document.getElementById(
      'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento'
    );
    if (!spanPrazo) return '';

    const [dia, mes, ano] = spanPrazo.innerText.trim().split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() - 10);

    // Ajuste para fim de semana
    if (data.getDay() === 6) {
      data.setDate(data.getDate() - 1);
    } else if (data.getDay() === 0) {
      data.setDate(data.getDate() + 1);
    }

    const d = data.getDate().toString().padStart(2, '0');
    const m = (data.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${data.getFullYear()}`;
  }

  /**
   * Preenche o campo de data de tratamento com a data calculada
   */
  function preencherDataTratamento() {
    const campoData = document.getElementById(
      'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtDataTratamento'
    );
    if (campoData) {
      campoData.value = calcularDataMenosDezDias();
    }
  }

  /**
   * Gera e insere o texto de mensagem no campo de tramitação
   */
function preencherMensagem() {
  const tagsField = document.getElementById(
    'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTags'
  );
  const mensagemField = document.getElementById(
    'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtMensagem'
  );

  if (!mensagemField || !tagsField || !mensagensConfig) return;

  const dataLimite = calcularDataMenosDezDias();

  // pegar a mensagem direto na chave "Tramitar"
  let template = mensagensConfig.Tramitar;

  // substituir placeholders
  template = template.replace('{SECRETARIA}', tagsField.value);
  template = template.replace('{PRAZO}', dataLimite);

  mensagemField.value = template;

  mensagemField.style.width = '515px';
  mensagemField.style.height = '1036px';
}

  /**
   * Cria e insere o painel de seleção de secretarias e botão de tramitar
   */
function criarPainelPontosFocais() {
  const painel = document.createElement('div');
  painel.style.display = 'block';
  painel.style.marginBottom = '20px';
  painel.style.padding = '15px';
  painel.style.backgroundColor = '#fff';
  painel.style.border = '1px solid #ddd';
  painel.style.borderRadius = '4px';
  painel.className = 'painel-pontos-focais';

  // Construir options dinamicamente
  let optionsHtml = `<option value="">Escolha uma Secretaria</option>`;

  for (const sigla in listaSecretariasEpontosFocais) {
    if (listaSecretariasEpontosFocais.hasOwnProperty(sigla)) {
      const nomes = listaSecretariasEpontosFocais[sigla];
      // nomes[0] é o nome completo da secretaria, segundo seu JSON
      optionsHtml += `<option value="${sigla}">${nomes[0]}</option>`;
    }
  }

  painel.innerHTML = `
    <div class="header">
      <h4>Pontos Focais</h4>
    </div>
    <div class="body">
      <label for="secretariasList">Selecione a Secretaria</label>
      <select id="secretariasList" style="width: 100%; padding: 8px; margin-bottom: 10px;">
        ${optionsHtml}
      </select>

      <label>Nome(s) relacionado(s)</label>
      <ul id="nomesSecretaria"></ul>

      <button id="autotramitar">Tramitar</button>
    </div>
  `;

  const container = document.querySelector('.col-md-6.col-md-push-6.hidden-print');
  if (container) {
    container.prepend(painel);
  }
}

  /**
   * Exibe os nomes associados à secretaria selecionada
   */
  function exibirNomes() {
    const select = document.getElementById('secretariasList');
    const ul = document.getElementById('nomesSecretaria');
    ul.innerHTML = '';
    const sigla = select.value;

    if (sigla && listaSecretariasEpontosFocais[sigla]) {
      listaSecretariasEpontosFocais[sigla].forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome;
        ul.appendChild(li);
      });
    }
  }

  /**
   * Processa o autotramitar: adiciona nomes automaticamente
   */
  function configurarAutotramitar() {
    const botao = document.getElementById('autotramitar');
    botao.addEventListener('click', () => {
      const sigla = document.getElementById('secretariasList').value;
      const nomes = listaSecretariasEpontosFocais[sigla] || [];
      if (!nomes.length) {
        alert('Selecione uma secretaria válida!');
        return;
      }

      const tabelaSelector =
        "#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_grdUsuariosUnidades";

      function getNomesNaTabela() {
        const tabela = document.querySelector(tabelaSelector);
        if (!tabela) return [];
        const spans = tabela.querySelectorAll(
          "span[id^='ConteudoForm_ConteudoGeral_ConteudoFormComAjax_grdUsuariosUnidades_lblNomeItem']"
        );
        return Array.from(spans).map(span =>
          span.textContent.trim().replace(' (Unidade)', '')
        );
      }

      function adicionarNomePorIndice(index = 0) {
        if (index >= nomes.length) {
          alert('Todos os nomes foram verificados e adicionados!');
          return;
        }

        const nomesAtuais = getNomesNaTabela();
        const nome = nomes[index];
        if (nomesAtuais.includes(nome)) {
          return adicionarNomePorIndice(index + 1);
        }

        const input = document.getElementById('selectize_0');
        const botaoAdd = document.getElementById(
          'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_btnIncluirUsuario'
        );

        if (!input || !botaoAdd) {
          alert('Erro: Elementos necessários não encontrados.');
          return;
        }

        input.value = nome;
        input.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          botaoAdd.click();

          setTimeout(() => adicionarNomePorIndice(index + 1), 3000);
        }, 500);
      }

      adicionarNomePorIndice();
    });
  }

  /**
   * Inicializa eventos e comportamentos do script
   */
async function init() {
  await carregarConfig();
  await carregarMensagens();
  preencherDataTratamento();
  preencherMensagem();
  criarPainelPontosFocais();

    document
      .getElementById('secretariasList')
      .addEventListener('change', exibirNomes);

    configurarAutotramitar();

    // Salva/restaura seleção de secretaria
    const select = document.getElementById('secretariasList');
    const salvo = localStorage.getItem('secretariaSelecionada');
    if (salvo) {
      select.value = salvo;
      exibirNomes();
    }
    select.addEventListener('change', () => {
      localStorage.setItem('secretariaSelecionada', select.value);
    });
  }

  // Dispara inicialização após carregamento da página
  window.addEventListener('load', init);
})();
