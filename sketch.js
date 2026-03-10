// Webcam Balls Interativas - Versão Corrigida
// Para Processing JavaScript Mode (p5.js)

let video;
let balls = [];
let ballSize = 50;
let cols = 10;
let rows = 8;
let captureReady = false;
let videoWidth, videoHeight;

function setup() {
  createCanvas(800, 600);
  
  // Inicializa webcam
  video = createCapture(VIDEO, function() {
    // Callback quando a câmera estiver pronta
    console.log("Câmera pronta!");
    captureReady = true;
    video.size(width, height);
    video.hide();
  });
  
  // Fallback para navegadores que não suportam o callback
  video.elt.onloadedmetadata = function() {
    captureReady = true;
    video.size(width, height);
    video.hide();
  };
}

function draw() {
  background(0);
  
  if (captureReady && video.width > 0 && video.height > 0) {
    // Se ainda não criamos as bolas, criamos
    if (balls.length === 0) {
      createBallsFromVideo();
    }
    
    // Opcional: atualizar a imagem das bolas em tempo real (descomente para efeito ao vivo)
    // updateBallsFromVideo();
  }
  
  // Desenha e atualiza as bolas
  for (let ball of balls) {
    ball.update();
    ball.display();
  }
  
  // Instruções na tela
  fill(255);
  textAlign(LEFT);
  textSize(16);
  text("Passe o mouse sobre as bolas para fazê-las rolar!", 20, 30);
  text("Pressione ESPAÇO para capturar nova imagem da webcam", 20, 50);
  text("Clique com o mouse para atualizar a imagem", 20, 70);
  
  if (!captureReady) {
    fill(255, 0, 0);
    text("Aguardando câmera...", 20, 100);
  }
}

function createBallsFromVideo() {
  balls = [];
  
  // Carrega a imagem atual do vídeo
  video.loadPixels();
  
  // Se os pixels não estiverem disponíveis, tenta novamente mais tarde
  if (video.pixels.length === 0) {
    console.log("Pixels não disponíveis ainda");
    return;
  }
  
  // Calcula espaçamento
  let spacingX = width / cols;
  let spacingY = height / rows;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Posição central da bola
      let x = i * spacingX + spacingX/2;
      let y = j * spacingY + spacingY/2;
      
      // Coordenadas da fatia na imagem do vídeo
      let sliceX = floor(i * spacingX);
      let sliceY = floor(j * spacingY);
      let sliceW = floor(spacingX);
      let sliceH = floor(spacingY);
      
      // Cria uma imagem separada para esta bola
      let imgSlice = createImage(sliceW, sliceH);
      imgSlice.copy(video, sliceX, sliceY, sliceW, sliceH, 0, 0, sliceW, sliceH);
      imgSlice.resize(ballSize, ballSize);
      
      // Cria bola
      balls.push(new Ball(x, y, imgSlice));
    }
  }
  
  console.log("Bolas criadas: " + balls.length);
}

function updateBallsFromVideo() {
  // Atualiza cada bola com a imagem atual do vídeo (opcional)
  if (video.pixels.length === 0) return;
  
  let spacingX = width / cols;
  let spacingY = height / rows;
  let index = 0;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (index >= balls.length) return;
      
      let sliceX = floor(i * spacingX);
      let sliceY = floor(j * spacingY);
      let sliceW = floor(spacingX);
      let sliceH = floor(spacingY);
      
      let imgSlice = createImage(sliceW, sliceH);
      imgSlice.copy(video, sliceX, sliceY, sliceW, sliceH, 0, 0, sliceW, sliceH);
      imgSlice.resize(ballSize, ballSize);
      
      balls[index].imgSlice = imgSlice;
      index++;
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    if (captureReady) {
      createBallsFromVideo();
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT && captureReady) {
    createBallsFromVideo();
  }
}

// Classe Ball
class Ball {
  constructor(x, y, imgSlice) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.imgSlice = imgSlice;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.hovered = false;
  }
  
  update() {
    // Calcula distância do mouse ao centro da bola
    let d = dist(mouseX, mouseY, this.x, this.y);
    this.hovered = d < ballSize/2;
    
    if (this.hovered) {
      // Aumenta a velocidade de rotação
      this.rotationSpeed += 0.2;
      // Limita a velocidade máxima
      this.rotationSpeed = min(this.rotationSpeed, 0.5);
      
      // Pequeno deslocamento aleatório
      this.x = lerp(this.x, this.originalX + random(-3, 3), 0.05);
      this.y = lerp(this.y, this.originalY + random(-3, 3), 0.05);
    } else {
      // Retorna suavemente à posição original
      this.x = lerp(this.x, this.originalX, 0.1);
      this.y = lerp(this.y, this.originalY, 0.1);
      // Reduz a velocidade gradualmente (fricção)
      this.rotationSpeed *= 0.95;
    }
    
    // Atualiza rotação
    this.rotation += this.rotationSpeed;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Ajusta opacidade e escala conforme hover
    if (this.hovered) {
      scale(1.2);
      tint(255, 220);
    } else {
      tint(255, 180);
    }
    
    // Desenha a imagem
    imageMode(CENTER);
    image(this.imgSlice, 0, 0, ballSize, ballSize);
    
    // Borda circular
    noFill();
    stroke(255);
    strokeWeight(2);
    ellipse(0, 0, ballSize, ballSize);
    
    pop();
  }
}