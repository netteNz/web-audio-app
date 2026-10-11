import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Maskable + Apple icons get a zinc-950 backdrop to match the app's theme_color
const background = '#09090b';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/audio-equalizer-device.svg'],
});
