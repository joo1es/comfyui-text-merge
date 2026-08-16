from typing_extensions import override

from comfy_api.latest import ComfyExtension, io

NUM_SLOTS = 4


class TextMerge(io.ComfyNode):
    """
    多文案拼接节点：
    输入多个备选文案，每个文案可通过复选框单独启用/停用，
    设置合并字符后，将选中的文案依次拼接输出为单个文本。
    """

    @classmethod
    def define_schema(cls) -> io.Schema:
        inputs = [
            io.String.Input(
                "merge_char",
                display_name="合并字符",
                multiline=False,
                default=", ",
                tooltip="用于连接多个已启用文案的分隔字符",
            )
        ]
        for i in range(1, NUM_SLOTS + 1):
            inputs.append(
                io.Boolean.Input(
                    f"enable_{i}",
                    display_name=f"启用文案{i}",
                    default=True,
                    label_on="启用",
                    label_off="停用",
                    socketless=True,
                )
            )
            inputs.append(
                io.String.Input(
                    f"text_{i}",
                    display_name=f"文案{i}",
                    multiline=True,
                    default="",
                )
            )

        return io.Schema(
            node_id="TextMerge",
            display_name="多文案拼接 TextMerge",
            category="utils/text",
            inputs=inputs,
            outputs=[
                io.String.Output("text", display_name="合并文本"),
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