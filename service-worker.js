(() => {
  "use strict";

  let activeTab,
    pendingScreenshot = "",
    img0 = "",
    img1 = "",
    img2 = "",
    img3 = "",
    img4 = "",
    img5 = "",
    img6 = "",
    img7 = "",
    idx0 = 0,
    idx1 = 0,
    idx2 = 0,
    idx3 = 0,
    idx4 = 0,
    idx5 = 0,
    idx6 = 0,
    idx7 = 0,
    targetHtml = "",
    targetTitle = "",
    targetUrl = "",
    shouldOpenEdit = 0,
    isHighRes = 0,
    activeFeature = void 0,
    activeFeatures = [],
    hasAllUrlsPermission = 0,
    contentLoaded = 0;

  const HISTORY_STORE = "capture_history";

  function registerFeature(feat) {
    if (feat) {
      activeFeature = feat;
      if (!activeFeatures.includes(feat)) activeFeatures.push(feat);
    }
  }

  function resetState() {
    pendingScreenshot = "";
    img0 = void 0;
    img1 = void 0;
    img2 = void 0;
    img3 = void 0;
    img4 = void 0;
    img5 = void 0;
    img6 = void 0;
    img7 = void 0;
    idx0 = 0;
    idx1 = 0;
    idx2 = 0;
    idx3 = 0;
    idx4 = 0;
    idx5 = 0;
    idx6 = 0;
    idx7 = 0;
    targetHtml = "";
    targetTitle = void 0;
    targetUrl = void 0;
    shouldOpenEdit = 0;
    isHighRes = 0;
    activeFeature = void 0;
    activeFeatures = [];
  }

  function openHistoryDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("opencapture_history_db", 1);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          db.createObjectStore(HISTORY_STORE, { keyPath: "id" }).createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
    });
  }

  function withHistoryStore(mode, callback) {
    return openHistoryDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE, mode);
      const req = callback(tx.objectStore(HISTORY_STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    }));
  }

  function getDomain(urlStr = "") {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return "";
    }
  }

  async function createThumbnail(imgUrl) {
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const bmp = await createImageBitmap(blob);
      const width = 180, height = 110;
      const targetHeight = Math.max(height, Math.round((bmp.height / bmp.width) * width));
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return imgUrl;
      ctx.drawImage(bmp, 0, 0, width, targetHeight);
      const thumbBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.75 });
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => resolve(imgUrl);
        reader.readAsDataURL(thumbBlob);
      });
    } catch {
      return imgUrl;
    }
  }

  async function pruneOldHistory() {
    const maxItems = 1000;
    const all = (await withHistoryStore("readonly", s => s.getAll()))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(maxItems);
    if (all.length === 0) return;
    const db = await openHistoryDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(HISTORY_STORE, "readwrite");
      const store = tx.objectStore(HISTORY_STORE);
      all.forEach(item => store.delete(item.id));
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }

  async function saveToHistory(tab) {
    const imgs = [img0, img1, img2, img3, img4, img5, img6, img7].filter(Boolean);
    if (imgs.length === 0) return "";
    const url = tab?.url || targetUrl || "";
    const title = tab?.title || targetTitle || "";
    const now = Date.now();
    const item = {
      id: `${now}_${Math.random().toString(36).slice(2)}`,
      createdAt: now,
      url,
      title,
      domain: getDomain(url),
      thumbnail: await createThumbnail(imgs[0]),
      images: imgs,
      highRes: isHighRes,
      feature: activeFeature,
      features: activeFeatures.slice()
    };
    await withHistoryStore("readwrite", s => s.put(item));
    await pruneOldHistory();
    return item.id;
  }

  function getEditorUrl(historyId) {
    const query = historyId ? `html/capture_edit.html?historyId=${encodeURIComponent(historyId)}` : "html/capture_edit.html";
    return chrome.runtime.getURL(query);
  }

  async function loadHistoryItem(id) {
    if (!id) return false;
    const item = await withHistoryStore("readonly", s => s.get(id));
    if (!item || !item.images) return false;
    const imgs = item.images;
    img0 = imgs[0];
    img1 = imgs[1];
    img2 = imgs[2];
    img3 = imgs[3];
    img4 = imgs[4];
    img5 = imgs[5];
    img6 = imgs[6];
    img7 = imgs[7];
    idx0 = 0; idx1 = 0; idx2 = 0; idx3 = 0; idx4 = 0; idx5 = 0; idx6 = 0; idx7 = 0;
    targetHtml = "";
    targetTitle = item.title;
    targetUrl = item.url;
    shouldOpenEdit = 1;
    isHighRes = item.highRes;
    activeFeature = item.feature;
    activeFeatures = item.features?.length ? item.features.slice() : item.feature ? [item.feature] : [];
    return true;
  }

  async function finalizeAndOpenEditor(tab) {
    targetTitle = tab?.title || activeTab?.title;
    targetUrl = tab?.url || activeTab?.url;
    const id = await saveToHistory(tab || activeTab);
    if (shouldOpenEdit === 1) {
      chrome.tabs.create({ url: getEditorUrl(id) });
    }
  }

  function isScriptableUrl(tab) {
    if (!tab || !tab.url) return false;
    const u = tab.url;
    return !(
      u.startsWith("chrome://") ||
      u.startsWith("edge://") ||
      u.startsWith("chrome-extension://") ||
      u.startsWith("extension://") ||
      u.startsWith("moz-extension://") ||
      u.startsWith("https://chromewebstore.google.com/") ||
      u.startsWith("https://microsoftedge.microsoft.com/") ||
      u.startsWith("about:") ||
      u.startsWith("view-source:")
    );
  }

  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
      chrome.tabs.create({ url: chrome.runtime.getURL("html/about.html") });
    }
  });

  chrome.tabs.onActivated.addListener(info => {
    chrome.tabs.get(info.tabId, t => {
      if (t) activeTab = t;
      else chrome.tabs.query({ active: true, currentWindow: true }, tabs => { activeTab = tabs[0]; });
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (activeTab && activeTab.id === tabId) activeTab = tab;
    if (changeInfo.status === "complete" && hasAllUrlsPermission === 1 && isScriptableUrl(activeTab)) {
      setTimeout(() => {
        if (tabId === activeTab?.id) {
          chrome.scripting.executeScript({ target: { tabId: activeTab.id }, files: ["content.js"] }).catch(() => {});
        }
      }, 100);
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs && tabs.length) activeTab = tabs[0];
  });

  chrome.permissions.contains({ origins: ["<all_urls>"] }, granted => {
    hasAllUrlsPermission = granted ? 1 : 0;
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "contentjsIsLoad") {
      contentLoaded = 1;
    } else if (msg.action === "permissionAllSite") {
      hasAllUrlsPermission = msg.value;
    } else if (msg.action === "checkContentJsIsLoad") {
      (async () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          activeTab = tabs[0];
          if (isScriptableUrl(activeTab)) {
            chrome.tabs.sendMessage(activeTab.id, { action: "checkContentLoaded" }, res => {
              if (chrome.runtime.lastError || !res?.loaded) {
                chrome.scripting.executeScript({ target: { tabId: activeTab?.id }, files: ["content.js"] }).catch(() => {});
              }
            });
          }
        });
      })();
    } else if (msg.action === "reSetData") {
      resetState();
    } else if (msg.action === "capture2edit") {
      shouldOpenEdit = 1;
      if (msg.feature) registerFeature(msg.feature);
    } else if (msg.action === "setHighResCaptureEdit") {
      isHighRes = msg.value === 1 ? 1 : 0;
    } else if (msg.action === "openNewTab") {
      chrome.tabs.create({ url: msg.url });
    } else if (msg.action === "openNewTabNoActive") {
      chrome.tabs.create({ url: msg.url, active: false });
    } else if (msg.action === "checkPremiumFeatureAccess" || msg.action === "requestPremiumFeatureAccess") {
      // 100% Free and Unlocked in OpenCapture
      if (msg.feature) registerFeature(msg.feature);
      sendResponse({
        allowed: true,
        premium: true,
        trial: false,
        feature: msg.feature,
        remaining: 999999,
        limit: 999999,
        used: 0
      });
      return true;
    } else if (msg.action === "setSelectionCaptureData") {
      img0 = msg.dataUrl;
      targetHtml = msg.pageHtml;
      targetTitle = activeTab?.title;
      targetUrl = activeTab?.url;
      saveToHistory(activeTab)
        .then(id => chrome.tabs.create({ url: getEditorUrl(id) }))
        .catch(() => chrome.tabs.create({ url: getEditorUrl() }));
    } else if (msg.action === "query_sendScreenshot") {
      const tabId = sender.tab?.id || activeTab?.id;
      if (!tabId) return;

      const broadcastData = () => {
        chrome.tabs.sendMessage(tabId, { action: "highResCaptureEdit", value: isHighRes });
        chrome.tabs.sendMessage(tabId, { action: "premiumFeatureForEdit", feature: activeFeature, features: activeFeatures });
        if (img0) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot0", data: img0 });
        if (img1) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot1", data: img1 });
        if (img2) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot2", data: img2 });
        if (img3) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot3", data: img3 });
        if (img4) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot4", data: img4 });
        if (img5) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot5", data: img5 });
        if (img6) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot6", data: img6 });
        if (img7) chrome.tabs.sendMessage(tabId, { action: "sendScreenshot7", data: img7 });
        chrome.tabs.sendMessage(tabId, { action: "page_data", url: targetUrl, title: targetTitle, pageHtml: targetHtml });
      };

      if (msg.historyId) {
        loadHistoryItem(msg.historyId)
          .then(ok => {
            broadcastData();
            sendResponse({ loaded: ok });
          })
          .catch(err => {
            broadcastData();
            sendResponse({ loaded: false, error: String(err) });
          });
        return true;
      }
      broadcastData();
      sendResponse({ loaded: true });
    } else if (msg.action === "getCaptureHistory") {
      (async () => {
        try {
          const items = (await withHistoryStore("readonly", s => s.getAll()))
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(item => ({
              id: item.id,
              createdAt: item.createdAt,
              url: item.url,
              title: item.title,
              domain: item.domain,
              thumbnail: item.thumbnail,
              imageCount: item.images.length,
              highRes: item.highRes,
              feature: item.feature,
              features: item.features
            }));
          sendResponse({ items });
        } catch (err) {
          sendResponse({ items: [], error: String(err) });
        }
      })();
      return true;
    } else if (msg.action === "openCaptureHistoryItem") {
      (async () => {
        try {
          const ok = await loadHistoryItem(msg.id || "");
          if (!ok) throw new Error("History item not found");
          chrome.tabs.create({ url: getEditorUrl(msg.id) });
          sendResponse({ loaded: true });
        } catch (err) {
          sendResponse({ loaded: false, error: String(err) });
        }
      })();
      return true;
    } else if (msg.action === "deleteCaptureHistoryItem") {
      (async () => {
        try {
          await withHistoryStore("readwrite", s => s.delete(msg.id || ""));
          sendResponse({ deleted: true });
        } catch (err) {
          sendResponse({ deleted: false, error: String(err) });
        }
      })();
      return true;
    } else if (msg.action === "clearCaptureHistory") {
      (async () => {
        try {
          if (typeof msg.value !== "number") {
            await withHistoryStore("readwrite", s => s.clear());
          } else {
            const all = (await withHistoryStore("readonly", s => s.getAll())).filter(i => i.createdAt < msg.value);
            if (all.length > 0) {
              const db = await openHistoryDB();
              await new Promise((resolve, reject) => {
                const tx = db.transaction(HISTORY_STORE, "readwrite");
                const store = tx.objectStore(HISTORY_STORE);
                all.forEach(i => store.delete(i.id));
                tx.oncomplete = () => { db.close(); resolve(); };
                tx.onerror = () => { db.close(); reject(tx.error); };
              });
            }
          }
          sendResponse({ cleared: true });
        } catch (err) {
          sendResponse({ cleared: false, error: String(err) });
        }
      })();
      return true;
    } else if (msg.action === "openCaptureEditPage") {
      chrome.tabs.create({ url: getEditorUrl() });
    } else if (msg.action === "start_captureAllpageEdit") {
      if (activeTab) {
        chrome.tabs.sendMessage(activeTab.id, { action: "captureAllPageScreenshot" });
        shouldOpenEdit = 1;
      }
    } else if (msg.action === "start_highResCaptureAllpageEdit") {
      const tab = sender.tab || activeTab;
      activeTab = tab;
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action: "captureHighResAllPageScreenshot" });
        shouldOpenEdit = 1;
      }
    } else if (msg.action === "start_capturePageFromCurrentPosition") {
      if (activeTab) {
        chrome.tabs.sendMessage(activeTab.id, { action: "capturePageScreenshotFromCurrentPosition" });
        shouldOpenEdit = 1;
      }
    } else if (msg.action === "captureVisiblePageScreenshot4Edit") {
      const getTab = msg.tabId
        ? new Promise(resolve => chrome.tabs.get(msg.tabId, t => resolve(chrome.runtime.lastError ? (sender.tab || activeTab) : t)))
        : Promise.resolve(sender.tab || activeTab);

      getTab.then(tab => {
        resetState();
        activeTab = tab || activeTab;
        return new Promise((resolve, reject) => {
          chrome.tabs.captureVisibleTab({ format: "png" }, dataUri => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            img0 = dataUri;
            targetTitle = activeTab?.title;
            targetUrl = activeTab?.url;
            saveToHistory(activeTab)
              .then(id => chrome.tabs.create({ url: getEditorUrl(id) }))
              .then(() => resolve())
              .catch(() => {
                chrome.tabs.create({ url: getEditorUrl() }, () => resolve());
              });
          });
        });
      })
      .then(() => sendResponse({ loaded: true }))
      .catch(err => sendResponse({ loaded: false, error: String(err) }));
      return true;
    } else if (msg.action === "captureVisiblePageScreenshot") {
      pendingScreenshot = "";
      chrome.tabs.captureVisibleTab(dataUri => {
        pendingScreenshot = dataUri || "";
        const payload = { action: "getNowShotImgData", y1: msg.y1, y2: msg.y2 };
        if (msg.nextPageData) payload.nextPageData = msg.nextPageData;
        chrome.tabs.sendMessage(activeTab?.id, payload);
      });
    } else if (msg.action === "captureVisiblePageScreenshot4Selection") {
      pendingScreenshot = "";
      chrome.tabs.captureVisibleTab(dataUri => {
        pendingScreenshot = dataUri || "";
        chrome.tabs.sendMessage(activeTab?.id, { action: "getNowShotImgData4Selection", y1: msg.y1, y2: msg.y2 });
      });
    } else if (msg.action === "captureVisiblePageScreenshot4SelectionCopy") {
      pendingScreenshot = "";
      chrome.tabs.captureVisibleTab(dataUri => {
        pendingScreenshot = dataUri || "";
        chrome.tabs.sendMessage(activeTab?.id, { action: "getNowShotImgData4SelectionCopy", y1: msg.y1, y2: msg.y2 });
      });
    } else if (msg.action === "requestCaptureScreenshot") {
      sendResponse({ imageData: pendingScreenshot, y1: msg.y1, y2: msg.y2 });
      pendingScreenshot = "";
      return true;
    } else {
      // Chunk receivers for long/segmented screenshots
      const chunkMap = [
        { idx: () => idx0, setIdx: v => { idx0 = v; }, getImg: () => img0, setImg: v => { img0 = v; } },
        { idx: () => idx1, setIdx: v => { idx1 = v; }, getImg: () => img1, setImg: v => { img1 = v; } },
        { idx: () => idx2, setIdx: v => { idx2 = v; }, getImg: () => img2, setImg: v => { img2 = v; } },
        { idx: () => idx3, setIdx: v => { idx3 = v; }, getImg: () => img3, setImg: v => { img3 = v; } },
        { idx: () => idx4, setIdx: v => { idx4 = v; }, getImg: () => img4, setImg: v => { img4 = v; } },
        { idx: () => idx5, setIdx: v => { idx5 = v; }, getImg: () => img5, setImg: v => { img5 = v; } },
        { idx: () => idx6, setIdx: v => { idx6 = v; }, getImg: () => img6, setImg: v => { img6 = v; } },
        { idx: () => idx7, setIdx: v => { idx7 = v; }, getImg: () => img7, setImg: v => { img7 = v; } },
      ];

      for (let i = 0; i < chunkMap.length; i++) {
        if (msg.action === `imgDataChunk${i}`) {
          const handler = chunkMap[i];
          if (msg.dataIndex === 0) {
            handler.setIdx(0);
            handler.setImg("");
          }
          if (msg.dataIndex === handler.idx()) {
            handler.setImg((handler.getImg() || "") + msg.dataItem);
            handler.setIdx(handler.idx() + 1);
          }
          if (msg.dataIndex === msg.dataLength - 1 && msg.hasNextImg === 0) {
            finalizeAndOpenEditor(sender.tab || activeTab);
          }
          sendResponse({ rtn: 1, index: msg.dataIndex });
          return true;
        }
      }
    }
  });
})();
