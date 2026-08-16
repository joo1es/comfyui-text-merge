import { app } from "../../scripts/app.js";

const NODE_NAME = "TextMerge";
const STYLE_ID = "comfyui-text-merge-style";

function injectStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .tm-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 4px 8px 8px;
      min-width: 300px;
      box-sizing: border-box;
    }
    .tm-mc {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tm-mc label {
      font-size: 12px;
      white-space: nowrap;
      color: var(--comfy-input-text, #ccc);
    }
    .tm-mc input {
      flex: 1;
      min-width: 0;
      background: rgba(0,0,0,0.4);
      color: var(--comfy-input-text, #ccc);
      border: 1px solid var(--border-color, #555);
      border-radius: 4px;
      padding: 3px 6px;
      font-size: 12px;
      box-sizing: border-box;
    }
    .tm-slots {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tm-row {
      display: flex;
      gap: 6px;
      align-items: flex-start;
    }
    .tm-row input[type="checkbox"] {
      margin-top: 4px;
      accent-color: #4caf50;
      flex-shrink: 0;
    }
    .tm-row textarea {
      flex: 1;
      min-width: 0;
      resize: vertical;
      background: rgba(0,0,0,0.4);
      color: var(--comfy-input-text, #ccc);
      border: 1px solid var(--border-color, #555);
      border-radius: 4px;
      padding: 3px 6px;
      font-size: 12px;
      font-family: inherit;
      line-height: 1.4;
      box-sizing: border-box;
    }
    .tm-row button.tm-del {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      line-height: 18px;
      text-align: center;
      padding: 0;
      margin-top: 2px;
      background: rgba(255, 80, 80, 0.15);
      color: #ff6b6b;
      border: 1px solid rgba(255, 80, 80, 0.4);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .tm-row button.tm-del:hover {
      background: rgba(255, 80, 80, 0.35);
    }
    button.tm-add {
      align-self: flex-start;
      background: rgba(76, 175, 80, 0.15);
      color: #6fce75;
      border: 1px solid rgba(76, 175, 80, 0.4);
      border-radius: 4px;
      padding: 3px 10px;
      cursor: pointer;
      font-size: 12px;
    }
    button.tm-add:hover {
      background: rgba(76, 175, 80, 0.35);
    }
    .tm-preview {
      border: 1px dashed var(--border-color, #555);
      border-radius: 4px;
      padding: 4px 6px;
      background: rgba(0,0,0,0.25);
      min-height: 22px;
      max-height: 90px;
      overflow-y: auto;
      word-break: break-all;
      white-space: pre-wrap;
      font-size: 12px;
      color: var(--comfy-input-text, #ccc);
    }
    .tm-preview-label {
      font-size: 11px;
      opacity: 0.7;
      margin-bottom: 2px;
    }
  `;
  document.head.appendChild(style);
}

app.registerExtension({
  name: "ComfyUI.TextMerge",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== NODE_NAME) return;

    const opts = nodeData?.input?.required?.state_json?.[1] ?? {};
    const NUM_SLOTS = opts.numSlots ?? 4;
    const MAX_SLOTS = opts.maxSlots ?? 20;

    function getStateWidget(node) {
      return node.widgets?.find((w) => w.name === "state_json");
    }

    function serialize(node) {
      return JSON.stringify({
        merge_char: node._mergeChar.value,
        slots: node._slots.map((row) => ({
          text: row.text.value,
          enabled: row.enabled.checked,
        })),
      });
    }

    function updatePreview(node) {
      const parts = node._slots
        .filter((row) => row.enabled.checked && row.text.value.trim() !== "")
        .map((row) => row.text.value);
      node._preview.textContent = parts.join(node._mergeChar.value);
    }

    function notifyState(node) {
      const sw = getStateWidget(node);
      if (sw) {
        sw.value = serialize(node);
        sw.callback?.(sw.value);
      }
      node.setDirtyCanvas?.(true, true);
      app.graph?.setDirtyCanvas?.(true, true);
    }

    function addSlotRow(node, text = "", enabled = true) {
      if (node._slots.length >= MAX_SLOTS) return;

      const row = document.createElement("div");
      row.className = "tm-row";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = enabled;
      cb.title = "Enable/disable this text";

      const ta = document.createElement("textarea");
      ta.rows = 2;
      ta.placeholder = "Text " + (node._slots.length + 1);
      ta.value = text;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "tm-del";
      del.textContent = "\u00d7";
      del.title = "Remove this text";

      const entry = { enabled: cb, text: ta, del };

      cb.addEventListener("change", () => {
        notifyState(node);
        updatePreview(node);
      });
      ta.addEventListener("input", () => {
        notifyState(node);
        updatePreview(node);
      });
      del.addEventListener("click", () => {
        if (node._slots.length <= 1) return;
        node._slots.splice(node._slots.indexOf(entry), 1);
        row.remove();
        node._slots.forEach((r, i) => {
          r.text.placeholder = "Text " + (i + 1);
        });
        notifyState(node);
        updatePreview(node);
        resizeNode(node);
      });

      row.append(cb, ta, del);
      node._slotsContainer.appendChild(row);
      node._slots.push(entry);
    }

    function resizeNode(node) {
      requestAnimationFrame(() => {
        const height = Math.max(80, node._wrap?.scrollHeight + 14 ?? 80);
        node.setSize?.([node.size[0] || 340, height]);
        node.graph?.setDirtyCanvas?.(true, false);
      });
    }

    function buildDom(node) {
      injectStyle();

      if (!node._wrap) {
        const wrap = document.createElement("div");
        wrap.className = "tm-wrap";

        const mcRow = document.createElement("div");
        mcRow.className = "tm-mc";
        const mcLabel = document.createElement("label");
        mcLabel.textContent = "Merge Char:";
        const mcInput = document.createElement("input");
        mcInput.type = "text";
        mcInput.value = ", ";
        mcInput.title = "Separator between enabled texts";
        mcRow.append(mcLabel, mcInput);

        const slotsContainer = document.createElement("div");
        slotsContainer.className = "tm-slots";

        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "tm-add";
        addBtn.textContent = "+ Add";
        addBtn.addEventListener("click", () => {
          addSlotRow(node);
          notifyState(node);
          updatePreview(node);
          resizeNode(node);
        });

        const preview = document.createElement("div");
        preview.className = "tm-preview";
        const previewLabel = document.createElement("div");
        previewLabel.className = "tm-preview-label";
        previewLabel.textContent = "Preview";
        preview.appendChild(previewLabel);

        wrap.append(mcRow, slotsContainer, addBtn, preview);

        node._wrap = wrap;
        node._mergeChar = mcInput;
        node._slotsContainer = slotsContainer;
        node._preview = preview;
        node._slots = [];

        mcInput.addEventListener("input", () => {
          notifyState(node);
          updatePreview(node);
        });

        node.addDOMWidget("tm_ui", "tmui", wrap, { serialize: false });
      }
    }

    function populateFromState(node, state) {
      buildDom(node);
      node._slotsContainer.innerHTML = "";
      node._slots = [];

      node._mergeChar.value = typeof state.merge_char === "string" ? state.merge_char : ", ";

      let slots = Array.isArray(state.slots) ? state.slots : [];
      const initialCount = Math.max(1, NUM_SLOTS);
      if (slots.length === 0) {
        slots = Array.from({ length: initialCount }, () => ({ text: "", enabled: true }));
      }
      for (const slot of slots.slice(0, MAX_SLOTS)) {
        const text = typeof slot?.text === "string" ? slot.text : "";
        const enabled = slot?.enabled !== false;
        addSlotRow(node, text, enabled);
      }
      updatePreview(node);
      notifyState(node);
      resizeNode(node);
    }

    const onNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onNodeCreated?.apply(this, arguments);
      requestAnimationFrame(() => {
        const sw = getStateWidget(this);
        if (sw) {
          sw.draw = () => {};
          sw.computeSize = () => [0, 0];
        }
        let state = null;
        try {
          if (sw?.value) state = JSON.parse(sw.value);
        } catch (e) {
          state = null;
        }
        populateFromState(this, state ?? {});
      });
    };

    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      onConfigure?.apply(this, arguments);
      if (!this._wrap) return;
      requestAnimationFrame(() => {
        const sw = getStateWidget(this);
        let state = null;
        try {
          if (sw?.value) state = JSON.parse(sw.value);
        } catch (e) {
          state = null;
        }
        if (state) populateFromState(this, state);
      });
    };

    const onExecuted = nodeType.prototype.onExecuted;
    nodeType.prototype.onExecuted = function (message) {
      onExecuted?.apply(this, arguments);
      if (message?.text?.[0] != null && this._wrap) {
        this._preview.textContent = String(message.text[0]);
      }
    };
  },
});