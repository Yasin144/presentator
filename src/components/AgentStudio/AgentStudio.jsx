import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'pattan-agent-studio-v1';
const MAX_ROUNDS = 12;

const makeChat = () => ({
  id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: 'New chat',
  createdAt: Date.now(),
  messages: [],
  references: [],
  assets: [],
});

const loadChats = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) && saved.length ? saved : [makeChat()];
  } catch {
    return [makeChat()];
  }
};

const kindIcon = {
  document: 'file',
  image: 'image',
  video: 'video',
};

const Icon = ({ name, size = 18, className = '' }) => {
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    retry: <><path d="M20 6v5h-5" /><path d="M19 11a8 8 0 1 0 1 5" /></>,
    spark: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M5 15v4h14v-4" /></>,
    file: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-5-4L5 20" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>,
    wrench: <><path d="M14.7 6.3a4 4 0 0 0-5-5L12 4 9 7 6.3 4.7a4 4 0 0 0 5 5L4 17l3 3 7.7-7.7a4 4 0 0 0 0-6Z" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    send: <><path d="M12 19V5m0 0L6 11m6-6 6 6" /></>,
    stop: <><rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" stroke="none" /></>,
    close: <><path d="m7 7 10 10M17 7 7 17" /></>,
    folder: <><path d="M3 6h7l2 2h9v11H3z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] || paths.spark}
    </svg>
  );
};

