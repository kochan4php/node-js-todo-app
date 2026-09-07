/* SPA navigation (Turbo-style): intercepts same-origin GET links, fetches the
   target page, and swaps only the <main> document region + matching head
   metadata — the chrome (header, theme, toasts, footer) never reloads, so
   navigation feels instant with no flash. Every navigation re-fetches a fresh
   full document from the server (data stays current); a small LRU cache makes
   Back/Forward restore instantly. Any surprise (network error, redirect,
   missing <main>) falls back to a normal full navigation. */
(() => {
    const MAIN_ID = 'main-content';
    const MAX_CACHE = 40;

    /* Progress bar — tiny, always-present indicator at the very top of the
       viewport while a fetch is in flight. No markup or layout changes needed. */
    const bar = document.createElement('div');
    bar.className = 'spa-progress';
    document.body.prepend(bar);
    const barShow = () => {
        bar.classList.remove('is-done');
        bar.classList.add('is-loading');
    };
    const barHide = () => {
        bar.classList.remove('is-loading');
        bar.classList.add('is-done');
    };

    const cache = new Map(); // key -> { head, mainHtml, jsonLd }
    const scrolls = {}; // key -> scrollY, restored on Back/Forward
    let busy = null; // AbortController
    let appliedClientSide = false; // ignore the initial history entry's popstate

    const keyOf = (url) => url.pathname + url.search;
    const currentKey = () => location.pathname + location.search;
    const mainEl = () => document.getElementById(MAIN_ID);
    let appliedKey = currentKey(); // key of the page currently on screen

    function saveScroll() {
        scrolls[appliedKey] = window.scrollY;
    }

    /* --- head metadata, mirrored from the fetched document --- */
    function headOf(doc) {
        const pick = (selector, attr) => {
            const el = doc.head ? doc.head.querySelector(selector) : null;
            return el ? el.getAttribute(attr) : null;
        };
        return {
            title: doc.title || document.title,
            description: pick('meta[name="description"]', 'content'),
            robots: pick('meta[name="robots"]', 'content'),
            canonical: pick('link[rel="canonical"]', 'href'),
            ogTitle: pick('meta[property="og:title"]', 'content'),
            ogDescription: pick('meta[property="og:description"]', 'content'),
            ogUrl: pick('meta[property="og:url"]', 'content'),
            twitterTitle: pick('meta[name="twitter:title"]', 'content'),
            twitterDescription: pick('meta[name="twitter:description"]', 'content'),
        };
    }

    function applyHead(head) {
        if (head.title) document.title = head.title;
        const setMeta = (selector, attr, value) => {
            if (value === null || value === undefined) return;
            const el = document.head.querySelector(selector);
            if (el) el.setAttribute(attr, value);
        };
        setMeta('meta[name="description"]', 'content', head.description);
        setMeta('meta[name="robots"]', 'content', head.robots);
        setMeta('link[rel="canonical"]', 'href', head.canonical);
        setMeta('meta[property="og:title"]', 'content', head.ogTitle);
        setMeta('meta[property="og:description"]', 'content', head.ogDescription);
        setMeta('meta[property="og:url"]', 'content', head.ogUrl);
        setMeta('meta[name="twitter:title"]', 'content', head.twitterTitle);
        setMeta('meta[name="twitter:description"]', 'content', head.twitterDescription);
    }

    /* JSON-LD blocks (per-page ItemList on the home page, the schema graph in
       the layout) live in <body> outside <main> — keep them in sync on swap. */
    function syncJsonLd(htmls) {
        [...document.body.children]
            .filter((el) => el.matches('script[type="application/ld+json"]'))
            .forEach((el) => {
                el.remove();
            });
        if (!htmls?.length) return;
        const template = document.createElement('template');
        template.innerHTML = htmls.join('');
        const main = mainEl();
        if (main) main.after(...template.content.childNodes);
    }

    function apply(entry, key, isPop) {
        const main = mainEl();
        if (!main) {
            location.assign(key);
            return;
        }
        main.innerHTML = entry.mainHtml;
        applyHead(entry.head);
        syncJsonLd(entry.jsonLd);
        window.scrollTo(0, isPop ? scrolls[key] || 0 : 0);
        /* Move focus to the fresh content (Turbo-style) so assistive tech and
           keyboard users land at the top of the new page. */
        main.focus({ preventScroll: true });
        appliedKey = key;
        document.dispatchEvent(new CustomEvent('spa:ready', { detail: { key, pop: isPop } }));
    }

    function remember(key, entry) {
        if (cache.has(key)) return;
        cache.set(key, entry);
        if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
    }

    function fetchPage(target, key, isPop) {
        if (busy) busy.abort();
        const controller = new AbortController();
        busy = controller;
        barShow();
        fetch(target.href, {
            credentials: 'same-origin',
            headers: { Accept: 'text/html, application/xhtml+xml' },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const final = new URL(response.url);
                if (keyOf(final) !== key) throw new Error('redirected');
                return response.text();
            })
            .then((html) => {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const main = doc.getElementById(MAIN_ID);
                if (!main) throw new Error('no main');
                const entry = {
                    head: headOf(doc),
                    mainHtml: main.innerHTML,
                    jsonLd: [...doc.body.children]
                        .filter((el) => el.matches('script[type="application/ld+json"]'))
                        .map((el) => el.outerHTML),
                };
                remember(key, entry);
                if (!isPop) history.pushState(null, '', key);
                appliedClientSide = true;
                apply(entry, key, isPop);
                barHide();
            })
            .catch((error) => {
                if (error && error.name === 'AbortError') return;
                barHide();
                location.assign(target.href);
            });
    }

    function navigate(url) {
        const target = url instanceof URL ? url : new URL(url, location.href);
        if (target.origin !== location.origin) {
            location.assign(target.href);
            return;
        }
        const key = keyOf(target);
        if (key === currentKey()) return; // same-document / #hash link — let the browser handle it
        saveScroll();
        if (cache.has(key)) {
            barShow();
            requestAnimationFrame(() => requestAnimationFrame(() => barHide()));
            history.pushState(null, '', key);
            appliedClientSide = true;
            apply(cache.get(key), key, false);
        } else {
            fetchPage(target, key, false);
        }
    }

    /* --- wire-up --- */
    history.scrollRestoration = 'manual';

    document.addEventListener(
        'click',
        (event) => {
            if (event.button !== 0 || event.defaultPrevented) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = event.target.closest('a');
            if (!anchor) return;
            if (anchor.target && anchor.target !== '_self') return;
            if (anchor.hasAttribute('download') || anchor.hasAttribute('data-no-spa')) return;
            const href = anchor.getAttribute('href') || '';
            if (!href || href.startsWith('#') || /^\s*(mailto:|tel:)/i.test(href)) return;
            if (anchor.origin !== location.origin) return;
            const url = new URL(anchor.href);
            if (keyOf(url) === currentKey()) return;
            event.preventDefault();
            navigate(url);
        },
        true,
    );

    window.addEventListener('popstate', () => {
        if (!appliedClientSide) return; // the initial full-load entry — nothing to restore
        saveScroll(); // record where the page we are leaving was scrolled to
        const key = currentKey();
        if (cache.has(key)) {
            apply(cache.get(key), key, true);
        } else {
            fetchPage(new URL(location.href), key, true);
        }
    });

    const main = mainEl();
    if (main) main.setAttribute('tabindex', '-1');

    window.rencanaSpa = { navigate };
})();
