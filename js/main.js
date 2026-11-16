// Clube Doguês — prévia Patron
(function () {
  'use strict';
  var ZAP = 'https://wa.me/551129858566';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Aberto agora (horário publicado no Google, fuso de São Paulo) ---------- */
  // CONFIRMAR: o Instagram do clube diz seg a sex 7h–20h; o Google diz 8h–19h.
  var HORARIO = { 0: null, 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [9, 17] };
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function agoraSP() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), hora: (+p.hour % 24) + (+p.minute) / 60 };
  }
  function hTxt(h) { return h + 'h'; }
  function atualizaSelo() {
    var a = agoraSP(), h = HORARIO[a.dia], aberto = !!h && a.hora >= h[0] && a.hora < h[1], txt;
    if (aberto) txt = 'Aberto agora, até as ' + hTxt(h[1]);
    else if (h && a.hora < h[0]) txt = 'Fechado, abre hoje às ' + hTxt(h[0]);
    else {
      var d = a.dia, n = 0;
      do { d = (d + 1) % 7; n++; } while (!HORARIO[d]);
      txt = 'Fechado, abre ' + (n === 1 ? 'amanhã' : DIAS[d]) + ' às ' + hTxt(HORARIO[d][0]);
    }
    [['#selo-aberto', '#selo-aberto-txt'], ['#selo-aberto-2', '#selo-aberto-2 span']].forEach(function (par) {
      var s = $(par[0]); if (!s) return;
      s.hidden = false; s.classList.toggle('fechado', !aberto);
      $(par[1]).textContent = par[0] === '#selo-aberto' && !aberto ? 'Fechado agora' : (par[0] === '#selo-aberto' ? 'Aberto agora' : txt);
      s.title = txt;
    });
    $$('.horarios tr').forEach(function (tr) { tr.classList.toggle('hoje', +tr.dataset.dia === a.dia); });
    return a;
  }
  var agora = atualizaSelo();
  setInterval(atualizaSelo, 60000);

  /* ---------- Um dia no clube ---------- */
  var MOMENTOS = [
    { t: 0.14, titulo: 'A manhã começa lá fora', texto: 'O dia abre com brincadeiras ao ar livre e circuitos de atividades.', detalhe: 'Cada cão brinca com a turma do seu porte.' },
    { t: 0.42, titulo: 'Almoço às 11h30 e descanso', texto: 'Depois do almoço, todos relaxam ao som de música suave.', detalhe: 'A alimentação segue as orientações que você passar.' },
    { t: 0.70, titulo: 'Tarde de jogos e novos sabores', texto: 'Diversão e aprendizado misturados, com jogos e sabores novos para explorar. As atividades mudam conforme o clima, sempre para estimular corpo e mente.', detalhe: '' },
    { t: 0.93, titulo: 'O dia termina em calma', texto: 'Para quem fica no hotel, jantar e procedimentos relaxantes preparam uma boa noite de sono. No day care, é hora de voltar para casa.', detalhe: 'O objetivo do clube: cada cão terminar o dia feliz e relaxado.' }
  ];
  var dia = $('.dia'), abas = $$('.dia-abas [role=tab]'), painel = $('#painel-dia'), astro = $('#astro'), trajeto = $('#trajeto');
  function mostra(i, foco) {
    var m = MOMENTOS[i];
    abas.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    painel.setAttribute('aria-labelledby', 'aba-' + i);
    $('#dia-titulo').textContent = m.titulo; $('#dia-texto').textContent = m.texto; $('#dia-detalhe').textContent = m.detalhe;
    dia.dataset.momento = i;
    try { var pt = trajeto.getPointAtLength(trajeto.getTotalLength() * m.t); astro.style.transform = 'translate(' + pt.x + 'px,' + pt.y + 'px)'; } catch (e) {}
    painel.classList.remove('troca'); void painel.offsetWidth; painel.classList.add('troca');
    if (foco) abas[i].focus();
  }
  abas.forEach(function (b, i) {
    b.addEventListener('click', function () { mostra(i); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); mostra(0, true); }
      else if (e.key === 'End') { e.preventDefault(); mostra(abas.length - 1, true); }
      else if (d) { e.preventDefault(); mostra((i + d + abas.length) % abas.length, true); }
    });
  });
  // começa no momento do dia em que o visitante está
  mostra(agora.hora < 11.5 ? 0 : agora.hora < 13.5 ? 1 : agora.hora < 17.5 ? 2 : 3);

  /* ---------- Matrícula ---------- */
  var estado = { nome: '', porte: '', idade: '', faixa: '', servico: [] };
  var VAC = 'Carteira de vacinação: Raiva, V8 ou V10 e Tosse Canina, assinada por veterinário';
  function lista() {
    var l = [VAC, 'Exame parasitológico e teste Snap Giardia (fezes)', 'Controle de pulgas e carrapatos em dia'];
    if (estado.faixa === 'b' || estado.faixa === 'c') l.push('Pré-avaliação física e comportamental (cães a partir de 6 meses)');
    if (estado.faixa === 'c') l.push('Cães acima de 8 meses devem ser castrados');
    if (estado.servico.indexOf('Hotel') > -1) l.push('Hotel: se ele nunca veio ao clube, a avaliação é marcada com pelo menos 3 dias de antecedência');
    if (estado.servico.indexOf('Adestramento') > -1) l.push('Adestramento: começa com uma entrevista comportamental, em casa ou na sede');
    return l;
  }
  function mensagem() {
    var n = estado.nome.trim();
    var m = 'Olá! Vi o site do Clube Doguês e quero matricular ' + (n ? 'o(a) ' + n : 'meu cão') + '.';
    if (estado.porte) m += '\nPorte: ' + estado.porte.toLowerCase() + '.';
    if (estado.idade) m += '\nIdade: ' + estado.idade.toLowerCase() + '.';
    if (estado.servico.length) m += '\nProcuro: ' + estado.servico.join(', ').toLowerCase() + '.';
    m += '\nComo funciona a avaliação e o primeiro dia?';
    return m;
  }
  function poe(id, valor, padrao) { var e = $(id); e.textContent = valor || padrao; e.classList.toggle('vazio', !valor); }
  function desenha() {
    poe('#cart-nome', estado.nome.trim(), 'seu cão');
    poe('#cart-porte', estado.porte, 'a escolher');
    poe('#cart-idade', estado.idade, 'a escolher');
    poe('#cart-servico', estado.servico.join(', '), 'a escolher');
    var ul = $('#cart-lista'); ul.textContent = '';
    lista().forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    $('#btn-zap').href = ZAP + '?text=' + encodeURIComponent(mensagem());
  }
  $('#cao-nome').addEventListener('input', function (e) { estado.nome = e.target.value; desenha(); });
  $('#form-matricula').addEventListener('submit', function (e) { e.preventDefault(); });
  $$('.chips').forEach(function (g) {
    var grupo = g.dataset.grupo, multi = g.hasAttribute('data-multi');
    $$('.chip', g).forEach(function (c) {
      c.addEventListener('click', function () {
        var on = c.getAttribute('aria-pressed') !== 'true';
        if (!multi) $$('.chip', g).forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', on);
        if (multi) estado.servico = $$('.chip[aria-pressed=true]', g).map(function (o) { return o.textContent; });
        else { estado[grupo] = on ? c.textContent : ''; if (grupo === 'idade') estado.faixa = on ? c.dataset.faixa : ''; }
        desenha();
      });
    });
  });
  desenha();

  /* ---------- Botão flutuante: aparece depois da primeira tela, some sobre a matrícula e o rodapé ---------- */
  var flut = $('.flutuante'), hero = $('.hero'), some = [$('#matricula'), $('.rodape')], dentro = new Set(), passou = false;
  function ajusta() { flut.classList.toggle('visivel', passou && dentro.size === 0); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { passou = !es[0].isIntersecting; ajusta(); }, { threshold: 0.15 }).observe(hero);
    var o2 = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? dentro.add(e.target) : dentro.delete(e.target); }); ajusta(); }, { threshold: 0.25 });
    some.forEach(function (s) { o2.observe(s); });
  } else { flut.classList.add('visivel'); }
})();
