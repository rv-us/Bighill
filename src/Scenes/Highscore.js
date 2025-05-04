class HighScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: "HighScoreScene" });
    }

    init(data) {
        this.score = data.score || 0;
        this.wave = data.wave || 0;

        const storedScore = localStorage.getItem('highscore');
        this.highscore = storedScore ? Math.max(parseInt(storedScore), this.score) : this.score;
        localStorage.setItem('highscore', this.highscore);

        const storedWave = localStorage.getItem('highwave');
        this.highwave = storedWave ? Math.max(parseInt(storedWave), this.wave) : this.wave;
        localStorage.setItem('highwave', this.highwave);
    }

    create() {
        this.add.rectangle(400, 400, 800, 800, 0x000000);

        this.add.text(400, 220, `GAME OVER`, { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(400, 300, `Final Score: ${this.score}`, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(400, 350, `Waves Survived: ${this.wave}`, { fontSize: '28px', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(400, 400, `High Score: ${this.highscore}`, { fontSize: '28px', fill: '#ffff66' }).setOrigin(0.5);
        this.add.text(400, 450, `Highest Wave: ${this.highwave}`, { fontSize: '28px', fill: '#66ffcc' }).setOrigin(0.5);
        this.add.text(400, 540, `Press SPACE to Restart`, { fontSize: '24px', fill: '#bbbbbb' }).setOrigin(0.5);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("PixelScene");
        }
    }
}
