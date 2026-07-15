// Bump isto a cada deploy: garante que o navegador detecte o sw.js como "mudou"
// e dispare o ciclo de atualização (install -> activate) para quem já tem o app aberto.
const CACHE_VERSION = "tcg-arena-v2";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/app-icon.svg",
    "./icons/app-icon-maskable.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
    );
    // Ativa a nova versão assim que ela termina de instalar, sem esperar as abas
    // antigas fecharem.
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Tudo que é do próprio site (HTML, manifest, ícones) usa "rede primeiro":
    // com internet, o usuário sempre recebe a versão mais nova; o cache só entra
    // como fallback quando a rede falha (modo offline).
    if (url.origin === location.origin) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then((cached) => {
                        if (cached) return cached;
                        if (request.mode === "navigate") return caches.match("./index.html");
                        return undefined;
                    })
                )
        );
        return;
    }

    // Fontes do Google não mudam de conteúdo numa mesma URL, então cache-first
    // é seguro e evita requisições desnecessárias.
    if (/fonts\.(googleapis|gstatic)\.com$/i.test(url.hostname)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;

                return fetch(request).then((response) => {
                    if (!response || !response.ok) return response;

                    const copy = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                    return response;
                });
            })
        );
    }
});
