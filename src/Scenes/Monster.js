// Player.js
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 70);
        scene.add.existing(this);
        this.setScale(2);
        this.scene = scene;


        this.trail = scene.add.sprite(x, y - 40, "tilesheet", 59).setScale(3);
        this.trail.visible = false;

        this.createAnimation();
        this.play("ski");

        this.on(Phaser.Animations.Events.ANIMATION_UPDATE, (anim, frame) => {
            this.trail.visible = frame.frame.name !== 70;
        });
    }

    createAnimation() {
        if (!this.scene.anims.exists("ski")) {
            this.scene.anims.create({
                key: "ski",
                frames: [
                    { key: "tilesheet", frame: 70 },
                    { key: "tilesheet", frame: 71 }
                ],
                frameRate: 2,
                repeat: -1,
                repeatDelay: 300
            });
        }
    }

    update(cursors, keys) {
        if (cursors.left.isDown || keys.A.isDown) this.x -= 6;
        if (cursors.right.isDown || keys.D.isDown) this.x += 6;

        this.trail.x = this.x;

        if (this.x < 0) this.x = 0;
        if (this.x > 800) this.x = 800;
    }
}

// Bullet.js
class Bullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 95);
        scene.add.existing(this);
        this.setScale(2);
        this.speed = 15;
    }

    update() {
        this.y += this.speed;
        if (this.y > 800) {
            this.destroy();
        }
    }
}
class EnemyABullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 131);
        scene.add.existing(this);
        this.setScale(2);
        this.speed = -10;
    }

    update() {
        this.y += this.speed;
        if (this.y < 0) {
            this.destroy();
        }
    }
}
class EnemyBBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 81);
        scene.add.existing(this);
        this.setScale(2);
        const dx = scene.player.x - x;
        const dy = scene.player.y - y;
        const angle = Math.atan2(dy, dx);
        this.vx = Math.cos(angle) * 7;
        this.vy = Math.sin(angle) * 7;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < 0 || this.y > 800 || this.x < 0 || this.x > 800) {
            this.destroy();
        }
    }
}
// EnemyA.js
class EnemyA extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 82);
        scene.add.existing(this);
        this.setScale(2);
        this.scene = scene;
        this.health = 3+ Math.floor(scene.currentWave / 5);
        this.follow = false;
        this.direction = 1;
        this.createAnimation();
        this.play("enemySki");

        this.shootTimer = scene.time.addEvent({
            delay: (3000+Math.floor(Math.random() * 500)),
            loop: true,
            callback: () => {
                if (!this.follow && scene.enemyBulletGroup) {
                    const bullet = new EnemyABullet(scene, this.x, this.y);
                    scene.enemyBulletGroup.add(bullet);  
                }
            }
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.follow) {
            this.y -= 1.5;
            this.x += this.direction * 2;
            if (this.x < 250 || this.x > 550) this.direction *= -1;
        }

        if (this.y < -50 || this.y > 850 || this.x < -50 || this.x > 850) {
            this.destroy();
        }
    }

    createAnimation() {
        if (!this.scene.anims.exists("enemySki")) {
            this.scene.anims.create({
                key: "enemySki",
                frames: [
                    { key: "tilesheet", frame: 82 },
                    { key: "tilesheet", frame: 83 }
                ],
                frameRate: 2,
                repeat: -1,
                repeatDelay: 300
            });
        }
    }
}
// EnemyB.js
class EnemyB extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "tilesheet", 78);
        scene.add.existing(this);
        this.setScale(2);
        this.scene = scene;
        this.health = 6 + Math.floor(scene.currentWave / 5);
        this.follow = false;
        this.createAnimation();
        this.play("enemyWolf");

        this.shootTimer = scene.time.addEvent({
            delay: (3000+Math.floor(Math.random() * 500)),
            loop: true,
            callback: () => {
                if (!this.follow && scene.enemyBulletGroup) {
                    const bullet = new EnemyBBullet(scene, this.x, this.y);
                    scene.enemyBulletGroup.add(bullet);  
                }
            }
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.follow) {
            const dx = this.scene.player.x - this.x;
            const dy = this.scene.player.y - this.y;
            const angle = Math.atan2(dy, dx);
            const speed = 3;
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
        }

        if (this.y < -50 || this.y > 850 || this.x < -50 || this.x > 850) {
            this.destroy();
        }
    }

    createAnimation() {
        if (!this.scene.anims.exists("enemyWolf")) {
            this.scene.anims.create({
                key: "enemyWolf",
                frames: [
                    { key: "tilesheet", frame: 79 },
                    { key: "tilesheet", frame: 78 }
                ],
                frameRate: 2,
                repeat: -1
            });
        }
    }
}


