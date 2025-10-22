

// DO SAL -- codigo do botão de voltar ;)
(function () {
  const FALLBACK = "/src/pages/user/explorar.html";

  function referrerIsSameOrigin() {
    try {
      if (!document.referrer) return false;
      const ref = new URL(document.referrer);
      return ref.origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function tryBackOrFallback() {
    if (window.history.length > 1 && referrerIsSameOrigin()) {
      console.log("[Voltar] usando history.back()");
      window.history.back();
      return;
    }

    if (window.history.length > 1 && !referrerIsSameOrigin()) {
      console.log("[Voltar] histórico existe, mas referrer externo -> redirecionando para fallback");
      window.location.href = FALLBACK;
      return;
    }

    console.log("[Voltar] sem histórico -> redirecionando para fallback");
    window.location.href = FALLBACK;
  }

  function onDocumentClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const target = /** @type {Element|null} */ (e.target instanceof Element ? e.target : null);
    if (!target) return;

    const voltarEl = target.closest("[voltar], [botaovoltar]");
    if (!voltarEl) return;

    e.preventDefault();

    tryBackOrFallback();
  }

  function onDocumentKeydown(e) {
    const key = e.key;
    if (key !== "Enter" && key !== " ") return;

    const active = document.activeElement;
    if (!active) return;

    const voltarEl = active.closest("[voltar], [botaovoltar]");
    if (!voltarEl) return;

    e.preventDefault();
    tryBackOrFallback();
  }

  function init() {
    console.log("js inicializado ronaldo");
    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("keydown", onDocumentKeydown, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.__appBackUtils = {
    tryBackOrFallback,
    referrer: document.referrer,
    historyLength: window.history.length,
    fallback: FALLBACK,
  };
})();
