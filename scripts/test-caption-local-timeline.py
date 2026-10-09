"""Verify decoder configuration without loading a model or running speech jobs."""
import ast
import pathlib
import unittest


class LocalCaptionTimelineTest(unittest.TestCase):
    def test_recovery_rejects_overlap_and_preserves_valid_words_on_failure(self):
        source = pathlib.Path(__file__).resolve().parents[1] / 'whisper-transcribe-caption.py'
        tree = ast.parse(source.read_text(encoding='utf-8'))
        functions = [node for node in tree.body if isinstance(node, ast.FunctionDef)
                     and node.name in ('uncovered_audio_ranges', 'repair_remaining_audio_gaps')]
        import re
        context = dict(auto_recovery=True, recovery_warnings=[], audio_duration_seconds=lambda _: 5,
                       song_mode=False, is_repetition_loop=lambda _: False,
                       clean=lambda text: text.strip(), re=re)
        exec(compile(ast.Module(body=functions, type_ignores=[]), str(source), 'exec'), context)
        current = ('Hello world', 'en', [], [
            {'word': 'Hello', 'start': 0, 'end': 1},
            {'word': 'world', 'start': 4, 'end': 5}])
        context['run_whisper_with_model'] = lambda *args, **kwargs: ('example sentence', 'en', [], [
            {'word': 'example', 'start': 2, 'end': 3},
            {'word': 'sentence', 'start': 2.5, 'end': 3.5}])
        self.assertEqual(context['repair_remaining_audio_gaps'](None, 'fixture', 'en', current), current)
        self.assertIn('overlapping word timing', context['recovery_warnings'][-1])
        def failed(*args, **kwargs):
            raise RuntimeError('decoder failed')
        context['run_whisper_with_model'] = failed
        self.assertEqual(context['repair_remaining_audio_gaps'](None, 'fixture', 'en', current), current)
        self.assertIn('Existing captions were retained', context['recovery_warnings'][-1])

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
