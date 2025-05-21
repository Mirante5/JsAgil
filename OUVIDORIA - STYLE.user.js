// ==UserScript==
// @name         OUVIDORIA - STYLE
// @namespace    http://tampermonkey.net/
// @version      6.1
// @description  Personaliza o estilo do loading na página de ouvidoria.
// @author       You
// @match        *://*falabr.cgu.gov.br/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @downloadURL  https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20STYLE.user.js
// @updateURL    https://github.com/Mirante5/JsAgil/raw/refs/heads/main/OUVIDORIA%20-%20STYLE.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Função para criar o SVG do loading
    function criarSVG() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="25" y="85">
                        <animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                    </rect>
                    <rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="85" y="85">
                        <animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                    </rect>
                    <rect fill="#43B4FF" stroke="#43B4FF" stroke-width="15" width="30" height="30" x="145" y="85">
                        <animate attributeName="opacity" calcMode="spline" dur="2.5" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                    </rect>
                </svg>`;
    }

    // Função para criar o texto "JSÀgil" com animação
    function criarTextoJSAGIL() {
        return `<div style="font-size: 24px; font-weight: bold; color: #fff; margin-top: 5px;">
                    JS<span id="rotatingO" style="display: inline-block; transition: transform 0.3s ease;">|</span>Àgil 6.1
                </div>`;
    }

    // Função para criar o texto "By Lucas Emiliano"
    function criarMadeBy() {
        return `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 5px;">
                    By Lucas Emiliano
                </div>`;
    }

    // Função para animar o "O" rotacionado usando requestAnimationFrame
    function animarRotatingO(rotatingO) {
        const frames = ["|", "/", "—", "\\"];
        let frameIndex = 0;
        let lastTime = 0;
        const intervalo = 500; // 500ms entre frames

        function atualizar(timestamp) {
            if (timestamp - lastTime >= intervalo) {
                rotatingO.textContent = frames[frameIndex];
                frameIndex = (frameIndex + 1) % frames.length;
                lastTime = timestamp;
            }
            requestAnimationFrame(atualizar);
        }

        requestAnimationFrame(atualizar);
    }

    // Função principal para modificar o loading
    function modificarLoading() {
        const lockPane = document.getElementById("skm_LockPane");
        const lockPaneText = document.getElementById("skm_LockPaneText");

        // Verifica se os elementos existem
        if (!lockPane || !lockPaneText) {
            console.warn("Elementos #skm_LockPane ou #skm_LockPaneText não encontrados.");
            return;
        }

        // Monta o conteúdo do loading
        const svg = criarSVG();
        const textoJSAGIL = criarTextoJSAGIL();
        const madeBy = criarMadeBy();
        lockPaneText.innerHTML = "Carregando.... Aguarde um momento.<br><br>" + svg + textoJSAGIL + madeBy;

        // Ajusta o tamanho do SVG
        const svgElement = lockPaneText.querySelector("svg");
        if (svgElement) {
            svgElement.style.width = "150px";
            svgElement.style.height = "75px";
        }

        // Aplica estilos ao lockPane
        Object.assign(lockPane.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo semi-transparente
            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' version=\'1.1\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' xmlns:svgjs=\'http://svgjs.dev/svgjs\' width=\'1440\' height=\'560\' preserveAspectRatio=\'none\' viewBox=\'0 0 1440 560\'%3e%3cg mask=\'url(%26quot%3b%23SvgjsMask1014%26quot%3b)\' fill=\'none\'%3e%3cpath d=\'M739.83 624.67C889.34 604.92 949.07 276 1220.79 260.57 1492.51 245.14 1576.13 116.55 1701.75 114.97\' stroke=\'rgba(223%2c33%2c33%2c0.58)\' stroke-width=\'2\'%3e%3c/path%3e%3cpath d=\'M796.82 634.15C959.43 588.93 1014.12 138.25 1251.7 135.27 1489.28 132.29 1579.96 353.31 1706.58 359.27\' stroke=\'rgba(223%2c33%2c33%2c0.58)\' stroke-width=\'2\'%3e%3c/path%3e%3cpath d=\'M754.54 624.4C846.89 606.62 822.39 372.21 1033.47 371.96 1244.55 371.71 1447.54 510.9 1591.33 511.96\' stroke=\'rgba(223%2c33%2c33%2c0.58)\' stroke-width=\'2\'%3e%3c/path%3e%3cpath d=\'M720.24 561.3C811.1 533.77 778.41 275.54 969.38 274.68 1160.36 273.82 1339.01 402.44 1467.67 403.48\' stroke=\'rgba(223%2c33%2c33%2c0.58)\' stroke-width=\'2\'%3e%3c/path%3e%3cpath d=\'M404.08 623.4C574.43 601.37 675.4 211.79 953.79 211.23 1232.17 210.67 1354.09 441.56 1503.49 446.43\' stroke=\'rgba(223%2c33%2c33%2c0.58)\' stroke-width=\'2\'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id=\'SvgjsMask1014\'%3e%3crect width=\'1440\' height=\'560\' fill=\'white\'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e")',
            backgroundSize: "cover",
            backgroundPosition: "center"
        });
        // Inicia a animação do "O"
        const rotatingO = document.getElementById("rotatingO");
        if (rotatingO) animarRotatingO(rotatingO);
    }

    // Configura o observador de mutações
    function iniciarObserver() {
        const lockPane = document.getElementById("skm_LockPane");
        if (!lockPane) {
            console.warn("Elemento #skm_LockPane não encontrado para observação.");
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class" && !lockPane.classList.contains("LockOff")) {
                    modificarLoading();
                }
            });
        });

        observer.observe(lockPane, { attributes: true });
    }

    // Inicia o script
    iniciarObserver();
})();
