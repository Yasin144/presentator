import re

def convert():
    with open('d:/presentator/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract from <section class="panel panel-input" to </section> before panel-stage
    match = re.search(r'(<section class="panel panel-input".*?</section>)\s*<section class="panel panel-stage', content, re.DOTALL)
    if match:
        html = match.group(1)
        
        # Convert HTML to JSX
        html = html.replace('class=', 'className=')
        html = html.replace('for=', 'htmlFor=')
        
        # Close self-closing tags
        html = re.sub(r'<(input[^>]*)(?<!/)>', r'<\1 />', html)
        html = re.sub(r'<(img[^>]*)(?<!/)>', r'<\1 />', html)
        html = re.sub(r'<(hr[^>]*)(?<!/)>', r'<\1 />', html)
        
        # Convert style="..." to style={{...}}
        def style_replacer(m):
            style_str = m.group(1)
            # simplistic conversion
            rules = style_str.split(';')
            out = []
            for r in rules:
                if ':' in r:
                    k, v = r.split(':', 1)
                    k = k.strip()
                    # camelCase key
                    parts = k.split('-')
                    k = parts[0] + ''.join(p.capitalize() for p in parts[1:])
                    out.append(f'"{k}": "{v.strip()}"')
            return 'style={{' + ', '.join(out) + '}}'
            
        html = re.sub(r'style="([^"]+)"', style_replacer, html)
        
        # Remove inline event handlers (onchange="...")
        html = re.sub(r'on[a-z]+="[^"]+"', '', html)
        
        # Write to InputPanel.jsx
        jsx = f'''import React from "react";
import {{ useStore }} from "../store/useStore";

function InputPanel() {{
  const actionLocks = useStore((state) => state.actionLocks);
  return (
    {html}
  );
}}

export default InputPanel;
'''
        with open('d:/presentator/presentator/src/components/InputPanel.jsx', 'w', encoding='utf-8') as f:
            f.write(jsx)
        print('Converted InputPanel to JSX successfully')

        # Now extract stage
        match_stage = re.search(r'(<section class="panel panel-stage.*?</section>)\s*</main>', content, re.DOTALL)
        if match_stage:
            stage_html = match_stage.group(1)
            stage_html = stage_html.replace('class=', 'className=')
            stage_html = stage_html.replace('for=', 'htmlFor=')
            stage_html = re.sub(r'<(input[^>]*)(?<!/)>', r'<\1 />', stage_html)
            stage_html = re.sub(r'<(img[^>]*)(?<!/)>', r'<\1 />', stage_html)
            stage_html = re.sub(r'<(hr[^>]*)(?<!/)>', r'<\1 />', stage_html)
            stage_html = re.sub(r'style="([^"]+)"', style_replacer, stage_html)
            stage_html = re.sub(r'on[a-z]+="[^"]+"', '', stage_html)
            
            stage_jsx = f'''import React, {{ useRef, useEffect }} from "react";
import {{ useStore }} from "../store/useStore";

function StagePanel() {{
  const canvasRef = useRef(null);
  const actionLocks = useStore((state) => state.actionLocks);

  useEffect(() => {{
    if (canvasRef.current) {{
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#173e58';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }}
  }}, []);

  return (
    {stage_html}
  );
}}

export default StagePanel;
'''
            with open('d:/presentator/presentator/src/components/StagePanel.jsx', 'w', encoding='utf-8') as f:
                f.write(stage_jsx)
            print('Converted StagePanel to JSX successfully')
    else:
        print('Could not extract HTML')

convert()
