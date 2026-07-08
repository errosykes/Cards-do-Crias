class SoundManager {
  private audioCtx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public toggle(state?: boolean) {
    if (state !== undefined) {
      this.enabled = state;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  public playCardPlay() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  public playVictory() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // C5, E5, G5, C6
        const osc = this.audioCtx!.createOscillator();
        const gainNode = this.audioCtx!.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + i * 0.15);
        
        gainNode.gain.setValueAtTime(0, t + i * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.1, t + i * 0.15 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx!.destination);
        
        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.4);
      });
    } catch (e) {}
  }

  public playDefeat() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;
      [392.00, 370.00, 349.23, 329.63].forEach((freq, i) => { // G4, Gb4, F4, E4
        const osc = this.audioCtx!.createOscillator();
        const gainNode = this.audioCtx!.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + i * 0.3);
        
        gainNode.gain.setValueAtTime(0, t + i * 0.3);
        gainNode.gain.linearRampToValueAtTime(0.1, t + i * 0.3 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + i * 0.3 + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx!.destination);
        
        osc.start(t + i * 0.3);
        osc.stop(t + i * 0.3 + 0.5);
      });
    } catch (e) {}
  }
  
  public playDraw() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const t = this.audioCtx.currentTime;
      [440.00, 440.00].forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gainNode = this.audioCtx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.4);
        
        gainNode.gain.setValueAtTime(0, t + i * 0.4);
        gainNode.gain.linearRampToValueAtTime(0.1, t + i * 0.4 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, t + i * 0.4 + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx!.destination);
        
        osc.start(t + i * 0.4);
        osc.stop(t + i * 0.4 + 0.3);
      });
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();

// Global click listener for UI interaction sounds
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.interactive')) {
       soundManager.playClick();
    }
  }, { capture: true });
}
