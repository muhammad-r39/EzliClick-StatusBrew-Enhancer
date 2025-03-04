// ==UserScript==
// @name         StatusBrew Enhancer
// @namespace    http://tampermonkey.net/
// @version      2025-03-03
// @description  Show full timestamps, custom styles, drag-and-drop upload & Enter-to-Send for StatusBrew
// @author       Muhammad Russell
// @match        https://space.statusbrew.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=statusbrew.com
// @grant        none
// ==/UserScript==

(function () {
  ("use strict");

  function injectStyles() {
    let existingStyle = document.getElementById("custom-statusbrew-style");
    if (existingStyle) existingStyle.remove();

    let style = document.createElement("style");
    style.id = "custom-statusbrew-style";
    style.innerHTML = `
          .g-image-item {
            pointer-events: auto !important;
          }
          .conversation-item > div:last-child {
            color: red;
            font-weight: 700;
          }

          .update-timestamp {
            position: fixed;
            top: 4px;
            left: 0;
            right: 0;
            margin: auto;
            width: 120px;
            background: red;
            color: white;
            padding: 10px 12px;
            font-size: 14px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s ease;
          }

          .update-timestamp:hover {
            scale: 1.1;
          }

            /* Drag & Drop Upload */
          .sb-drag-drop-area {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.3);
            color: white;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 30px;
            text-align: center;
            cursor: pointer;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s, width 0.3s, height 0.3s, background 0.3s;
          }
          .sb-drag-drop-area.active {
            opacity: 1;
            pointer-events: auto;
          }
          .sb-drag-drop-area.dragging {
            width: 800px;
            height: 400px;
            background: rgba(255, 0, 0, 0.7);
          }
          .meta-business-chat-button {
            position: fixed;
            top: 0;
            background-color: #0078d4;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            z-index: 999;
          }
        `;

    document.head.appendChild(style);
  }

  function revealFullTimestamps() {
    const chatTimes = document.querySelectorAll(
      "span.mat-body-small.sb-text-secondary.sbui-tooltip-host-tp-position-top.sbui-tooltip-host:not([data-fulltimestamp])"
    );

    chatTimes.forEach((chatTime) => {
      chatTime.dispatchEvent(new Event("mouseenter", { bubbles: true }));

      setTimeout(() => {
        const tooltip = document.querySelector(".tippy-content");
        if (tooltip) {
          const fullTimestamp = tooltip.innerText.trim();
          if (fullTimestamp) {
            // Store the full timestamp as an attribute
            chatTime.setAttribute("data-fulltimestamp", fullTimestamp);
            chatTime.textContent = fullTimestamp;
          }
        }
        chatTime.dispatchEvent(new Event("mouseleave", { bubbles: true }));
      }, 300);
    });
  }

  function addButton() {
    if (document.querySelector(".update-timestamp")) return;

    let button = document.createElement("button");
    button.textContent = "Timestamps";
    button.classList.add("update-timestamp");
    document.body.appendChild(button);
    button.addEventListener("click", revealFullTimestamps);
  }

  function addDragDropArea() {
    if (document.querySelector(".sb-drag-drop-area")) return;

    let dropArea = document.createElement("div");
    dropArea.classList.add("sb-drag-drop-area");
    dropArea.textContent = "Drop Here";

    const messageBox = document.querySelector("sb-message-reply-box");
    if (messageBox) {
      messageBox.appendChild(dropArea);
    } else {
      document.body.appendChild(dropArea);
    }

    let dragCounter = 0;

    document.addEventListener("dragenter", () => {
      dragCounter++;
      dropArea.classList.add("active");
    });

    document.addEventListener("dragleave", () => {
      dragCounter--;
      if (dragCounter === 0) {
        dropArea.classList.remove("active");
        dropArea.classList.remove("dragging");
      }
    });

    document.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropArea.classList.add("dragging");
    });

    document.addEventListener("drop", (event) => {
      event.preventDefault();
      dropArea.classList.remove("dragging");
      dropArea.classList.remove("active");

      let files = event.dataTransfer.files;
      if (files.length > 0) {
        attachFiles(files);
      }
    });
  }

  function attachFiles(files) {
    let fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) {
      alert("Attachment input not found! Make sure you are in a chat.");
      return;
    }

    let dataTransfer = new DataTransfer();
    for (let file of files) {
      dataTransfer.items.add(file);
    }
    fileInput.files = dataTransfer.files;

    // Simulate user clicking the upload button (optional)
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function enableEnterToSend() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        let sendButton = document.querySelector(
          'button[type="submit"]:not([disabled])'
        );
        if (sendButton) {
          sendButton.click();
        }
      }
    });
  }

  // Function to get the user ID (adjust the selector according to your page structure)
  function getUserId() {
    return false;
  }

  // Function to add the Meta Business Chat button
  function addMetaBusinessChatButton() {
    const userId = getUserId();
    if (!userId) return;

    // Check if the button already exists
    if (document.querySelector(".meta-business-chat-button")) return;

    // Create the button
    let button = document.createElement("button");
    button.textContent = "Go to Meta Business Chat";
    button.classList.add("meta-business-chat-button");

    // Add the button to the page
    document.body.appendChild(button);

    // Add event listener to navigate to Meta Business Chat
    button.addEventListener("click", () => {
      const metaChatUrl = `https://m.me/${userId}`; // Meta Business Chat link
      window.open(metaChatUrl, "_blank");
    });
  }

  function initialize() {
    injectStyles();
    addButton();
    addDragDropArea();
    enableEnterToSend();
    addMetaBusinessChatButton();
  }

  if (document.readyState === "complete") {
    initialize();
  } else {
    window.addEventListener("load", initialize);
  }

  const observer = new MutationObserver(() => {
    injectStyles();
    addButton();
    addDragDropArea();
    enableEnterToSend();
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
