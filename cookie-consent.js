/* ============================================
   BLITZ-IT & ELEKTRO — Cookie-Consent
   DSGVO / TTDSG-konform: Google Analytics wird
   erst nach aktiver Einwilligung geladen.
   ============================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'blitz-cookie-consent';
    var GA_ID = 'G-5QPEHSVQLW';
    var CONSENT_VERSION = 1;

    /* ----- Google Consent Mode v2: Standard = alles abgelehnt ----- */
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });

    /* ----- Speicherung ----- */
    function readConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || data.version !== CONSENT_VERSION) return null;
            return data;
        } catch (e) {
            return null;
        }
    }

    function saveConsent(statistics) {
        var data = {
            version: CONSENT_VERSION,
            necessary: true,
            statistics: !!statistics,
            timestamp: new Date().toISOString()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* Speicher blockiert — Banner erscheint erneut */ }
        return data;
    }

    /* ----- Google Analytics nur nach Einwilligung laden ----- */
    var gaLoaded = false;

    function loadAnalytics() {
        gtag('consent', 'update', { analytics_storage: 'granted' });
        if (gaLoaded) return;
        gaLoaded = true;

        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);

        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    }

    function revokeAnalytics() {
        gtag('consent', 'update', { analytics_storage: 'denied' });
        // Bereits gesetzte GA-Cookies entfernen
        var cookies = document.cookie.split(';');
        cookies.forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (/^_ga/.test(name) || name === '_gid' || name === '_gat') {
                var host = location.hostname.replace(/^www\./, '');
                document.cookie = name + '=; Max-Age=0; path=/';
                document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host;
            }
        });
    }

    function applyConsent(data) {
        if (data && data.statistics) {
            loadAnalytics();
        } else {
            revokeAnalytics();
        }
    }

    /* ----- Banner / Einstellungs-Dialog ----- */
    var banner, settings, statsToggle;

    function buildUI() {
        banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.id = 'cookieBanner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-labelledby', 'cookieBannerTitle');
        banner.hidden = true;
        banner.innerHTML =
            '<div class="cookie-banner-inner">' +
                '<div class="cookie-banner-text">' +
                    '<p class="cookie-banner-title" id="cookieBannerTitle">Cookies &amp; Datenschutz</p>' +
                    '<p>Wir verwenden technisch notwendige Cookies. Mit Ihrer Einwilligung setzen wir zusätzlich ' +
                    'Google Analytics ein, um die Nutzung unserer Website zu verstehen. Details finden Sie in unserer ' +
                    '<a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
                '</div>' +
                '<div class="cookie-banner-actions">' +
                    '<button type="button" class="btn-ghost" id="cookieSettingsBtn">Einstellungen</button>' +
                    '<button type="button" class="btn-secondary" id="cookieRejectBtn">Nur notwendige</button>' +
                    '<button type="button" class="btn-primary" id="cookieAcceptBtn">Alle akzeptieren</button>' +
                '</div>' +
            '</div>';

        settings = document.createElement('div');
        settings.className = 'cookie-settings';
        settings.id = 'cookieSettings';
        settings.setAttribute('role', 'dialog');
        settings.setAttribute('aria-modal', 'true');
        settings.setAttribute('aria-labelledby', 'cookieSettingsTitle');
        settings.hidden = true;
        settings.innerHTML =
            '<div class="cookie-settings-backdrop" data-close></div>' +
            '<div class="cookie-settings-panel">' +
                '<button type="button" class="cookie-settings-close" aria-label="Schließen" data-close>&times;</button>' +
                '<h2 id="cookieSettingsTitle">Cookie-Einstellungen</h2>' +
                '<p class="cookie-settings-desc">Wählen Sie, welche Cookies wir verwenden dürfen. Ihre Auswahl können Sie jederzeit über den Link „Cookie-Einstellungen“ im Footer ändern.</p>' +
                '<div class="cookie-category">' +
                    '<div class="cookie-category-head">' +
                        '<label for="cookieNecessary"><strong>Notwendig</strong></label>' +
                        '<input type="checkbox" id="cookieNecessary" checked disabled aria-describedby="cookieNecessaryDesc">' +
                    '</div>' +
                    '<p id="cookieNecessaryDesc">Erforderlich für den Betrieb der Website, z.&nbsp;B. das Speichern Ihrer Cookie-Auswahl. Kann nicht deaktiviert werden.</p>' +
                '</div>' +
                '<div class="cookie-category">' +
                    '<div class="cookie-category-head">' +
                        '<label for="cookieStatistics"><strong>Statistik</strong> (Google Analytics)</label>' +
                        '<input type="checkbox" id="cookieStatistics" aria-describedby="cookieStatisticsDesc">' +
                    '</div>' +
                    '<p id="cookieStatisticsDesc">Hilft uns zu verstehen, wie Besucher die Website nutzen. Daten werden mit anonymisierter IP-Adresse an Google übermittelt.</p>' +
                '</div>' +
                '<div class="cookie-settings-actions">' +
                    '<button type="button" class="btn-secondary" id="cookieSaveBtn">Auswahl speichern</button>' +
                    '<button type="button" class="btn-primary" id="cookieAcceptAllBtn">Alle akzeptieren</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(banner);
        document.body.appendChild(settings);

        statsToggle = settings.querySelector('#cookieStatistics');

        banner.querySelector('#cookieAcceptBtn').addEventListener('click', function () {
            finish(true);
        });
        banner.querySelector('#cookieRejectBtn').addEventListener('click', function () {
            finish(false);
        });
        banner.querySelector('#cookieSettingsBtn').addEventListener('click', openSettings);

        settings.querySelector('#cookieSaveBtn').addEventListener('click', function () {
            finish(statsToggle.checked);
        });
        settings.querySelector('#cookieAcceptAllBtn').addEventListener('click', function () {
            finish(true);
        });
        settings.querySelectorAll('[data-close]').forEach(function (el) {
            el.addEventListener('click', closeSettings);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !settings.hidden) closeSettings();
        });
    }

    function showBanner() {
        banner.hidden = false;
        requestAnimationFrame(function () { banner.classList.add('visible'); });
    }

    function hideBanner() {
        banner.classList.remove('visible');
        banner.hidden = true;
    }

    function openSettings() {
        var current = readConsent();
        statsToggle.checked = !!(current && current.statistics);
        settings.hidden = false;
        document.body.classList.add('cookie-settings-open');
        settings.querySelector('.cookie-settings-close').focus();
    }

    function closeSettings() {
        settings.hidden = true;
        document.body.classList.remove('cookie-settings-open');
        // Ohne gespeicherte Entscheidung bleibt das Banner sichtbar
        if (!readConsent()) showBanner();
    }

    function finish(statistics) {
        var data = saveConsent(statistics);
        applyConsent(data);
        settings.hidden = true;
        document.body.classList.remove('cookie-settings-open');
        hideBanner();
    }

    /* ----- Init ----- */
    function init() {
        buildUI();

        // Footer-Link "Cookie-Einstellungen"
        document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                hideBanner();
                openSettings();
            });
        });

        var stored = readConsent();
        if (stored) {
            applyConsent(stored);
        } else {
            showBanner();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
