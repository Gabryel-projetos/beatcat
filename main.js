// BeatCat: Fenda Rítmica - Jogo simples em HTML5 Canvas e JavaScript

// Seleção de elementos da DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuDiv = document.getElementById('menu');
const playBtn = document.getElementById('playBtn');
const skinsBtn = document.getElementById('skinsBtn');
const soundBtn = document.getElementById('soundBtn');

// Estado do jogo
let gameState = 'menu';
let soundOn = true;

// Variáveis do jogador (gato)
const cat = {
  x: canvas.width * 0.2,
  y: canvas.height / 2,
  width: 40,
  height: 40,
  velocity: 0
};
const gravity = 0.5;
const flapVelocity = -8;

// Portais / obstáculos
let portals = [];
let score = 0;
let timeSinceLastPortal = 0;
const portalInterval = 2000; // intervalo entre portais (ms)
const portalOpenTime = 800;  // tempo em que o portal fica aberto (ms)
let lastTime = 0;

function resetGame() {
  cat.y = canvas.height / 2;
  cat.velocity = 0;
  portals = [];
  score = 0;
  timeSinceLastPortal = 0;
}

// Gera um novo portal em posição aleatória
function spawnPortal() {
  const portalY = Math.random() * (canvas.height - 150) + 75;
  portals.push({
    x: canvas.width,
    y: portalY,
    width: 80,
    open: true,
    timer: 0,
    scored: false
  });
}

// Atualiza estado a cada frame
function update(delta) {
  if (gameState !== 'playing') return;

  // Atualiza gato
  cat.velocity += gravity;
  cat.y += cat.velocity;

  // Verifica colisão com topo ou fundo
  if (cat.y + cat.height > canvas.height || cat.y < 0) {
    gameState = 'gameover';
    return;
  }

  // Gera portais periódicos
  timeSinceLastPortal += delta;
  if (timeSinceLastPortal > portalInterval) {
    spawnPortal();
    timeSinceLastPortal = 0;
  }

  // Atualiza portais
  portals.forEach((p) => {
    p.x -= 2; // movimento horizontal
    p.timer += delta;

    // Fecha portal após tempo aberto
    if (p.open && p.timer > portalOpenTime) {
      p.open = false;
    }

    // Verifica passagem do jogador pelo portal
    if (!p.scored && p.x + p.width < cat.x) {
      if (p.open) {
        score++;
      } else {
        gameState = 'gameover';
      }
      p.scored = true;
    }

    // Verifica colisão com portal fechado
    const withinPortalX = cat.x + cat.width > p.x && cat.x < p.x + p.width;
    const outsideGap = cat.y < p.y - 60 || cat.y + cat.height > p.y + 60;
    if (!p.open && withinPortalX && outsideGap) {
      gameState = 'gameover';
    }
  });

  // Remove portais que saíram da tela
  portals = portals.filter((p) => p.x + p.width > 0);
}

// Desenha tudo
function draw() {
  // Limpa e fundo
  ctx.fillStyle = '#f0f8ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desenha portais
  portals.forEach((p) => {
    // Parte superior
    ctx.fillStyle = p.open ? 'rgba(0, 200, 0, 0.6)' : 'rgba(200, 0, 0, 0.6)';
    ctx.fillRect(p.x, 0, p.width, p.y - 60);
    // Parte inferior
    ctx.fillRect(p.x, p.y + 60, p.width, canvas.height - (p.y + 60));
  });

  // Desenha gato (retângulo simples)
  ctx.fillStyle = '#000';
  ctx.fillRect(cat.x, cat.y, cat.width, cat.height);

  // Desenha pontuação
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText(`Pontuação: ${score}`, 10, 30);

  // Tela de game over
  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Toque para jogar novamente', canvas.width / 2 - 140, canvas.height / 2 + 20);
  }
}

// Loop principal
function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

// Eventos de clique/tap
function handleTap() {
  if (gameState === 'playing') {
    cat.velocity = flapVelocity;
  } else if (gameState === 'menu' || gameState === 'gameover') {
    // Inicia/reinicia o jogo
    gameState = 'playing';
    menuDiv.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
  }
}

// Associa eventos
canvas.addEventListener('mousedown', handleTap);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleTap();
});

document.addEventListener('keydown', (e) => {
  // tecla espaço também faz o gato subir
  if (e.code === 'Space') {
    handleTap();
  }
});

playBtn.addEventListener('click', () => {
  gameState = 'playing';
  menuDiv.style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
});

skinsBtn.addEventListener('click', () => {
  alert('Skins em breve!');
});

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? 'Som On' : 'Som Off';
});

// Inicialização
resetGame();
requestAnimationFrame(loop);
