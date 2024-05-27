// Selecciona el elemento canvas del documento HTML
const canvas = document.getElementById("canvas");

// Obtiene el contexto de representación 2D del canvas
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la ventana del navegador
const window_height = window.innerHeight; // Alto de la ventana
const window_width = window.innerWidth; // Ancho de la ventana

// Asigna el alto y ancho del canvas igual al alto y ancho de la ventana
canvas.height = window_height;
canvas.width = window_width;

const heartImage = new Image();
heartImage.src = "img/Heart.png";

// Carga la imagen del alien
const alienImage = new Image();
alienImage.src = "img/Alien.png";

const alien2Image = new Image();
alien2Image.src = "img/Alien2.png";

// Carga la imagen de explosión
const explosionImage = new Image();
explosionImage.src = "img/Explosion.png"; // Ruta de la imagen de explosión

// Carga el sonido de disparo
const disparoSound = new Audio('sounds/Shoot.mp3');

// Carga la música de fondo
const backgroundMusic = new Audio('sounds/Background.mp3');
backgroundMusic.loop = true;

// Reproduce la música de fondo cuando el usuario interactúa con la página
document.addEventListener('click', () => {
    backgroundMusic.play().catch(error => console.error('Error al reproducir la música:', error));
}, { once: true });

// Define una clase para representar alienígenas (en lugar de círculos)
class Alien {
    constructor(x, y, radius, text, speed) {
        this.posX = x; // Posición x del centro del alien
        this.posY = y; // Posición y del centro del alien
        this.radius = radius; // Radio del alien (se usa para detección de clics)
        this.text = text; // Texto a mostrar en el centro del alien
        this.speed = speed; // Velocidad de movimiento del alien en píxeles por fotograma

        // Velocidad de desplazamiento en los ejes x e y
        this.dx = 0;
        this.dy = -1 * this.speed; // Movimiento hacia arriba
    }

    // Método para dibujar el alien en el canvas
    draw(context) {
        context.drawImage(alienImage, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);

        // Dibuja el texto en el centro de la imagen
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    // Método para actualizar la posición del alien
    update(context) {
        this.draw(context); // Dibuja el alien en su nueva posición

        // Si el alien alcanza los límites del canvas en la parte superior, lo elimina
        if (this.posY - this.radius < 0) {
            let index = ArregloAliens.indexOf(this);
            if (index > -1) {
                ArregloAliens.splice(index, 1);
                gameOver(); // Termina el juego si un alien alcanza la parte superior
            }
        }

        // Si el alien alcanza los límites del canvas en los ejes x, invierte su dirección
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        // Actualiza las coordenadas del centro del alien
        this.posX += this.dx;
        this.posY += this.dy;
    }
}
class Alien2 {
    constructor(x, y, radius, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.text = text;
        this.speed = speed;
        this.clicks = 0; // Inicializa el contador de clics en 0

        this.dx = 0;
        this.dy = -1 * this.speed;
    }

    draw(context) {
        context.drawImage(alien2Image, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);

        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    update(context) {
        this.draw(context);

        if (this.posY - this.radius < 0) {
            let index = ArregloAliens.indexOf(this);
            if (index > -1) {
                ArregloAliens.splice(index, 1);
                gameOver();
            }
        }

        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }

    // Método para manejar los clics en un Alien2
    handleClick() {
        this.clicks++; // Incrementa el contador de clics

        if (this.clicks >= 2) { // Si se han dado 2 clics, elimina el Alien2
            let index = ArregloAliens.indexOf(this);
            if (index > -1) {
                ArregloAliens.splice(index, 1);
                contadorAliens++; // Incrementa el contador de aliens reventados
                let explosion = new Explosion(this.posX, this.posY, this.radius);
                ArregloExplosiones.push(explosion);
            }
        }
    }
}


// Clase para la animación de explosión
class Explosion {
    constructor(x, y, radius) {
        this.posX = x; // Posición x del centro de la explosión
        this.posY = y; // Posición y del centro de la explosión
        this.radius = radius; // Radio de la explosión
        this.frame = 0; // Fotograma actual de la animación
        this.maxFrame = 28; // Número máximo de fotogramas de la animación (ajustar según tu imagen)
    }

    // Método para dibujar la explosión en el canvas
    draw(context) {
        const size = this.radius * 2;
        const frameWidth = explosionImage.width / this.maxFrame; // Ancho de un fotograma
        context.drawImage(explosionImage, this.frame * frameWidth, 0, frameWidth, explosionImage.height, this.posX - this.radius, this.posY - this.radius, size, size);
    }

