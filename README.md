<p align="center"><img src="public/logo.png" width="112" alt="Kitsune Tales logo"></p>

<h1 align="center">Kitsune Tales site</h1>

<p align="center"><a href="https://kitsune-tales-qwen.vercel.app"><b>Site</b></a> ·
<a href="https://github.com/whoashish115/kitsune-tales-qwen">Main repo</a> ·
<a href="https://huggingface.co/whoashish115/kitsune-tales-e4b-jp">JP model</a> ·
<a href="https://huggingface.co/whoashish115/kitsune-tales-e4b-en">EN model</a></p>

Source of the site for the two Gemma 4 E4B fine-tunes `kitsune-tales-e4b-jp` and `kitsune-tales-e4b-en`:
the models, the data, interactive training curves, the main results with three figures, samples and links.
The full set of figures and tables is in the main repository's README and report.
The page reads in English (the default), Japanese or both ("mix").

## Data

This repository holds no statistics of its own. `src/data/kitsune.json`, `public/figures/` and `public/slides/` are exported from the
[main repository](https://github.com/whoashish115/kitsune-tales-qwen), where every number is computed from `reports/`:

```bash
# in a checkout of kitsune-tales-qwen, with this repository next to it
python -m kitsune.figures
(cd slides && npm install && npm run build)   # the deck, copied into public/slides/
python -m kitsune.site_export --site ../kitsune-tales-qwen-site
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to out/
```

Next.js 16 (static export), React 19, Tailwind CSS 4, TypeScript. Deployed on Vercel from `main`.

## Layout

```
src/app/          layout, global styles (palette tokens for light and dark), favicon
src/components/   hero, model/data/training/results sections, W&B-style training charts, language switch
src/data/         kitsune.json, exported from the main repository
public/figures/   the three site figures in light and dark versions, exported from the main repository
public/slides/    the built Slidev deck, served at /slides/; its source is slides/ in the main repository
```

## License

Apache-2.0.
