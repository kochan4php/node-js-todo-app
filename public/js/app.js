(() => {
    const theme = document.documentElement;
    const BASE_TITLE = theme.dataset.title || document.title;

    /* ------------------------------------------------------------------
       Entri GSAP — intro masthead + reveal data-reveal via IntersectionObserver.
       Tanpa GSAP atau prefers-reduced-motion: elemen tetap terlihat (default).
    ------------------------------------------------------------------ */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function introMasthead() {
        const children = document.querySelectorAll('.masthead-copy > *');
        if (!children.length) return;
        gsap.fromTo(
            children,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.05 },
        );
    }

    function runReveals() {
        const els = document.querySelectorAll('[data-reveal]');
        if (!els.length) return;

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    gsap.fromTo(
                        el,
                        { autoAlpha: 0, y: 26 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.7,
                            delay: parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0,
                            ease: 'power3.out',
                        },
                    );
                    revealObserver.unobserve(el);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
        );
        els.forEach((el) => {
            revealObserver.observe(el);
        });
    }

    if (!window.gsap || prefersReduced) {
        /* mode senyap tanpa GSAP / gerak dikurangi — biarkan CSS & DOM polos */
    } else {
        introMasthead();
        runReveals();
    }

    if (window.gsap && !prefersReduced) {
        /* Hitungan stat ledger — angka mono naik pelan */
        document.querySelectorAll('.ledger-num strong').forEach((el) => {
            const target = Math.max(0, parseInt(el.textContent, 10));
            if (!target) return;
            const state = { value: 0 };
            el.textContent = '0';
            gsap.to(state, {
                value: target,
                duration: 1.1,
                ease: 'power2.out',
                onUpdate: () => {
                    el.textContent = String(Math.round(state.value));
                },
            });
        });
    }

    /* ------------------------------------------------------------------
       Tema terang / gelap
    ------------------------------------------------------------------ */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(theme.dataset.theme === 'dark'));
        themeToggle.addEventListener('click', () => {
            const next = theme.dataset.theme === 'dark' ? 'light' : 'dark';
            theme.dataset.theme = next;
            themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
            try {
                localStorage.setItem('theme', next);
            } catch {
                /* penyimpanan tidak tersedia — tema tetap dipakai sesi ini */
            }
        });
    }

    /* ------------------------------------------------------------------
       Toast
    ------------------------------------------------------------------ */
    const toastStack = document.getElementById('toast-stack');
    const ICON_CROSS =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>';

    function dismissToast(toast) {
        if (!toast || toast.dataset.leave) return;
        toast.dataset.leave = '1';
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }

    function wireToast(toast) {
        const close = toast.querySelector('.toast-close');
        if (close) close.addEventListener('click', () => dismissToast(toast));
        window.setTimeout(() => dismissToast(toast), 4000);
    }

    function showToast(text, type = 'success', ttl = 4000, action) {
        if (!toastStack) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.innerHTML = `
            <span class="toast-dot" aria-hidden="true"></span>
            <span class="toast-text"></span>
            <button type="button" class="toast-close" aria-label="Tutup pemberitahuan">${ICON_CROSS}</button>`;
        toast.querySelector('.toast-text').textContent = text;
        if (action) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'toast-action';
            btn.textContent = action.label;
            btn.addEventListener('click', () => {
                dismissToast(toast);
                action.onClick();
            });
            toast.insertBefore(btn, toast.querySelector('.toast-close'));
        }
        toastStack.appendChild(toast);
        while (toastStack.children.length > 3) dismissToast(toastStack.children[0]);
        wireToast(toast);
        window.setTimeout(() => dismissToast(toast), ttl);
    }

    document.querySelectorAll('.toast[data-toast]').forEach(wireToast);

    /* Flash tidak disimpan di URL (butir 267) — dibersihkan via syncState() di bawah. */

    /* ------------------------------------------------------------------
       Modal konfirmasi hapus
    ------------------------------------------------------------------ */
    const confirmModal = document.getElementById('confirm-modal');
    const confirmName = confirmModal ? confirmModal.querySelector('[data-confirm-name]') : null;
    const confirmOk = confirmModal ? confirmModal.querySelector('[data-confirm-ok]') : null;
    let pendingForm = null;
    let lastTrigger = null;

    function lockScroll() {
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        document.body.style.overflow = '';
    }

    function openConfirmModal(name, trigger) {
        if (!confirmModal) return;
        confirmName.textContent = `"${name}"`;
        lastTrigger = trigger;
        pendingForm = trigger.closest('form');
        confirmModal.hidden = false;
        lockScroll();
        /* 942 — fokus awal ke tombol Batal (aksi non-destruktif). */
        confirmModal.querySelector('.modal-actions [data-modal-close]').focus();
    }

    function closeConfirmModal() {
        if (!confirmModal || confirmModal.hidden) return;
        confirmModal.hidden = true;
        unlockScroll();
        if (lastTrigger) lastTrigger.focus();
        lastTrigger = null;
        pendingForm = null;
    }

    if (confirmModal) {
        confirmModal.querySelectorAll('[data-modal-close]').forEach((el) => {
            el.addEventListener('click', closeConfirmModal);
        });

        /* Hapus asinkron: tanpa reload, item mengecil lalu hilang (266).
           Ditawarkan "Batalkan" (undo, 409) selama 7 detik.
           Gagal jaringan → tawarkan retry (263), bukan reload diam-diam.
           List menjadi kosong → reload penuh. */
        function attemptDelete(form, item, saved) {
            if (!form) return;

            /* FormData asli berformat multipart yang tidak diparse server
               (hanya urlencoded) → kirim URL-encoded agar req.body terbaca. */
            fetch(form.getAttribute('action'), {
                method: 'POST',
                body: new URLSearchParams(new FormData(form)),
                headers: { Accept: 'text/html' },
                credentials: 'same-origin',
            })
                .then((response) => {
                    if (!response.ok) throw new Error(response.statusText);
                    const leave = () => {
                        item.remove();
                        if (!document.querySelectorAll('.todo-item').length) {
                            location.reload();
                            return;
                        }
                        refreshStats();
                        showToast(
                            'Rencana dihapus.',
                            'success',
                            7000,
                            saved ? { label: 'Batalkan', onClick: () => undoDelete(saved) } : undefined,
                        );
                    };
                    if (item && window.gsap && !prefersReduced) {
                        return new Promise((resolve) => {
                            gsap.to(item, {
                                autoAlpha: 0,
                                y: 14,
                                duration: 0.4,
                                ease: 'power2.in',
                                onComplete: () => {
                                    leave();
                                    resolve();
                                },
                            });
                        });
                    }
                    leave();
                })
                .catch(() => {
                    showToast('Gagal menghapus. Coba lagi.', 'error', 7000, {
                        label: 'Coba lagi',
                        onClick: () => attemptDelete(form, item, saved),
                    });
                });
        }

        confirmOk.addEventListener('click', () => {
            const form = pendingForm;
            const item = form ? form.closest('.todo-item') : null;
            const saved = item
                ? {
                      name: item.querySelector('.todo-name').textContent,
                      completed: item.classList.contains('is-done'),
                      createdAt: new Date().toISOString(),
                      priority: item.dataset.priority || '',
                      due: item.dataset.due || '',
                      node: item,
                  }
                : null;
            closeConfirmModal();
            attemptDelete(form, item, saved);
        });

        function undoDelete(saved) {
            const body = new URLSearchParams();
            body.set('name', saved.name);
            body.set('completed', String(saved.completed));
            body.set('createdAt', saved.createdAt);
            body.set('priority', saved.priority || '');
            body.set('due', saved.due || '');

            fetch('/restore', {
                method: 'POST',
                body,
                headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'same-origin',
            })
                .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
                .then((payload) => {
                    if (!payload.ok || !payload.todo) throw new Error('restore gagal');
                    const todo = payload.todo;
                    const node = saved.node;
                    const list = document.getElementById('todo-list');
                    if (!list || !node) return;

                    node.dataset.id = todo.id;
                    node.dataset.priority = todo.priority || '';
                    node.dataset.due = todo.due || '';
                    const toggleForm = node.querySelector('.toggle-form');
                    toggleForm.setAttribute('action', `/toggle/${todo.id}`);
                    const editLink = node.querySelector('a[href^="/edit-todo/"]');
                    editLink.setAttribute('href', `/edit-todo/${todo.id}`);
                    editLink.setAttribute('aria-label', `Ubah rencana: ${todo.name}`);
                    const deleteForm = node.querySelector('.delete-form');
                    deleteForm.querySelector('input[name="id"]').value = todo.id;
                    node.classList.toggle('is-done', todo.completed);

                    list.insertBefore(node, list.querySelector('#empty-filtered'));
                    if (window.gsap && !prefersReduced) {
                        gsap.fromTo(node, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                    } else {
                        node.hidden = false;
                    }
                    refreshStats();
                    showToast('Rencana dikembalikan.');
                })
                .catch(() => {
                    location.reload();
                });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeConfirmModal();
        });

        confirmModal.addEventListener('keydown', (event) => {
            if (event.key !== 'Tab') return;
            const focusables = [...confirmModal.querySelectorAll('button')].filter((b) => !b.disabled);
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    document.querySelectorAll('.delete-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            openConfirmModal(form.dataset.name || 'rencana ini', form.querySelector('button'));
        });
    });

    /* ------------------------------------------------------------------
       Toggle selesai — progresif: fetch bila ada JS, form bila tidak
    ------------------------------------------------------------------ */
    function namePartOf(label) {
        return label.replace(/^Tandai (selesai|belum selesai):\s*/i, '');
    }

    function visibleItems() {
        return [...document.querySelectorAll('.todo-item')];
    }

    function updateCounts() {
        const items = visibleItems();
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

        const matches = (filter) =>
            items.filter((item) => {
                const done = item.classList.contains('is-done');
                if (filter === 'active' && done) return false;
                if (filter === 'done' && !done) return false;
                if (searchTerm) {
                    const name = item.querySelector('.todo-name').textContent.toLowerCase();
                    if (!name.includes(searchTerm)) return false;
                }
                return true;
            }).length;

        document.querySelectorAll('.filter-chip').forEach((chip) => {
            const count = chip.querySelector('.filter-count');
            if (count) count.textContent = String(matches(chip.dataset.filter));
        });
    }

    function refreshStats() {
        const items = visibleItems();
        const done = items.filter((item) => item.classList.contains('is-done')).length;
        const total = items.length;
        const active = total - done;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = String(value);
        };
        setText('stat-done', done);
        setText('stat-active', active);

        const bar = document.getElementById('progress-bar');
        if (bar) {
            const percent = total ? Math.round((done / total) * 100) : 0;
            bar.style.setProperty('--p', String(percent / 100));
            bar.parentElement.setAttribute('aria-valuenow', String(percent));
        }

        const caption = document.getElementById('progress-text');
        if (caption) caption.textContent = `${done} dari ${total} selesai`;

        const allDone = document.getElementById('all-done');
        if (allDone) allDone.classList.toggle('is-hidden', !(total > 0 && active === 0));

        updateCounts();
    }

    document.querySelectorAll('.toggle-form').forEach((form) => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('.todo-check');
            const item = form.closest('.todo-item');
            const action = form.getAttribute('action');

            try {
                const response = await fetch(action, { method: 'POST', credentials: 'same-origin' });
                if (!response.ok) {
                    form.submit();
                    return;
                }

                const wasDone = item.classList.contains('is-done');
                const nowDone = !wasDone;
                item.classList.toggle('is-done', nowDone);
                button.setAttribute('aria-checked', String(nowDone));
                button.setAttribute(
                    'aria-label',
                    `Tandai ${nowDone ? 'belum selesai' : 'selesai'}: ${namePartOf(button.getAttribute('aria-label'))}`,
                );

                showToast(nowDone ? 'Rencana ditandai selesai.' : 'Rencana ditandai belum selesai.');
                refreshStats();
                button.focus();
            } catch {
                form.submit();
            }
        });
    });

    /* ------------------------------------------------------------------
       Pencarian & filter
    ------------------------------------------------------------------ */
    const searchInput = document.getElementById('todo-search');
    const searchClear = document.getElementById('search-clear');
    const emptyFiltered = document.getElementById('empty-filtered');
    const emptyClear = document.getElementById('empty-clear');
    let currentFilter = 'all';

    function applyView() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visible = 0;

        visibleItems().forEach((item) => {
            const done = item.classList.contains('is-done');
            const filterOk = currentFilter === 'all' || (currentFilter === 'active' && !done) || (currentFilter === 'done' && done);
            const searchOk = !searchTerm || item.querySelector('.todo-name').textContent.toLowerCase().includes(searchTerm);
            const show = filterOk && searchOk;
            item.hidden = !show;
            if (show) visible += 1;
        });

        if (emptyFiltered) emptyFiltered.classList.toggle('is-hidden', visible !== 0);
        updateCounts();
    }

    if (searchInput && searchClear) {
        searchInput.addEventListener('keyup', () => {
            searchClear.hidden = searchInput.value.trim() === '';
            applyView();
            syncState();
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.hidden = true;
            applyView();
            syncState();
            searchInput.focus();
        });
    }

    function applySort(mode) {
        const list = document.getElementById('todo-list');
        if (!list) return;
        const nodes = [...list.querySelectorAll('.todo-item')];
        nodes.sort((a, b) => {
            const aDone = a.classList.contains('is-done') ? 1 : 0;
            const bDone = b.classList.contains('is-done') ? 1 : 0;
            if (aDone !== bDone) return aDone - bDone;
            const aName = a.querySelector('.todo-name').textContent;
            const bName = b.querySelector('.todo-name').textContent;
            if (mode === 'az') return aName.localeCompare(bName, 'id');
            if (mode === 'za') return bName.localeCompare(aName, 'id');
            return 0;
        });
        nodes.forEach((node) => {
            list.appendChild(node);
        });
    }

    document.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach((other) => {
                const active = other === chip;
                other.classList.toggle('is-active', active);
                other.setAttribute('aria-pressed', String(active));
            });
            currentFilter = chip.dataset.filter;
            applyView();
            syncState();
        });
    });

    if (emptyClear) {
        emptyClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                searchClear.hidden = true;
            }
            document.querySelectorAll('.filter-chip').forEach((chip) => {
                const active = chip.dataset.filter === 'all';
                chip.classList.toggle('is-active', active);
                chip.setAttribute('aria-pressed', String(active));
            });
            currentFilter = 'all';
            applyView();
            syncState();
        });
    }

    /* ------------------------------------------------------------------
       Counter karakter lembut (341): "n/200" di bawah input nama
    ------------------------------------------------------------------ */
    document.querySelectorAll('[data-counter-for]').forEach((counter) => {
        const input = document.getElementById(counter.dataset.counterFor);
        if (!input) return;
        const render = () => {
            counter.textContent = `${input.value.length}/${input.maxLength || 200}`;
        };
        input.addEventListener('input', render);
        render();
    });

    /* ------------------------------------------------------------------
       Error form hilang saat mulai ketik ulang (255) + fokus awal (353)
    ------------------------------------------------------------------ */
    document.querySelectorAll('.form-field.is-error').forEach((field) => {
        const input = field.querySelector('input, select, textarea');
        const clear = () => field.classList.remove('is-error');
        if (input) input.addEventListener('input', clear, { once: true });
        else clear();
    });

    /* ------------------------------------------------------------------
       Posisi scroll dipulihkan saat kembali dari edit (271)
    ------------------------------------------------------------------ */
    (() => {
        const KEY = 'todo-scroll-y';
        document.querySelectorAll('.todo-actions a[href^="/edit-todo/"]').forEach((link) => {
            link.addEventListener('click', () => {
                try {
                    sessionStorage.setItem(KEY, String(window.scrollY));
                } catch {
                    /* penyimpanan tidak tersedia */
                }
            });
        });
        let saved = null;
        try {
            saved = sessionStorage.getItem(KEY);
            sessionStorage.removeItem(KEY);
        } catch {
            /* penyimpanan tidak tersedia */
        }
        if (saved) {
            requestAnimationFrame(() => {
                setTimeout(() => window.scrollTo(0, Number(saved) || 0), 0);
            });
        }
    })();

    /* ------------------------------------------------------------------
       Filter / urutan / pencarian bertahan di URL (412) — tanpa reload.
       syncState() juga membuang ?flash= dari URL (267).
    ------------------------------------------------------------------ */
    function syncState() {
        const params = new URLSearchParams(location.search);
        params.delete('flash');
        const q = searchInput?.value.trim();
        const f = currentFilter === 'all' ? '' : currentFilter;
        const s = sortSelect && sortSelect.value !== 'newest' ? sortSelect.value : '';
        if (q) params.set('q', q);
        else params.delete('q');
        if (f) params.set('f', f);
        else params.delete('f');
        if (s) params.set('s', s);
        else params.delete('s');
        const qs = params.toString();
        history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
        updateTitle(q, f, s);
    }

    /* 272 — judul tab ikut konteks daftar yang sedang disaring. */
    function updateTitle(q, f, s) {
        const label = f ? ({ active: 'Aktif', done: 'Selesai' }[f] ?? '') : '';
        const extras = [label, q ? `cari "${q}"` : '', s ? `diurut ${s}` : ''].filter(Boolean).join(' · ');
        document.title = extras ? `${extras} — ${BASE_TITLE}` : BASE_TITLE;
    }

    const sortSelect = document.getElementById('todo-sort');
    const urlParams = new URLSearchParams(location.search);
    if (searchInput) {
        const q = urlParams.get('q');
        if (q) {
            searchInput.value = q;
            searchClear.hidden = false;
        }
    }
    const stateFilter = urlParams.get('f');
    if (stateFilter === 'active' || stateFilter === 'done') {
        currentFilter = stateFilter;
        document.querySelectorAll('.filter-chip').forEach((chip) => {
            const active = chip.dataset.filter === stateFilter;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', String(active));
        });
    }
    const stateSort = urlParams.get('s');
    if (stateSort === 'az' || stateSort === 'za') {
        applySort(stateSort);
    }
    applyView();
    syncState();

    /* ------------------------------------------------------------------
       CTA magnetik — ikut kursor halus via CSS var (--mx/--my)
       Dipakai hanya bila pointer presisi (mouse), bukan raba layar.
    ------------------------------------------------------------------ */
    (() => {
        const btn = document.querySelector('.btn-cta');
        if (!btn || window.matchMedia('(pointer: coarse)').matches) return;
        const MAX = 8;
        let frame = 0;
        const place = (mx, my) => {
            const rect = btn.getBoundingClientRect();
            const dx = Math.max(-MAX, Math.min(MAX, mx - (rect.left + rect.width / 2)));
            const dy = Math.max(-MAX, Math.min(MAX, my - (rect.top + rect.height / 2)));
            btn.style.setProperty('--mx', `${dx}px`);
            btn.style.setProperty('--my', `${dy}px`);
        };
        btn.addEventListener('pointerenter', () => btn.setAttribute('data-hover', ''));
        btn.addEventListener('pointermove', (event) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => place(event.clientX, event.clientY));
        });
        btn.addEventListener('pointerleave', () => {
            cancelAnimationFrame(frame);
            btn.style.setProperty('--mx', '0px');
            btn.style.setProperty('--my', '0px');
            btn.removeAttribute('data-hover');
        });
    })();

    /* ------------------------------------------------------------------
       Indikator loading saat submit form add/edit (anti submit ganda)
    ------------------------------------------------------------------ */
    document.querySelectorAll('form.form').forEach((form) => {
        form.addEventListener('submit', () => {
            const button = form.querySelector('button[type="submit"]');
            if (!button) return;
            button.disabled = true;
            button.classList.add('is-loading');
        });
    });

    /* ------------------------------------------------------------------
       Urutkan list (client): Terbaru / A–Z / Z–A — selesai tetap di bawah
       (369). Nilai tersinkron ke URL (412).
    ------------------------------------------------------------------ */
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (sortSelect.value === 'newest') {
                const params = new URLSearchParams(location.search);
                params.delete('s');
                location.replace(params.toString() ? `?${params.toString()}` : location.pathname);
                return;
            }
            applySort(sortSelect.value);
            syncState();
        });
    }

    /* ------------------------------------------------------------------
       Cadangan data (1030): unduh via /api/export (anchor), impor lewat
       input file → POST /api/import → muat ulang. Tanpa dependency.
    ------------------------------------------------------------------ */
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());

        importFile.addEventListener('change', () => {
            const file = importFile.files?.[0];
            importFile.value = '';
            if (!file) return;
            if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
                showToast('Pilih berkas .json.', 'error', 7000);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const json = reader.result;
                if (typeof json !== 'string') return;
                fetch('/api/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: json,
                })
                    .then((response) => response.json())
                    .then((result) => {
                        if (result?.success) return location.reload();
                        throw new Error('payload invalid');
                    })
                    .catch(() => {
                        showToast('Impor gagal. Periksa format berkas JSON.', 'error', 7000);
                    });
            };
            reader.onerror = () => showToast('Gagal membaca berkas.', 'error', 7000);
            reader.readAsText(file);
        });
    }

    /* ------------------------------------------------------------------
       Pintasan keyboard (221): "/" cari, "n" buat rencana baru
    ------------------------------------------------------------------ */
    document.addEventListener('keydown', (event) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        const target = event.target;
        const typing =
            target &&
            (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
        if (typing || !searchInput) return;
        if (event.key === '/') {
            event.preventDefault();
            searchInput.focus();
        } else if (event.key.toLowerCase() === 'n') {
            event.preventDefault();
            location.assign('/add-todo');
        }
    });

    /* ------------------------------------------------------------------
       Tarik ke atas (201): muncul setelah scroll jauh (rAF, tanpa jitter)
    ------------------------------------------------------------------ */
    const scrollTop = document.getElementById('scroll-top');
    const appHeaderInner = document.querySelector('.app-header-inner');
    if (scrollTop || appHeaderInner) {
        const onScroll = () => {
            const far = window.scrollY >= 600;
            if (scrollTop) scrollTop.hidden = !far;
            if (appHeaderInner) appHeaderInner.classList.toggle('is-scrolled', window.scrollY > 4);
        };
        onScroll();
        let frame = 0;
        window.addEventListener(
            'scroll',
            () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(onScroll);
            },
            { passive: true },
        );
        if (scrollTop) {
            scrollTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
            });
        }
    }
})();
