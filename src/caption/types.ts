// Caption Burner — Types (v3 — auto-detect language)
export interface WordItem { text: string; start: number; end: number; }
export interface CaptionItem { start: number; end: number; text: string; words?: WordItem[]; }
export type ItemStatus = 'idle'|'transcribing'|'transcribed'|'exporting'|'completed'|'failed';
export interface VideoMeta {
  name: string; mimeType: string; file?: File; base64?: string; duration?: number;
}
export interface QueueItem {
  id: string; video: VideoMeta; status: ItemStatus;
  progress: number; message: string; retryCount: number;
  captions?: CaptionItem[]; outputUrl?: string;
  detectedLang?: string;   // e.g. "Telugu", "Hindi"
}
export type FontColor  = 'White'|'Yellow'|'Cyan'|'Black';
export type BgColor    = 'Black (70%)'|'White (20%)'|'Black'|'Transparent';
export type CaptionStyle = 'pill'|'outline'|'minimal';
export type Position   = 'top'|'bottom'|'custom';
export type Language   = 'Auto-Detect'|'Telugu'|'English'|'Hindi'|'Tamil'|'Urdu'|'Arabic';

export interface CaptionSettings {
  fontSize: number;
  fontColor: FontColor;
  bgColor: BgColor;
  style: CaptionStyle;
  position: Position;
  xPos: number;
  yPos: number;
  highlightColor: string;
  language: Language;
  offset: number;
  maxWordsPerCaption: number;
}

// BCP-47 codes for manual selection
export const LANG_CODE: Record<string, string> = {
  Telugu:'te', English:'en', Hindi:'hi', Tamil:'ta', Urdu:'ur', Arabic:'ar',
};

// Human-readable name from BCP-47 code
export const CODE_TO_NAME: Record<string, string> = {
  te:'Telugu', en:'English', hi:'Hindi', ta:'Tamil', ur:'Urdu', ar:'Arabic',
  fr:'French', de:'German', es:'Spanish', zh:'Chinese', ja:'Japanese',
  ko:'Korean', ru:'Russian', pt:'Portuguese', it:'Italian', nl:'Dutch',
  tr:'Turkish', pl:'Polish', sv:'Swedish', da:'Danish', fi:'Finnish',
  no:'Norwegian', id:'Indonesian', ms:'Malay', th:'Thai', vi:'Vietnamese',
};
