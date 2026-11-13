/* Diagrams — draws ```mermaid code blocks with Mermaid, in the site's colours.

   Write a diagram in any post or module:

       ```mermaid
       flowchart LR
           A[First step]:::green --> B[Second step]:::red
       ```

   - Colours and fonts come from the CSS variables in assets/css/htb.css,
     so every diagram matches the site. Box/figure styling: terminal.css.
   - Accent a box with :::green, :::aqua, :::yellow, :::red, :::blue or :::purple.
   - Font Awesome icons work in labels:  A["fa:fa-shield-alt Preparation"]
   - A diagram is drawn when it comes into view, so one inside a collapsed
     module or topic is drawn when that is opened.
   - If Mermaid can't load or the diagram has a typo, the block stays a
     normal code block (the error is in the browser console). */
(function () {
  "use strict";

  var MERMAID_SRC = "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js";
  var ACCENTS = ["green", "aqua", "yellow", "red", "blue", "purple"];
  var MIN_SCALE = 0.75;     // smallest a diagram is drawn, relative to its full size…
  var MIN_WIDTH_CAP = 600;  // …but never forced wider than this (px)

  // Jekyll renders the block as <pre><code class="language-mermaid">; the whole
  // <pre> (or the highlighter wrapper, if there is one) is what gets replaced.
  var blocks = Array.prototype.map.call(
    document.querySelectorAll("code.language-mermaid"),
    function (code) { return code.closest("div.highlighter-rouge") || code.parentElement; }
  );
  if (!blocks.length) return;

  // Hide the source while it waits to be drawn (see .diagram-pending)
  blocks.forEach(function (b) { b.classList.add("diagram-pending"); });

  function showSource(block) {
    block.classList.remove("diagram-pending");
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* ---------- Theme (from the site palette) ---------- */

  function configure() {
    var bgDeep = cssVar("--htb-bg-deep");
    var surface = cssVar("--htb-surface");
    var border = cssVar("--htb-border");
    var text = cssVar("--htb-text");
    var heading = cssVar("--htb-heading");
    var muted = cssVar("--htb-muted");
    var green = cssVar("--htb-green");

    // :::green, :::red … — tinted box, coloured border and icon
    var accentCss = ACCENTS.map(function (name) {
      var c = cssVar("--htb-" + name);
      var node = ".node." + name;
      return node + " .label-container{stroke:" + c + ";fill:" + c + ";fill-opacity:0.13;}" +
             node + " .nodeLabel i{color:" + c + ";}";
    }).join("");

    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      themeVariables: {
        darkMode: true,
        background: bgDeep,
        fontFamily: cssVar("--term-mono") || "monospace",
        fontSize: "14px",
        primaryColor: surface,
        primaryTextColor: heading,
        primaryBorderColor: green,
        secondaryColor: bgDeep,
        secondaryTextColor: text,
        secondaryBorderColor: border,
        tertiaryColor: bgDeep,
        tertiaryTextColor: text,
        tertiaryBorderColor: border,
        lineColor: muted,
        textColor: text,
        titleColor: heading,
        edgeLabelBackground: bgDeep,
        clusterBkg: bgDeep,
        clusterBorder: border,
        noteBkgColor: surface,
        noteTextColor: text,
        noteBorderColor: border
      },
      themeCSS:
        ".node .label-container{rx:8px;ry:8px;stroke-width:1.5px;}" +
        ".nodeLabel i{margin-right:0.45em;}" +
        accentCss,
      flowchart: { htmlLabels: true, curve: "basis", padding: 18 }
    });
  }

  /* ---------- Drawing ---------- */

  var count = 0;

  function draw(block) {
    var source = block.textContent;
    window.mermaid.render("diagram-" + (++count), source).then(function (out) {
      var figure = document.createElement("figure");
      figure.className = "diagram";
      figure.innerHTML = out.svg;
      if (out.bindFunctions) out.bindFunctions(figure);

      // On narrow screens let the figure scroll sideways instead of
      // shrinking the diagram until its text is unreadable.
      var svg = figure.querySelector("svg");
      var fullWidth = svg && parseFloat(svg.style.maxWidth);
      if (fullWidth) svg.style.minWidth = Math.round(Math.min(fullWidth * MIN_SCALE, MIN_WIDTH_CAP)) + "px";
      block.replaceWith(figure);
    }).catch(function (err) {
      showSource(block);
      console.warn("Diagram not drawn:", err);
    });
  }

  function watch() {
    if (!("IntersectionObserver" in window)) {
      blocks.forEach(draw);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          draw(entry.target);
        }
      });
    }, { rootMargin: "300px 0px" });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* ---------- Load Mermaid only on pages that have a diagram ---------- */

  var script = document.createElement("script");
  script.src = MERMAID_SRC;
  script.async = true;
  script.onload = function () {
    configure();
    watch();
  };
  script.onerror = function () {
    blocks.forEach(showSource);
  };
  document.head.appendChild(script);
})();
