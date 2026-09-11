(() => {
    const theme = document.documentElement;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Navigate through the SPA layer when available; otherwise a full load. */
    function goto(url) {
        if (window.rencanaSpa) window.rencanaSpa.navigate(url);
        else location.assign(url);
    }

    /* ------------------------------------------------------------------
       Page-scoped state — re-resolved on every navigation so handlers
       always talk to the currently rendered DOM.
    ------------------------------------------------------------------ */
    let searchInput = null;
    let searchClear = null;
    let emptyFiltered = null;
    let emptyClear = null;
    let sortSelect = null;
    let categorySelect = null;
    let currentFilter = 'all';
    let currentCategory = '';
    let dragging = null;

    /* ------------------------------------------------------------------
       Reveal — CSS-only, anti-hilang. Default visible (no-JS aman).
       Dengan JS: tambah .reveal, observer tambah .is-in. Safety timeout
       paksa visible dalam 800ms agar tidak ada yang nyangkut opacity:0.
    ------------------------------------------------------------------ */
    let revealObserver = null;
    function runReveals() {
        if (revealObserver) revealObserver.disconnect();
        const els = [...document.querySelectorAll('[data-reveal]')];
        if (!els.length) return;
        if (prefersReduced) {
            els.forEach((el) => {
                el.classList.add('is-in');
            });
            return;
        }
        els.forEach((el) => {
            el.classList.add('reveal');
            const d = Number.parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
            el.style.transitionDelay = d ? `${d}s` : '';
        });
        const show = (el) => {
            el.classList.add('is-in');
            if (revealObserver) revealObserver.unobserve(el);
        };
        if (!('IntersectionObserver' in window)) {
            els.forEach(show);
            return;
        }
        revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) show(entry.target);
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -2% 0px' },
        );
        els.forEach((el) => {
            revealObserver.observe(el);
        });
        window.setTimeout(() => {
            els.forEach((el) => {
                el.classList.add('is-in');
            });
        }, 800);
    }

    /* ------------------------------------------------------------------
       Light / dark theme
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
                /* storage unavailable — the theme still applies for this session */
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
        /* Max 3 toasts in a row: drop the oldest NOW (dismissToast awaits
           animationend → that loop would never terminate). */
        while (toastStack.children.length > 3) {
            const oldest = toastStack.children[0];
            oldest.dataset.leave = '1';
            toastStack.removeChild(oldest);
        }
        wireToast(toast);
        window.setTimeout(() => dismissToast(toast), ttl);
    }

    /* Flash toasts only ever exist on a full page load — wire them once. */
    document.querySelectorAll('.toast[data-toast]').forEach(wireToast);

    /* ------------------------------------------------------------------
       Delete confirmation modal (persistent chrome — wired once)
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
        /* 942 — initial focus on the Cancel button (non-destructive action). */
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

    /* Async delete: no reload, the item shrinks then disappears (266).
       Offers "Batalkan" (undo, 409) for 7 seconds.
       Network failure → offer retry (263), not a silent reload.
       List becomes empty → full reload. */
    function attemptDelete(form, item, saved) {
        if (!form) return;

        /* The native FormData is multipart, which the server does not
           parse (urlencoded only) → send URL-encoded so req.body is read. */
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
                if (item && !prefersReduced) {
                    item.classList.add('is-leaving');
                    window.setTimeout(leave, 180);
                    return;
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

    function undoDelete(saved) {
        const body = new URLSearchParams();
        body.set('name', saved.name);
        body.set('completed', String(saved.completed));
        body.set('createdAt', saved.createdAt);
        body.set('priority', saved.priority || '');
        body.set('due', saved.due || '');
        body.set('category', saved.category || '');
        body.set('notes', saved.notes || '');
        body.set('archived', String(saved.archived));
        if (saved.repeat) body.set('repeat', saved.repeat);
        if (Array.isArray(saved.subtasks) && saved.subtasks.length) body.set('subtasks', JSON.stringify(saved.subtasks));

        fetch('/restore', {
            method: 'POST',
            body,
            headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
            credentials: 'same-origin',
        })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(response.statusText))))
            .then((payload) => {
                if (!payload.ok || !payload.todo) throw new Error('restore failed');
                const todo = payload.todo;
                const node = saved.node;
                const list = document.getElementById('todo-list');
                if (!list || !node) return;

                node.dataset.id = todo.id;
                node.dataset.priority = todo.priority || '';
                node.dataset.due = todo.due || '';
                node.dataset.category = todo.category || '';
                node.dataset.archived = todo.archived ? '1' : '0';
                node.classList.toggle('is-archived', Boolean(todo.archived));
                const toggleForm = node.querySelector('.toggle-form');
                toggleForm.setAttribute('action', `/toggle/${todo.id}`);
                const archiveForm = node.querySelector('.archive-form');
                if (archiveForm) archiveForm.setAttribute('action', `/archive/${todo.id}`);
                const editLink = node.querySelector('a[href^="/edit-todo/"]');
                editLink.setAttribute('href', `/edit-todo/${todo.id}`);
                editLink.setAttribute('aria-label', `Ubah rencana: ${todo.name}`);
                const deleteForm = node.querySelector('.delete-form');
                deleteForm.querySelector('input[name="id"]').value = todo.id;
                node.classList.toggle('is-done', todo.completed);

                list.insertBefore(node, list.querySelector('#empty-filtered'));
                if (!prefersReduced) {
                    node.classList.add('is-entering');
                    requestAnimationFrame(() => requestAnimationFrame(() => node.classList.remove('is-entering')));
                } else {
                    node.hidden = false;
                }
                refreshStats();
                applyView();
                refreshDnD();
                showToast('Rencana dikembalikan.');
            })
            .catch(() => {
                location.reload();
            });
    }

    if (confirmModal) {
        confirmModal.querySelectorAll('[data-modal-close]').forEach((el) => {
            el.addEventListener('click', closeConfirmModal);
        });

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
                      category: item.dataset.category || '',
                      notes: item.querySelector('.todo-note')?.textContent || '',
                      archived: isArchived(item),
                      repeat: pendingForm.querySelector('input[name="repeat"]')?.value || '',
                      subtasks: (() => {
                          const raw = pendingForm.querySelector('input[name="subtasks"]')?.value || '';
                          try {
                              return JSON.parse(raw);
                          } catch {
                              return [];
                          }
                      })(),
                      node: item,
                  }
                : null;
            closeConfirmModal();
            attemptDelete(form, item, saved);
        });

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

    /* ------------------------------------------------------------------
       List helpers — called by handlers bound in runPage()
    ------------------------------------------------------------------ */
    function namePartOf(label) {
        return label.replace(/^Tandai (selesai|belum selesai):\s*/i, '');
    }

    function visibleItems() {
        return [...document.querySelectorAll('.todo-item')];
    }

    function isArchived(item) {
        return item.dataset.archived === '1';
    }

    function updateCounts() {
        const items = visibleItems();
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

        const matches = (filter) =>
            items.filter((item) => {
                const done = item.classList.contains('is-done');
                const archived = isArchived(item);
                if (filter === 'archive') {
                    if (!archived) return false;
                } else if (archived) {
                    return false;
                } else if (filter === 'active' && done) {
                    return false;
                } else if (filter === 'done' && !done) {
                    return false;
                }
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
        const items = visibleItems().filter((item) => !isArchived(item));
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

    function applyView() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visible = 0;

        visibleItems().forEach((item) => {
            const done = item.classList.contains('is-done');
            const archived = isArchived(item);
            const filterOk =
                currentFilter === 'archive'
                    ? archived
                    : !archived && (currentFilter === 'all' || (currentFilter === 'active' && !done) || (currentFilter === 'done' && done));
            const searchOk = !searchTerm || item.querySelector('.todo-name').textContent.toLowerCase().includes(searchTerm);
            const catOk = !currentCategory || (item.dataset.category ?? '') === currentCategory;
            const show = filterOk && searchOk && catOk;
            item.hidden = !show;
            if (show) visible += 1;
        });

        if (emptyFiltered) emptyFiltered.classList.toggle('is-hidden', visible !== 0);
        updateCounts();
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

    /* Filter / sort / search persist in the URL (412) — no reload.
       syncState() also drops ?flash= from the URL (267). */
    function syncState() {
        const params = new URLSearchParams(location.search);
        params.delete('flash');
        const q = searchInput?.value.trim();
        const f = currentFilter === 'all' ? '' : currentFilter;
        const s = sortSelect && sortSelect.value !== 'newest' ? sortSelect.value : '';
        const c = currentCategory;
        if (q) params.set('q', q);
        else params.delete('q');
        if (f) params.set('f', f);
        else params.delete('f');
        if (s) params.set('s', s);
        else params.delete('s');
        if (c) params.set('c', c);
        else params.delete('c');
        const qs = params.toString();
        history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
        updateTitle(q, f, s, c);
    }

    /* 272 — the tab title follows the currently filtered list context. The base
       is the page title the SPA has on screen (authoritative — survives any
       stale write from an error-page load); on a plain full page it comes from
       the live <title>, stripping our own `ekstra — ` prefix if present. */
    function updateTitle(q, f, s, c) {
        if (!searchInput) return;
        const label = f ? ({ active: 'Aktif', done: 'Selesai', archive: 'Arsip' }[f] ?? '') : '';
        const extras = [label, c || '', q ? `cari "${q}"` : '', s ? `diurut ${s}` : ''].filter(Boolean).join(' · ');
        const spaHead = window.rencanaSpa?.head?.();
        let base = spaHead?.title || document.title;
        const sepAt = base.indexOf(' — ');
        if (sepAt > 0) base = base.slice(sepAt + 3);
        document.title = extras ? `${extras} — ${base}` : base;
    }

    /* ----------------------------------------
       Progressive form wiring — shared by runPage() and freshly added items
       (quick-add). A form must be wired once per rendered DOM instance.
    ---------------------------------------- */
    function wireDeleteForm(form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            openConfirmModal(form.dataset.name || 'rencana ini', form.querySelector('button'));
        });
    }

    function wireToggleForm(form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('.todo-check');
            const item = form.closest('.todo-item');
            const action = form.getAttribute('action');

            try {
                const response = await fetch(action, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok || !payload?.ok) {
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

                if (nowDone && payload.next?.html) {
                    const wrapper = new DOMParser().parseFromString(payload.next.html, 'text/html');
                    const next = wrapper.body.firstElementChild;
                    const list = document.getElementById('todo-list');
                    if (next && list) {
                        const firstDone = [...list.querySelectorAll('.todo-item')].find((n) => n.classList.contains('is-done'));
                        list.insertBefore(next, firstDone || document.getElementById('empty-filtered'));
                        wireItem(next);
                        if (!prefersReduced) {
                            next.classList.add('is-entering');
                            requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-entering')));
                        }
                        refreshDnD();
                    }
                    showToast(nowDone ? 'Selesai — jadwal berikutnya dibuat.' : 'Rencana ditandai belum selesai.');
                } else {
                    showToast(nowDone ? 'Rencana ditandai selesai.' : 'Rencana ditandai belum selesai.');
                }
                refreshStats();
                applyView();
                button.focus();
            } catch {
                form.submit();
            }
        });
    }

    /* 1070 — arsip: fetch POST /archive/:id returns {ok, todo}; re-render
       the item so it reflects its archive state. */
    function wireArchiveForm(form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = form.querySelector('button');
            const item = form.closest('.todo-item');
            const action = form.getAttribute('action');

            try {
                const response = await fetch(action, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                if (!response.ok) throw new Error(response.statusText);
                const payload = await response.json();
                if (!payload?.ok || !payload.todo) throw new Error('archive failed');

                const archived = payload.todo.archived;
                item.dataset.archived = archived ? '1' : '0';
                item.classList.toggle('is-archived', archived);
                const title = archived ? 'Aktifkan kembali' : 'Arsipkan';
                button.title = title;
                button.setAttribute('aria-label', `${archived ? 'Aktifkan kembali rencana' : 'Arsipkan rencana'}: ${payload.todo.name}`);

                applyView();
                refreshStats();
                refreshDnD();
                showToast(archived ? 'Rencana diarsipkan.' : 'Rencana dikembalikan dari arsip.');
            } catch {
                form.submit();
            }
        });
    }

    /* 1090 — P2: subtask checklist. One fetch endpoint mutates the embedded
       array; the response re-renders the rows block, so both the list item
       and the editor stay consistent without a page swap. Delegated across
       the panel so freshly re-rendered rows keep working. */
    function wireSubtaskPanel(panel) {
        if (!panel.dataset.wired) panel.dataset.wired = '1';
        else return;
        const mode = panel.dataset.mode || 'list';

        panel.addEventListener('click', async (event) => {
            const row = event.target.closest('.subtask-row');
            if (!row) return;
            const form = event.target.closest('.subtask-toggle') || (mode === 'edit' ? event.target.closest('.subtask-remove') : null);
            if (!form) return;
            event.preventDefault();
            const action = form.querySelector('input[name="action"]').value;
            if (action === 'remove' && !window.confirm('Hapus langkah ini?')) return;

            try {
                const response = await fetch(form.getAttribute('action'), {
                    method: 'POST',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                    credentials: 'same-origin',
                    body: new URLSearchParams(new FormData(form)),
                });
                const payload = await response.json().catch(() => null);
                if (!response.ok || !payload?.ok) {
                    form.submit();
                    return;
                }
                const wrapper = new DOMParser().parseFromString(payload.html, 'text/html');
                const block = wrapper.body.firstElementChild;
                if (block && panel) {
                    panel.innerHTML = block.outerHTML;
                }
                if (mode !== 'edit') refreshStats();
            } catch {
                form.submit();
            }
        });
    }

    function wireItem(item) {
        const toggleForm = item.querySelector('.toggle-form');
        if (toggleForm) wireToggleForm(toggleForm);
        const archiveForm = item.querySelector('.archive-form');
        if (archiveForm) wireArchiveForm(archiveForm);
        const deleteForm = item.querySelector('.delete-form');
        if (deleteForm) wireDeleteForm(deleteForm);
        const panel = item.querySelector('.subtask-panel');
        if (panel) wireSubtaskPanel(panel);
    }

    /* ----------------------------------------
       Drag & drop manual order (1040). Active only when the whole list is
       visible — hidden/searching/filtered lists would reorder against a
       misleading subset. Delegated on the list, so appended items work too.
    ---------------------------------------- */
    function reorderable() {
        return !searchInput?.value.trim() && currentFilter === 'all' && (!sortSelect || sortSelect.value === 'newest') && !currentCategory;
    }

    function refreshDnD() {
        const allow = reorderable();
        document.querySelectorAll('.todo-item').forEach((item) => {
            item.dataset.reorder = allow && !isArchived(item) ? '1' : '0';
            const handle = item.querySelector('.drag-handle');
            if (handle) handle.setAttribute('draggable', String(allow && !isArchived(item)));
        });
    }

    function persistOrder() {
        const list = document.getElementById('todo-list');
        const ids = [...(list ? list.querySelectorAll('.todo-item') : [])]
            .filter((node) => !isArchived(node))
            .map((node) => node.dataset.id);
        if (!ids.length) return Promise.resolve();
        return fetch('/api/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
            credentials: 'same-origin',
        })
            .then((response) => (response.ok ? null : Promise.reject(new Error(response.statusText))))
            .then(
                () => showToast('Urutan rencana disimpan.'),
                () => showToast('Gagal menyimpan urutan. Muat ulang halaman.', 'error', 7000),
            );
    }

    function cleanupDrag() {
        if (dragging) dragging.classList.remove('is-grabbed');
        dragging = null;
    }

    /* ------------------------------------------------------------------
       runPage — binds everything that targets the currently rendered
       <main>. Called on first load and again after every SPA swap, so the
       handlers always follow the fresh DOM.
    ------------------------------------------------------------------ */
    function runPage() {
        /* Enter: CSS-only, tidak ada yang disembunyikan via inline style. */
        runReveals();

        /* ----------------------------------------
           Destructive forms confirm via native dialog.
        ---------------------------------------- */
        document.querySelectorAll('form[data-confirm]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                if (!window.confirm(form.dataset.confirm)) event.preventDefault();
            });
        });

        /* ----------------------------------------
           Delete confirmation flow (bound per rendered form).
        ---------------------------------------- */
        document.querySelectorAll('.delete-form').forEach(wireDeleteForm);

        /* ----------------------------------------
           Toggle done — progressive: fetch when JS is available, form otherwise
        ---------------------------------------- */
        document.querySelectorAll('.toggle-form').forEach(wireToggleForm);

        /* ----------------------------------------
           Archive — same progressive fetch pattern (1070)
        ---------------------------------------- */
        document.querySelectorAll('.archive-form').forEach(wireArchiveForm);

        /* ----------------------------------------
           Subtasks (1090) — panels are wired once per item; the editor's
           "Tambah" form is a plain progressive POST (full reload without JS).
        ---------------------------------------- */
        document.querySelectorAll('.subtask-panel').forEach(wireSubtaskPanel);
        document.querySelectorAll('.subtask-add').forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const input = form.querySelector('input[name="text"]');
                if (!input?.value.trim()) return;
                try {
                    const response = await fetch(form.getAttribute('action'), {
                        method: 'POST',
                        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
                        credentials: 'same-origin',
                        body: new URLSearchParams(new FormData(form)),
                    });
                    const payload = await response.json().catch(() => null);
                    if (!response.ok || !payload?.ok) {
                        form.submit();
                        return;
                    }
                    const wrapper = new DOMParser().parseFromString(payload.html, 'text/html');
                    const block = wrapper.body.firstElementChild;
                    const panel = form.closest('.form-field')?.querySelector('.subtask-panel');
                    if (block && panel) panel.innerHTML = block.outerHTML;
                    input.value = '';
                } catch {
                    form.submit();
                }
            });
        });

        /* ----------------------------------------
           Search & filter, re-resolved against the current DOM.
        ---------------------------------------- */
        searchInput = document.getElementById('todo-search');
        searchClear = document.getElementById('search-clear');
        emptyFiltered = document.getElementById('empty-filtered');
        emptyClear = document.getElementById('empty-clear');
        sortSelect = document.getElementById('todo-sort');
        categorySelect = document.getElementById('todo-category');
        currentFilter = 'all';
        currentCategory = '';

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
                if (categorySelect) {
                    categorySelect.value = '';
                    currentCategory = '';
                }
                applyView();
                syncState();
                refreshDnD();
            });
        }

        document.querySelectorAll('.filter-chip').forEach((chip) => {
            chip.addEventListener('click', (event) => {
                event.preventDefault();
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

        /* Sort the list (client): Terbaru / A–Z / Z–A — done stays at the
           bottom (369). Value syncs to the URL (412). */
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                if (sortSelect.value === 'newest') {
                    const params = new URLSearchParams(location.search);
                    params.delete('s');
                    goto(params.toString() ? `?${params.toString()}` : location.pathname);
                    return;
                }
                applySort(sortSelect.value);
                syncState();
                refreshDnD();
            });
        }

        /* Restore a deep-linked filter/search/sort state from the URL. */
        const urlParams = new URLSearchParams(location.search);
        if (searchInput) {
            const q = urlParams.get('q');
            if (q) {
                searchInput.value = q;
                searchClear.hidden = false;
            }
        }
        const stateFilter = urlParams.get('f');
        if (stateFilter === 'active' || stateFilter === 'done' || stateFilter === 'archive') {
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
        const stateCategory = urlParams.get('c');
        if (categorySelect && stateCategory && [...categorySelect.options].some((o) => o.value === stateCategory)) {
            categorySelect.value = stateCategory;
            currentCategory = stateCategory;
        }
        applyView();
        syncState();

        /* Category filter — same no-reload behaviour as the status chips. */
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                currentCategory = categorySelect.value;
                applyView();
                syncState();
                refreshDnD();
            });
        }

        /* ----------------------------------------
           Drag & drop manual order (1040) — delegated on the list.
        ---------------------------------------- */
        refreshDnD();
        const todoList = document.getElementById('todo-list');
        if (todoList) {
            todoList.addEventListener('dragstart', (event) => {
                const handle = event.target.closest('.drag-handle');
                if (!handle || !reorderable()) return;
                const item = handle.closest('.todo-item');
                if (!item) return;
                dragging = item;
                event.dataTransfer.setData('text/plain', item.dataset.id ?? '');
                event.dataTransfer.effectAllowed = 'move';
                item.classList.add('is-grabbed');
            });

            todoList.addEventListener('dragover', (event) => {
                if (!dragging) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                const target = event.target.closest('.todo-item');
                if (!target || target === dragging) return;
                const rect = target.getBoundingClientRect();
                todoList.insertBefore(dragging, event.clientY > rect.top + rect.height / 2 ? target.nextSibling : target);
            });

            todoList.addEventListener('drop', (event) => {
                if (!dragging) return;
                event.preventDefault();
                cleanupDrag();
                persistOrder();
            });

            todoList.addEventListener('dragend', cleanupDrag);
        }

        /* ----------------------------------------
           Bulk actions (1100) — select checkboxes + floating action bar.
        ---------------------------------------- */
        const bulkBar = document.getElementById('bulk-bar');
        const bulkCount = document.getElementById('bulk-count');
        if (bulkBar && bulkCount) {
            const refreshBulk = () => {
                const selected = [...document.querySelectorAll('.todo-select:checked')];
                bulkCount.textContent = `${selected.length} dipilih`;
                bulkBar.hidden = selected.length === 0;
            };
            document.getElementById('todo-list')?.addEventListener('change', (event) => {
                if (event.target.classList?.contains('todo-select')) refreshBulk();
            });
            document.getElementById('bulk-clear')?.addEventListener('click', () => {
                document.querySelectorAll('.todo-select:checked').forEach((el) => {
                    el.checked = false;
                });
                refreshBulk();
            });
            bulkBar.querySelectorAll('[data-bulk]').forEach((button) => {
                button.addEventListener('click', async () => {
                    const action = button.dataset.bulk;
                    const ids = [...document.querySelectorAll('.todo-select:checked')].map((el) => el.closest('.todo-item').dataset.id);
                    if (!ids.length) return;
                    if (action === 'delete' && !window.confirm(`Hapus ${ids.length} rencana sekaligus?`)) return;
                    button.disabled = true;
                    try {
                        const response = await fetch('/api/bulk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify({ ids, action }),
                        });
                        const payload = await response.json().catch(() => null);
                        if (!response.ok || !payload?.ok) {
                            showToast('Aksi massal gagal. Coba lagi.', 'error', 7000);
                            return;
                        }
                        ids.forEach((id) => {
                            const node = document.querySelector(`.todo-item[data-id="${id}"]`);
                            if (!node) return;
                            if (action === 'delete') {
                                node.remove();
                            } else if (action === 'archive') {
                                node.dataset.archived = '1';
                                node.classList.add('is-archived');
                            } else {
                                node.classList.add('is-done');
                            }
                        });
                        refreshBulk();
                        refreshStats();
                        applyView();
                        refreshDnD();
                        showToast(
                            `${ids.length} rencana ${action === 'complete' ? 'diselesaikan' : action === 'archive' ? 'diarsipkan' : 'dihapus'}.`,
                        );
                    } catch {
                        showToast('Aksi massal gagal. Coba lagi.', 'error', 7000);
                    } finally {
                        button.disabled = false;
                    }
                });
            });
        }

        /* ----------------------------------------
           Quick-add (1040) — native form posts as usual without JS (full
           reload); with JS it appends the item inline via JSON.
        ---------------------------------------- */
        const quickAdd = document.getElementById('quick-add');
        if (quickAdd) {
            const quickCategory = document.getElementById('quick-add-category');
            const quickInput = quickAdd.querySelector('input[name="name"]');
            const quickBtn = quickAdd.querySelector('button[type="submit"]');
            const setQuickCategory = () => {
                if (quickCategory && categorySelect) quickCategory.value = categorySelect.value;
            };
            setQuickCategory();
            quickAdd.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (!quickInput || !quickBtn) return;
                const value = quickInput.value.trim();
                if (!value) return;
                setQuickCategory();
                const body = new URLSearchParams(new FormData(quickAdd));
                quickBtn.disabled = true;
                try {
                    const response = await fetch(quickAdd.getAttribute('action') || '/', {
                        method: 'POST',
                        body,
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                    });
                    const payload = await response.json().catch(() => null);
                    if (!response.ok || !payload?.ok || !payload.html) {
                        const error = typeof payload?.error === 'string' ? payload.error : 'Gagal menambahkan rencana.';
                        showToast(error, 'error', 7000);
                        return;
                    }
                    const wrapper = new DOMParser().parseFromString(payload.html, 'text/html');
                    const item = wrapper.body.firstElementChild;
                    const list = document.getElementById('todo-list');
                    if (!item || !list) return;
                    /* A fresh todo belongs on top of the active group (newest first). */
                    const firstDone = [...list.querySelectorAll('.todo-item')].find((n) => n.classList.contains('is-done'));
                    list.insertBefore(item, firstDone || document.getElementById('empty-filtered'));
                    wireItem(item);
                    wrapper.remove();
                    if (!prefersReduced) {
                        item.classList.add('is-entering');
                        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove('is-entering')));
                    }
                    quickInput.value = '';
                    refreshStats();
                    refreshDnD();
                    showToast('Rencana ditambahkan.');
                } catch {
                    showToast('Gagal menambahkan rencana. Coba lagi.', 'error', 7000);
                } finally {
                    quickBtn.disabled = false;
                    quickInput.focus();
                }
            });
        }

        /* ----------------------------------------
           Soft character counter (341): "n/200" under the name input
        ---------------------------------------- */
        document.querySelectorAll('[data-counter-for]').forEach((counter) => {
            const input = document.getElementById(counter.dataset.counterFor);
            if (!input) return;
            const render = () => {
                counter.textContent = `${input.value.length}/${input.maxLength || 200}`;
            };
            input.addEventListener('input', render);
            render();
        });

        /* ----------------------------------------
           Form errors clear on retyping (255) + initial focus (353)
        ---------------------------------------- */
        document.querySelectorAll('.form-field.is-error').forEach((field) => {
            const input = field.querySelector('input, select, textarea');
            const clear = () => field.classList.remove('is-error');
            if (input) input.addEventListener('input', clear, { once: true });
            else clear();
        });

        /* ----------------------------------------
           Live preview for the form pages — name, priority, due date
           appear in the "Pratinjau" rail exactly as they will in the list.
           Without JS the rail is just static (decorative), the form still
           works fully.
        ---------------------------------------- */
        (() => {
            const root = document.querySelector('[data-preview]');
            const nameInput = document.getElementById('todo-name');
            const dueInput = document.getElementById('todo-due');
            const priInputs = document.querySelectorAll('input[name="priority"]');
            if (!root || !nameInput || !dueInput || !priInputs.length) return;

            const nameEl = root.querySelector('[data-preview-name]');
            const priEl = root.querySelector('[data-preview-priority]');
            const dueEl = root.querySelector('[data-preview-due]');
            if (!nameEl || !priEl || !dueEl) return;

            const NAME_PLACEHOLDER = 'Nama rencana akan tampil di sini.';
            const PRIORITY_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };

            const renderName = () => {
                const v = nameInput.value.trim();
                nameEl.textContent = v || NAME_PLACEHOLDER;
                nameEl.classList.toggle('is-placeholder', !v);
            };

            const renderPriority = () => {
                const v = String(document.querySelector('input[name="priority"]:checked')?.value ?? '');
                if (!v) {
                    priEl.hidden = true;
                    return;
                }
                priEl.hidden = false;
                priEl.textContent = PRIORITY_LABEL[v] || v;
                priEl.className = `badge badge-priority badge-priority-${v}`;
            };

            const formatDue = (iso) => {
                const due = new Date(`${iso}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
                if (diff === 0) return { label: 'Hari ini', state: 'is-today' };
                if (diff === 1) return { label: 'Besok', state: '' };
                if (diff < 0) return { label: `Terlewat ${-diff} hari`, state: 'is-overdue' };
                return {
                    label: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(due),
                    state: '',
                };
            };

            const renderDue = () => {
                if (!dueInput.value) {
                    dueEl.hidden = true;
                    return;
                }
                dueEl.hidden = false;
                const info = formatDue(dueInput.value);
                dueEl.textContent = info.label;
                dueEl.className = info.state ? `badge badge-due ${info.state}` : 'badge badge-due';
            };

            nameInput.addEventListener('input', renderName);
            dueInput.addEventListener('change', renderDue);
            priInputs.forEach((input) => {
                input.addEventListener('change', renderPriority);
            });

            renderName();
            renderPriority();
            renderDue();
        })();

        /* ----------------------------------------
           Show/hide password — brutal auth upgrade, no dependency.
        ---------------------------------------- */
        document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.getAttribute('aria-controls') || '');
                if (!input) return;
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.setAttribute('aria-pressed', String(show));
                btn.querySelector('.pw-show').hidden = show;
                btn.querySelector('.pw-hide').hidden = !show;
                input.focus();
            });
        });

        /* ----------------------------------------
           Loading indicator on add/edit form submit (prevents double submit)
        ---------------------------------------- */
        document.querySelectorAll('form.form').forEach((form) => {
            form.addEventListener('submit', () => {
                const button = form.querySelector('button[type="submit"]');
                if (!button) return;
                button.disabled = true;
                button.classList.add('is-loading');
            });
        });

        /* ----------------------------------------
           Data backup (1030): download via /api/export (anchor), import via
           file input → POST /api/import → reload. No dependencies.
        ---------------------------------------- */
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
                            throw new Error('invalid payload');
                        })
                        .catch(() => {
                            showToast('Impor gagal. Periksa format berkas JSON.', 'error', 7000);
                        });
                };
                reader.onerror = () => showToast('Gagal membaca berkas.', 'error', 7000);
                reader.readAsText(file);
            });
        }
    }

    /* ------------------------------------------------------------------
       Startup — one-shot chrome wiring, then the first page render.
    ------------------------------------------------------------------ */

    /* ----------------------------------------
       Keyboard shortcuts (221): "/" searches, "n" creates a new todo
    ---------------------------------------- */
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
            goto('/add-todo');
        }
    });

    /* ----------------------------------------
       Back to top (201): appears after scrolling far (rAF, no jitter)
    ---------------------------------------- */
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

    /* First render now; every later SPA swap re-renders the page content. */
    runPage();
    document.addEventListener('spa:ready', runPage);
})();
