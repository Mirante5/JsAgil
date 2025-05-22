(function() {
  'use strict';

  // calcula prazo = hoje -10 dias, ajustando fim de semana
  function calcularDataMenosDezDias() {
    const dataTextoElement = document
      .getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtPrazoAtendimento');
    if (!dataTextoElement) {
      console.error('Elemento de data do prazo não encontrado.');
      const hoje = new Date();
      // Fallback para hoje se o elemento não existir, apenas para evitar erro total
      const d = `0${hoje.getDate()}`.slice(-2);
      const m = `0${hoje.getMonth() + 1}`.slice(-2);
      return `${d}/${m}/${hoje.getFullYear()}`;
    }
    const dataTexto = dataTextoElement.innerText.trim();
    if (!dataTexto || !dataTexto.includes('/')) {
        console.error('Formato de data inválido ou data não encontrada:', dataTexto);
        // Fallback para hoje se a data estiver mal formatada
        const hoje = new Date();
        const d = `0${hoje.getDate()}`.slice(-2);
        const m = `0${hoje.getMonth() + 1}`.slice(-2);
        return `${d}/${m}/${hoje.getFullYear()}`;
    }
    const [dd, mm, yyyy] = dataTexto.split('/');
    const data = new Date(yyyy, mm - 1, dd); // Mês é 0-indexado
    data.setDate(data.getDate() - 10);
    if (data.getDay() === 6) data.setDate(data.getDate() - 1); // Sábado
    else if (data.getDay() === 0) data.setDate(data.getDate() + 1); // Domingo (ou data.setDate(data.getDate() - 2) se for para segunda anterior)
    
    // Ajuste para garantir que caia em dia útil (caso o +1 ou -1 caia no fds de novo - raro com -10d)
    if (data.getDay() === 6) data.setDate(data.getDate() - 1); 
    else if (data.getDay() === 0) data.setDate(data.getDate() + 1); // Ou -2 se quiser a sexta anterior

    const d = `0${data.getDate()}`.slice(-2);
    const m = `0${data.getMonth() + 1}`.slice(-2);
    return `${d}/${m}/${data.getFullYear()}`;
  }

  async function carregarJSON(path) {
    try {
      const url = chrome.runtime.getURL(path);
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(`Erro ao carregar ${path}: ${resp.status} ${resp.statusText}`);
        return null;
      }
      return await resp.json();
    } catch (e) {
      console.error(`Erro carregando ${path}:`, e);
      return null;
    }
  }

  window.addEventListener('load', async function() {
    const campoData = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtDataTratamento');
    if (campoData) {
        campoData.value = calcularDataMenosDezDias();
    }

    const campoTags = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtTags');
    const campoTextoTramitar = document.getElementById('ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtMensagem');

    // painel de pontos focais
    const painel = document.createElement('div');
    painel.innerHTML = `
      <div style="padding:10px;background:#f5f5f5;border:1px solid #ddd;border-radius:3px">
        <h4>Pontos Focais</h4>
      </div>
      <div>
        <label for="secretariasList">Selecione a Secretaria</label>
        <select id="secretariasList" style="width:100%;padding:6px;margin:8px 0;"></select>
        <label>Nome(s) relacionado(s)</label>
        <ul id="nomesSecretaria" style="list-style:none;padding-left:0; margin-top: 5px; border: 1px solid #ccc; padding: 5px; min-height: 50px; background: #fff;"></ul>
        <button id="autotramitar" type="button" style="padding:8px 15px;margin-top:10px;">Tramitar</button>
      </div>
    `;
    const container = document.querySelector('.col-md-6.col-md-push-6.hidden-print');
    if (container) {
        container.insertBefore(painel, container.firstChild);
    } else {
        console.error('Container para o painel não encontrado.');
        // Opcional: adicionar o painel ao body como fallback ou logar erro
        // document.body.appendChild(painel); 
    }

    // Carrega dados
    const textConfig = await carregarJSON('config/text.json');
    const pontosFocais = await carregarJSON('config/pontosfocais.json');

    if (!pontosFocais) {
        console.error("Falha ao carregar pontosfocais.json. Funcionalidade de pontos focais não estará disponível.");
        // Poderia desabilitar ou esconder o painel aqui
        return; 
    }
    if (!textConfig) {
        console.error("Falha ao carregar text.json. Funcionalidade de autotramitar pode não funcionar corretamente.");
    }

    const template = textConfig?.Tramitar?.['Encaminhamento para Pontos Focais'] ?? 
        'Prezados(as) Senhores(as) da {SECRETARIA},\n\nEncaminhamos a presente demanda para análise e providências cabíveis.\n\nPrazo para atendimento: {PRAZO}\n\nAtenciosamente,';


    // popula select de secretarias
    const selectSec = document.getElementById('secretariasList');
    if (selectSec) {
        const placeholder = document.createElement('option');
        placeholder.text = 'Escolha uma Secretaria';
        placeholder.value = '';
        selectSec.appendChild(placeholder);

        Object.keys(pontosFocais).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key; // e.g., "SESU"
            opt.text = pontosFocais[key].descricao || key; // Usa a descrição se disponível, senão a chave
            selectSec.appendChild(opt);
        });
    }


    // exibe nomes
    function exibirNomes() {
      const ul = document.getElementById('nomesSecretaria');
      if (!ul) return;
      const key = selectSec.value;
      ul.innerHTML = ''; // Limpa nomes anteriores
      if (key && pontosFocais[key] && pontosFocais[key].equipe) { // Verifica se a chave existe e tem a propriedade equipe
        pontosFocais[key].equipe.forEach(nome => {
          const li = document.createElement('li');
          li.textContent = nome;
          ul.appendChild(li);
        });
      }
    }

    // função de auto-tramitar
    function configurarAutotramitar() { // Renomeada para clareza, pois ela configura o listener
      const botaoAutotramitar = document.getElementById('autotramitar');
      if (botaoAutotramitar) {
          botaoAutotramitar.addEventListener('click', () => {
            if (campoTextoTramitar && campoTags && selectSec) {
              const secretariaKey = selectSec.value; // Chave da secretaria, ex: "SESU"
              const secretariaSelecionada = pontosFocais[secretariaKey];

              if (!secretariaSelecionada) {
                  alert("Por favor, selecione uma secretaria válida.");
                  return;
              }
              
              // Usar a descrição da secretaria no template, ou a chave se não houver descrição
              const nomeSecretariaParaTemplate = secretariaSelecionada.descricao || secretariaKey;
              
              // Atualizar o campoTags com a sigla/chave da secretaria
              campoTags.value = secretariaKey; 

              const prazo = calcularDataMenosDezDias();
              campoTextoTramitar.value = template
                .replace(/\{SECRETARIA\}/g, nomeSecretariaParaTemplate)
                .replace(/\{PRAZO\}/g, prazo);
              
              // Ajustes de estilo (opcional, mas estavam no seu código)
              campoTextoTramitar.style.width = '515px'; // Considere usar % ou classes CSS
              campoTextoTramitar.style.height = '1036px';// Considere usar % ou classes CSS
            } else {
                if (!campoTextoTramitar) console.error("Campo de texto para tramitar não encontrado.");
                if (!campoTags) console.error("Campo de tags não encontrado.");
                if (!selectSec) console.error("Select de secretarias não encontrado.");
            }
          });
      }
    }

    // eventos
    if (selectSec) {
        selectSec.addEventListener('change', () => {
            exibirNomes();
            localStorage.setItem('secSelecionada', selectSec.value);
            // Se quiser que campoTags seja atualizado dinamicamente com a sigla da secretaria:
            // if (campoTags) {
            //   campoTags.value = selectSec.value; // Coloca a sigla (ex: "SESU") no campo tags
            // }
        });

        // mantém seleção após reload e exibe nomes
        const salva = localStorage.getItem('secSelecionada');
        if (salva) {
            selectSec.value = salva;
        }
        exibirNomes(); // Exibe nomes para a secretaria carregada do localStorage ou placeholder
    }
    
    configurarAutotramitar(); // Configura o listener do botão de tramitar

  });

})();