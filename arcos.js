/* HARD ELETRIC — feedback de arco elétrico no botão.
   Global e idêntico nas cinco páginas. Traço fino, vazado, ramificado e
   irregular — o oposto do raio sólido da marca. Azul de instrumento.

   Dispara SÓ em botão, e SÓ em clique completo:
   · o gatilho é 'click', não 'pointerdown'. No celular, encostar para rolar
     a tela cancela o clique, então rolar não acende mais nada.
   · o alvo precisa casar com SELETOR_BOTAO. Um toque no meio do texto, na
     foto ou no fundo não produz arco.
   Para transformar qualquer elemento em gatilho, basta marcá-lo com
   data-arco no HTML.

   Geometria: contêiner fixed no centro do botão com translate(-50%,-50%);
   svg com viewBox centrado na origem e todos os arcos partindo de 0,0.
   A animação usa só opacity e scale — nenhum translate. */
(function () {
  if (window.__arcosHardEletric) return;
  window.__arcosHardEletric = true;

  var NS = 'http://www.w3.org/2000/svg';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
  var host = null;
  var ultimo = 0;

  /* O que conta como botão. Links de texto, fotos, títulos e o fundo da
     página ficam de fora de propósito. */
  var SELETOR_BOTAO = [
    'button',
    '[role="button"]',
    '[data-arco]',
    'a[href*="wa.me"]'
  ].join(',');
  var THROTTLE = 120;
  var DURACAO = 320;

  function pegarHost() {
    if (host && host.isConnected) return host;
    host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:visible';
    document.body.appendChild(host);
    return host;
  }

  function aleatorio(min, max) { return min + Math.random() * (max - min); }

  // Polilinha de 3–4 vértices em ângulos quebrados, partindo de 0,0.
  function polilinha(x, y, ang, comp, vertices) {
    var d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
    var cx = x, cy = y, a = ang;
    for (var i = 0; i < vertices; i++) {
      a += aleatorio(-0.72, 0.72);
      var passo = comp / vertices * aleatorio(0.65, 1.35);
      cx += Math.cos(a) * passo;
      cy += Math.sin(a) * passo;
      d += ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1);
    }
    return { d: d, x: cx, y: cy, a: a };
  }

  function traco(d) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'var(--azul-glow, #6FC3FF)');
    p.setAttribute('stroke-width', aleatorio(1, 1.5).toFixed(2));
    p.setAttribute('stroke-linecap', 'round');
    p.style.filter = 'drop-shadow(0 0 3px var(--azul-glow, #6FC3FF))';
    p.style.transformOrigin = 'center';
    return p;
  }

  function disparar(cx, cy) {
    var caixa = document.createElement('div');
    caixa.style.cssText =
      'position:fixed;left:' + cx + 'px;top:' + cy + 'px;width:100px;height:100px;' +
      'transform:translate(-50%,-50%);transform-origin:center;pointer-events:none;overflow:visible';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-50 -50 100 100');
    svg.style.cssText = 'width:100px;height:100px;display:block;overflow:visible;transform-origin:center';

    var g = document.createElementNS(NS, 'g');
    g.style.transformOrigin = 'center';

    // Arcos distribuídos em volta do ponto, em todas as direções.
    var quantos = Math.round(aleatorio(3, 5));
    var base = Math.random() * Math.PI * 2;
    for (var i = 0; i < quantos; i++) {
      var ang = base + (i / quantos) * Math.PI * 2 + aleatorio(-0.45, 0.45);
      var comp = aleatorio(12, 28);
      var arco = polilinha(0, 0, ang, comp, Math.random() < 0.5 ? 3 : 4);
      g.appendChild(traco(arco.d));
      if (i === 0 || Math.random() < 0.45) {
        var bif = polilinha(arco.x, arco.y, arco.a + aleatorio(-1.4, 1.4), comp * 0.42, 2);
        g.appendChild(traco(bif.d));
      }
    }

    svg.appendChild(g);
    caixa.appendChild(svg);
    pegarHost().appendChild(caixa);

    var anim = g.animate(
      [
        { opacity: 1, transform: 'scale(0.86)' },
        { opacity: 0.9, transform: 'scale(1)', offset: 0.3 },
        { opacity: 0, transform: 'scale(1.08)' }
      ],
      { duration: DURACAO, easing: 'cubic-bezier(0.22,0.61,0.36,1)', fill: 'forwards' }
    );
    anim.onfinish = function () { if (caixa.parentNode) caixa.parentNode.removeChild(caixa); };
  }

  document.addEventListener('click', function (e) {
    if (reduz.matches) return;

    var botao = e.target && e.target.closest && e.target.closest(SELETOR_BOTAO);
    if (!botao) return;

    var agora = e.timeStamp || Date.now();
    if (agora - ultimo < THROTTLE) return;
    ultimo = agora;

    // Sempre do centro do botão: vale igual para toque, mouse e teclado.
    var r = botao.getBoundingClientRect();
    disparar(r.left + r.width / 2, r.top + r.height / 2);

    var antes = botao.style.boxShadow;
    botao.style.boxShadow = '0 0 0 2px var(--azul-glow, #6FC3FF)';
    setTimeout(function () { botao.style.boxShadow = antes; }, DURACAO);
  }, { passive: true });

})();
