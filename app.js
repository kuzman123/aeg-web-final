/* AEG web — shared interactions.
   - Left-rail section navigation (click + ArrowLeft/ArrowRight).
   - Visual 01: play-loop highlight.
   - Visual 02: node selection -> selection panel.
   - Visual 07: key-provider selection + tamper simulation.
   All guarded by element presence, so the same file is safe on every page. */

(function () {
  "use strict";

  /* ---------- section navigation ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[data-section]"));

  function activate(id) {
    if (!id) return;
    sections.forEach(function (s) { s.classList.toggle("active", s.id === id); });
    navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-section") === id); });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    var active = document.getElementById(id);
    if (active) active.scrollIntoView({ block: "start" });
  }

  if (sections.length) {
    navLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        activate(a.getAttribute("data-section"));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var cur = sections.findIndex(function (s) { return s.classList.contains("active"); });
      if (cur < 0) cur = 0;
      var next = e.key === "ArrowRight"
        ? Math.min(cur + 1, sections.length - 1)
        : Math.max(cur - 1, 0);
      activate(sections[next].id);
    });

    var initial = (location.hash || "").replace("#", "");
    activate(document.getElementById(initial) ? initial : sections[0].id);
  }

  /* ---------- Visual 01: play loop — moves the active (dark) box along the pipeline ---------- */
  var loopNodes = Array.prototype.slice.call(document.querySelectorAll("[data-loop-node]"));
  // Traverse in true loop order (the U-shape), not DOM order.
  loopNodes.sort(function (a, b) {
    return (+a.getAttribute("data-loop-order")) - (+b.getAttribute("data-loop-order"));
  });
  var playBtn = document.getElementById("play-loop");
  var resetBtn = document.getElementById("reset-loop");
  var loopTimer = null;

  function setCurrentStage(idx) {
    loopNodes.forEach(function (n, i) {
      n.classList.toggle("dark", i === idx);
      n.classList.toggle("lit", i === idx);
    });
  }
  function resetLoop() {
    if (loopTimer) { clearInterval(loopTimer); loopTimer = null; }
    loopNodes.forEach(function (n) { n.classList.remove("lit"); });
    setCurrentStage(0); // Human Principal is the resting active box
    loopNodes.forEach(function (n) { n.classList.remove("lit"); });
    if (playBtn) playBtn.textContent = "▶ Play loop";
  }
  if (playBtn && loopNodes.length) {
    playBtn.addEventListener("click", function () {
      if (loopTimer) { resetLoop(); return; }
      playBtn.textContent = "■ Stop";
      var i = 0;
      setCurrentStage(0);
      loopTimer = setInterval(function () {
        i = (i + 1) % loopNodes.length;
        setCurrentStage(i);
      }, 750);
    });
  }
  if (resetBtn) resetBtn.addEventListener("click", resetLoop);

  /* ---------- Visual 02: node selection ---------- */
  var mapNodes = Array.prototype.slice.call(document.querySelectorAll("[data-node]"));
  var selName = document.getElementById("sel-name");
  var selList = document.getElementById("sel-list");
  var selFoot = document.getElementById("sel-foot");
  function selectNode(node) {
    mapNodes.forEach(function (n) { n.classList.remove("sel"); });
    node.classList.add("sel");
    if (selName) selName.textContent = node.getAttribute("data-name") || "";
    if (selList) {
      selList.innerHTML = "";
      (node.getAttribute("data-items") || "").split("|").forEach(function (it) {
        if (!it) return;
        var li = document.createElement("li");
        li.textContent = it;
        selList.appendChild(li);
      });
    }
    if (selFoot) selFoot.textContent = node.getAttribute("data-foot") || "";
  }
  if (mapNodes.length) {
    mapNodes.forEach(function (n) {
      n.addEventListener("click", function () { selectNode(n); });
    });
    var def = document.querySelector("[data-node].sel") || mapNodes[0];
    selectNode(def);
  }

  /* ---------- Visual 07: provider select + tamper ---------- */
  var provOpts = Array.prototype.slice.call(document.querySelectorAll("[data-storage]"));
  var provFoot = document.getElementById("prov-foot");
  if (provOpts.length) {
    provOpts.forEach(function (o) {
      o.addEventListener("click", function () {
        provOpts.forEach(function (x) { x.classList.remove("sel"); });
        o.classList.add("sel");
        if (provFoot) provFoot.innerHTML = o.getAttribute("data-storage");
      });
    });
  }

  var tamperBtn = document.getElementById("tamper-btn");
  var chainLine = document.getElementById("chain-line");
  var row4 = document.getElementById("log-row-4");
  var tampered = false;
  if (tamperBtn && chainLine && row4) {
    var origRow = row4.innerHTML;
    var origChain = chainLine.textContent;
    var origChainClass = chainLine.className;
    tamperBtn.addEventListener("click", function () {
      tampered = !tampered;
      if (tampered) {
        row4.innerHTML =
          '<td>4</td><td>claim-done</td><td>e84b…1f</td><td>13af…7c</td>' +
          '<td class="rej">MISMATCH</td>';
        chainLine.textContent = "✗ chain broken at #4 — recorded hash ≠ recomputed";
        chainLine.className = "broken";
        tamperBtn.textContent = "Restore #4";
      } else {
        row4.innerHTML = origRow;
        chainLine.textContent = origChain;
        chainLine.className = origChainClass;
        tamperBtn.textContent = "Simulate tamper on #4";
      }
    });
  }
})();
