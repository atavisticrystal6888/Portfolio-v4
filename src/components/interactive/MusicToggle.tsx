'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBackgroundMusicController } from './BackgroundMusic';
import styles from './MusicToggle.module.css';

export function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkController = () => {
      const ctrl = getBackgroundMusicController();
      if (ctrl) {
        setReady(true);
        setPlaying(ctrl.isPlaying());
      }
    };

    const onStateChange = (e: Event) => {
      const detail = (e as CustomEvent<{ playing: boolean }>).detail;
      setPlaying(detail.playing);
    };

    checkController();
    window.addEventListener('music-controller-ready', checkController);
    window.addEventListener('music-state-change', onStateChange);

    return () => {
      window.removeEventListener('music-controller-ready', checkController);
      window.removeEventListener('music-state-change', onStateChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const ctrl = getBackgroundMusicController();
    if (!ctrl) return;

    if (playing) {
      ctrl.pause();
      setPlaying(false);
    } else {
      ctrl.play();
      setPlaying(true);
    }
  }, [playing]);

  if (!ready) return null;

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={playing ? 'Pause background music' : 'Play background music'}
      title={playing ? 'Pause music' : 'Play music'}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
      {playing && <span className={styles.pulse} />}
    </button>
  );
}
