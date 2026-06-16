import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    text = f.read()

new_vars = r'''let transparentAnjaliCanvas = null;
let avatarVideoElement = null;

const avatarConfig = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    scale: 0.65, // Default scale lower for tall cropped portrait video
    hovered: false,
    dragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    initialized: false
};'''
text = re.sub(r'let transparentAnjaliCanvas = null;.*?initialized: false\n\};', new_vars, text, flags=re.DOTALL)

video_init_logic = r'''// We are switching from a static Anjali image to a live transparent video
avatarVideoElement = document.createElement('video');
// Use the exact path requested by the user!
avatarVideoElement.src = 'file:///C:/Users/patan/Desktop/NEVER%20DELETE/teacher%20video.mp4'; 
avatarVideoElement.loop = true;
avatarVideoElement.muted = true;
avatarVideoElement.crossOrigin = "anonymous";
avatarVideoElement.autoplay = true;

// Because it's an mp4, we MUST run flood-fill background removal on every single video frame before drawing it
avatarVideoElement.addEventListener('play', function() {
    function step() {
        if (!avatarVideoElement.paused && !avatarVideoElement.ended) {
            const scratchCvs = document.createElement('canvas');
            // Hardcode fallback resolution if video is not fully loaded immediately
            scratchCvs.width = avatarVideoElement.videoWidth || 720;
            scratchCvs.height = avatarVideoElement.videoHeight || 1280;
            
            if (scratchCvs.width === 0) {
               setTimeout(step, 50); // wait for metadata
               return;
            }
            
            const sCtx = scratchCvs.getContext('2d', { willReadFrequently: true });
            sCtx.drawImage(avatarVideoElement, 0, 0, scratchCvs.width, scratchCvs.height);
            
            const frameData = sCtx.getImageData(0, 0, scratchCvs.width, scratchCvs.height);
            const d = frameData.data;
            const w = scratchCvs.width;
            const h = scratchCvs.height;
            
            const stack = new Int32Array(w * h * 2);
            let stackPtr = 0;
            const visited = new Uint8Array(w * h);
            
            function push(x, y) {
                if (stackPtr < stack.length - 2) {
                    stack[stackPtr++] = x;
                    stack[stackPtr++] = y;
                }
            }
            
            push(0, 0); visited[0] = 1;
            push(w-1, 0); visited[w-1] = 1;
            push(0, h-1); visited[(h-1)*w] = 1;
            push(w-1, h-1); visited[(h-1)*w + w-1] = 1;
            
            function isBg(x, y) {
                if (x < 0 || x >= w || y < 0 || y >= h) return false;
                const idx = (y * w + x) * 4;
                const r = d[idx], g = d[idx+1], b = d[idx+2];
                // Video compression has noise, must use lower threshold than flat image!
                return ((r + g + b) / 3) > 230; 
            }
            
            while(stackPtr > 0) {
                const y = stack[--stackPtr];
                const x = stack[--stackPtr];
                
                if (isBg(x, y)) {
                    const vIdx = y * w + x;
                    const idx = vIdx * 4;
                    d[idx + 3] = 0; // Transparent
                    
                    if (x+1 < w && !visited[y*w + x+1]) { visited[y*w + x+1] = 1; push(x+1, y); }
                    if (x-1 >= 0 && !visited[y*w + x-1]) { visited[y*w + x-1] = 1; push(x-1, y); }
                    if (y+1 < h && !visited[(y+1)*w + x]) { visited[(y+1)*w + x] = 1; push(x, y+1); }
                    if (y-1 >= 0 && !visited[(y-1)*w + x]) { visited[(y-1)*w + x] = 1; push(x, y-1); }
                }
            }
            sCtx.putImageData(frameData, 0, 0);
            
            // Swap the buffer! The avatar drawer simply looks at this pointer.
            transparentAnjaliCanvas = scratchCvs;
            
            // Force the presentation stage to redraw!
            if (typeof drawScene === 'function') drawScene();
            
            setTimeout(step, 1000/30); // ~30fps 
        }
    }
    step();
});

// Autoplay policy bypass helper
document.addEventListener('click', () => {
   if (avatarVideoElement && avatarVideoElement.paused) avatarVideoElement.play(); 
}, {once: true});
'''

# Rip out the entire image loader logic and replace it with the video handler
text = re.sub(r'const anjaliTeacherImg = new Image\(\);.*?transparentAnjaliCanvas = oc;\n\};', video_init_logic, text, flags=re.DOTALL)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully swapped image for live video parser!')
