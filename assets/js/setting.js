(() => {
  "use strict";

  const THEME_KEY = "openCaptureThemeMode";

  function sanitizeTheme(e) {
    return e === "light" || e === "dark" || e === "system" ? e : "system";
  }

  function resolveTheme(e) {
    if (e === "system") {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return e;
  }

  function applyTheme(e) {
    const t = resolveTheme(e);
    document.documentElement.setAttribute("data-opencapture-theme-mode", e);
    document.documentElement.setAttribute("data-opencapture-theme", t);
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

  function showToast(msg, durationSec = 2) {
    const box = document.createElement("div");
    box.id = "opencapture_toast";
    const inner = document.createElement("div");
    inner.style.cssText =
      "z-index: 2147483645; width: auto; height: auto; position:fixed; top:50%; left:50%; transform: translate(-50%, -50%); background-color: #000; opacity:0.85; padding: 10px 18px; border-radius: 6px; text-align: center; font-size:18px; color:#fff;";
    inner.innerHTML = msg;
    box.appendChild(inner);
    document.body.appendChild(box);
    setTimeout(() => {
      box.remove();
    }, durationSec * 1000);
  }

  function getMsg(k, def) {
    return chrome.i18n.getMessage(k) || def;
  }

  $(document).ready(() => {
    const userLang = navigator.language || navigator.userLanguage || "";
    if (userLang.startsWith("ar") || userLang.startsWith("fa") || userLang.startsWith("ur")) {
      document.documentElement.setAttribute("dir", "rtl");
      $(".card-body").removeClass("text-left").addClass("text-right");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }

    $("#settings").html(getMsg("settings", "Settings"));
    $("#setting_appearance").html(getMsg("setting_appearance", "Appearance"));
    $("#setting_theme_mode").html(getMsg("setting_theme_mode", "Mode"));
    $("#setting_theme_mode_info").html(getMsg("setting_theme_mode_info", "Choose the display theme for OpenCapture pages."));

    const themeSelect = document.getElementById("openCaptureThemeMode");
    if (themeSelect) {
      if (themeSelect.options[0]) themeSelect.options[0].text = getMsg("theme_follow_system", "Follow system");
      if (themeSelect.options[1]) themeSelect.options[1].text = getMsg("theme_light", "Light");
      if (themeSelect.options[2]) themeSelect.options[2].text = getMsg("theme_dark", "Dark");
    }

    $("#setting_pdf").html(getMsg("setting_pdf", "PDF"));
    $("#setting_pdf_papersize").html(getMsg("setting_pdf_papersize", "Paper Size"));
    $("#setting_pdf_papersize_info").html(getMsg("setting_pdf_papersize_info", "Specify PDF paper format."));
    $("#setting_pdf_margin").html(getMsg("setting_pdf_margin", "Page margin"));
    $("#setting_pdf_margin_info").html(getMsg("setting_pdf_margin_info", "Specify page margin (0-40 pt)."));

    $("#setting_download").html(getMsg("setting_download", "Download"));
    $("#setting_download_save_as").html(getMsg("setting_download_save_as", "Save as"));
    $("#setting_download_save_as_info").html(getMsg("setting_download_save_as_info", "Show a Save As dialog when downloading."));
    $("#setting_down_image_format").html(getMsg("setting_down_image_format", "Save Image"));
    $("#setting_down_image_format_info").html(getMsg("setting_down_image_format_info", "Specify the image format for downloading screenshots."));

    $("#setting_filename_set").html(getMsg("savedFileNameSet", "File Naming"));
    const fnSelect = document.getElementById("fileNameSet");
    if (fnSelect) {
      if (fnSelect.options[0]) fnSelect.options[0].text = getMsg("savedFileNameByTime", "By Time");
      if (fnSelect.options[1]) fnSelect.options[1].text = getMsg("savedFileNameByTile", "By Title");
    }

    const manifest = chrome.runtime.getManifest();
    $("#version").text("v" + manifest.version);
    document.title = `${getMsg("settings", "Settings")} - OpenCapture`;

    chrome.storage.local.get([THEME_KEY], res => {
      $("#openCaptureThemeMode").val(sanitizeTheme(res[THEME_KEY]));
    });

    $("#openCaptureThemeMode").on("change", function() {
      const val = sanitizeTheme($(this).val());
      applyTheme(val);
      chrome.storage.local.set({ [THEME_KEY]: val }, () => {
        showToast(getMsg("fav_success", "Saved successfully"));
      });
    });

    chrome.storage.local.get({ pdfPageSize: "a4" }, res => {
      $("#pdfPageSize").val(res.pdfPageSize);
    });
    $("#pdfPageSize").on("change", function() {
      chrome.storage.local.set({ pdfPageSize: $(this).val() }, () => {
        showToast(getMsg("fav_success", "Saved successfully"));
      });
    });

    chrome.storage.local.get({ pdfPageMargin: "10" }, res => {
      $("#pdfPageMargin").val(res.pdfPageMargin);
    });
    $("#pdfPageMargin").on("change", function() {
      const n = Number($(this).val());
      if (n >= 0 && n <= 40) {
        chrome.storage.local.set({ pdfPageMargin: String(n) }, () => {
          showToast(getMsg("fav_success", "Saved successfully"));
        });
      } else {
        showToast("Range must be 0-40");
      }
    });

    chrome.storage.local.get({ downloadImageFormat: "image/png" }, res => {
      $("#downloadImageFormat").val(res.downloadImageFormat);
    });
    $("#downloadImageFormat").on("change", function() {
      chrome.storage.local.set({ downloadImageFormat: $(this).val() }, () => {
        showToast(getMsg("fav_success", "Saved successfully"));
      });
    });

    chrome.storage.local.get({ downloadSaveAs: "no" }, res => {
      const chk = document.getElementById("mySwitch_save_as");
      if (chk) chk.checked = res.downloadSaveAs === "yes";
    });

    const chkSaveAs = document.getElementById("mySwitch_save_as");
    if (chkSaveAs) {
      chkSaveAs.addEventListener("change", function() {
        if (this.checked) {
          chrome.permissions.contains({ permissions: ["downloads"] }, hasPerm => {
            if (hasPerm) {
              chrome.storage.local.set({ downloadSaveAs: "yes" }, () => {
                showToast(getMsg("fav_success", "Saved successfully"));
              });
            } else {
              chrome.permissions.request({ permissions: ["downloads"] }, granted => {
                if (granted) {
                  chrome.storage.local.set({ downloadSaveAs: "yes" }, () => {});
                } else {
                  showToast(getMsg("permissionDownloadsDenied", "Download permission denied"));
                  chkSaveAs.checked = false;
                }
              });
            }
          });
        } else {
          chrome.storage.local.set({ downloadSaveAs: "no" }, () => {
            showToast(getMsg("fav_success", "Saved successfully"));
          });
        }
      });
    }

    chrome.storage.local.get({ fileNameSet: "By Time" }, res => {
      $("#fileNameSet").val(res.fileNameSet);
      if (res.fileNameSet === "By Time") {
        $("#setting_filename_set_info").html(getMsg("savedFileNameByTimeInfo", ""));
      } else {
        $("#setting_filename_set_info").html(getMsg("savedFileNameByTileInfo", ""));
      }
    });

    $("#fileNameSet").on("change", function() {
      const val = $(this).val();
      chrome.storage.local.set({ fileNameSet: val }, () => {
        if (val === "By Time") {
          $("#setting_filename_set_info").html(getMsg("savedFileNameByTimeInfo", ""));
        } else {
          $("#setting_filename_set_info").html(getMsg("savedFileNameByTileInfo", ""));
        }
        showToast(getMsg("fav_success", "Saved successfully"));
      });
    });
  });
})();
