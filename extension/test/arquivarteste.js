// script.js

// 1) LISTA DE SELECTORS QUE PRECISAMOS PARA COMEÇAR
const SELECTORS_NECESSARIOS = [
  'label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoArquivamento"]',
  '#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaArquivamento',
  '#ConteudoForm_ConteudoGeral_ConteudoFormComAjax_infoManifestacoes_infoManifestacao_txtNumero'
];

/**
 * Aguarda até que todos os elementos especificados pelos selectors estejam disponíveis no DOM.
 * 
 * @param {string[]} selectors - Lista de seletores CSS dos elementos a serem aguardados.
 * @param {number} [intervalo=300] - Intervalo em milissegundos entre as verificações.
 * @param {number} [timeout=10000] - Tempo máximo em milissegundos para aguardar os elementos.
 * @returns {Promise<void>} - Resolve quando todos os elementos estão disponíveis, ou rejeita em caso de timeout.
 */
function aguardarElementos(selectors, intervalo = 300, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const inicio = Date.now();

    const timer = setInterval(() => {
      const todosExistem = selectors.every(sel => document.querySelector(sel));
      if (todosExistem) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - inicio > timeout) {
        clearInterval(timer);
        reject(new Error('Timeout: elementos necessários não apareceram dentro do prazo.'));
        return;
      }
    }, intervalo);
  });
}

// 3) FUNÇÃO PARA CRIAR O LABEL E O SELECT (SE AINDA NÃO EXISTIREM)
function criarDropdownJustificativas(jsonJustificativas) {
  // Verifica se já existe dropdown
  if (document.getElementById('justificativasBox')) {
    console.log('Dropdown já existe na página.');
    return;
  }

  // Localiza o label pai (Motivo de Arquivamento) e o input de justificativa
  const motivoArquivamentoLabel = document.querySelector(
    'label[for="ConteudoForm_ConteudoGeral_ConteudoFormComAjax_cmbMotivoArquivamento"]'
  );
  const justificativaInput = document.getElementById(
    'ConteudoForm_ConteudoGeral_ConteudoFormComAjax_txtJustificativaArquivamento'
  );

  if (!motivoArquivamentoLabel || !justificativaInput) {
    console.error('Ao criar: elementos-base não encontrados.');
    return;
  }

  console.log('Criando elemento <label> e <select> na página...');

  // Cria o <label> da justificativa
  const labelJustificativa = document.createElement('label');
  labelJustificativa.setAttribute('for', 'justificativasBox');
  labelJustificativa.textContent = 'Justificativa do Arquivamento:';
  labelJustificativa.className = 'justificativas-label';

  // Cria o <select>
  const justificativasBox = document.createElement('select');
  justificativasBox.id = 'justificativasBox';
  justificativasBox.name = 'justificativasBox';
  justificativasBox.className = 'justificativas-dropdown';

  // Preenche o <select> com dados do JSON
  if (Array.isArray(jsonJustificativas) && jsonJustificativas.every(item => item && typeof item.text === 'string' && typeof item.value === 'string')) {
    jsonJustificativas.forEach(({ text, value }) => {
      const option = document.createElement('option');
      option.value = value;
      option.text = text;
      justificativasBox.appendChild(option);
    });
  } else {
    console.warn('JSON de justificativas inválido. Nenhuma opção será inserida.');
  }

  // Insere no DOM logo após o label de motivo de arquivamento
  const parentNode = motivoArquivamentoLabel.parentNode;
  parentNode.appendChild(labelJustificativa);
  parentNode.appendChild(justificativasBox);

  // Faz a troca automática do input de justificativa quando o usuário selecionar uma opção
  // Synchronize the value of the input field with the selected option in the dropdown.
  // This ensures that the user's selection in the dropdown is reflected in the input field.
  justificativasBox.addEventListener('change', () => {
    justificativaInput.value = justificativasBox.value || '';
  });

  console.log('Dropdown e label criados com sucesso no DOM.');
}
function verificarEAjustarDropdown(jsonJustificativas) {
  if (!document.getElementById('justificativasBox')) {
    console.warn('Dropdown não encontrado após criação. Tentando criar novamente...');
    criarDropdownJustificativas(jsonJustificativas);
  } else {
    console.log('Dropdown verificado e existente.');
  }
}

// Função para buscar o JSON de justificativas
function fetchJustificativasJSON() {
  return fetch(chrome.runtime.getURL('justificativas.json'))
    .then(response => response.json())
    .catch(err => {
      console.error('Falha ao obter JSON de justificativas:', err);
      // Fallback: retorna um array padrão de justificativas
      return [
        { text: 'Justificativa Padrão 1', value: 'padrao1' },
        { text: 'Justificativa Padrão 2', value: 'padrao2' }
      ];
    });
}

// 5) FLUXO PRINCIPAL
document.addEventListener('DOMContentLoaded', () => {
  // Add styles for justificativas only once
  if (!document.querySelector('.justificativas-styles')) {
    const style = document.createElement('style');
    style.className = 'justificativas-styles';
    style.textContent = `
      .justificativas-label {
        display: block;
        margin-top: 16px;
        font-weight: bold;
      }
      .justificativas-dropdown {
        width: 100%;
        padding: 8px;
        margin-bottom: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }
  // Inicia o fluxo: primeiro, aguardar os elementos básicos aparecerem
  aguardarElementos(SELECTORS_NECESSARIOS, 300, 10000)
  // Inicia o fluxo: primeiro, aguardar os elementos básicos aparecerem
  aguardarElementos(SELECTORS_NECESSARIOS, 300, 10000)
    .then(() => {
      console.log('Elementos básicos carregados na página. Buscando JSON de justificativas...');
      // Busca o JSON externo de justificativas
      return fetchJustificativasJSON();
    })
    .then(justificativasArray => {
      if (!Array.isArray(justificativasArray) || justificativasArray.length === 0) {
        console.warn('JSON de justificativas vazio ou inválido. Nenhuma opção será inserida.');
        return; // Skip dropdown creation if the array is invalid or empty
      }
      // Cria o dropdown (ou logo saltará a mensagem de “já existe”)
      criarDropdownJustificativas(justificativasArray);
      // Verifica novamente após criar
      verificarEAjustarDropdown(justificativasArray);
    })
    .catch(err => {
      console.error('Não foi possível concluir o fluxo de criação de dropdown:', err);
    });
});
