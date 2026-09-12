<div align="center">

# 📸 OpenCapture

**The 100% Free & Open-Source (FOSS) Full-Page Screenshot & Annotation Extension**  
*Zero paywalls, zero ads, zero telemetry. 100% local-first alternative to GoFullPage, Awesome Screenshot, and FireShot.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success.svg)](manifest.json)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local--First-brightgreen.svg)](#-privacy--security)
[![No Telemetry](https://img.shields.io/badge/Telemetry-Zero%20Tracking-purple.svg)](#-privacy--security)
[![Supported Browsers](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Opera%20%7C%20Arc-orange.svg)](#-browser-compatibility)

[English](README.md) | [Português (Brasil)](README.pt-BR.md)

<br>
<img src="assets/screenshots/preview-editor.png" alt="OpenCapture Full-Page Screenshot & Annotation Editor" width="880" />

</div>

---

## 🚀 Why OpenCapture?

Most popular screen capture extensions have shifted toward aggressive freemium models—locking multi-page PDF exports, high-DPI captures, and redaction tools behind monthly subscriptions or collecting user browsing habits. Recently, several commercial extensions have even been flagged by privacy-conscious browsers like Brave for questionable tracking.

**OpenCapture** is built to do the opposite: provide a **complete, high-performance, and privacy-respecting screen capture suite** that runs entirely inside your browser sandbox.

### 🌟 Key Highlights

- ⚡ **Full Page & Scrollable Container Capture:** Automatically scrolls and stitches entire web pages or nested scrollable elements.
- 🔍 **2x HD High-DPI Capture:** Crisp captures with sharp typography and high fidelity on Retina/4K displays.
- ✂️ **Smart Ultra-Long Page Splitting:** Automatically slices giant web pages into logical segments for smooth rendering and clean printing.
- 🎨 **Built-in Annotation & Redaction:** Add arrows, rectangles, freehand sketches, callouts, text, and **blur/mosaic tools** to redact sensitive passwords, emails, or personal data.
- 📄 **Flexible Export Options:** Copy directly to clipboard, download as lossless PNG/JPEG, or generate high-quality **multi-page PDFs**.
- 🗂️ **Local Screenshot History:** Built-in IndexedDB storage lets you revisit, edit, and re-export past captures anytime.
- 🔒 **100% Local-First & Privacy Guaranteed:** Zero cloud servers, zero analytics, zero external API requests. Your captures never leave your machine.

---

## 👥 Who Is It For? (Use Cases)

- **UX/UI Designers:** Capture entire responsive web layouts, full-length landing pages, and complex designs in crystal-clear 2x HD without cutoffs.
- **QA Engineers & Testers:** Take full-page bug evidence, annotate defects with arrows and callouts, and attach them directly to Jira, GitHub, or Linear.
- **Researchers, Journalists & Legal:** Capture immutable, complete webpage records and export them directly to multi-page PDF documents.
- **Developers:** Document full pull requests, UI workflows, and design system states without paying for SaaS screen capture tools.

---

## 📊 Feature Comparison

| Feature | OpenCapture (FOSS) | GoFullPage | Awesome Screenshot | FireShot |
| :--- | :---: | :---: | :---: | :---: |
| **Price** | **100% Free** | Freemium ($12+/yr) | Freemium ($36+/yr) | Freemium / Pro |
| **Multi-page PDF Export** | ✅ **Free & Unlimited** | 🔒 Premium Only | 🔒 Premium Only | 🔒 Pro Only |
| **2x HD (Retina) Capture** | ✅ **Free** | 🔒 Premium Only | 🔒 Premium Only | 🔒 Pro Only |
| **Blur / Mosaic (Redact Data)** | ✅ **Free** | 🔒 Premium Only | ⚠️ Limited | 🔒 Pro Only |
| **Ultra-Long Page Split** | ✅ **Automatic** | 🔒 Premium Only | ❌ No | ❌ No |
| **Account / Login Required** | ❌ **No (Zero Sign-up)** | ⚠️ Optional | ⚠️ Required for features | ❌ No |
| **Privacy & Telemetry** | 🛡️ **Zero Tracking** | ⚠️ Analytics | ⚠️ Ad / Tracker network | ⚠️ Analytics |
| **Open Source** | ✅ **MIT License** | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary |

---

## 📦 Simple Installation (For Non-Developers & Everyone)

You do **not** need any coding experience or terminal tools to install and use OpenCapture in your browser! Just follow these quick steps:

### 1️⃣ Download OpenCapture
- **[👉 Click here to download OpenCapture (.ZIP)](https://github.com/nklowns/opencapture/releases/latest/download/opencapture-v1.0.0.zip)** (or visit the [Releases page](https://github.com/nklowns/opencapture/releases))
- Save the file to your computer.

### 2️⃣ Extract the ZIP to a Permanent Folder
- Right-click the downloaded `.zip` file and select **"Extract All..."** (or unzip it with your preferred tool).
- 💡 **Important Tip:** Place the extracted folder in a permanent location (such as `Documents/OpenCapture` or a dedicated `Extensions` folder). Do not leave it in a temporary "Downloads" folder, because the browser loads the extension directly from this directory.

### 3️⃣ Load into Your Browser

#### Google Chrome, Brave, Opera, Vivaldi, Arc:
1. In your address bar, type `chrome://extensions` (or `brave://extensions`, `opera://extensions`) and press **Enter**.
2. Turn ON **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the extracted `opencapture` folder.

#### Microsoft Edge:
1. In your address bar, type `edge://extensions` and press **Enter**.
2. Turn ON **Developer mode** in the left sidebar.
3. Click **Load unpacked** and select the extracted `opencapture` folder.

---

## 📌 Pin OpenCapture for 1-Click Access

<div align="center">
  <table>
    <tr>
      <td align="center" width="45%" valign="middle">
        <strong>📸 Instant Capture Modes</strong><br><br>
        <img src="assets/screenshots/preview-menu.png" alt="OpenCapture Capture Menu" width="270" />
      </td>
      <td align="center" width="55%" valign="middle">
        <strong>📌 Pin to Toolbar</strong><br><br>
        <img src="assets/pin.png" alt="How to pin OpenCapture in Chrome and Chromium browsers" width="370" />
      </td>
    </tr>
  </table>
</div>

1. Click the **puzzle icon (🧩)** in the top right of your browser toolbar.
2. Click the **pin icon (📌)** next to **OpenCapture**.
3. Now, whenever you want to take a screenshot, just click the OpenCapture camera icon!

> 💡 **Keyboard Shortcut:** Press `Alt + Shift + S` (or `Cmd + Shift + S` on macOS) on any page to open the OpenCapture menu instantly! You can customize this shortcut anytime at `chrome://extensions/shortcuts`.

---

## ⚙️ Configurable Options

Customize page margins, PDF paper sizes (A4, Letter, Full page), image format (PNG/JPG), and automatic downloads via the built-in settings panel:

<div align="center">
  <img src="assets/screenshots/preview-settings.png" alt="OpenCapture Settings Panel" width="750" />
</div>

---

## 🔄 How to Update to Newer Versions

When a new version of OpenCapture is released:
1. Download the latest `.zip` file.
2. Replace the files in your existing `opencapture` folder with the new ones.
3. Go back to `chrome://extensions` and click the **Reload button (🔄)** on the OpenCapture card. Done!

---

## 💻 Developer Installation (Optional)

If you have Git installed:

```bash
# Clone the repository
git clone https://github.com/nklowns/opencapture.git

# Open your browser extensions manager
# Chrome: chrome://extensions
# Edge:   edge://extensions
# Enable "Developer mode" -> click "Load unpacked" -> choose the folder
```

---

## 🌐 Browser Compatibility

| Browser | Status | Support Level |
| :--- | :---: | :--- |
| **Google Chrome** | ✅ Supported | Native (Chromium Manifest V3) |
| **Microsoft Edge** | ✅ Supported | Native (Chromium Manifest V3) |
| **Brave Browser** | ✅ Supported | Native (Chromium Manifest V3) |
| **Opera / Opera GX** | ✅ Supported | Native (Chromium Manifest V3) |
| **Vivaldi** | ✅ Supported | Native (Chromium Manifest V3) |
| **Arc Browser** | ✅ Supported | Native (Chromium Manifest V3) |
| **Mozilla Firefox** | ⚠️ Notice | Works via `about:debugging` for development/temporary sessions. Firefox restricts persistent unpacked extensions on standard release channels without digital signing. |

---

## 🔒 Privacy & Security

OpenCapture is designed around the **Local-First** philosophy:
- **No Remote Servers:** All screenshot stitching, canvas transformations, and PDF generation happen locally via Web APIs.
- **No Telemetry:** We do not track what websites you visit, when you capture, or what you save.
- **No Third-Party Scripts:** No Google Analytics, no trackers, no remote font/script fetching.
- **Minimal Permissions:** Uses standard `activeTab` and `scripting` permissions strictly to read page scroll dimensions and capture visible tabs.

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><strong>Why do I need to turn on "Developer mode" to install it?</strong></summary>
"Developer mode" is the standard browser mechanism for loading extensions directly from source files instead of downloading them through a corporate extension store. It gives you 100% control over the code running on your machine.
</details>

<details>
<summary><strong>Can OpenCapture capture sticky headers and footers without duplicating them?</strong></summary>
Yes! OpenCapture uses intelligent fixed-position element handling during scrolling so that headers and navbars aren't repeated or cut off in the final stitched image.
</details>

<details>
<summary><strong>Can I blur passwords or private information before saving?</strong></summary>
Yes. OpenCapture features a built-in annotation editor with a dedicated mosaic/blur tool, allowing you to easily obscure sensitive text, emails, or credentials before downloading or sharing.
</details>

<details>
<summary><strong>Is there any limit to the page length or number of screenshots?</strong></summary>
None. All screenshots are stored locally in your browser's IndexedDB database. You can capture as many pages as your computer's local disk allows.
</details>

---

## 📄 License & Third-Party Notices

OpenCapture is open-source software licensed under the [MIT License](LICENSE).

Third-party dependencies and their licenses are documented in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
