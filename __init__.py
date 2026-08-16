from typing_extensions import override

from comfy_api.latest import ComfyExtension, io

NUM_SLOTS = 4


class TextMerge(io.ComfyNode):
    """
    Text Merge node:
    Input multiple alternative text pieces, toggle each one on/off with a checkbox,
    set a merge separator, and output the selected texts joined into a single string.
    """

    @classmethod
    def define_schema(cls) -> io.Schema:
        inputs = [
            io.String.Input(
                "merge_char",
                display_name="Merge Char",
                multiline=False,
                default=", ",
                tooltip="Separator used to join the enabled text pieces",
            )
        ]
        for i in range(1, NUM_SLOTS + 1):
            inputs.append(
                io.Boolean.Input(
                    f"enable_{i}",
                    display_name=f"Enable Text {i}",
                    default=True,
                    label_on="On",
                    label_off="Off",
                    socketless=True,
                )
            )
            inputs.append(
                io.String.Input(
                    f"text_{i}",
                    display_name=f"Text {i}",
                    multiline=True,
                    default="",
                )
            )

        return io.Schema(
            node_id="TextMerge",
            display_name="Text Merge",
            category="utils/text",
            inputs=inputs,
            outputs=[
                io.String.Output("text", display_name="Merged Text"),
            ],
        )

    @classmethod
    def execute(cls, merge_char, **kwargs) -> io.NodeOutput:
        parts = []
        for i in range(1, NUM_SLOTS + 1):
            enabled = kwargs.get(f"enable_{i}", True)
            text = kwargs.get(f"text_{i}", "")
            if enabled and text is not None and text.strip() != "":
                parts.append(text)
        return io.NodeOutput(merge_char.join(parts))


class TextMergeExtension(ComfyExtension):
    @override
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [
            TextMerge,
        ]


async def comfy_entrypoint() -> TextMergeExtension:
    return TextMergeExtension()