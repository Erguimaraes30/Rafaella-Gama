import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: o GitHub Pages publica o site em https://<usuário>.github.io/Rafaella-Gama/
export default defineConfig({ base: '/Rafaella-Gama/', plugins: [react()] });
