(() => {
    const theme = document.documentElement;

    /* ------------------------------------------------------------------
       Masker reveal — IntersectionObserver (tanpa listener scroll)
    ------------------------------------------------------------------ */
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealEls.forEach((el) => {
            el.classList.add('is-in');
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-in');
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
        );
        revealEls.forEach((el) => {
            revealObserver.observe(el);
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

    function showToast(text, type = 'success', ttl = 4000) {
        if (!toastStack) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.innerHTML = `
            <span class="toast-dot" aria-hidden="true"></span>
            <span class="toast-text"></span>
            <button type="button" class="toast-close" aria-label="Tutup pemberitahuan">${ICON_CROSS}</button>`;
        toast.querySelector('.toast-text').textContent = text;
        toastStack.appendChild(toast);
        wireToast(toast);
        window.setTimeout(() => dismissToast(toast), ttl);
    }

    document.querySelectorAll('.toast[data-toast]').forEach(wireToast);

    if (location.search.includes('flash=')) {
        history.replaceState(null, '', location.pathname);
    }

    /* ------------------------------------------------------------------
       Modal konfirmasi hapus
    ------------------------------------------------------------------ */
    const confirmModal = document.getElementById('confirm-modal');
    const confirmName = confirmModal ? confirmModal.querySelector('[data-confirm-name]') : null;
    const confirmOk = confirmModal ? confirmModal.querySelector('[data-confirm-ok]') : null;
    let pendingForm = null;
    let lastTrigger = null;

    function openConfirmModal(name, trigger) {
        if (!confirmModal) return;
        confirmName.textContent = `"${name}"`;
        lastTrigger = trigger;
        pendingForm = trigger.closest('form');
        confirmModal.hidden = false;
        confirmOk.focus();
    }

    function closeConfirmModal() {
        if (!confirmModal || confirmModal.hidden) return;
        confirmModal.hidden = true;
        if (lastTrigger) lastTrigger.focus();
        lastTrigger = null;
        pendingForm = null;
    }

    if (confirmModal) {
        confirmModal.querySelectorAll('[data-modal-close]').forEach((el) => {
            el.addEventListener('click', closeConfirmModal);
        });

        confirmOk.addEventListener('click', () => {
            const form = pendingForm;
            closeConfirmModal();
            if (form) form.submit();
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
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.hidden = true;
            applyView();
            searchInput.focus();
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
        });
    }

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
})();
