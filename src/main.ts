import './styles.css';

type Project = {
  index: string;
  name: string;
  segment: string;
  description: string;
  category: string;
  artClass: string;
};

const projects: Project[] = [
  {
    index: '01',
    name: 'Estudo 01',
    segment: 'Território & narrativa',
    description: 'Exploração conceitual de como um posicionamento pode ganhar forma visual.',
    category: 'Estratégia · Identidade',
    artClass: 'project-art--casa',
  },
  {
    index: '02',
    name: 'Estudo 02',
    segment: 'Ritmo & presença',
    description: 'Exploração conceitual sobre clareza, ritmo e presença na comunicação.',
    category: 'Conteúdo · Presença',
    artClass: 'project-art--lume',
  },
  {
    index: '03',
    name: 'Estudo 03',
    segment: 'Sistema & conexão',
    description: 'Exploração conceitual de um sistema visual que transforma intenção em linguagem.',
    category: 'Identidade · Conteúdo',
    artClass: 'project-art--entre',
  },
];

const mascot = (className = '', note = '') => `
  <div class="mascot ${className}" aria-label="Mascote novelo da TRAMA">
    <span class="mascot__shadow"></span>
    <svg class="mascot__svg" viewBox="0 0 220 220" role="img" aria-hidden="true">
      <path class="mascot__thread mascot__thread--back" d="M24 173 C-8 139 28 115 5 80 C-14 51 21 18 49 35 C74 51 68 18 102 15 C130 13 142 38 161 33 C192 25 213 48 196 75 C186 91 211 104 201 133 C191 161 163 157 151 181 C136 209 95 207 75 187 C58 170 42 194 24 173Z" />
      <path class="mascot__ball" d="M52 63 C68 34 107 28 135 42 C165 57 179 91 167 123 C157 151 129 169 98 163 C64 157 42 125 45 94 C46 82 48 72 52 63Z" />
      <path class="mascot__line" d="M66 78 C89 104 123 103 151 75 M56 108 C83 90 128 124 157 103 M73 139 C96 118 121 145 146 127 M83 51 C83 78 111 91 138 55" />
      <circle class="mascot__eye" cx="92" cy="92" r="4.5" />
      <circle class="mascot__eye" cx="123" cy="89" r="4.5" />
      <path class="mascot__smile" d="M99 111 C106 117 114 117 120 110" />
      <path class="mascot__limb" d="M49 112 C26 104 19 112 13 127" />
      <path class="mascot__limb" d="M157 111 C179 105 189 111 202 125" />
      <path class="mascot__foot" d="M78 158 C72 180 57 186 45 181 M135 157 C143 178 157 184 170 177" />
      <path class="mascot__thread mascot__thread--front" d="M156 121 C186 134 171 165 195 173 C220 181 221 205 198 212" />
    </svg>
    ${note ? `<span class="mascot__note">${note}</span>` : ''}
  </div>
`;

const sectionLabel = (number: string, label: string, dark = false) => `
  <div class="section-label ${dark ? 'section-label--dark' : ''}">
    <span>${number}</span>
    <span>${label}</span>
  </div>
`;

const arrow = '<span aria-hidden="true">↗</span>';
const whatsappMessage = 'Oi, TRAMA! Acho que minha marca está precisando encontrar o fio certo. Quero contar um pouco sobre ela e entender como vocês podem me ajudar.';
const whatsappLink = `https://wa.me/+5512982034542?text=${encodeURIComponent(whatsappMessage)}`;

const projectCard = (project: Project) => `
  <article class="project-card reveal">
    <div class="project-card__visual ${project.artClass}">
      <div class="project-card__index">${project.index}</div>
      <div class="project-art__shape project-art__shape--one"></div>
      <div class="project-art__shape project-art__shape--two"></div>
      <div class="project-art__line"></div>
      <div class="project-art__word">${project.name}</div>
    </div>
    <div class="project-card__body">
      <div>
        <p class="eyebrow">${project.segment}</p>
        <h3>${project.name}</h3>
      </div>
      <p>${project.description}</p>
      <div class="project-card__meta">
        <span>${project.category}</span>
        <span class="project-card__arrow">${arrow}</span>
      </div>
    </div>
  </article>
`;

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root not found');
}

