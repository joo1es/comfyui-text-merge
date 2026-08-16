import json

# Number of slots shown when the node is first created.
# Change this to adjust the initial slot count.
NUM_SLOTS = 4

# Hard cap on the number of slots a node can have in the UI.
MAX_SLOTS = 20


class TextMerge:
    """Merge multiple alternative texts into a single string.

    Slots are toggled on/off via checkboxes, a merge character separates the
    selected texts, and a live preview is shown on the frontend. The serialized
    slot state travels from the frontend through the hidden ``state_json``
    widget, so the node only needs this one input.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "state_json": (
                    "STRING",
                    {
                        "multiline": True,
                        "default": "",
                        "numSlots": NUM_SLOTS,
                        "maxSlots": MAX_SLOTS,
                    },
                ),
            },
            "optional": {
                "input_1": ("STRING", {"forceInput": True}),
                "input_2": ("STRING", {"forceInput": True}),
                "input_3": ("STRING", {"forceInput": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "merge"
    CATEGORY = "utils/text"

    def merge(self, state_json, input_1="", input_2="", input_3=""):
        try:
            state = json.loads(state_json)
        except Exception:
            state = {}
        if not isinstance(state, dict):
            state = {}
        merge_char = state.get("merge_char", ", ")
        slots = state.get("slots", [])
        parts = []
        for slot in slots:
            if not isinstance(slot, dict):
                continue
            if not slot.get("enabled"):
                continue
            text = slot.get("text", "")
            if isinstance(text, str) and text.strip():
                parts.append(text)
        for inp in (input_1, input_2, input_3):
            if isinstance(inp, str) and inp.strip():
                parts.append(inp)
        return (merge_char.join(parts),)


NODE_CLASS_MAPPINGS = {"TextMerge": TextMerge}
NODE_DISPLAY_NAME_MAPPINGS = {"TextMerge": "Text Merge"}

WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]