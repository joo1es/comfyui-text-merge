import { app } from "../../scripts/app.js";
import { ComfyWidgets } from "../../scripts/widgets.js";

app.registerExtension({
  name: "ComfyUI.TextMerge",
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name !== "TextMerge") return;

    function numSlots(node) {
      return (node.widgets || []).filter((w) => /^text_\d+$/.test(w.name)).length;
    }

    function getWidget(node, name) {
      return (node.widgets || []).find((w) => w.name === name);
    }

    function updatePreview(node) {
      const n = numSlots(node);
      const get = (name) => getWidget(node, name)?.value;
      const parts = [];
      for (let i = 1; i <= n; i++) {
        if (get("enable_" + i) && get("text_" + i)?.trim()) {
          parts.push(get("text_" + i));
        }
      }
      const preview = getWidget(node, "Preview");
      if (preview) {
        preview.value = parts.join(get("merge_char") ?? ", ");
      }
    }

    function createPreview(node) {
      if (getWidget(node, "Preview")) return;
      const w = ComfyWidgets["STRING"](node, "Preview", ["STRING", { multiline: true }], app).widget;
      if (w.inputEl) w.inputEl.readOnly = true;
      w.serializeValue = () => "";
    }

    function hookCallbacks(node) {
      for (const w of node.widgets || []) {
        if (!w || !w.name || w.name === "Preview") continue;
        if (w.name === "merge_char" || /^text_\d+$/.test(w.name) || /^enable_\d+$/.test(w.name)) {
          const original = w.callback;
          w.callback = function () {
            original?.apply(this, arguments);
            updatePreview(node);
          };
        }
      }
    }

    function resize(node) {
      requestAnimationFrame(() => {
        const sz = node.computeSize();
        if (sz[0] < node.size[0]) sz[0] = node.size[0];
        if (sz[1] < node.size[1]) sz[1] = node.size[1];
        node.onResize?.(sz);
        node.graph?.setDirtyCanvas?.(true, false);
      });
    }

    function init(node) {
      createPreview(node);
      hookCallbacks(node);
      updatePreview(node);
      resize(node);
    }

    const onNodeCreated = nodeType.prototype.onNodeCreated;
    nodeType.prototype.onNodeCreated = function () {
      onNodeCreated?.apply(this, arguments);
      requestAnimationFrame(() => init(this));
    };

    const onConfigure = nodeType.prototype.onConfigure;
    nodeType.prototype.onConfigure = function () {
      onConfigure?.apply(this, arguments);
      requestAnimationFrame(() => init(this));
    };

    const onExecuted = nodeType.prototype.onExecuted;
    nodeType.prototype.onExecuted = function (message) {
      onExecuted?.apply(this, arguments);
      const preview = getWidget(this, "Preview");
      if (message?.text?.[0] != null && preview) {
        preview.value = String(message.text[0]);
      }
    };
  },
});