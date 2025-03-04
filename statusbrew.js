// ==UserScript==
// @name         StatusBrew Enhancer
// @namespace    http://tampermonkey.net/
// @version      2025-03-03
// @description  Show full timestamps, custom styles, drag-and-drop upload & Enter-to-Send for StatusBrew
// @author       You
// @match        https://space.statusbrew.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=statusbrew.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function injectStyles() {
        let existingStyle = document.getElementById('custom-statusbrew-style');
        if (existingStyle) existingStyle.remove();

        let style = document.createElement('style');
        style.id = 'custom-statusbrew-style';
        style.innerHTML = `
            .g-image-item {
                pointer-events: auto !important;
            }
            .conversation-item > div:last-child {
                color: red;
                font-weight: 700;
            }

            .ezliclick-button {
                position: fixed;
                top: 50px;
                right: 10px;
                background: red;
                color: white;
                padding: 8px 12px;
                font-size: 14px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 9999;
            }

            /* Drag & Drop Upload */
            .sb-drag-drop-area {
                position: fixed;
                bottom: 200px;
                right: 20px;
                width: 150px;
                height: 150px;
                background: rgba(0, 0, 0, 0.5);
                color: white;
                font-size: 14px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 10px;
                text-align: center;
                cursor: pointer;
                z-index: 9999;
                transition: background 0.3s;
            }
            .sb-drag-drop-area.dragging {
                background: rgba(255, 0, 0, 0.7);
            }
        `;
        document.head.appendChild(style);
    }

    function revealFullTimestamps() {
        const chatTimes = document.querySelectorAll(
            'span.mat-body-small.sb-text-secondary.sbui-tooltip-host-tp-position-top.sbui-tooltip-host:not([data-fulltimestamp])'
        );
    
        chatTimes.forEach((chatTime) => {
            chatTime.dispatchEvent(new Event('mouseenter', { bubbles: true }));
    
            setTimeout(() => {
                const tooltip = document.querySelector('.tippy-content');
                if (tooltip) {
                    const fullTimestamp = tooltip.innerText.trim();
                    if (fullTimestamp) {
                        // Store the full timestamp as an attribute
                        chatTime.setAttribute('data-fulltimestamp', fullTimestamp);
                        chatTime.textContent = fullTimestamp;
                    }
                }
                chatTime.dispatchEvent(new Event('mouseleave', { bubbles: true }));
            }, 300);
        });
    }
    

    function addButton() {
        if (document.querySelector('.ezliclick-button')) return;

        let button = document.createElement('button');
        button.textContent = 'Show Full Timestamps';
        button.classList.add('ezliclick-button');
        document.body.appendChild(button);
        button.addEventListener('click', revealFullTimestamps);
    }

    function addDragDropArea() {
        if (document.querySelector('.sb-drag-drop-area')) return;

        let dropArea = document.createElement('div');
        dropArea.classList.add('sb-drag-drop-area');
        dropArea.textContent = 'Drop Media Here';

        document.body.appendChild(dropArea);

        dropArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            dropArea.classList.add('dragging');
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('dragging');
        });

        dropArea.addEventListener('drop', (event) => {
            event.preventDefault();
            dropArea.classList.remove('dragging');

            let files = event.dataTransfer.files;
            if (files.length > 0) {
                attachFiles(files);
            }
        });
    }

    function attachFiles(files) {
        let fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) {
            alert('Attachment input not found! Make sure you are in a chat.');
            return;
        }

        let dataTransfer = new DataTransfer();
        for (let file of files) {
            dataTransfer.items.add(file);
        }
        fileInput.files = dataTransfer.files;

        // Simulate user clicking the upload button (optional)
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function enableEnterToSend() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
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

    function initialize() {
        injectStyles();
        addButton();
        addDragDropArea();
        enableEnterToSend();
    }

    if (document.readyState === 'complete') {
        initialize();
    } else {
        window.addEventListener('load', initialize);
    }

    const observer = new MutationObserver(() => {
        injectStyles();
        addButton();
        addDragDropArea();
        enableEnterToSend();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
