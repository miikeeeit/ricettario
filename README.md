# Ricettario di Mike

App web installabile (PWA) con il piano alimentare del trainer: le ricette del giorno, la modalità cucina con timer, la ricerca per ingredienti, il convertitore cotto/crudo, la lista della spesa e i progressi (peso e diario).

## Come funziona

- `index.html`: tutta l'app, cioè ricette, grafica e logica.
- `store.js`: l'archivio locale. Pesate, diario, spesa e giorni di allenamento si salvano **solo sul telefono** (localStorage), mai su questo repository.
- `seed.json`: i dati di partenza al primo avvio (liste della spesa vuote e giorni di allenamento). Non contiene dati personali.
- `sw.js`: il service worker che fa funzionare l'app anche senza internet.
- `manifest.webmanifest` e `icons/`: nome, colori e logo dell'app installata.

## Pubblicare con GitHub Pages

1. Settings → Pages → «Deploy from a branch» → branch `main`, cartella `/ (root)`.
2. Dopo un minuto l'app è su `https://<utente>.github.io/ricettario/`.

## Installare su Android

Apri il link in Chrome, poi menu ⋮ → «Installa app». Se non compare, usa «Aggiungi a schermata Home».

## Aggiornare

Dopo ogni modifica ai file, cambia `VERSIONE` in `sw.js` (per esempio `ricettario-v2`). Così il telefono scarica la versione nuova alla prossima apertura.

## Copia di sicurezza

In **Progressi → Copia di sicurezza** puoi salvare un file con tutti i dati e ricaricarlo su un altro telefono.