app.innerHTML = `
  <div class="site-shell">
    <div class="cursor-dot" aria-hidden="true"></div>
    <header class="site-header" data-header>
      <a class="wordmark" href="#inicio" aria-label="TRAMA — início">
        <img src="${import.meta.env.BASE_URL}logotrama.png" alt="TRAMA" />
      </a>
      <span class="header-signature">Ideias que se entrelaçam.</span>
      <nav class="desktop-nav" aria-label="Navegação principal">
        <a href="#sobre">Sobre</a>
        <a href="#metodo">Método</a>
        <a href="#servicos">Serviços</a>
        <a href="#projetos">Projetos</a>
        <a class="nav-contact" href="${whatsappLink}" target="_blank" rel="noreferrer">Vamos conversar ${arrow}</a>
      </nav>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle>
        <span></span><span></span>
      </button>
    </header>
    <div class="mobile-menu" data-mobile-menu aria-hidden="true">
      <nav aria-label="Navegação mobile">
        <a href="#sobre">Sobre <span>01</span></a>
        <a href="#metodo">Método <span>02</span></a>
        <a href="#servicos">Serviços <span>03</span></a>
        <a href="#projetos">Projetos <span>04</span></a>
        <a href="#contato">Contato <span>05</span></a>
      </nav>
      <p>Ideias que se entrelaçam.</p>
    </div>

    <main>
      <section class="hero section section--cream" id="inicio">
        <div class="hero__grain" aria-hidden="true"></div>
        <div class="hero__content page-wrap">
          <div class="hero__intro reveal">
            ${sectionLabel('00', 'ESTÚDIO INDEPENDENTE')}
            <h1>Sua marca<br />tem muito<br />a dizer.<br /><em>A gente<br />encontra<br /><span class="hero__sense">o fio.</span></em></h1>
            <p class="hero__lead">Estratégia, conteúdo e identidade para transformar ideias soltas em uma comunicação que conecta.</p>
            <div class="hero__actions">
              <a class="button button--primary" href="${whatsappLink}" target="_blank" rel="noreferrer">Vamos conversar ${arrow}</a>
              <a class="text-link" href="#sobre">Conheça a TRAMA <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div class="hero__visual reveal reveal--delay">
            <div class="hero__stamp">pensamento<br /><span>em movimento</span></div>
            ${mascot('mascot--hero')}
            <svg class="hero__thread" viewBox="0 0 760 520" fill="none" aria-hidden="true">
              <path d="M520 26 C445 85 532 119 464 174 C381 241 284 172 214 242 C154 301 257 359 183 421 C127 468 73 438 6 484" />
              <path class="hero__thread-dot" d="M6 484 C3 486 2 489 3 492" />
            </svg>
            <div class="hero__orbit hero__orbit--one"></div>
            <div class="hero__orbit hero__orbit--two"></div>
          </div>
        </div>
        <div class="hero__bottom-line page-wrap">
          <span>uma linha. muitas possibilidades.</span>
          <span class="scroll-cue">deslize para encontrar o fio <span aria-hidden="true">↓</span></span>
        </div>
      </section>

      <section class="problem section section--petrol" id="problema">
        <div class="problem__threads" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <div class="page-wrap problem__layout">
          <div class="problem__copy reveal">
            ${sectionLabel('01', 'ANTES DO POST', true)}
            <h2>Seu problema<br />talvez não seja<br /><span>falta de conteúdo.</span></h2>
            <p class="problem__body">Talvez sua marca tenha ideias demais.<br />Talvez você publique sem saber exatamente por quê.<br />Talvez sua identidade não acompanhe aquilo que você quer transmitir.<br />Talvez sua comunicação diga várias coisas, mas nenhuma delas fique.</p>
            <p class="problem__closing">A TRAMA começa <strong>antes</strong> do post.</p>
          </div>
          <div class="problem__visual reveal reveal--delay">
            <div class="tangle-frame">
              <svg viewBox="0 0 520 520" fill="none" aria-hidden="true">
                <path class="tangle-frame__line tangle-frame__line--one" d="M23 362 C124 267 58 185 175 138 C260 104 289 213 391 163 C445 137 470 83 494 23" />
                <path class="tangle-frame__line tangle-frame__line--two" d="M37 42 C165 75 132 172 258 189 C359 203 335 315 474 332 C497 335 508 343 516 361" />
                <path class="tangle-frame__line tangle-frame__line--three" d="M11 231 C111 249 139 321 235 289 C329 258 357 339 423 435" />
                <path class="tangle-frame__line tangle-frame__line--four" d="M137 511 C127 398 235 411 287 347 C346 274 427 268 511 284" />
                <path class="tangle-frame__pull" d="M288 259 C347 250 376 213 421 177 C457 148 483 117 507 78" />
                <path class="tangle-frame__pull-arrow" d="M492 84 L507 78 L504 95" />
                <circle cx="105" cy="136" r="7" /><circle cx="388" cy="168" r="7" /><circle cx="287" cy="347" r="7" />
              </svg>
              ${mascot('mascot--tangled', 'ops...')}
            </div>
            <p class="scribble">a gente puxa o fio<br />e cria com identidade.</p>
          </div>
        </div>
      </section>

      <section class="about section section--wine" id="sobre">
        <div class="page-wrap about__layout">
          <div class="about__aside reveal">
            ${sectionLabel('02', 'O QUE É A TRAMA', true)}
            <div class="about__aside-word">entre</div>
            <div class="about__aside-word about__aside-word--outline">laçar</div>
            <p>Ideias diferentes não precisam disputar espaço. Elas precisam encontrar o fio que conecta tudo.</p>
          </div>
          <div class="about__copy reveal reveal--delay">
            <h2>A gente<br /><span>encontra o fio.</span></h2>
            <p class="about__lead">A TRAMA é um estúdio de estratégia, conteúdo, identidade e comunicação que ajuda marcas a encontrarem a forma certa de se comunicar.<br /><br />A gente conecta o que a marca é, o que ela quer dizer e para quem precisa falar.</p>
            <div class="about__statement"><span>Não é sobre fazer mais.</span><strong>É sobre fazer sentido.</strong></div>
            <div class="connection-map" aria-label="A TRAMA conecta marca, público, estratégia, conteúdo e identidade">
              <div class="connection-map__line"></div>
              <span>marca</span><span>público</span><span>estratégia</span><span>conteúdo</span><span>identidade</span>
            </div>
          </div>
        </div>
      </section>

      <section class="method section section--cream" id="metodo">
        <div class="page-wrap">
          <div class="method__header reveal">
            ${sectionLabel('03', 'MÉTODO')}
            <h2>Ver antes de criar.<br /><em>Entender antes de falar.</em><br />Conectar antes de construir.</h2>
            <p>Um método para sair do ruído e chegar naquilo que realmente precisa ser dito.</p>
          </div>
          <div class="method__path" aria-hidden="true"><svg viewBox="0 0 1100 210" preserveAspectRatio="none"><path d="M6 165 C105 30 189 185 292 83 C387 -11 461 153 563 93 C659 36 698 165 786 106 C893 35 978 165 1094 24" /></svg></div>
          <div class="method__steps">
            <article class="method-step reveal"><span class="method-step__number">01</span><h3>VER</h3><p>Observar a marca como ela realmente é.</p><span class="method-step__mark">olhar sem atalho</span></article>
            <article class="method-step reveal reveal--delay-1"><span class="method-step__number">02</span><h3>ENTENDER</h3><p>Conhecer o negócio, o público e o contexto.</p><span class="method-step__mark">escutar primeiro</span></article>
            <article class="method-step reveal reveal--delay-2"><span class="method-step__number">03</span><h3>APROFUNDAR</h3><p>Encontrar dores, desejos, diferenciais e oportunidades.</p><span class="method-step__mark">ir além da superfície</span></article>
            <article class="method-step reveal reveal--delay-3"><span class="method-step__number">04</span><h3>CONECTAR</h3><p>Transformar descobertas em comunicação para as pessoas certas.</p><span class="method-step__mark">fazer sentido junto</span></article>
            <article class="method-step reveal reveal--delay-4"><span class="method-step__number">05</span><h3>CONSTRUIR</h3><p>Dar forma através de identidade, conteúdo e presença digital.</p><span class="method-step__mark">deixar existir</span></article>
          </div>
        </div>
      </section>

      <section class="services section section--burnt" id="servicos">
        <div class="services__scribble" aria-hidden="true">tudo conectado</div>
        <div class="page-wrap">
          <div class="services__header reveal">
            ${sectionLabel('04', 'O QUE A GENTE TRAMA', true)}
            <h2>O que a gente<br /><span>trama.</span></h2>
          </div>
          <div class="services__thread" aria-hidden="true"><svg viewBox="0 0 1200 130" preserveAspectRatio="none"><path d="M-20 92 C130 10 230 118 368 57 C515 -8 596 112 739 57 C877 4 986 112 1220 28" /></svg></div>
          <div class="services__grid">
            <article class="service-card service-card--dark reveal"><span class="service-card__number">01</span><div class="service-card__icon service-card__icon--knot" aria-hidden="true"><span></span></div><h3>Fio solto</h3><p>Para quando você precisa de uma comunicação pontual, sem contratar uma gestão completa.</p><p class="service-card__detail">Criamos as peças que sua marca precisa e entregamos tudo pronto para você publicar.</p><a href="https://canva.link/fiosolto" target="_blank" rel="noreferrer" aria-label="Conhecer o Fio solto no Canva">ver como funciona ${arrow}</a></article>
            <article class="service-card service-card--cream reveal reveal--delay-1"><span class="service-card__number">02</span><div class="service-card__icon service-card__icon--line" aria-hidden="true"><span></span></div><h3>Fio condutor</h3><p>Para quem já produz, mas não sabe o que comunicar, como se posicionar ou por onde começar.</p><p class="service-card__detail">A TRAMA entende sua marca e transforma isso em uma direção de conteúdo com temas, ideias, roteiros e planejamento para você ou sua equipe produzir.</p><a href="#contato" aria-label="Conversar sobre fio condutor">ver como funciona ${arrow}</a></article>
            <article class="service-card service-card--wine reveal reveal--delay-2"><span class="service-card__number">03</span><div class="service-card__icon service-card__icon--loop" aria-hidden="true"><span></span></div><h3>TRAMA contínua</h3><p>Para quem quer tirar a comunicação das próprias mãos e ter alguém cuidando dela de forma estratégica e contínua.</p><p class="service-card__detail">A TRAMA planeja, cria e gerencia seus conteúdos, do calendário à publicação, mantendo sua comunicação alinhada ao posicionamento da marca.</p><a href="#contato" aria-label="Conversar sobre TRAMA contínua">ver como funciona ${arrow}</a></article>
            <article class="service-card service-card--coral reveal reveal--delay-3"><span class="service-card__number">04</span><div class="service-card__icon service-card__icon--dot" aria-hidden="true"><span></span></div><h3>Fio de alcance</h3><p>Para quem quer ampliar o alcance da marca e colocar sua comunicação diante das pessoas certas.</p><p class="service-card__detail">Criamos, gerenciamos e otimizamos campanhas de tráfego pago de acordo com seus objetivos, acompanhando os resultados para ajustar o caminho.</p><a href="#contato" aria-label="Conversar sobre fio de alcance">ver como funciona ${arrow}</a></article>
          </div>
        </div>
      </section>

      <section class="philosophy section section--poster" id="filosofia">
        <div class="poster__line poster__line--top" aria-hidden="true"></div>
        <div class="page-wrap poster__content reveal">
          ${sectionLabel('05', 'FILOSOFIA', true)}
          <p class="poster__overline">uma provocação necessária</p>
          <h2>Bonito não é<br />o mesmo que<br /><span>estratégico.</span></h2>
          <div class="poster__bottom"><p>Uma identidade pode chamar atenção.<br />Um conteúdo pode ser bonito.<br />Um perfil pode parecer organizado.</p><p>Mas se ninguém entende o que aquela marca tem a dizer, alguma coisa está faltando.<br /><strong>A TRAMA existe para conectar essas partes.</strong></p></div>
        </div>
        <div class="poster__line poster__line--bottom" aria-hidden="true"></div>
        ${mascot('mascot--poster', 'isso importa')}
      </section>

      <section class="difference section section--cream" id="diferencial">
        <div class="page-wrap">
          <div class="difference__header reveal">
            ${sectionLabel('06', 'DIFERENCIAL')}
            <h2>Antes do conteúdo,<br /><span>existe entendimento.</span></h2>
          </div>
          <div class="difference__comparison">
            <div class="comparison-block comparison-block--without reveal">
              <div class="comparison-block__heading"><span>01</span><h3>Conteúdo<br /><em>sem estratégia</em></h3></div>
              <ul><li>muito conteúdo</li><li>pouca clareza</li><li>comunicação genérica</li><li>pouca diferenciação</li></ul>
              <div class="comparison-thread comparison-thread--loose" aria-hidden="true"></div>
            </div>
            <div class="comparison-bridge reveal reveal--delay"><span>versus</span><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M3 40 C34 5 76 76 117 12" /></svg></div>
            <div class="comparison-block comparison-block--with reveal reveal--delay-2">
              <div class="comparison-block__heading"><span>02</span><h3>Conteúdo<br /><em>com intenção</em></h3></div>
              <ul><li>clareza</li><li>personalidade</li><li>consistência</li><li>conexão</li></ul>
              <div class="comparison-thread comparison-thread--tight" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="projects section section--petrol" id="projetos">
        <div class="page-wrap">
          <div class="projects__header reveal">
            ${sectionLabel('07', 'PORTFÓLIO / PROJETOS', true)}
            <div><h2>Ideias que<br /><span>ganharam forma.</span></h2><p>Algumas tramas possíveis. Cada uma começa com uma pergunta e termina em uma marca que sabe se apresentar.</p></div>
          </div>
          <div class="projects__grid">${projects.map(projectCard).join('')}</div>
          <div class="projects__foot reveal"><span>estudos conceituais</span><span>porque toda ideia merece uma forma</span></div>
        </div>
      </section>

      <section class="impact section section--coral" id="impacto">
        <div class="impact__thread" aria-hidden="true"><svg viewBox="0 0 1400 300" preserveAspectRatio="none"><path d="M0 238 C154 62 269 285 432 137 C572 8 683 240 826 135 C975 24 1118 271 1400 40" /></svg></div>
        <div class="page-wrap impact__content reveal">
          <span class="impact__index">08 / UMA IDEIA CENTRAL</span>
          <h2>Você não precisa<br /><span>postar mais.</span><br />Precisa ser<br /><em>entendido.</em></h2>
          <p>O fio certo não faz barulho. Ele faz conexão.</p>
        </div>
        ${mascot('mascot--impact', 'entendeu?')}
      </section>

      <section class="final-cta section section--wine" id="contato">
        <div class="final-cta__thread" aria-hidden="true"><svg viewBox="0 0 900 700" preserveAspectRatio="none"><path d="M875 12 C738 70 792 183 648 230 C511 274 584 403 390 425 C235 442 244 592 14 681" /></svg></div>
        <div class="page-wrap final-cta__layout">
          <div class="final-cta__copy reveal">
            ${sectionLabel('09', 'VAMOS CONVERSAR', true)}
            <h2>Tem uma<br /><span>ideia aí?</span><br />Vamos encontrar<br />o fio.</h2>
            <p>Se sua marca tem muito a dizer, mas ainda não encontrou a melhor forma para fazer isso, talvez a gente tenha a TRAMA para construir.</p>
            <a class="button button--cream" href="${whatsappLink}" target="_blank" rel="noreferrer">Vamos conversar ${arrow}</a>
          </div>
          <div class="final-cta__visual reveal reveal--delay">${mascot('mascot--final', 'a gente começa por aqui')}</div>
        </div>
      </section>
    </main>

    <footer class="site-footer section--petrol">
      <div class="page-wrap footer__top">
        <div class="footer__brand"><a class="wordmark wordmark--footer wordmark--footer-abbrev" href="#inicio"><img src="${import.meta.env.BASE_URL}logo-abrev.png" alt="TR" /></a><p>Ideias que se entrelaçam.</p></div>
        <div class="footer__nav"><p class="eyebrow">Navegue</p><a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#metodo">Método</a><a href="#servicos">Serviços</a><a href="#projetos">Projetos</a><a href="#contato">Contato</a></div>
        <div class="footer__contact"><p class="eyebrow">Fale com a gente</p><a href="${whatsappLink}" target="_blank" rel="noreferrer">WhatsApp ${arrow}</a><div class="footer__social"><a href="#contato">Instagram ${arrow}</a><a href="#contato">LinkedIn ${arrow}</a></div></div>
      </div>
      <div class="page-wrap footer__bottom"><span>© 2026 TRAMA</span><span>estratégia · conteúdo · identidade · presença</span><span>uma linha. muitas possibilidades.</span></div>
    </footer>
  </div>
`;

const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const mobileMenu = document.querySelector<HTMLElement>('[data-mobile-menu]');
const header = document.querySelector<HTMLElement>('[data-header]');
const cursorDot = document.querySelector<HTMLElement>('.cursor-dot');

const setMenuState = (open: boolean) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.classList.toggle('is-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
};

menuToggle?.addEventListener('click', () => {
  setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
});

document.querySelectorAll<HTMLAnchorElement>('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => observer.observe(element));

const onScroll = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
  document.documentElement.style.setProperty('--scroll-progress', String(progress));
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

window.addEventListener('pointermove', (event) => {
  if (!cursorDot) return;
  cursorDot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
  document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
});

document.querySelectorAll<HTMLElement>('a, button, .project-card, .service-card').forEach((element) => {
  element.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
  element.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
});
