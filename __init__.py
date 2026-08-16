# Number of text slots. Change this to adjust the slot count.
NUM_SLOTS = 4


class TextMerge:
    """Merge multiple alternative texts into a single string.

    Every slot is a native checkbox + multiline text pair. A merge character
    separates the enabled texts, and up to three optional STRING inputs can be
    wired in as well.
    """

    @classmethod
    def INPUT_TYPES(cls):
        required = {
            "merge_char": ("STRING", {"multiline": False, "default": ", "}),
        }
        for i in range(1, NUM_SLOTS + 1):
            required[f"enable_{i}"] = ("BOOLEAN", {"default": True})
            required[f"text_{i}"] = ("STRING", {"multiline": True, "default": ""})
        optional = {
            "input_1": ("STRING", {"forceInput": True}),
            "input_2": ("STRING", {"forceInput": True}),
            "input_3": ("STRING", {"forceInput": True}),
        }
        return {"required": required, "optional": optional}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "merge"
    CATEGORY = "utils/text"

    def merge(self, merge_char, **kwargs):
        parts = []
        for i in range(1, NUM_SLOTS + 1):
            enabled = kwargs.get(f"enable_{i}", True)
            text = kwargs.get(f"text_{i}", "")
            if enabled and isinstance(text, str) and text.strip():
                parts.append(text)
        for key in ("input_1", "input_2", "input_3"):
            value = kwargs.get(key, "")
            if isinstance(value, str) and value.strip():
                parts.append(value)
        return (merge_char.join(parts),)


NODE_CLASS_MAPPINGS = {"TextMerge": TextMerge}
NODE_DISPLAY_NAME_MAPPINGS = {"TextMerge": "Text Merge"}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]