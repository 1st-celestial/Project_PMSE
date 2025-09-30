(function () {
  // Feature-safe startup: ensure widget exists
  var widget = document.getElementById('pm-search-widget');
  if (!widget) return;

  // DOM refs
  var btn = document.getElementById('pm-search-btn');
  var panel = document.getElementById('pm-search-panel');
  var input = document.getElementById('pm-search-input');
  var suggBox = document.getElementById('pm-search-suggestions');

  // State
  var domIndex = [];    // items from current page DOM
  var siteIndex = [];   // optional JSON site-wide index (fetched once)
  var mergedIndex = []; // siteIndex + domIndex merged on open
  var activeIdx = -1;
  var activeClass = 'active';

  // Try to fetch a site-wide index.json (optional). Fail silently if not present.
  (function fetchSiteIndex() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/search-index.json', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              siteIndex = JSON.parse(xhr.responseText) || [];
            } catch (e) {
              siteIndex = [];
            }
          } else {
            siteIndex = [];
          }
        }
      };
      xhr.send();
    } catch (e) {
      siteIndex = [];
    }
  })();

  // Build DOM index from anchors, headings and data-search attributes
  function buildDomIndex() {
    domIndex = [];
    var anchors = document.querySelectorAll('a[href]');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var txt = (a.innerText || a.textContent || '').trim();
      if (txt.length > 1) {
        domIndex.push({ title: txt, href: a.href, el: a, snippet: 'link' });
      }
    }

    var headings = document.querySelectorAll('h1,h2,h3,h4,h5');
    for (var j = 0; j < headings.length; j++) {
      var h = headings[j];
      var ht = (h.innerText || h.textContent || '').trim();
      if (ht.length > 1) {
        var parentAnchor = h.closest('a[href]');
        var href = parentAnchor ? parentAnchor.href : (h.id ? location.href.split('#')[0] + '#' + h.id : null);
        domIndex.push({ title: ht, href: href, el: h, snippet: 'heading' });
      }
    }

    var dataEls = document.querySelectorAll('[data-search]');
    for (var k = 0; k < dataEls.length; k++) {
      var el = dataEls[k];
      var txt = (el.getAttribute('data-search') || el.innerText || el.textContent || '').trim();
      if (txt.length > 1) {
        var href2 = el.id ? location.href.split('#')[0] + '#' + el.id : null;
        domIndex.push({ title: txt, href: href2, el: el, snippet: 'data' });
      }
    }

    // dedupe simple
    var seen = {};
    domIndex = domIndex.filter(function (it) {
      var key = (it.title || '') + '|' + (it.href || '') + '|' + (it.snippet || '');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  // Merge siteIndex & domIndex into mergedIndex (siteIndex first then DOM)
  function mergeIndexes() {
    // ensure both arrays present
    var combined = (siteIndex || []).slice();
    // append dom entries but avoid duplicates (by title+href)
    var map = {};
    for (var m = 0; m < combined.length; m++) {
      var key = (combined[m].title || '') + '|' + (combined[m].href || '');
      map[key] = true;
    }
    for (var n = 0; n < domIndex.length; n++) {
      var d = domIndex[n];
      var key2 = (d.title || '') + '|' + (d.href || '');
      if (!map[key2]) {
        combined.push(d);
        map[key2] = true;
      }
    }
    mergedIndex = combined;
  }

  // Open / close helpers
  function openWidget() {
    widget.classList.add('open');
    setTimeout(function () { if (input) input.focus(); }, 120);
    buildDomIndex();
    mergeIndexes();
  }
  function closeWidget() {
    widget.classList.remove('open');
    if (input) input.value = '';
    renderSuggestions([]);
    activeIdx = -1;
  }

  // Render suggestions
  function renderSuggestions(list) {
    if (!suggBox) return;
    suggBox.innerHTML = '';
    if (!list || list.length === 0) {
      var nr = document.createElement('div');
      nr.className = 'pm-no-results';
      nr.textContent = 'No results';
      suggBox.appendChild(nr);
      return;
    }
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var item = document.createElement('div');
      item.className = 'pm-suggestion';
      item.setAttribute('role', 'option');
      item.setAttribute('data-idx', i);
      item.tabIndex = 0;

      var title = document.createElement('div');
      title.textContent = it.title;
      item.appendChild(title);

      if (it.snippet) {
        var meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = it.snippet;
        item.appendChild(meta);
      }

      // click handler
      (function (localIt) {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          if (localIt.href) {
            try {
              var url = localIt.href;
              // handle same-origin fragment links as smooth scroll
              if (url.indexOf(location.origin) === 0 && url.indexOf('#') !== -1) {
                var id = url.split('#')[1];
                var target = document.getElementById(id);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  closeWidget();
                  return;
                }
              }
              window.location.href = url;
            } catch (err) {
              window.location.href = localIt.href;
            }
          } else if (localIt.el && localIt.el.scrollIntoView) {
            localIt.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            closeWidget();
          }
        });
      })(it);

      suggBox.appendChild(item);
    }
  }

  // searchQuery: simple substring match on title
  function searchQuery(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    var results = [];
    var list = mergedIndex || [];
    for (var i = 0; i < list.length; i++) {
      var title = (list[i].title || '').toLowerCase();
      if (title.indexOf(q) !== -1) {
        results.push(list[i]);
      }
    }
    results.sort(function (a, b) { return (a.title || '').length - (b.title || '').length; });
    return results.slice(0, 10);
  }

  // Keyboard + input handlers
  function updateActive(list, idx) {
    var items = list || [];
    for (var m = 0; m < items.length; m++) items[m].classList.remove(activeClass);
    if (idx >= 0 && items[idx]) items[idx].classList.add(activeClass);
    if (idx >= 0 && items[idx] && items[idx].scrollIntoView) items[idx].scrollIntoView({ block: 'nearest' });
  }

  if (input) {
    input.addEventListener('input', function () {
      var q = input.value || '';
      if (!q.trim()) {
        renderSuggestions([]);
        activeIdx = -1;
        return;
      }
      var res = searchQuery(q);
      renderSuggestions(res);
      activeIdx = -1;
    });

    input.addEventListener('keydown', function (ev) {
      var items = suggBox ? suggBox.querySelectorAll('.pm-suggestion') : [];
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (!items || items.length === 0) return;
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        updateActive(items, activeIdx);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (!items || items.length === 0) return;
        activeIdx = Math.max(activeIdx - 1, 0);
        updateActive(items, activeIdx);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (items && items.length > 0 && activeIdx >= 0) {
          items[activeIdx].click();
        } else {
          var q = input.value || '';
          var res = searchQuery(q);
          if (res && res.length > 0) {
            var first = res[0];
            if (first.href) window.location.href = first.href;
            else if (first.el && first.el.scrollIntoView) {
              first.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              closeWidget();
            }
          }
        }
      }
    });
  }

  // Prevent panel clicks from closing widget
  if (panel) {
    panel.addEventListener('click', function (ev) { ev.stopPropagation(); });
  }
  if (suggBox) {
    suggBox.addEventListener('click', function (ev) { ev.stopPropagation(); });
  }

  // btn toggle
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (widget.classList.contains('open')) {
        closeWidget();
      } else {
        openWidget();
      }
    });
  }

  // close on outside click or ESC
  document.addEventListener('click', function (ev) {
    if (!widget.contains(ev.target)) closeWidget();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') closeWidget();
  });

  // initial build for local DOM index (so suggestions are available quickly)
  buildDomIndex();
  mergeIndexes();

})(); // IIFE end


