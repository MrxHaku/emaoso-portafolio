/**
 * Glass Folder Cards — vanilla JS port
 * Drop glass-folder.css + this file into your project.
 * Usage: GlassFolder.mount(element, options)
 */
(function (global) {
  "use strict";

  var W = 340;
  var H = 272;
  var HEADROOM = 54;
  var FRONT_TOP = 74;
  var FRONT_H = H - FRONT_TOP; // 198
  var SHEET_W = 272;
  var SHEET_H = 184;
  var MAX_VISIBLE = 4;

  var BACK_PATH =
    "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z";
  var FRONT_PATH =
    "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 " +
    (FRONT_H - 22) +
    "A22 22 0 0 1 318 " +
    FRONT_H +
    "L22 " +
    FRONT_H +
    "A22 22 0 0 1 0 " +
    (FRONT_H - 22) +
    "Z";

  function fanSlot(index, count) {
    return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1;
  }

  function hashString(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Simple gradient art when no image is provided (no heavy canvas noise). */
  var PRESET_GRADIENTS = {
    aurora: "linear-gradient(135deg, #f4efe9 0%, #e9c2b8 20%, #c2433f 45%, #2a1e2a 70%, #22395e 85%, #6f97c2 100%)",
    ember: "linear-gradient(160deg, #07090c 0%, #16252c 25%, #3d5f68 40%, #a3201a 65%, #ef4a2b 85%, #ff8a5c 100%)",
    dusk: "linear-gradient(145deg, #120c18 0%, #3e2850 30%, #8f6c9c 50%, #b3502f 75%, #eab08a 100%)",
    glacier: "linear-gradient(120deg, #f7f8fa 0%, #d9e2ea 30%, #9fb4c7 55%, #e8edf2 80%, #ffffff 100%)",
    verdant: "linear-gradient(155deg, #070b08 0%, #173024 30%, #4f7a5a 50%, #a7843a 75%, #e9cf87 100%)",
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildSheet(file, index, total, startIndex) {
    var slot = fanSlot(index, total);
    var seed = hashString(file.name || "file") + (startIndex + index);
    var r = rng(seed);
    var jx = ((r() - 0.5) * 8).toFixed(2) + "px";
    var jr = ((r() - 0.5) * 4).toFixed(2) + "deg";
    var depth = total - 1 - index;
    var picture = !!(file.art || file.image);
    var artStyle = "";
    if (file.image) {
      artStyle = "";
    } else if (file.art && PRESET_GRADIENTS[file.art]) {
      artStyle = "background:" + PRESET_GRADIENTS[file.art] + ";";
    }

    var html =
      '<div class="gf-sheet-slot" style="--gf-slot:' +
      slot +
      ";--gf-depth:" +
      depth +
      ";--gf-jx:" +
      jx +
      ";--gf-jr:" +
      jr +
      '">' +
      '<button type="button" class="gf-sheet' +
      (picture ? " gf-sheet--art" : "") +
      '" role="listitem" data-index="' +
      (startIndex + index) +
      '"' +
      (file.href ? ' data-href="' + escapeHtml(file.href) + '"' : '') +
      '>';

    if (file.image) {
      html +=
        '<img class="gf-sheet-art" src="' +
        escapeHtml(file.image) +
        '" alt="" width="' +
        SHEET_W +
        '" height="' +
        SHEET_H +
        '" draggable="false" />';
    } else if (file.art && PRESET_GRADIENTS[file.art]) {
      html +=
        '<div class="gf-sheet-art" style="' +
        artStyle +
        'width:100%;height:100%;"></div>';
    }

    html +=
      '<div class="gf-sheet-head">' +
      '<span class="gf-sheet-name">' +
      escapeHtml(file.name || "Untitled") +
      "</span>";
    if (file.meta) {
      html += '<span class="gf-sheet-meta">' + escapeHtml(file.meta) + "</span>";
    }
    html += "</div>";

    if (!picture) {
      html +=
        '<div class="gf-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>';
    }

    html += "</button></div>";
    return html;
  }

  function GlassFolder(el, opts) {
    opts = opts || {};
    this.el = el;
    this.label = opts.label || "Folder";
    this.meta = opts.meta;
    this.tone = opts.tone === "dark" ? "dark" : "light";
    this.art = opts.art || "aurora";
    this.image = opts.image || null;
    this.files = Array.isArray(opts.files) ? opts.files.slice() : [];
    this.action = opts.action || "none"; // add | more | none
    this.menu = opts.menu || [];
    this.labelPlacement = opts.labelPlacement || "bottom-left";
    this.width = opts.width || 280;
    this.open = !!opts.open;
    this.menuOpen = false;
    this.onFileSelect = opts.onFileSelect || null;
    this.onOpenChange = opts.onOpenChange || null;
    this.onAdd = opts.onAdd || null;
    this._uid = "gf-" + Math.random().toString(36).slice(2, 9);
    this.render();
    this.bind();
  }

  GlassFolder.prototype.render = function () {
    var k = this.width / W;
    var count = this.files.length;
    var metaLine =
      this.meta != null
        ? this.meta
        : count + (count === 1 ? " item" : " items");
    var start = Math.max(0, count - MAX_VISIBLE);
    var visible = this.files.slice(start);
    var uid = this._uid;

    var backArt = "";
    if (this.image) {
      backArt =
        '<img class="gf-art" src="' +
        escapeHtml(this.image) +
        '" alt="" width="' +
        (W + 24) +
        '" height="' +
        (H + 24) +
        '" draggable="false" />';
    } else if (this.art !== "none" && PRESET_GRADIENTS[this.art]) {
      backArt =
        '<div class="gf-art" style="background:' +
        PRESET_GRADIENTS[this.art] +
        ';width:100%;height:100%;"></div>';
    }

    var sheets = "";
    for (var i = 0; i < visible.length; i++) {
      sheets += buildSheet(visible[i], i, visible.length, start);
    }

    var keyHtml = "";
    if (this.action === "add") {
      keyHtml =
        '<button type="button" class="gf-key gf-key--add" aria-label="Add file">' +
        '<svg class="gf-glyph gf-glyph--plus" viewBox="0 0 26 26"><path d="M13 5v16M5 13h16"/></svg>' +
        "</button>";
    } else if (this.action === "more") {
      keyHtml =
        '<button type="button" class="gf-key gf-key--more" aria-label="More" aria-expanded="false" aria-haspopup="true">' +
        '<svg class="gf-glyph gf-glyph--more" viewBox="0 0 30 12"><circle cx="6" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="24" cy="6" r="2"/></svg>' +
        "</button>";
    }

    var menuItems =
      '<button type="button" class="gf-menu-item" data-action="toggle-open">' +
      (this.open ? "Close" : "Open") +
      "</button>";
    for (var m = 0; m < this.menu.length; m++) {
      var item = this.menu[m];
      menuItems +=
        '<button type="button" class="gf-menu-item' +
        (item.danger ? " gf-menu-item--danger" : "") +
        '" data-menu-index="' +
        m +
        '">' +
        escapeHtml(item.label) +
        "</button>";
    }

    var html =
      '<div class="gf-stage" style="transform:translateY(' +
      HEADROOM * k +
      "px) scale(" +
      k +
      ')">' +
      '<div class="gf-tilt">' +
      '<div class="gf-shadow" aria-hidden="true"></div>' +
      // back
      '<div class="gf-back" style="clip-path:path(\'' +
      BACK_PATH +
      '\')" aria-hidden="true">' +
      backArt +
      '<div class="gf-back-sheen"></div>' +
      "</div>" +
      '<svg class="gf-rim gf-back-rim" viewBox="0 0 ' +
      W +
      " " +
      H +
      '" aria-hidden="true"><path d="' +
      BACK_PATH +
      '"/></svg>' +
      // files
      '<div class="gf-files" role="list" aria-label="' +
      escapeHtml(this.label) +
      ' contents">' +
      sheets +
      "</div>" +
      // front glass
      '<div class="gf-front" style="clip-path:path(\'' +
      FRONT_PATH +
      "')\">" +
      '<div class="gf-tint" aria-hidden="true"></div>' +
      '<div class="gf-spec" aria-hidden="true"></div>' +
      '<svg class="gf-rim gf-front-rim" viewBox="0 0 ' +
      W +
      " " +
      FRONT_H +
      '" aria-hidden="true">' +
      "<defs><linearGradient id=\"" +
      uid +
      '-rim" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.95"/>' +
      '<stop offset="0.35" stop-color="#fff" stop-opacity="0.35"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0.12"/>' +
      "</linearGradient></defs>" +
      '<path d="' +
      FRONT_PATH +
      '" stroke="url(#' +
      uid +
      '-rim)"/></svg>' +
      '<button type="button" class="gf-hit" aria-expanded="' +
      this.open +
      '" aria-label="' +
      (this.open ? "Close " : "Open ") +
      escapeHtml(this.label) +
      ", " +
      count +
      (count === 1 ? " item" : " items") +
      '"></button>' +
      '<div class="gf-label">' +
      '<span class="gf-title">' +
      escapeHtml(this.label) +
      "</span>" +
      '<span class="gf-meta">' +
      escapeHtml(metaLine) +
      "</span>" +
      "</div>" +
      "</div>" +
      keyHtml +
      // menu
      (this.action === "more"
        ? '<div class="gf-menu" role="menu">' + menuItems + "</div>"
        : "") +
      "</div></div>";

    this.el.className =
      "gf-root" + (this.el.className ? " " + this.el.className : "");
    this.el.setAttribute("data-tone", this.tone);
    this.el.setAttribute("data-place", this.labelPlacement);
    if (this.open) this.el.setAttribute("data-open", "");
    else this.el.removeAttribute("data-open");
    this.el.style.width = this.width + "px";
    this.el.style.height = (H + HEADROOM) * k + "px";
    this.el.innerHTML = html;

    // appear animation
    requestAnimationFrame(
      function () {
        this.el.setAttribute("data-entered", "");
      }.bind(this)
    );
  };

  GlassFolder.prototype.bind = function () {
    var self = this;
    this.el.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t || !self.el.contains(t)) return;

      if (t.classList.contains("gf-hit")) {
        self.setOpen(!self.open);
        return;
      }
      if (t.classList.contains("gf-key--add")) {
        self.addFile();
        return;
      }
      if (t.classList.contains("gf-key--more")) {
        self.setMenuOpen(!self.menuOpen);
        return;
      }
      if (t.classList.contains("gf-sheet")) {
        e.preventDefault();
        e.stopPropagation();
        var idx = parseInt(t.getAttribute("data-index"), 10);
        var href = t.getAttribute("data-href");
        if (self.onFileSelect && self.files[idx]) {
          self.onFileSelect(self.files[idx], idx);
        }
        if (href) {
          // External links open in a new tab; internal stay in the same tab
          if (/^https?:\/\//i.test(href)) {
            window.open(href, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = href;
          }
        } else if (!self.open) {
          // No link yet: open the folder so the user can see the cards
          self.setOpen(true);
        }
        return;
      }
      if (t.classList.contains("gf-menu-item")) {
        var action = t.getAttribute("data-action");
        if (action === "toggle-open") {
          self.setOpen(!self.open);
        } else {
          var mi = parseInt(t.getAttribute("data-menu-index"), 10);
          if (self.menu[mi] && typeof self.menu[mi].onSelect === "function") {
            self.menu[mi].onSelect();
          }
        }
        self.setMenuOpen(false);
      }
    });

    // pointer lean on glass
    this.el.addEventListener("pointermove", function (e) {
      if (self.open) return;
      var rect = self.el.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      self.el.style.setProperty("--gf-px", px.toFixed(3));
      self.el.style.setProperty("--gf-py", py.toFixed(3));
    });
    this.el.addEventListener("pointerleave", function () {
      self.el.style.setProperty("--gf-px", "0");
      self.el.style.setProperty("--gf-py", "0");
    });

    // close menu on outside click
    document.addEventListener("click", function (e) {
      if (self.menuOpen && !self.el.contains(e.target)) {
        self.setMenuOpen(false);
      }
    });
  };

  GlassFolder.prototype.setOpen = function (open) {
    this.open = !!open;
    if (this.open) {
      this.el.setAttribute("data-open", "");
    } else {
      this.el.removeAttribute("data-open");
    }
    var hit = this.el.querySelector(".gf-hit");
    if (hit) hit.setAttribute("aria-expanded", String(this.open));
    // update open/close menu label
    var toggle = this.el.querySelector('[data-action="toggle-open"]');
    if (toggle) toggle.textContent = this.open ? "Close" : "Open";
    if (this.onOpenChange) this.onOpenChange(this.open);
  };

  GlassFolder.prototype.setMenuOpen = function (open) {
    this.menuOpen = !!open;
    var menu = this.el.querySelector(".gf-menu");
    var key = this.el.querySelector(".gf-key--more");
    if (menu) {
      if (this.menuOpen) menu.setAttribute("data-open", "");
      else menu.removeAttribute("data-open");
    }
    if (key) key.setAttribute("aria-expanded", String(this.menuOpen));
  };

  GlassFolder.prototype.addFile = function () {
    var file = { name: "Untitled" };
    if (typeof this.onAdd === "function") {
      var custom = this.onAdd(this.files);
      if (custom) file = custom;
    }
    this.files.push(file);
    this.render();
    this.bind();
    // brief bump
    var front = this.el.querySelector(".gf-front");
    if (front) {
      front.classList.add("gf-front--bump");
      setTimeout(function () {
        front.classList.remove("gf-front--bump");
      }, 800);
    }
  };

  GlassFolder.prototype.setFiles = function (files) {
    this.files = Array.isArray(files) ? files.slice() : [];
    this.render();
    this.bind();
  };

  GlassFolder.mount = function (el, opts) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return null;
    return new GlassFolder(el, opts);
  };

  // Helper: pointer lean on the folder (original CSS already handles data-open)
  var tiltStyle = document.createElement("style");
  tiltStyle.textContent =
    ".gf-tilt{transform:perspective(900px) rotateY(calc(var(--gf-px)*6deg)) rotateX(calc(var(--gf-py)*-4deg));transition:transform .6s var(--gf-ease)}" +
    ".gf-root[data-open] .gf-tilt{transform:none}";
  document.head.appendChild(tiltStyle);

  global.GlassFolder = GlassFolder;
})(typeof window !== "undefined" ? window : this);
