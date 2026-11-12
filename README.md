# Heng Qiao — Research

Source of the personal research website **https://hankkiu.github.io/publication/**.

Static site served by GitHub Pages from the `main` branch (root folder):

- `index.html`: the page
- `css/style.css`: styles
- `js/render-publications.js`: renders the publication list
- `data/publications.public.json`: publication data

## Home page (`home/`)

`home/` is a self-contained welcome page (`index.html`, `home.css`, `img/`) for the
site root **https://hankkiu.github.io/**. It presents four research areas and links
each one, and each selected work, to an anchor on the publications page
(`/publication/#<id>`).

- Preview: https://hankkiu.github.io/publication/home/
- To serve it at the root, copy the contents of `home/` into the root of a
  repository named `hankkiu.github.io` and enable GitHub Pages there.

Anchors on the publications page: section ids (`#working-papers`, `#auction-theory`,
`#applied-economics`, `#economic-history`), entry ids in lower case (`#j1`, `#b1`, ...),
and the `id` fields of working-paper groups and items in
`data/publications.public.json` (`#wp-applied`, `#wp-land-auctions`, ...).
