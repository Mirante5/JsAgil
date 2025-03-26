// ==UserScript==
// @name         OUVIDORIA - STYLE
// @namespace    http://tampermonkey.net/
// @version      5.5
// @description  try to take over the world!
// @author       You
// @match        *://*falabr.cgu.gov.br/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @downloadURL https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20STYLE.user.js
// @updateURL   https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20STYLE.user.js
// ==/UserScript==

(function() {
    'use strict';
// Função para modificar o loading e centralizá-lo
function modificarLoading() {
  const lockPane = document.getElementById("skm_LockPane");
  const lockPaneText = document.getElementById("skm_LockPaneText");

  // Criando o SVG personalizado para o loading
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="25" y="85"><animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect><rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="85" y="85"><animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect><rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="145" y="85"><animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect></svg>`;

  // Criando o texto "JSAGIL" com a letra "O" rotacionada dinamicamente
  const textoJSAGIL = `<div style="font-size: 24px; font-weight: bold; margin-top: 1px;">
                          JS<span id="rotatingO" style="display: inline-block;">|</span>Àgil 5.5
                        </div>`;
  const madeby = `<div style="font-size: 12px; font-weight: normal; font-style: italic; margin-top: 1px;">
                          By Lucas Emiliano
                        </div>`;

  // Alterando o conteúdo do loading
  lockPaneText.innerHTML = "Carregando.... Aguarde um momento.<br><br>" + svg + textoJSAGIL + madeby;

    // Aplicando estilos para centralizar e manter o loading fixo(¬_¬")
  lockPane.style.position = "fixed"; // Mantém fixo na tela
  lockPane.style.top = "50%";
  lockPane.style.left = "50%";
  lockPane.style.transform = "translate(-50%, -70%)";
  lockPane.style.width = "100%";
  lockPane.style.height = "100%";
  lockPane.style.display = "flex";
  lockPane.style.justifyContent = "center";
  lockPane.style.alignItems = "center";

  // Ajuste do tamanho do SVG
  const svgElement = lockPaneText.querySelector("svg");
  if (svgElement) {
    svgElement.style.width = "150px";
    svgElement.style.height = "75px";
  }

  // Criando a rotação da letra "O" animada
  const rotatingO = document.getElementById("rotatingO");
  const frames = [" |", "/ ", "—","\\"];
  let frameIndex = 0;

  setInterval(() => {
    rotatingO.textContent = frames[frameIndex];
    frameIndex = (frameIndex + 1) % frames.length;
  }, 500); // Alterna os símbolos a cada ms
}

// Observador para detectar quando o loading for ativado automaticamente
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      const lockPane = document.getElementById("skm_LockPane");

      // Se o elemento está sendo ativado, chamamos a função para modificar o loading
      if (!lockPane.classList.contains("LockOff")) {
        modificarLoading();
      }
    }
  });
});

// Monitorando mudanças no #skm_LockPane
const lockPane = document.getElementById("skm_LockPane");
observer.observe(lockPane, { attributes: true });



})();