    // Método para actualizar la animación de la explosión
    update(context) {
        this.draw(context);
        this.frame++;
        if (this.frame >= this.maxFrame) {
            let index = ArregloExplosiones.indexOf(this);
            if (index > -1) {
                ArregloExplosiones.splice(index, 1);
            }
        }
    }
}

// Función para calcular la distancia entre dos puntos en el plano cartesiano
function getDistance(posx1, posy1, posx2, posy2) {
    let result = Math.sqrt(Math.pow(posx2 - posx1, 2) + Math.pow(posy2 - posy1, 2));
    return result;
}

// Arreglo para almacenar instancias de aliens
let ArregloAliens = [];
// Número inicial de aliens que se crearán
let NumeroAliens = 5;

// Contador de aliens reventados
let contadorAliens = 0;

// Arreglo para almacenar explosiones
let ArregloExplosiones = [];

// Nivel actual
let nivel = 1;

// Récord de puntuación más alta
let record = localStorage.getItem("record") || 0;

// Variable para mostrar el nivel temporalmente
let mostrarNivel = true;

// Función para crear un alien y agregarlo al arreglo
function crearAlien() {
    let AlienCreado = false;
    while (!AlienCreado) {
        // Genera valores aleatorios para la posición, radio y velocidad del alien
        let randomRadius = Math.floor(Math.random() * 60 + 40);
        let randomX = Math.random() * (window_width - 2 * randomRadius) + randomRadius;
        let randomY = window_height + randomRadius; // Aparecen desde abajo
        let randomSpeed = 1 + (nivel * 1); // Velocidad inicial 1, aumenta 0.1 por nivel

        let VerificacionCreacion = true;
        // Verifica si el nuevo alien está demasiado cerca de los aliens existentes
        for (let j = 0; j < ArregloAliens.length; j++) {
            if (getDistance(randomX, randomY, ArregloAliens[j].posX, ArregloAliens[j].posY) < (randomRadius + ArregloAliens[j].radius)) {
                VerificacionCreacion = false;
                break;
            }
        }
        // Si el nuevo alien no está demasiado cerca de los aliens existentes, lo crea y lo agrega al
        if (VerificacionCreacion) {
            let nuevoAlien;
            if (nivel >= 5 && Math.random() < 0.5) {
                nuevoAlien = new Alien2(randomX, randomY, randomRadius, (ArregloAliens.length + 1).toString(), randomSpeed);
            } else {
                nuevoAlien = new Alien(randomX, randomY, randomRadius, (ArregloAliens.length + 1).toString(), randomSpeed);
            }
            ArregloAliens.push(nuevoAlien);
            AlienCreado = true;
        }
    }
}



// Función para crear aliens con un intervalo de tiempo de diferencia
let vidas = 0; // Variable para llevar un registro de cuántas vidas se han perdido
let Hearts = 2;

// Función para crear aliens con un intervalo de tiempo aleatorio entre 1 y 2 segundos
function crearAliensConIntervalo() {
    crearAlien(); // Crea un alien inmediatamente

    // Crea un nuevo alien en un intervalo de tiempo aleatorio entre 1 y 2 segundos
    setInterval(function () {
        crearAlien();
    }, Math.random() * 1000 + 500);
}

function showMessage(message, duration) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "White";
    ctx.textAlign = "center";
    ctx.fillText(message, window_width / 2, 50);

    // Ocultar el mensaje después de la duración especificada
    setTimeout(() => {
        ctx.clearRect(0, 0, window_width, window_height);
    }, duration);
}

// Función para actualizar la posición de los aliens y detectar colisiones
function updateAlien() {
    ctx.clearRect(0, 0, window_width, window_height); // Borra el canvas para cada fotograma

drawHearts(ctx, Hearts);

    // Mostrar el nivel temporalmente
    if (mostrarNivel) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "White";
        ctx.textAlign = "center";
        ctx.fillText("Level " + nivel, window_width / 2, window_height / 2);

        // Ocultar el texto del nivel después de 2 segundos
        setTimeout(() => {
            mostrarNivel = false;
        }, 2000);
    }

    // Mostrar mensaje especial en el nivel 5
    if (nivel === 5) {
        showMessage("¡Cuidado! Alien de nivel 2. Dispara 2 veces para aniquilarlo", 2000);
    }

    // Itera sobre cada alien en el arreglo y actualiza su posición
    ArregloAliens.forEach(alien => {
        alien.update(ctx);
    });

    // Itera sobre cada explosión en el arreglo y actualiza su animación
    ArregloExplosiones.forEach(explosion => {
        explosion.update(ctx);
    });

    // Mostrar el contador de aliens reventados en el canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Score: " + contadorAliens, 790, 15);
    ctx.fillText("Record: " + record, 60, 15);
    ctx.fillText("Level: " + nivel, 1490, 15);

    // Mostrar el mensaje de Game Over y el botón Restart si se han perdido 3 vidas
    if (vidas >= 3) {
        gameOver();

        // Detiene el juego
        return;
    }

    requestAnimationFrame(updateAlien); // Llama a la función de actualización nuevamente para el siguiente fotograma
}

// Función para finalizar el juego
// Función para finalizar el juego
function gameOver() {
    vidas++; // Incrementa el contador de vidas perdidas
    Hearts--;

    if (vidas >= 3) {
        showGameOverMessage();
        if (contadorAliens > record) {
            localStorage.setItem("record", contadorAliens);
            record = contadorAliens;
        }
        // Detiene la música de fondo
        backgroundMusic.pause();
        // Elimina el event listener para evitar más clics
        canvas.removeEventListener('click', handleCanvasClick);
    }
}


