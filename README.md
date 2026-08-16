# ComfyUI Text Merge

A simple [ComfyUI](https://github.com/Comfy-Org/ComfyUI) custom node that lets you input multiple alternative text pieces, toggle each one on/off with a checkbox, set a merge separator, and output the combined text.

## Features

- Up to 4 text slots (configurable), each with its own **Enable/Disable** toggle
- A **merge character** field to set the separator between enabled texts
- Only enabled, non-empty texts are joined
- Single **String** output with the final concatenated text

## Installation

Clone the repo into your `custom_nodes` folder:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/joo1es/comfyui-text-merge.git
```

Restart ComfyUI. The node will appear in the node list under `utils/text`.

## Usage

1. Add the node `多文案拼接 TextMerge` (`utils/text`) to your workflow.
2. Fill in the text slots you want to use (`文案1` ~ `文案4`).
3. Check the toggle (`启用文案N`) to include a slot, uncheck to exclude it.
4. Set the `合并字符` (merge character), e.g. `, ` or `|`.
5. The `合并文本` (merged text) output contains the joined result.

Example: with slots `["a", "b", "c"]`, slot 2 disabled, and separator `|`, the output is `a|c`.

## Customization

- To change the number of text slots, edit `NUM_SLOTS` in `__init__.py`.
- Dynamic add/remove of slots, or a real-time preview in the frontend, can be added on request.