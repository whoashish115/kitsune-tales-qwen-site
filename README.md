<p align="center"><img src="public/logo.png" width="112" alt="Kitsune Tales logo"></p>

<h1 align="center">Kitsune Tales site</h1>

<p align="center"><a href="https://kitsune-tales-qwen.vercel.app"><b>Site</b></a> ·
<a href="https://github.com/whoashish115/kitsune-tales-qwen">Main repo</a> ·
<a href="https://huggingface.co/whoashish115/Kitsune-Tales-E4B-JP">JP model</a> ·
<a href="https://huggingface.co/whoashish115/Kitsune-Tales-E4B-EN">EN model</a></p>

Source of the site for the two Gemma 4 E4B fine-tunes `Kitsune-Tales-E4B-JP` and `Kitsune-Tales-E4B-EN`:
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

## License

Apache-2.0.