function showGameOverMessage() {
    // Mostrar el mensaje de Game Over
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", window_width / 2, window_height / 2 - 50);

    // Mostrar la puntuación obtenida en la última ronda
    ctx.font = "bold 30px Arial";
    ctx.fillText("Score: " + contadorAliens, window_width / 2, window_height / 2);

    // Mostrar el botón Restart
    ctx.fillStyle = "green";
    ctx.fillRect(window_width / 2 - 70, window_height / 2 + 30, 140, 50);
    ctx.fillStyle = "white";
    ctx.fillText("Restart", window_width / 2, window_height / 2 + 60);

    // Detener la música de fondo
    backgroundMusic.pause();
}
// Función para manejar el reinicio del juego
function handleRestartClick(event) {
    if (vidas >= 3) { // Verifica si se han perdido las 3 vidas
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

        // Verifica si se hizo clic en el botón Restart
        if (mouseX >= window_width / 2 - 70 && mouseX <= window_width / 2 + 70 &&
            mouseY >= window_height / 2 + 30 && mouseY <= window_height / 2 + 80) {
            document.location.reload(); // Recargar la página para reiniciar el juego
        }
    }
}


function drawHearts(context, numHearts) {
    ctx.font = "bold 25px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Hearts left", 65, 40);
    for (let i = 0; i < numHearts; i++) {
        context.drawImage(heartImage, 1 + i * 55, 70, 90, 100);
    }
}



// Agregar el evento de clic al botón Restart
canvas.addEventListener('click', handleRestartClick);

// Agrega el evento de clic al canvas
canvas.addEventListener('click', handleCanvasClick);

// Función para reiniciar el juego
function restartGame(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    // Verificar si se hizo clic en el botón Restart
    if (mouseX >= window_width / 2 - 50 && mouseX <= window_width / 2 + 50 &&
        mouseY >= window_height / 2 + 50 && mouseY <= window_height / 2 + 90) {
        document.location.reload(); // Recargar la página para reiniciar el juego
    }
}


//Intento para modificar el index


// Agregar el evento de clic para eliminar aliens
// Función para manejar los clics en el canvas
function handleCanvasClick(event) {
    // Obtén las coordenadas del clic ajustadas según la posición del canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
    // Reproduce el sonido de disparo
    disparoSound.play().catch(error => console.error('Error al reproducir el sonido:', error));

    // Verifica si el clic está dentro de algún alien
    for (let i = 0; i < ArregloAliens.length; i++) {
         
        const alien = ArregloAliens[i];
        const distanceFromCenter = getDistance(mouseX, mouseY, alien.posX, alien.posY);

        // Si el clic está dentro del alien, elimina el alien del arreglo y aumenta el contador
        if (distanceFromCenter <= alien.radius) {
            if (alien instanceof Alien2) {
                // Verifica si es un Alien2 y ya ha sido clickeado una vez
                if (alien.clicked) {
                    ArregloAliens.splice(i, 1); // Elimina el alien del arreglo
                    contadorAliens++; // Incrementa el contador de aliens reventados

                    // Crea una nueva explosión en la posición del alien eliminado
                    let explosion = new Explosion(alien.posX, alien.posY, alien.radius);
                    ArregloExplosiones.push(explosion);

                    // Verifica si es necesario incrementar el nivel
                    if (contadorAliens % 5 === 0) {
                        nivel++;
                        mostrarNivel = true; // Muestra el nuevo nivel
                        ArregloAliens.forEach(alien => {
                        });
                    }
                } else {
                    // Si es la primera vez que se hace clic en Alien2, marca que ya fue clickeado una vez
                    alien.clicked = true;
                }
            } else {
                // Para otros tipos de aliens, simplemente marca que han sido clickeados
                ArregloAliens.splice(i, 1); // Elimina el alien del arreglo
                contadorAliens++; // Incrementa el contador de aliens reventados

                // Crea una nueva explosión en la posición del alien eliminado
                let explosion = new Explosion(alien.posX, alien.posY, alien.radius);
                ArregloExplosiones.push(explosion);

                // Verifica si es necesario incrementar el nivel
                if (contadorAliens % 5 === 0) {
                    nivel++;
                    mostrarNivel = true; // Muestra el nuevo nivel
                    ArregloAliens.forEach(alien => {
                        alien.speed += 0.5; // Aumenta la velocidad de los aliens existentes
                        alien.dy = -1 * alien.speed; // Actualiza la velocidad en el eje y
                    });
                }
            }

            break; // Sale del bucle una vez que se elimina el alien
        }
    }
}


// Agrega el evento de clic al canvas
canvas.addEventListener('click', handleCanvasClick);

// Cambiar el icono del mouse al pasar sobre el canvas
canvas.style.cursor = "url(img/Gunshot.png), auto";

crearAliensConIntervalo(); // Llama a la función para crear aliens con intervalo
updateAlien(); // Llama a la función de actualización inicialmente para iniciar la animación