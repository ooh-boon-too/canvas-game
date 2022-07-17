const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');
const modalEl = document.querySelector('#modalEl');
const modalScoreEl = document.querySelector('#modalScoreEl');
const buttonEl = document.querySelector('#buttonEl');
const startButtonEl = document.querySelector('#startButtonEl');
const startModalEl = document.querySelector('#startModalEl');
const divScoreEl = document.querySelector('#divScoreEl');

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 12, 'white');

let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;
let powerUp = new PowerUp({
	position: {
		x: 100,
		y: 100
	}
});

function init() {
	player = new Player(x, y, 12, 'white');
	projectiles = [];
	enemies = [];
	particles = [];
	animationId;
	score = 0;
	scoreEl.innerHTML = 0;
}

function spawnEnemies() {
	intervalId = setInterval(() => {
		const radius = Math.random() * (30 - 6) + 6;
		let x;
		let y;
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const color = 'hsl(' + Math.random() * 255 + ', 50%, 50%)';

		const angle = Math.atan2(player.y - y, player.x - x);
		const velocity = {
			x: Math.cos(angle) * 1.2,
			y: Math.sin(angle) * 1.2
		};
		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 500);
}

function animate() {
	animationId = requestAnimationFrame(animate);
	// kolor canvasu
	c.fillStyle = 'rgba(0, 0, 0, 0.2)';
	c.fillRect(0, 0, canvas.width, canvas.height);

	player.update();
	powerUp.update();

	for (let index = particles.length - 1; index >= 0; index--) {
		const particle = particles[index];

		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	}

	for (let index = projectiles.length - 1; index >= 0; index--) {
		const projectile = projectiles[index];

		projectile.update();
		// usuwa obiekty za krawędzią ekranu
		if (
			projectile.x - projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectiles.y + projectile.radius > 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			projectiles.splice(index, 1);
		}
	}

	for (let index = enemies.length - 1; index >= 0; index--) {
		const enemy = enemies[index];

		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		// koniec gry
		if (dist - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
			clearInterval(intervalId);
			modalScoreEl.innerHTML = score;
			modalEl.style.display = 'block';
			gsap.fromTo(
				'#modalEl',
				{
					scale: 0.8,
					opacity: 0
				},
				{
					scale: 1,
					opacity: 1,
					ease: 'expo'
				}
			);
			gsap.to('#divScoreEl', {
				opacity: 0,
				duration: 0.4
			});
		}

		for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
			const projectile = projectiles[projectileIndex];

			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

			// kiedy obiekty dotkną przeciwników
			if (dist - enemy.radius - projectile.radius < 1) {
				// eksplozje
				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(
						new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
							x: (Math.random() - 0.5) * (Math.random() * 6),
							y: (Math.random() - 0.5) * (Math.random() * 6)
						})
					);
				}
				// zmiejszanie przeciwników
				if (enemy.radius - 10 > 5) {
					score += 50;
					scoreEl.innerHTML = score;
					gsap.to(enemy, {
						radius: enemy.radius - 10
					});
					projectiles.splice(projectileIndex, 1);
				} else {
					// usuwanie przeciwników jeśli są mniejsi
					score += 100;
					scoreEl.innerHTML = score;
					enemies.splice(index, 1);
					projectiles.splice(projectileIndex, 1);
				}
			}
		}
	}
}

addEventListener('click', (event) => {
	const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5
	};
	projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
});

buttonEl.addEventListener('click', () => {
	init();
	animate();
	spawnEnemies();
	gsap.to('#divScoreEl', {
		opacity: 1,
		duration: 0.4
	});
	gsap.to('#modalEl', {
		opacity: 0,
		scale: 0.8,
		duration: 0.4,
		ease: 'expo',
		onComplete: () => {
			modalEl.style.display = 'none';
		}
	});
});

startButtonEl.addEventListener('click', () => {
	init();
	animate();
	spawnEnemies();
	gsap.to('#divScoreEl', {
		opacity: 1,
		duration: 0.4
	});
	gsap.to('#startModalEl', {
		opacity: 0,
		scale: 0.8,
		duration: 0.4,
		ease: 'expo',
		onComplete: () => {
			startModalEl.style.display = 'none';
		}
	});
});

addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'ArrowRight':
			player.velocity.x += 1;
			break;
		case 'ArrowLeft':
			player.velocity.x -= 1;
			break;
		case 'ArrowUp':
			player.velocity.y -= 1;
			break;
		case 'ArrowDown':
			player.velocity.y += 1;
			break;
	}
});
