# ComfyUI Text Merge

A simple [ComfyUI](https://github.com/Comfy-Org/ComfyUI) custom node that lets you input multiple alternative text pieces, toggle each one on/off with a checkbox, set a merge separator, and output the combined text.

## Features

- **Native widgets only**: each text slot is a standard checkbox + multiline text pair, so node sizing stays pixel-perfect.
- Every slot has its own **Enable/Disable** checkbox; only enabled, non-empty texts are joined.
- A **merge character** field sets the separator between the selected texts.
- **Live preview**: a read-only native preview widget shows the merged result as you type (and updates from the real output after execution).
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
3. Set the `Merge Char` (merge character), e.g. `, ` or `|`. The `Preview` widget shows the merged result live.
4. Optionally connect other text nodes to `input_1` ~ `input_3`; their text is appended to the merged output.
5. The `text` output contains the joined result.

Example: slots `["a", "b", "c"]` with slot 2 disabled, `input_1 = "x"`, and separator `|` produces `a|c|x`.

## Configuration

- `NUM_SLOTS` in `__init__.py`: number of text slots the node has. Edit it and restart ComfyUI to change the slot count.

## Customization

The live preview is built in and uses only native widgets. Need different slot behavior, more optional inputs, or other tweaks? Feel free to ask.