# ComfyUI Text Merge

A simple [ComfyUI](https://github.com/Comfy-Org/ComfyUI) custom node that lets you input multiple alternative text pieces, toggle each one on/off with a checkbox, set a merge separator, and output the combined text.

## Features

- **Dynamic text slots**: add/remove text slots on the fly with the `+ Add` / `×` buttons (up to `MAX_SLOTS`).
- Each slot has its own **Enable/Disable** checkbox; only enabled, non-empty texts are joined.
- A **merge character** field sets the separator between the selected texts.
- **Live preview** inside the node updates the merged result as you type.
- **Three optional STRING inputs** (`input_1` ~ `input_3`): connect other nodes' text and it is merged into the output too (after the slots).
- Single **String** output with the final concatenated text.

## Installation

Clone the repo into your `custom_nodes` folder:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/joo1es/comfyui-text-merge.git
```

Restart ComfyUI. The node will appear in the node list under `utils/text`.

## Usage

1. Add the node `Text Merge` (`utils/text`) to your workflow.
2. Fill in the text slots you want to use, and check the toggle (`Enable Text N`) to include a slot, uncheck to exclude it.
3. Use `+ Add` to create more slots and `×` to remove a slot.
4. Set the `Merge Char` (merge character), e.g. `, ` or `|`. The `Preview` area shows the merged result live.
5. Optionally connect other text nodes to `input_1` ~ `input_3`; their text is appended to the merged output.
6. The `text` output contains the joined result.

Example: slots `["a", "b", "c"]` with slot 2 disabled, `input_1 = "x"`, and separator `|` produces `a|c|x`.

## Configuration

- `NUM_SLOTS` in `__init__.py`: number of slots shown when the node is first created.
- `MAX_SLOTS` in `__init__.py`: hard cap on how many slots a node can have.

The values are forwarded to the frontend automatically; just restart ComfyUI after editing.

## Customization

Dynamic add/remove of slots and the real-time frontend preview are built in. Need different slot behavior, more optional inputs, or other tweaks? Feel free to ask.