'use client';

import { useEffect, useRef } from 'react';

import './Noise.css';

// Ajuste do projeto: só o grão animado (sem poeira, riscos, linhas e cintilação do original).
const TILE = 256;
const BLENDS = ['normal', 'overlay', 'soft-light', 'multiply', 'screen', 'difference'];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const generator = seed => {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const paintTile = contrast => {
  const canvas = document.createElement('canvas');
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const image = ctx.createImageData(TILE, TILE);
  const data = image.data;
  const random = generator(1013904223);
  const range = 0.5 + contrast * 1.1;
  for (let i = 0; i < data.length; i += 4) {
    const value = clamp(0.5 + (random() + random() - 1) * range, 0, 1) * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
};

const Noise = ({ opacity = 0.2, fps = 24, blendMode = 'overlay', contrast = 0.6 }) => {
  const rootRef = useRef(null);
  const grainRef = useRef(null);
  const urlRef = useRef('');
  const wakeRef = useRef(null);
  const settings = {
    opacity: clamp(opacity, 0, 1),
    fps: clamp(fps, 0, 60)
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const blend = BLENDS.includes(blendMode) ? blendMode : 'normal';

  useEffect(() => {
    const grain = grainRef.current;
    if (!grain) return undefined;
    let alive = true;
    const canvas = paintTile(clamp(contrast, 0, 1));
    canvas?.toBlob(blob => {
      if (!alive || !blob) return;
      const previous = urlRef.current;
      urlRef.current = URL.createObjectURL(blob);
      grain.style.backgroundImage = `url("${urlRef.current}")`;
      if (previous) URL.revokeObjectURL(previous);
    });
    return () => {
      alive = false;
    };
  }, [contrast]);

  useEffect(() => {
    const root = rootRef.current;
    const grain = grainRef.current;
    if (!root || !grain) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;

    const tick = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const rate = reduce ? 0 : s.fps;
      if (rate > 0 && now - last >= 1000 / rate) {
        last = now;
        grain.style.backgroundPosition = `${(Math.random() * TILE).toFixed(1)}px ${(Math.random() * TILE).toFixed(1)}px`;
      }
      if (visible && rate > 0) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !alive || !visible) return;
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const visibility = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) wake();
    });
    visibility.observe(root);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      visibility.disconnect();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = '';
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div ref={rootRef} className="noise" aria-hidden="true">
      <div
        ref={grainRef}
        className="noise__grain"
        style={{ opacity: settings.opacity, mixBlendMode: blend, backgroundSize: `${TILE}px ${TILE}px` }}
      />
    </div>
  );
};

export default Noise;
