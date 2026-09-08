(() => {
  "use strict";

  const THEME_KEY = "openCaptureThemeMode";
  let pollInterval, isContentReady = false;
  const captureItemSelectors = [
    ".capture_allPage",
    ".capture_highResAllPage",
    ".capture_scrollable",
    ".capture_currentPosition",
    ".capture_selection"
  ];

  function sanitizeTheme(t) {
    return t === "light" || t === "dark" || t === "system" ? t : "system";
  }

  function resolveTheme(mode) {
    if (mode === "system") {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return mode;
  }

  function applyTheme(mode) {
    const resolved = resolveTheme(mode);
    document.documentElement.setAttribute("data-opencapture-theme-mode", mode);
    document.documentElement.setAttribute("data-opencapture-theme", resolved);
  }

  applyTheme("light");
  chrome.storage.local.get([THEME_KEY], res => {
    applyTheme(sanitizeTheme(res[THEME_KEY]));
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[THEME_KEY]) {
      applyTheme(sanitizeTheme(changes[THEME_KEY].newValue));
    }
  });

  function sendToActiveTab(msg) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (tab?.id) chrome.tabs.sendMessage(tab.id, msg);
    });
  }

  function sendPromiseToActiveTab(msg) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, msg, res => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(res);
          });
        } else {
          showNotSupported();
          reject(new Error("No active tab"));
        }
      });
    });
  }

  function setCaptureButtonsEnabled(enabled) {
    isContentReady = enabled;
    $(captureItemSelectors.join(",")).toggleClass("content-disabled", !enabled);
  }

  function pollContentScript() {
    setCaptureButtonsEnabled(false);
    let attempts = 0;
    const check = () => {
      attempts++;
      new Promise(res => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tab = tabs[0];
          if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { action: "checkContentLoaded" }, resp => {
              res(!chrome.runtime.lastError && resp?.loaded === true);
            });
          } else {
            res(false);
          }
        });
      }).then(loaded => {
        if (loaded) {
          setCaptureButtonsEnabled(true);
          if (pollInterval) clearInterval(pollInterval);
          return;
        }
        setCaptureButtonsEnabled(false);
        if (attempts >= 20 && pollInterval) {
          clearInterval(pollInterval);
        }
      });
    };
    check();
    pollInterval = window.setInterval(check, 250);
  }

  function updateProgressBar(percent) {
    $("#user_page").addClass("d-none");
    $("#scrollable_select_lay").addClass("d-none");
    $("#progress_lay").removeClass("d-none");
    const val = Math.max(0, Math.min(100, Number(percent) || 0));
    $("#progressbar").attr("aria-valuenow", val).css("width", val + "%");
  }

  let onVisibilityCancel;
  function showScrollableAreas(count = 0) {
    $("#user_page").addClass("d-none");
    $("#scrollable_select_lay").removeClass("d-none");
    if (count > 0) $("#scrollable_select_btns").empty();

    for (let i = 0; i < count; i++) {
      $("#scrollable_select_btns").append(
        `<button type="button" id="scrollable_select_${i}" data-index="${i}" class="btn btn-light w-100 mb-2">` +
        `<span class="fa fa-cut fa-lg btn-icon mr-2"></span><span>${chrome.i18n.getMessage("capture_scroll")}</span></button>`
      );
      $(`#scrollable_select_${i}`).on("click", function() {
        if (onVisibilityCancel) {
          document.removeEventListener("visibilitychange", onVisibilityCancel);
          onVisibilityCancel = null;
        }
        const idx = this.getAttribute("data-index");
        chrome.runtime.sendMessage({ action: "reSetData" });
        sendToActiveTab({ action: "capture_scrollable_select", index: idx });
        updateProgressBar(0);
      }).hover(
        function() { sendToActiveTab({ action: "scrollable_select_hover_on", index: this.getAttribute("data-index") }); },
        function() { sendToActiveTab({ action: "scrollable_select_hover_off", index: this.getAttribute("data-index") }); }
      );
    }

    if (count > 0 && count < 3) {
      $("#scrollable_select_btns").append(
        `<button type="button" id="scrollable_all" class="btn btn-light w-100 mb-2">` +
        `<span class="fa fa-camera fa-lg btn-icon mr-2"></span><span>${chrome.i18n.getMessage("captureAllPage")}</span></button>`
      );
      $("#scrollable_all").on("click", function() {
        if (onVisibilityCancel) {
          document.removeEventListener("visibilitychange", onVisibilityCancel);
          onVisibilityCancel = null;
        }
        chrome.runtime.sendMessage({ action: "reSetData" });
        sendPromiseToActiveTab({ action: "start_captureAllpageEdit" })
          .then(res => { if (res?.loaded !== undefined) updateProgressBar(0); })
          .catch(() => showNotSupported());
      });
    }

    if (count > 0) {
      $("#scrollable_select_btns").append(
        `<button type="button" id="scrollable_select_cancel" class="btn btn-light w-100 mb-2">` +
        `<span>${chrome.i18n.getMessage("btn_cancel")}</span></button>`
      );
      $("#scrollable_select_cancel").on("click", function() {
        sendToActiveTab({ action: "scrollable_select_cancel" });
        window.close();
      });
    }

    if (!onVisibilityCancel) {
      onVisibilityCancel = function() {
        if (document.visibilityState === "hidden") {
          sendToActiveTab({ action: "scrollable_select_cancel" });
        }
      };
      document.addEventListener("visibilitychange", onVisibilityCancel);
    }
  }

  function showNotSupported() {
    $(".menus").html(`<p class="p-2" style="font-size:0.8rem;">${chrome.i18n.getMessage("not_support")}</p>`);
  }

  function showNotReady() {
    $("#user_page").addClass("d-none");
    $("#not_ready_lay").removeClass("d-none");
    setTimeout(() => window.close(), 2000);
  }

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === "setProgress") {
      updateProgressBar(msg.progress);
    } else if (msg.action === "closeMenu") {
      window.close();
    } else if (msg.action === "showStopBtn") {
      $(".stop").removeClass("d-none");
      $(".stop_load").hide();
      $(".stop_txt").text(chrome.i18n.getMessage("stop_scrolling"));
      $("#btn_stop").off("click").on("click", function() {
        $(".stop_load").show();
        sendToActiveTab({ action: "stop_captureAllpageEdit" });
      });
    } else if (msg.action === "showLoading") {
      if (!$(".stop").hasClass("d-none")) {
        $(".stop").removeClass("d-none");
        $(".stop_load").show();
        $(".stop_txt").text(chrome.i18n.getMessage("loading"));
      }
    } else if (msg.action === "showScrollableAreasBtns") {
      showScrollableAreas(msg.num);
    } else if (msg.action === "no_scrollableAreas") {
      $("#scrollable_select_btns").html(chrome.i18n.getMessage("scrollable_area_no"));
      $("#scrollable_select_btns").append(
        `<button type="button" id="scrollable_all" class="btn btn-light w-100 mt-3 mb-2">` +
        `<span class="fa fa-camera fa-lg btn-icon mr-2"></span><span>${chrome.i18n.getMessage("captureAllPage")}</span></button>`
      );
      $("#scrollable_all").on("click", function() {
        if (onVisibilityCancel) {
          document.removeEventListener("visibilitychange", onVisibilityCancel);
          onVisibilityCancel = null;
        }
        chrome.runtime.sendMessage({ action: "reSetData" });
        sendPromiseToActiveTab({ action: "start_captureAllpageEdit" })
          .then(res => { if (res?.loaded !== undefined) updateProgressBar(0); })
          .catch(() => showNotSupported());
      });
    }
  });

  // i18n and RTL setup
  const userLang = navigator.language || navigator.userLanguage || "";
  if (userLang.startsWith("ar") || userLang.startsWith("fa") || userLang.startsWith("ur")) {
    document.documentElement.setAttribute("dir", "rtl");
    $(".menus").removeClass("text-left").addClass("text-right");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }

  $(".capture_allPage_txt").text(chrome.i18n.getMessage("captureAllPage"));
  $(".capture_highResAllPage_txt").text(chrome.i18n.getMessage("captureHighResAllPage") || "HD entire page");
  $(".capture_currentPosition_txt").text(chrome.i18n.getMessage("capturePageCurrentPosition"));
  $(".capture_scrollable_txt").text(chrome.i18n.getMessage("captureScrollable"));
  $(".capture_page_txt").text(chrome.i18n.getMessage("capturePage"));
  $(".capture_selection_txt").text(chrome.i18n.getMessage("captureSelection"));
  $(".local_setting_btn_txt").text(chrome.i18n.getMessage("settings"));
  $(".history_btn_txt").text(chrome.i18n.getMessage("history") || "History");
  $(".report_btn_txt").text("GitHub / Issues");
  $(".not_ready_text").text(chrome.i18n.getMessage("page_not_ready"));
  $(".stop_txt").text(chrome.i18n.getMessage("stop_scrolling"));

  chrome.runtime.sendMessage({ action: "checkContentJsIsLoad" });
  pollContentScript();

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab?.url) return;
    const u = tab.url;
    if (
      u.startsWith("https://chromewebstore.google.com") ||
      u.startsWith("chrome://") ||
      u.startsWith("chrome-extension://") ||
      u.startsWith("https://microsoftedge.microsoft.com") ||
      u.startsWith("edge://") ||
      u.startsWith("extension://") ||
      u.startsWith("moz-extension://") ||
      u.startsWith("about:") ||
      u.startsWith("file://")
    ) {
      $("#not_surport_alert").removeClass("d-none");
      $("#view_more_not_support").on("click", () => showNotSupported());
    }
  });

  // Action Triggers
  $(".capture_allPage").on("click", function() {
    if (!isContentReady) return;
    chrome.runtime.sendMessage({ action: "reSetData" });
    sendPromiseToActiveTab({ action: "start_captureAllpageEdit" })
      .then(res => { if (res?.loaded !== undefined) updateProgressBar(0); })
      .catch(() => showNotSupported());
  });

  $(".capture_highResAllPage").on("click", function() {
    if (!isContentReady) return;
    chrome.runtime.sendMessage({ action: "reSetData" });
    sendPromiseToActiveTab({ action: "start_highResCaptureAllpageEdit" })
      .then(res => { if (res?.loaded !== undefined) updateProgressBar(0); })
      .catch(() => showNotSupported());
  });

  $(".capture_currentPosition").on("click", function() {
    if (!isContentReady) return;
    chrome.runtime.sendMessage({ action: "reSetData" });
    sendPromiseToActiveTab({ action: "start_capturePageFromCurrentPosition" })
      .then(res => { if (res?.loaded !== undefined) updateProgressBar(0); })
      .catch(() => showNotSupported());
  });

  $(".capture_page").on("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      chrome.runtime.sendMessage({ action: "captureVisiblePageScreenshot4Edit", tabId: tab?.id }, res => {
        if (!chrome.runtime.lastError && res?.loaded !== false) {
          window.close();
        } else {
          showNotSupported();
        }
      });
    });
  });

  $(".capture_scrollable").on("click", function() {
    if (!isContentReady) return;
    chrome.runtime.sendMessage({ action: "reSetData" });
    sendPromiseToActiveTab({ action: "captureScrollableEdit" })
      .then(res => { if (res?.loaded !== undefined) showScrollableAreas(0); })
      .catch(() => showNotSupported());
  });

  $(".capture_selection").on("click", function() {
    if (!isContentReady) return;
    chrome.runtime.sendMessage({ action: "reSetData" });
    sendPromiseToActiveTab({ action: "captureSelectionEdit" })
      .then(res => {
        if (res?.loaded !== undefined) window.close();
      })
      .catch(() => showNotSupported());
  });

  $(".local_setting_btn").on("click", function() {
    chrome.tabs.create({ url: chrome.runtime.getURL("html/setting.html") });
  });

  $(".history_btn").on("click", function() {
    chrome.tabs.create({ url: chrome.runtime.getURL("html/history.html") });
  });

  $(".report_btn").on("click", function() {
    chrome.tabs.create({ url: "https://github.com/nklowns/opencapture/issues" });
  });
})();
