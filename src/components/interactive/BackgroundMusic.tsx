'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

interface MusicController {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

let globalController: MusicController | null = null;

export function getBackgroundMusicController(): MusicController | null {
  return globalController;
}

export function BackgroundMusic() {
  const soundRef = useRef<Howl | null>(null);
  const startedRef = useRef(false);
  const initRef = useRef(false);
  const retryCount = useRef(0);

  const startMusic = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || startedRef.current) return;
    if (sound.state() !== 'loaded') return;

    startedRef.current = true;
    sound.volume(0);
    sound.play();
    sound.fade(0, 0.05, 2000);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let sound: Howl;
    try {
      sound = new Howl({
        src: ['/audio/Akeboshi.mp3'],
        loop: true,
        volume: 0.05,
        autoplay: false,
        preload: true,
        html5: false,
        rate: 1.0,
        onplay: () => {
          window.dispatchEvent(new CustomEvent('music-state-change', { detail: { playing: true } }));
        },
        onpause: () => {
          window.dispatchEvent(new CustomEvent('music-state-change', { detail: { playing: false } }));
        },
        onstop: () => {
          window.dispatchEvent(new CustomEvent('music-state-change', { detail: { playing: false } }));
        },
        onplayerror: () => {
          if (retryCount.current < 3) {
            retryCount.current += 1;
            setTimeout(() => {
              if (!startedRef.current) sound.play();
            }, 1000);
          }
        },
      });
    } catch (err) {
      console.warn('BackgroundMusic: Howler.js initialization failed:', err);
      return;
    }

    soundRef.current = sound;

    globalController = {
      play: () => {
        sound.play();
        sound.fade(0, 0.05, 1000);
      },
      pause: () => {
        sound.fade(0.05, 0, 1000);
        setTimeout(() => sound.pause(), 1000);
      },
      isPlaying: () => sound.playing(),
    };

    window.dispatchEvent(new CustomEvent('music-controller-ready'));

    const handleInteraction = () => {
      startMusic();
    };

    const events = ['click', 'touchstart', 'keydown'] as const;
    events.forEach((evt) => {
      document.addEventListener(evt, handleInteraction, { once: true });
    });

    return () => {
      events.forEach((evt) => {
        document.removeEventListener(evt, handleInteraction);
      });
    };
  }, [startMusic]);

  return null;
}
