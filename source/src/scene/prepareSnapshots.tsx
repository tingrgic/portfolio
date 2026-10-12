import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Intro, Work, Connect} from '../components/Spreads';
import type {NotebookScene} from './NotebookScene';

/** Finite idle work, never a second visible UI or an animation renderer. */
export function prepareSnapshots(scene: NotebookScene, mobile: boolean, currentKey: string) {
  // A separate same-origin document keeps staging selectors/IDs out of the
  // live page and prevents background preparation from affecting focus.
  const frame = document.createElement('iframe');
  frame.className = 'snapshot-preparation';
  frame.setAttribute('aria-hidden','true'); frame.tabIndex=-1;
  Object.assign(frame.style,{position:'fixed',left:'-20000px',top:'0',width:`${innerWidth}px`,height:`${innerHeight}px`,opacity:'0',pointerEvents:'none',border:'0'});
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const base=doc.createElement('base');base.href=location.href;doc.head.append(base);
  const stylesReady = Promise.all([...document.querySelectorAll('style,link[rel="stylesheet"]')].map(node => {
    const copy = node.cloneNode(true) as HTMLElement;
    const ready = copy.tagName === 'LINK' ? new Promise<void>((resolve)=>{
      copy.addEventListener('load',()=>resolve(),{once:true});
      copy.addEventListener('error',()=>resolve(),{once:true});
    }) : Promise.resolve();
    doc.head.append(copy); return ready;
  }));
  const host=doc.createElement('div');host.className='desk';host.dataset.renderer='webgl';host.inert=true;doc.body.append(host);
  const root = createRoot(host);
  const allPages = mobile ? ['intro/0','work/0','work/1','connect/0'] : ['intro/0','work/0','connect/0'];
  const current = Math.max(0, allPages.indexOf(currentKey));
  // Prepare the physically adjacent destination first, then finish the finite
  // cache pass. The current page comes last and is usually already cached.
  const pages = [...allPages.slice(current + 1), ...allPages.slice(0, current + 1)];
  let stopped = false, timer = 0;
  const next = async () => {
    await stylesReady;
    if (stopped) return;
    const key = pages.shift();
    if (stopped || !key) {cleanup(); return;}
    const [section,index] = key.split('/');
    flushSync(()=>root.render(<div className={`notebook section-${section}`}><div className="book-content" data-page-key={key}>
      {section === 'intro' ? <Intro mobile={mobile} navigate={()=>{}}/> : section === 'work' ? <Work mobile={mobile} projectIndex={Number(index)}/> : <Connect/>}
    </div></div>));
    // Never duplicate focus targets or landmarks in the live document.
    host.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    host.querySelectorAll('[aria-labelledby]').forEach(node=>node.removeAttribute('aria-labelledby'));
    try {await scene.warmPage(host.querySelector<HTMLElement>('.book-content')!);} catch { /* navigation/disposal may cancel idle preparation */ }
    if (!stopped) timer=window.setTimeout(()=>{void next();},80);
  };
  function cleanup() { if (stopped) return; stopped=true;clearTimeout(timer);frame.remove();queueMicrotask(()=>root.unmount()); }
  timer=window.setTimeout(()=>{void next();},0);
  return cleanup;
}