// MainScene.js
class Pixel extends Phaser.Scene {
    constructor() {
        super("PixelScene");
        this.worldspeed = 3;
        this.score = 0;
        this.lives = 3;
        this.maxbullet = 5;
        this.currentWave = 0;
        this.waveInProgress = false;
    }

    preload() {
        this.load.spritesheet("tilesheet", "assets/kenney_tiny-ski/Tilemap/tilemap.png", {
            frameWidth: 16,
            frameHeight: 16,
            spacing: 1
        });
        this.load.image("skimap", "assets/kenney_tiny-ski/Tilemap/tilemap_packed.png");
        this.load.tilemapTiledJSON("skimap", "assets/skimap.json");
        this.load.audio('bgm', 'assets/background-music-upbeat-energetic-333016.mp3');
        this.load.audio('md', 'assets/assets/male-death-sound-128357.mp3');
        this.load.audio('ad', 'assets/assets/animal-dying-sound-281658.mp3');

    }
    resetGame() {
        this.worldspeed = 3;
        this.score = 0;
        this.lives = 3;
        this.maxbullet = 5;
        this.currentWave = 0;
        this.waveInProgress = false;
    }

    create() {
        this.resetGame();
        this.createScrollingMaps();
        this.music = this.sound.add('bgm', { loop: true, volume: 0.5 });
        this.music.play();

    
        this.player = new Player(this, 400, 100);
    
        this.bulletGroup = this.add.group({ runChildUpdate: true });
        this.enemyBulletGroup = this.add.group({ runChildUpdate: true });
        this.enemyGroup = this.add.group();
    
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ A: Phaser.Input.Keyboard.KeyCodes.A, D: Phaser.Input.Keyboard.KeyCodes.D });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        this.createUI();
        this.time.delayedCall(0, () => this.spawnWave(), [], this);
    }
    

    createScrollingMaps() {
        this.map1 = this.make.tilemap({ key: "skimap" });
        this.tileset1 = this.map1.addTilesetImage("tilemap_packed", "skimap");
        this.treeLayer1 = this.map1.createLayer("Base-Layer", this.tileset1, 0, 0);
        this.grassLayer1 = this.map1.createLayer("Stuff", this.tileset1, 0, 0);

        this.map2 = this.make.tilemap({ key: "skimap" });
        this.tileset2 = this.map2.addTilesetImage("tilemap_packed", "skimap");
        this.treeLayer2 = this.map2.createLayer("Base-Layer", this.tileset2, 0, -this.map2.heightInPixels);
        this.grassLayer2 = this.map2.createLayer("Stuff", this.tileset2, 0, -this.map2.heightInPixels);
    }

    createUI() {
        this.scoreDigits = [];
        for (let i = 0; i < 5; i++) {
            let digit = this.add.sprite(20 + i * 24, 20, "tilesheet", 84).setScale(2);
            this.scoreDigits.push(digit);
        }

        this.livesSprite = this.add.sprite(750, 20, "tilesheet", 70).setScale(2);
        this.livesNumber = this.add.sprite(780, 20, "tilesheet", 87).setScale(2);
    }

    update(time, delta) {
        this.player.update(this.cursors, this.keys);

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.bulletGroup.getChildren().length < this.maxbullet) {
            let bullet = new Bullet(this, this.player.x, this.player.y);
            this.bulletGroup.add(bullet);
        }

        this.bulletGroup.getChildren().forEach(bullet => {
            this.enemyGroup.getChildren().forEach(enemy => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), enemy.getBounds())) {
                    bullet.destroy();
                    enemy.health--;
                    if ((enemy instanceof EnemyA && enemy.health <= 1) || (enemy instanceof EnemyB && enemy.health <= 2)) {
                        enemy.follow = true;
                    }
                    if (enemy.health <= 0) {
                        if (enemy instanceof EnemyA) {
                            this.sound.play('md', { volume: 1 });
                        } else if (enemy instanceof EnemyB) {
                            this.sound.play('ad', { volume: 1 });
                        }
                        enemy.destroy();
                        this.score += 500;
                    }
                }
            });
        });
        this.enemyBulletGroup.getChildren().forEach(bullet => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(bullet.getBounds(), this.player.getBounds())) {
                bullet.destroy();
                this.lives -= 1;
                this.updateLivesUI();
        
                if (this.lives <= 0) {
                    this.registry.set("lastScore", this.score);
                    this.scene.start("HighScoreScene", { score: this.score, wave: this.currentWave });
                }
            }
        });
        if (!this.waveInProgress && this.enemyGroup.getLength() === 0) {
            this.waveInProgress = true;
            this.time.delayedCall(1000, () => this.spawnWave());
        }


        this.updateScore();
        this.updateLivesUI();
        this.scrollMap();
    }

    spawnWave() {
        if (this.enemyGroup.getLength() > 0) return;
        if(this.lives < 3){
            this.lives += 1;
        }
        this.currentWave++;
        this.waveInProgress = false;

        this.worldspeed = 3 + 1.5 * (this.currentWave - 1);
        this.playerBulletSpeed = 15 + 1.5 * (this.currentWave - 1);
        this.enemyBulletSpeed = -10 - 1.5 * (this.currentWave - 1);

        const numEnemyA = 3 + this.currentWave;
        const baseY = 700;

        for (let i = 0; i < numEnemyA; i++) {
            const x = 300 + Math.floor(Math.random() * 200);
            const y = baseY - i * 30;
            this.enemyGroup.add(new EnemyA(this, x, y));
        }

        if (this.currentWave >= 3) {
            const numEnemyB = this.currentWave - 2;
            for (let i = 0; i < numEnemyB; i++) {
                const x = (i % 2 === 0)
                    ? 100 + Math.floor(Math.random() * 100)
                    : 600 + Math.floor(Math.random() * 100);
                const y = baseY - i * 50;
                this.enemyGroup.add(new EnemyB(this, x, y));
            }
        }
    }

    updateScore() {
        this.score += 1;
        const str = this.score.toString();
        for (let i = 0; i < this.scoreDigits.length; i++) {
            if (i < str.length) {
                this.scoreDigits[i].setFrame(84 + parseInt(str[i]));
                this.scoreDigits[i].visible = true;
            } else {
                this.scoreDigits[i].visible = false;
            }
        }
    }

    updateLivesUI() {
        const frameMap = { 3: 87, 2: 86, 1: 85, 0: 84 };
        this.livesNumber.setFrame(frameMap[this.lives]);
    }

    scrollMap() {
        for (let layer of [this.treeLayer1, this.treeLayer2, this.grassLayer1, this.grassLayer2]) {
            layer.y -= this.worldspeed;
        }

        if (this.treeLayer1.y <= -this.map1.heightInPixels) {
            this.treeLayer1.y = this.treeLayer2.y + this.map1.heightInPixels;
            this.grassLayer1.y = this.grassLayer2.y + this.map1.heightInPixels;
        }

        if (this.treeLayer2.y <= -this.map2.heightInPixels) {
            this.treeLayer2.y = this.treeLayer1.y + this.map2.heightInPixels;
            this.grassLayer2.y = this.grassLayer1.y + this.map2.heightInPixels;
        }
    }
}
