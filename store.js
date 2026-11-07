/* Archivio locale del Ricettario.
   Imita le poche funzioni del database usate dalla pagina (collection/doc, onSnapshot,
   set/update/delete/add) ma salva tutto nel telefono, in localStorage.
   Al primo avvio carica seed.json (liste della spesa e giorni di allenamento). */
(function(){
  const KEY = "ricettario-db-v1";
  let data = null;                     // { collections: {nome: {id: doc}}, docs: {"col/id": doc} }
  const subs = new Set();              // { type:"col"|"doc", path, cb }

  function load(){
    try{ const raw = localStorage.getItem(KEY); if(raw) return JSON.parse(raw); }catch(e){}
    return null;
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }
    catch(e){ console.error("Salvataggio non riuscito", e); }
  }
  const clone = o => JSON.parse(JSON.stringify(o));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  function colSnap(name){
    const c = data.collections[name] || {};
    return { docs: Object.keys(c).map(id => ({ id, data: () => clone(c[id]) })), exists: true };
  }
  function docSnap(path){
    const d = data.docs[path];
    return { exists: d !== undefined, data: () => (d === undefined ? undefined : clone(d)) };
  }
  function notify(){
    subs.forEach(s => setTimeout(() => s.cb(s.type === "col" ? colSnap(s.path) : docSnap(s.path)), 0));
  }
  function setIn(name, id, doc){ (data.collections[name] ||= {})[id] = clone(doc); save(); notify(); }

  function docRef(name, id){
    return {
      async set(doc){ setIn(name, id, doc); },
      async update(patch){
        const cur = (data.collections[name] || {})[id];
        if(cur === undefined) throw Object.assign(new Error("Documento inesistente"), {code:"not_found"});
        setIn(name, id, {...cur, ...patch});
      },
      async delete(){ if(data.collections[name]){ delete data.collections[name][id]; save(); notify(); } }
    };
  }

  const db = {
    collection(name){
      return {
        doc: id => docRef(name, id),
        async add(doc){ const id = uid(); setIn(name, id, doc); return {id}; },
        onSnapshot(cb){
          const s = {type:"col", path:name, cb}; subs.add(s);
          setTimeout(() => cb(colSnap(name)), 0);
          return () => subs.delete(s);
        }
      };
    },
    doc(path){
      return {
        async set(doc){ data.docs[path] = clone(doc); save(); notify(); },
        onSnapshot(cb){
          const s = {type:"doc", path, cb}; subs.add(s);
          setTimeout(() => cb(docSnap(path)), 0);
          return () => subs.delete(s);
        }
      };
    }
  };

  /* ---- copia di sicurezza ---- */
  function exportJSON(){
    return JSON.stringify({ app:"ricettario", versione:1, esportato:new Date().toISOString().slice(0,10), ...clone(data) }, null, 1);
  }
  function importJSON(text){
    const o = JSON.parse(text);
    if(!o || o.app !== "ricettario" || typeof o.collections !== "object") throw new Error("Questo file non è una copia del Ricettario.");
    data = { collections: o.collections || {}, docs: o.docs || {} };
    save(); notify();
  }

  async function ready(){
    data = load();
    if(!data){
      data = { collections:{}, docs:{} };
      try{
        const r = await fetch("seed.json", {cache:"no-cache"});
        if(r.ok){ const s = await r.json(); data = { collections: s.collections || {}, docs: s.docs || {} }; }
      }catch(e){}
      save();
    }
    try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){}
    return db;
  }

  const readyP = ready();
  window.claude = { use: async name => name === "db" ? readyP : null };
  window.RicettarioStore = { exportJSON, importJSON, ready: () => readyP };
})();
