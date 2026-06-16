import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    indian = [v for v in voices if v["ShortName"].startswith("en-IN")]
    print(f"{'Voice':<45} {'Gender':<8} {'Style'}")
    print("-" * 80)
    for v in indian:
        styles = v.get("VoiceTag", {}).get("VoicePersonalities", [])
        style = ", ".join(styles[:2]) if styles else "—"
        print(f"{v['ShortName']:<45} {v['Gender']:<8} {style}")

asyncio.run(main())
