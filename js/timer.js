console.log("TIMER.JS LOADED!");


class GameTimer {
    constructor(duration, displayElement, onComplete) {
        this.duration = duration;
        this.displayElement = displayElement;
        this.onComplete = onComplete;
        this.timeLeft = duration;
        this.timerId = null;
        this.isPaused = false;
    }

    start() {
        this.reset();
        this.timerId = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.displayElement.textContent = this.timeLeft;
                
                if (this.timeLeft <= 0) {
                    this.stop();
                    if (this.onComplete) this.onComplete();
                }
            }
        }, 1000);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        clearInterval(this.timerId);
    }

    reset() {
        this.stop();
        this.timeLeft = this.duration;
        this.displayElement.textContent = this.timeLeft;
        this.isPaused = false;
    }
}
