"""Verify decoder configuration without loading a model or running speech jobs."""
import ast
import pathlib
import unittest


class LocalCaptionTimelineTest(unittest.TestCase):
    def test_decoder_keeps_silent_gaps_in_the_original_audio(self):
        source = pathlib.Path(__file__).resolve().parents[1] / 'whisper-transcribe-caption.py'
        tree = ast.parse(source.read_text(encoding='utf-8'))
        decoder = next(node for node in tree.body if isinstance(node, ast.FunctionDef)
                       and node.name == 'run_whisper_with_model')
        call = next(node for node in ast.walk(decoder) if isinstance(node, ast.Call)
                    and isinstance(node.func, ast.Attribute) and node.func.attr == 'transcribe')
        keywords = {keyword.arg: keyword.value for keyword in call.keywords}
        self.assertIs(ast.literal_eval(keywords['vad_filter']), False)
        self.assertIs(ast.literal_eval(keywords['word_timestamps']), True)
        self.assertIn('clip_timestamps', keywords)
        # Audio-preserving decoding must still filter hallucinated repetitions.
        self.assertTrue(any(isinstance(node, ast.Call) and isinstance(node.func, ast.Name)
                            and node.func.id == 'is_repetition_loop' for node in ast.walk(decoder)))


if __name__ == '__main__':
    unittest.main()
