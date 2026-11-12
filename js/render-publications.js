(function () {
  "use strict";

  var DATA_URL = "data/publications.public.json";
  var GROUPS = [
    { type: "book", label: "Books" },
    { type: "article", label: "Journal Articles" },
    { type: "conference", label: "Conference Proceedings" },
    { type: "series", label: "Research Paper Series" }
  ];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function joinNames(names) {
    if (names.length <= 1) return names.join("");
    if (names.length === 2) return names[0] + " and " + names[1];
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  }

  function authorsHtml(list, self) {
    return joinNames(list.map(function (n) {
      return n === self ? '<span class="self">' + esc(n) + "</span>" : esc(n);
    }));
  }

  function authorsZhHtml(list, self) {
    return list.map(function (n) {
      return n === self ? '<span class="self">' + esc(n) + "</span>" : esc(n);
    }).join("、");
  }

  function volIssue(it) {
    var s = "";
    if (it.volume) s += esc(it.volume);
    if (it.issue) s += "(" + esc(it.issue) + ")";
    return s;
  }

  function venueHtml(it) {
    var parts;
    if (it.type === "book") {
      parts = [esc(it.publisher), (it.month ? esc(it.month) + " " : "") + it.year];
      if (it.pages_total) parts.push(it.pages_total + " pp.");
      if (it.isbn) parts.push("ISBN " + esc(it.isbn));
      return parts.join(", ") + ".";
    }
    if (it.type === "article") {
      var s = "<em>" + esc(it.venue) + "</em>";
      // Journals numbered by issue only (no volume) are cited as "no. 1".
      var vi = it.volume ? volIssue(it) : (it.issue ? ", no. " + esc(it.issue) : "");
      if (vi) s += (it.volume ? " " : "") + vi;
      if (it.pages) s += (vi ? ": " : ", ") + esc(it.pages);
      return s + ", " + it.year + ".";
    }
    if (it.type === "conference") {
      var c = "In <em>" + esc(it.venue) + "</em>";
      if (it.volume) c += ", vol. " + esc(it.volume);
      if (it.pages) c += ", " + esc(it.pages);
      if (it.publisher) c += ". " + esc(it.publisher);
      return c + ", " + it.year + ".";
    }
    return esc(it.venue) + ", " + it.year + ".";
  }

  function zhHtml(it, selfZh) {
    var parts = [];
    if (it.title_zh) parts.push("《" + esc(it.title_zh) + "》");
    if (it.authors_zh) parts.push(authorsZhHtml(it.authors_zh, selfZh));
    if (it.venue_zh) parts.push("《" + esc(it.venue_zh) + "》");
    if (it.publisher_zh) parts.push(esc(it.publisher_zh));
    if (!parts.length) return "";
    return '<p class="pub-zh" lang="zh-CN">' + parts.join("，") + "</p>";
  }

  function linkItem(label, url) {
    return '<li><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a></li>";
  }

  function linksHtml(it) {
    var out = [];
    if (it.doi) out.push(linkItem("DOI", "https://doi.org/" + it.doi));
    (it.links || []).forEach(function (l) { out.push(linkItem(l.label, l.url)); });
    var cv = it.conference_version;
    if (cv) {
      if (cv.doi) out.push(linkItem("Conference DOI", "https://doi.org/" + cv.doi));
      if (cv.url) out.push(linkItem("Conference page", cv.url));
    }
    return out.length ? '<ul class="pub-links">' + out.join("") + "</ul>" : "";
  }

  function entryHtml(it, self) {
    var tag = it.language === "zh" ? '<span class="tag">In Chinese</span>' : "";
    var html = '<li class="pub" id="' + esc(it.id.toLowerCase()) + '">';
    html += '<p class="pub-title">' + esc(it.title) + tag + "</p>";
    html += '<p class="pub-authors">' + authorsHtml(it.authors, self.en) + "</p>";
    html += '<p class="pub-venue">' + venueHtml(it) + "</p>";
    html += zhHtml(it, self.zh);
    if (it.conference_version) {
      var cv = it.conference_version;
      html += '<p class="pub-conf">Conference version: <em>' + esc(cv.venue) + "</em> " + esc(cv.detail) + ".</p>";
    }
    html += linksHtml(it);
    return html + "</li>";
  }

  function byRecency(a, b) {
    return (b.year - a.year) ||
      (MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month)) ||
      a.id.localeCompare(b.id, "en", { numeric: true });
  }

  var BACK_TOP = '<p class="back-top"><a href="#top">↑ Back to top</a></p>';

  function navItem(id, label, short, count) {
    var text = short
      ? '<span class="nav-long">' + esc(label) + '</span><span class="nav-short">' + esc(short) + "</span>"
      : esc(label);
    return '<li><a href="#' + esc(id) + '" data-section="' + esc(id) + '">' +
      text + '<span class="count">' + count + "</span></a></li>";
  }

  function workingPaperHtml(it) {
    var html = '<li class="pub wp"' + (it.id ? ' id="' + esc(it.id) + '"' : "") + '><p class="pub-title">' + esc(it.title) + "</p>";
    if (it.title_zh) html += '<p class="pub-zh" lang="zh-CN">' + esc(it.title_zh) + "</p>";
    return html + "</li>";
  }

  function workingPapersHtml(wp) {
    var html = '<section class="part research-section" id="' + esc(wp.id) + '">';
    html += '<h2 class="part-title">' + esc(wp.title) + "</h2>";
    wp.groups.forEach(function (g) {
      html += '<h4 class="group-title"' + (g.id ? ' id="' + esc(g.id) + '"' : "") + ">" + esc(g.title) + "</h4>";
      html += '<ol class="pub-list">' + g.items.map(workingPaperHtml).join("") + "</ol>";
    });
    return html + BACK_TOP + "</section>";
  }

  function publicationsHtml(data) {
    var html = '<div class="part" id="publications">';
    html += '<h2 class="part-title">Publications</h2>';
    html += '<p class="page-note">Arranged by research area; within each area, entries are grouped by type and listed from most recent. ' +
      "Works published in Chinese are listed under their English title, followed by the original Chinese title.</p>";

    data.sections.forEach(function (sec) {
      var items = data.items.filter(function (it) { return it.section === sec.id; });
      html += '<section class="research-section area" id="' + esc(sec.id) + '">';
      html += '<h3 class="area-title">' + esc(sec.title) + "</h3>";
      if (sec.blurb) html += '<p class="section-blurb">' + esc(sec.blurb) + "</p>";

      GROUPS.forEach(function (g) {
        var group = items.filter(function (it) { return it.type === g.type; }).sort(byRecency);
        if (!group.length) return;
        html += '<h4 class="group-title">' + g.label + "</h4>";
        html += '<ol class="pub-list">' + group.map(function (it) {
          return entryHtml(it, data.self);
        }).join("") + "</ol>";
      });

      html += BACK_TOP + "</section>";
    });
    return html + "</div>";
  }

  function render(data) {
    var navHtml = "";
    var bodyHtml = "";
    var wp = data.working_papers;

    if (wp) {
      var wpCount = wp.groups.reduce(function (n, g) { return n + g.items.length; }, 0);
      navHtml += navItem(wp.id, wp.nav, wp.nav_short, wpCount) + '<li class="nav-sep" aria-hidden="true"></li>';
      bodyHtml += workingPapersHtml(wp);
    }
    data.sections.forEach(function (sec) {
      var count = data.items.filter(function (it) { return it.section === sec.id; }).length;
      navHtml += navItem(sec.id, sec.nav, sec.nav_short, count);
    });
    bodyHtml += publicationsHtml(data);

    document.getElementById("section-nav-list").innerHTML = navHtml;
    document.getElementById("research").innerHTML = bodyHtml;

    if (data.updated) {
      var d = new Date(data.updated + "T00:00:00");
      document.getElementById("updated").textContent = MONTHS[d.getMonth()] + " " + d.getFullYear();
      document.getElementById("year-now").textContent = d.getFullYear();
    }

    highlightOnScroll();
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  function highlightOnScroll() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".section-nav a"));
    var sections = links.map(function (a) { return document.getElementById(a.dataset.section); });
    var navH = document.querySelector(".section-nav").offsetHeight;

    function update() {
      var current = null;
      sections.forEach(function (s) {
        if (s && s.getBoundingClientRect().top - navH - 24 <= 0) current = s.id;
      });
      // The last section is short, so its top may never reach the nav bar.
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && sections.length) current = sections[sections.length - 1].id;
      links.forEach(function (a) {
        a.classList.toggle("active", a.dataset.section === current);
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  fetch(DATA_URL)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      document.getElementById("research").innerHTML =
        '<p class="status">The research list could not be loaded. Please refresh the page.</p>';
    });
})();