export default function AgentStudio() {
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [progress, setProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cancelledRef = useRef(false);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const progressTimerRef = useRef(null);

  const activeChat = useMemo(
    () => chats.find(chat => chat.id === activeId) || chats[0],
    [chats, activeId]
  );

  useEffect(() => {
    if (!activeId && chats[0]) setActiveId(chats[0].id);
  }, [activeId, chats]);

  useEffect(() => {
    const persistable = chats.map(chat => ({
      ...chat,
      references: chat.references.map(({ imageBase64, frames, ...reference }) => reference),
      assets: chat.assets.map(({ preview, ...asset }) => asset),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [chats]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeChat?.messages, activeChat?.assets, busy]);

  useEffect(() => () => window.clearInterval(progressTimerRef.current), []);

  const updateActiveChat = (updater) => {
    setChats(previous => previous.map(chat => (
      chat.id === activeId ? updater(chat) : chat
    )));
  };

  const addMessage = (role, text, extra = {}) => {
    if (!text) return;
    updateActiveChat(chat => ({
      ...chat,
      messages: [...chat.messages, {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        text: String(text),
        createdAt: Date.now(),
        ...extra,
      }],
    }));
  };

  const addAsset = (asset) => {
    updateActiveChat(chat => ({
      ...chat,
      assets: [...chat.assets, {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...asset,
      }],
    }));
  };

  const beginProgress = (label, estimateMs = 20000) => {
    window.clearInterval(progressTimerRef.current);
    setStatus(label);
    setProgress(3);
    const started = Date.now();
    progressTimerRef.current = window.setInterval(() => {
      const elapsedRatio = (Date.now() - started) / Math.max(estimateMs, 1000);
      const next = Math.min(94, Math.round(3 + (1 - Math.exp(-elapsedRatio * 2.5)) * 91));
      setProgress(current => Math.max(current, next));
    }, 350);
  };

  const finishProgress = (label = 'Completed') => {
    window.clearInterval(progressTimerRef.current);
    setProgress(100);
    setStatus(label);
    window.setTimeout(() => setProgress(0), 900);
  };

  const withProgress = async (label, estimateMs, operation) => {
    beginProgress(label, estimateMs);
    try {
      const result = await operation();
      finishProgress(`${label} • done`);
      return result;
    } catch (error) {
      window.clearInterval(progressTimerRef.current);
      setStatus(`Stopped: ${error.message}`);
      setProgress(0);
      throw error;
    }
  };

  const importFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    beginProgress(`Reading ${files.length} reference${files.length > 1 ? 's' : ''}`, 12000);
    try {
      const imported = [];
      for (const file of Array.from(files)) {
        const filePath = window.electronAPI?.getPathForFile?.(file);
        if (!filePath) throw new Error(`Could not access ${file.name}.`);
        const result = await window.electronAPI.presentatorAgentImportReference({ filePath });
        if (!result?.ok) throw new Error(result?.error || `Could not read ${file.name}.`);
        imported.push(result.reference);
      }
      updateActiveChat(chat => ({
        ...chat,
        references: [...chat.references, ...imported],
      }));
      finishProgress(`${imported.length} reference${imported.length > 1 ? 's' : ''} ready`);
    } catch (error) {
      setStatus(`Upload failed: ${error.message}`);
      setProgress(0);
      addMessage('assistant', `I could not import that reference: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeReference = (id) => {
    updateActiveChat(chat => ({
      ...chat,
      references: chat.references.filter(reference => reference.id !== id),
    }));
  };

  const executeAction = async (action) => {
    const tool = String(action?.tool || '');
    const args = action?.args || {};

    if (tool === 'inspect_state') {
      return { tool, ok: true, module: 'Agent Studio', referenceCount: activeChat.references.length };
    }
    if (tool === 'check_servers') {
      return { tool, ok: true, health: await window.electronAPI.getServerHealth() };
    }
    if (tool === 'read_diagnostics') {
      return { tool, ...(await window.electronAPI.presentatorAgentReadDiagnostics()) };
    }
    if (tool === 'restart_server') {
      return { tool, ...(await window.electronAPI.presentatorAgentRestartServer(args.server)) };
    }
    if (tool === 'inspect_code') {
      return { tool, ...(await window.electronAPI.presentatorAgentInspectCode(args)) };
    }
    if (tool === 'apply_code_patch') {
      return {
        tool,
        ...(await withProgress('Validating internal repair', 45000, () =>
          window.electronAPI.presentatorAgentApplyPatch(args)
        )),
      };
    }
    if (tool === 'restart_application') {
      return { tool, ...(await window.electronAPI.presentatorAgentRestartApp()) };
    }
    if (tool === 'generate_image') {
      const generated = await withProgress('Generating high-quality local image', 150000, () =>
        window.electronAPI.presentatorAgentGenerateImage(args)
      );
      if (generated?.ok) {
        addAsset({
          kind: 'image',
          name: generated.fileName,
          path: generated.imagePath,
          preview: `data:${generated.mimeType};base64,${generated.imageBase64}`,
        });
        return {
          tool,
          ok: true,
          imagePath: generated.imagePath,
          fileName: generated.fileName,
          seed: generated.seed,
          elapsedSeconds: generated.elapsedSeconds,
        };
      }
      return { tool, ok: false, error: generated?.error || 'Image generation failed.' };
    }
    if (tool === 'create_animated_video') {
      const video = await withProgress('Creating eight-second video', 8000, () =>
        window.electronAPI.presentatorAgentCreateVideo({ ...args, duration: 8 })
      );
      if (video?.ok) addAsset({ kind: 'video', name: video.fileName, path: video.videoPath });
      return { tool, ...video, duration: 8 };
    }
    if (tool === 'finish') return { tool, ok: true };
    return { tool, ok: false, error: `Tool ${tool} is not available in Agent Studio.` };
  };

  const buildReferencePayload = () => {
    const references = activeChat.references.map(reference => ({
      name: reference.name,
      kind: reference.kind,
      filePath: reference.filePath,
      text: reference.kind === 'document' ? String(reference.text || '').slice(0, 50000) : undefined,
      summary: reference.summary,
      durationSeconds: reference.durationSeconds,
      metadata: reference.metadata,
    }));
    const images = [];
    for (const reference of activeChat.references) {
      if (reference.kind === 'image' && reference.imageBase64) images.push(reference.imageBase64);
      if (reference.kind === 'video' && Array.isArray(reference.frames)) images.push(...reference.frames);
      if (images.length >= 6) break;
    }
    return { references, referenceImages: images.slice(0, 6) };
  };

  const runAgent = async (request, conversationOverride) => {
    cancelledRef.current = false;
    setBusy(true);
    let toolResults = [];
    let latestGeneratedImagePath = '';
    let videoCreated = false;
    const wantsVideo = /\b(video|animate|animation|mp4|8[- ]?second)\b/i.test(request);
    const uploadedImagePath = activeChat.references.find(reference => reference.kind === 'image')?.filePath || '';
    const conversation = conversationOverride || [
      ...activeChat.messages,
      { role: 'user', text: request },
    ].slice(-14);
    const referencePayload = buildReferencePayload();

    try {
      for (let round = 0; round < MAX_ROUNDS && !cancelledRef.current; round += 1) {
        const response = await withProgress(
          round === 0 ? 'Local brain is analyzing' : `Verifying step ${round + 1}`,
          22000,
          () => window.electronAPI.presentatorAgentThink({
            userRequest: request,
            currentState: {
              module: 'Agent Studio',
              referenceCount: activeChat.references.length,
              generatedAssets: activeChat.assets.map(asset => ({
                kind: asset.kind,
                name: asset.name,
                path: asset.path,
              })),
            },
            conversation,
            toolResults,
            ...referencePayload,
          })
        );
        if (!response?.ok) throw new Error(response?.error || 'The local brain failed.');
        const result = response.result || {};
        if (result.message) addMessage('assistant', result.message, { model: response.model });
        const actions = Array.isArray(result.actions) ? result.actions : [];
        if (!actions.length) break;

        toolResults = [];
        for (const action of actions.slice(0, 5)) {
          if (cancelledRef.current) break;
          const normalizedAction = action?.tool === 'create_animated_video'
            ? {
                ...action,
                args: {
                  ...(action.args || {}),
                  imagePath: action.args?.imagePath || latestGeneratedImagePath,
                },
              }
            : action;
          if (normalizedAction?.tool === 'create_animated_video' && videoCreated) {
            toolResults.push({
              action: normalizedAction,
              outcome: { tool: 'create_animated_video', ok: true, skipped: true, reason: 'The requested video is already complete.' },
            });
            continue;
          }
          const outcome = await executeAction(normalizedAction);
          if (normalizedAction?.tool === 'generate_image' && outcome?.ok) {
            latestGeneratedImagePath = outcome.imagePath;
          }
          if (normalizedAction?.tool === 'create_animated_video' && outcome?.ok) {
            videoCreated = true;
          }
          toolResults.push({ action: normalizedAction, outcome });
        }
        const videoSourcePath = latestGeneratedImagePath || uploadedImagePath;
        if (wantsVideo && videoSourcePath && !videoCreated && !cancelledRef.current) {
          const videoAction = {
            tool: 'create_animated_video',
            args: { imagePath: videoSourcePath, fileName: `scene-${Date.now()}.mp4` },
            reason: 'Complete the requested eight-second video from the generated frame.',
          };
          const videoOutcome = await executeAction(videoAction);
          videoCreated = Boolean(videoOutcome?.ok);
          toolResults.push({ action: videoAction, outcome: videoOutcome });
        }
        if (result.done) break;
      }
      setStatus(cancelledRef.current ? 'Stopped safely' : 'Ready');
    } catch (error) {
      addMessage('assistant', `I could not complete that run: ${error.message}`);
      setStatus('Needs attention');
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    const request = input.trim();
    if (!request || busy) return;
    setInput('');
    if (activeChat.title === 'New chat') {
      updateActiveChat(chat => ({ ...chat, title: request.slice(0, 42) }));
    }
    addMessage('user', request);
    runAgent(request);
  };

  const retryLast = () => {
    const lastUser = [...activeChat.messages].reverse().find(message => message.role === 'user');
    if (lastUser && !busy) runAgent(lastUser.text);
  };

  const newChat = () => {
    const chat = makeChat();
    setChats(previous => [chat, ...previous]);
    setActiveId(chat.id);
    setInput('');
  };

  const deleteChat = (id) => {
    setChats(previous => {
      const remaining = previous.filter(chat => chat.id !== id);
      const next = remaining.length ? remaining : [makeChat()];
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  return (
    <div
      className="h-full w-full flex bg-[#212121] text-white overflow-hidden"
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => {
        event.preventDefault();
        setDragging(false);
        importFiles(event.dataTransfer.files);
      }}
    >
      {dragging && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="rounded-3xl border-2 border-dashed border-emerald-300 bg-[#171717] px-14 py-12 text-center">
            <Icon name="upload" size={44} className="mx-auto text-emerald-300" />
            <div className="text-lg font-semibold mt-3">Drop references here</div>
            <div className="text-sm text-white/45 mt-1">Documents, images, and videos</div>
          </div>
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-[240px]' : 'w-0'} shrink-0 bg-[#171717] border-r border-white/5 transition-all overflow-hidden`}>
        <div className="w-[240px] h-full flex flex-col p-3">
          <button onClick={newChat} className="h-11 rounded-xl border border-white/10 hover:bg-white/5 flex items-center gap-3 px-3 text-sm">
            <Icon name="plus" />
            New chat
          </button>
          <div className="mt-4 px-2 text-[11px] font-semibold text-white/35">Recent</div>
          <div className="flex-1 overflow-y-auto mt-2 space-y-1 dark-scrollbar">
            {chats.map(chat => (
              <div key={chat.id} className={`group flex items-center rounded-lg ${chat.id === activeId ? 'bg-[#2f2f2f]' : 'hover:bg-white/5'}`}>
                <button onClick={() => setActiveId(chat.id)} className="flex-1 min-w-0 px-3 py-2.5 text-left text-[13px] truncate">
                  {chat.title}
                </button>
                <button onClick={() => deleteChat(chat.id)} className="opacity-0 group-hover:opacity-100 px-2 text-white/35 hover:text-red-300">
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-3 px-2">
            <div className="text-xs font-semibold">Pattan Local Brain</div>
            <div className="text-[10px] text-emerald-300/70 mt-1">Offline • No quota • D drive</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 h-full flex flex-col relative">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#212121]/95 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(value => !value)} className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center">
              <Icon name="menu" />
            </button>
            <div>
              <div className="text-sm font-semibold">Super Agent</div>
              <div className="text-[10px] text-white/40">{status}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={retryLast} disabled={busy || !activeChat.messages.length} className="h-9 px-3 rounded-lg hover:bg-white/5 disabled:opacity-25 text-xs flex items-center gap-2">
              <Icon name="retry" size={17} />
              Retry
            </button>
            <button onClick={newChat} className="h-9 px-3 rounded-lg bg-white text-black text-xs font-semibold">New chat</button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto dark-scrollbar">
          {!activeChat.messages.length && !activeChat.assets.length ? (
            <div className="min-h-full flex flex-col items-center justify-center px-6 pb-24">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl">
                <Icon name="spark" size={26} />
              </div>
              <h1 className="text-2xl font-semibold mt-6">What are we creating?</h1>
              <p className="text-sm text-white/45 mt-2 text-center max-w-md">
                Upload a document, image, or video as reference. I can analyze it, generate local images, create eight-second video scenes, diagnose Presentator, and validate repairs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-2xl w-full">
                {[
                  ['image', 'Generate an educational image'],
                  ['video', 'Create an 8-second video scene'],
                  ['file', 'Analyze an uploaded document'],
                  ['wrench', 'Find and repair an internal problem'],
                ].map(([icon, text]) => (
                  <button key={text} onClick={() => setInput(text)} className="min-h-[72px] rounded-2xl border border-white/10 bg-[#2f2f2f] hover:bg-[#383838] p-4 text-left text-sm flex items-start gap-3 transition-colors">
                    <Icon name={icon} className="text-white/55 shrink-0" />
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-5 py-8 space-y-7">
              {activeChat.messages.map(message => (
                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-white text-black flex items-center justify-center">
                      <Icon name="spark" size={17} />
                    </div>
                  )}
                  <div className={`group max-w-[82%] ${message.role === 'user' ? 'bg-[#2f2f2f] rounded-3xl px-5 py-3' : 'pt-1'}`}>
                    <div className="text-[14px] leading-7 whitespace-pre-wrap">{message.text}</div>
                    {message.role === 'assistant' && (
                      <div className="mt-2 opacity-0 group-hover:opacity-100 flex items-center gap-2">
                        <button onClick={() => navigator.clipboard.writeText(message.text)} className="text-white/35 hover:text-white" title="Copy">
                          <Icon name="copy" size={15} />
                        </button>
                        {message.model && <span className="text-[9px] text-white/25">{message.model}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activeChat.assets.map(asset => (
                <div key={asset.id} className="ml-12 rounded-2xl border border-white/10 bg-[#2b2b2b] overflow-hidden max-w-xl">
                  {asset.kind === 'image' ? (
                    <img src={asset.preview} alt={asset.name} className="w-full max-h-[430px] object-contain bg-black" />
                  ) : (
                    <video src={`file:///${asset.path.replace(/\\/g, '/')}`} controls className="w-full bg-black" />
                  )}
                  <div className="p-3 flex items-center justify-between">
                    <div className="text-xs truncate">{asset.name}</div>
                    <button onClick={() => window.electronAPI.showItemInFolder(asset.path)} className="text-[10px] text-emerald-300 hover:underline">Show in folder</button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
          <div className="max-w-3xl mx-auto">
            {progress > 0 && (
              <div className="mb-3 rounded-2xl border border-white/10 bg-[#2b2b2b] px-4 py-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon name="spark" size={16} className="text-white" />
                    {busy && <span className="absolute inset-0 rounded-full border border-transparent border-t-emerald-400 animate-spin" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-medium text-white/85">{status}</span>
                      <span className="font-mono text-emerald-300">{progress}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeChat.references.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 dark-scrollbar">
                {activeChat.references.map(reference => (
                  <div key={reference.id} className="shrink-0 max-w-[210px] h-11 rounded-xl border border-white/10 bg-[#2f2f2f] px-3 flex items-center gap-2">
                    <Icon name={kindIcon[reference.kind]} size={16} className="text-white/70" />
                    <span className="text-[11px] truncate flex-1">{reference.name}</span>
                    <button onClick={() => removeReference(reference.id)} className="text-white/35 hover:text-white">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-[26px] bg-[#2f2f2f] border border-white/10 shadow-2xl focus-within:border-white/20">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="Message Super Agent"
                className="w-full min-h-[58px] max-h-44 resize-none bg-transparent px-5 pt-4 text-sm outline-none placeholder:text-white/30"
                disabled={busy}
              />
              <div className="h-12 flex items-center justify-between px-3 pb-2">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md,.csv,.json,.log,.srt,.png,.jpg,.jpeg,.webp,.bmp,.mp4,.mov,.mkv,.webm,.avi"
                    className="hidden"
                    onChange={event => {
                      importFiles(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading || busy} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center disabled:opacity-30" title="Add references">
                    <Icon name="plus" size={19} />
                  </button>
                  <span className="text-[10px] text-white/30">PDF • DOCX • images • videos</span>
                </div>
                {busy ? (
                  <button onClick={() => { cancelledRef.current = true; setStatus('Stopping after current step'); }} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center" title="Stop">
                    <Icon name="stop" size={17} />
                  </button>
                ) : (
                  <button onClick={submit} disabled={!input.trim()} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-20" title="Send">
                    <Icon name="send" size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="text-center text-[10px] text-white/25 mt-2">
              Local AI can make mistakes. Review generated media and repairs.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
