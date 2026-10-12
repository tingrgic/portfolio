import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Intro, Work, Connect } from "./components/Spreads";
import { projects, sections } from "./config";
import type { Section } from "./config";
import type { NotebookScene } from "./scene/NotebookScene";
import { asset } from "./asset";

function readSection(): Section {
  if (location.hash === "#cover/back") return "connect";
  const id = location.hash.slice(1).split("/")[0];
  return sections.some((section) => section.id === id)
    ? (id as Section)
    : "intro";
}
type Cover = "front" | "back" | null;
function readCover(): Cover {
  return location.hash === "#cover/front" ? "front" : location.hash === "#cover/back" ? "back" : null;
}

function TabIcon({ section }: { section: Section }) {
  const common = {
    className: `tab-icon tab-icon-${section}`,
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    "aria-hidden": true,
    focusable: "false",
  } as const;
  if (section === "intro") return (
    <svg {...common}>
      <circle cx="12" cy="7" r="3.1" />
      <path d="M5.8 19c.7-4 2.8-6 6.2-6s5.5 2 6.2 6" />
    </svg>
  );
  if (section === "work") return (
    <svg {...common}>
      <path d="M8.2 7V5.8c0-1 .8-1.8 1.8-1.8h4c1 0 1.8.8 1.8 1.8V7" />
      <rect x="4" y="7" width="16" height="12" rx="1.8" />
      <path d="M4 11.5c4.9 2 11.1 2 16 0M10 13h4" />
    </svg>
  );
  return (
    <svg {...common}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>(readSection);
  const [project, setProject] = useState(() =>
    location.hash.endsWith("/normal") ? 1 : 0,
  );
  const [mobile, setMobile] = useState(() => innerWidth < 700);
  const [busy, setBusy] = useState(false);
  const [arriving, setArriving] = useState(true);
  const [cover, setCover] = useState<Cover>(readCover);
  const coverRef = useRef<Cover>(cover);
  const [renderer, setRenderer] = useState<"loading" | "webgl" | "fallback">(
    "loading",
  );
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [manualReduced, setManualReduced] = useState(false);
  const reduced = systemReduced || manualReduced;
  const world = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null),
    tabs = useRef<HTMLElement>(null);
  const engine = useRef<NotebookScene | null>(null);
  const openingSkipped = useRef(false);
  const lock = useRef(false),
    navigation = useRef(0),
    suppressClick = useRef(0);
  const gesture = useRef<{ x: number; y: number; time: number } | null>(null);
  const sequence = mobile
    ? ([
        { id: "intro", project: 0 },
        { id: "work", project: 0 },
        { id: "work", project: 1 },
        { id: "connect", project: 0 },
      ] as { id: Section; project: number }[])
    : sections.map((s) => ({ id: s.id, project: 0 }));
  const current = sequence.findIndex(
    (item) => item.id === section && (!mobile || item.project === project),
  );

  function fallback() {
    engine.current?.dispose();
    engine.current = null;
    content.current?.removeAttribute("style");
    content.current
      ?.querySelectorAll(".paper-page")
      .forEach((p) => p.removeAttribute("style"));
    tabs.current?.removeAttribute("style");
    tabs.current?.querySelectorAll("button").forEach(button => button.removeAttribute("style"));
    if (world.current) delete world.current.dataset.physicalTabs;
    setRenderer("fallback");
    setArriving(false);
    setBusy(false);
    lock.current = false;
  }
  useEffect(() => {
    let cancelled = false;
    projects.forEach((project) => {
      const image = new Image();
      image.src = project.image;
      void image.decode().catch(() => {});
    });
    void import("./scene/NotebookScene").then(async ({ NotebookScene }) => {
      if (cancelled) return;
      try {
        const scene = new NotebookScene({
          host: world.current!,
          content: content.current!,
          tabs: tabs.current!,
          onFailure: fallback,
        });
        engine.current = scene;
        setRenderer("webgl");
        await scene.initialize(
          !matchMedia("(prefers-reduced-motion: reduce)").matches &&
            !readCover() &&
            readSection() === "intro" &&
            !openingSkipped.current,
        );
        if (!cancelled && readCover()) await scene.setClosed(readCover(), false);
        if (!cancelled) setArriving(false);
      } catch {
        if (!cancelled) fallback();
      }
    });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setSystemReduced(media.matches);
    const resize = () => {
      navigation.current++;
      engine.current?.cancel();
      engine.current?.resize();
      lock.current = false;
      setBusy(false);
      setArriving(false);
      setSection(readSection());
      setProject(location.hash.endsWith("/normal") ? 1 : 0);
      setMobile(innerWidth < 700);
    };
    media.addEventListener("change", motion);
    window.addEventListener("resize", resize);
    return () => {
      media.removeEventListener("change", motion);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useLayoutEffect(() => {
    engine.current?.layout();
  }, [section, project, mobile, renderer]);
  useEffect(() => {
    if (renderer !== 'webgl' || arriving || busy || cover || reduced) return;
    let cancelled = false;
    let cleanup: (()=>void) | undefined;
    const timer = window.setTimeout(async()=>{
      const {prepareSnapshots} = await import('./scene/prepareSnapshots');
      if (!cancelled && engine.current) cleanup=prepareSnapshots(engine.current,mobile,`${section}/${project}`);
    },100);
    return ()=>{cancelled=true;clearTimeout(timer);cleanup?.();};
  }, [renderer, arriving, busy, cover, reduced, mobile, section, project]);
  useEffect(() => {
    if (reduced) {
      navigation.current++;
      engine.current?.cancel();
      lock.current = false;
      setBusy(false);
      setArriving(false);
      setSection(readSection());
      setProject(location.hash.endsWith("/normal") ? 1 : 0);
    }
  }, [reduced]);
  function focusPage() {
    requestAnimationFrame(() => {
      content.current
        ?.querySelectorAll<HTMLElement>(".paper-page")
        .forEach((p) => {
          p.scrollTop = 0;
        });
      if (content.current) content.current.scrollTop = 0;
      document
        .getElementById("section-heading")
        ?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  async function navigate(next: Section, history = true, nextProject = 0) {
    if (
      lock.current ||
      (!coverRef.current && next === section && (!mobile || nextProject === project))
    )
      return;
    const token = ++navigation.current;
    const wasClosed = coverRef.current;
    coverRef.current = null;
    setCover(null);
    lock.current = true;
    setBusy(true);
    engine.current?.finish();
    setArriving(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    const index = sequence.findIndex(
      (s) => s.id === next && (!mobile || s.project === nextProject),
    );
    if (history)
      window.history.pushState(
        null,
        "",
        `#${next}${next === "work" && nextProject === 1 ? "/normal" : ""}`,
      );
    const commit = () =>
      flushSync(() => {
        setSection(next);
        setProject(nextProject);
      });
    try {
      if (engine.current && wasClosed) {
        commit();
        engine.current.layout();
        await engine.current.setClosed(null, !reduced);
      } else if (engine.current && !reduced)
        await engine.current.turn(index < current, commit);
      else {
        engine.current?.cancel();
        commit();
        engine.current?.layout();
      }
    } catch {
      // A detached image/capture may reject after history or resize cancels the turn.
      if (token !== navigation.current) return;
      commit();
      fallback();
    }
    if (token !== navigation.current) return;
    lock.current = false;
    // Remove inert synchronously before scheduling focus after the texture handoff.
    flushSync(() => setBusy(false));
    focusPage();
  }
  useEffect(() => {
    const history = () => {
      const token = ++navigation.current;
      engine.current?.cancel();
      lock.current = false;
      setBusy(false);
      setArriving(false);
      setSection(readSection());
      setProject(location.hash.endsWith("/normal") ? 1 : 0);
      const destinationCover = readCover();
      coverRef.current = destinationCover;
      setCover(destinationCover);
      const focusDestination = () => {
        if (token !== navigation.current) return;
        if (destinationCover)
          requestAnimationFrame(() =>
            document.querySelector<HTMLButtonElement>('.open-notebook')
              ?.focus({preventScroll: true}),
          );
        else focusPage();
      };
      const settled = engine.current?.setClosed(destinationCover, false);
      if (settled) void settled.then(focusDestination).catch(() => {
        if (token === navigation.current) fallback();
      });
      else focusDestination();
    };
    window.addEventListener("popstate", history);
    return () => window.removeEventListener("popstate", history);
  }, []);
  async function closeNotebook(side: Exclude<Cover, null>) {
    if (lock.current || arriving) return;
    const token = ++navigation.current;
    lock.current = true;
    coverRef.current = side;
    setCover(side);
    setBusy(true);
    window.history.pushState(null, "", `#cover/${side}`);
    try { await engine.current?.setClosed(side, !reduced); }
    catch { if (token === navigation.current) fallback(); }
    if (token !== navigation.current) return;
    lock.current = false;
    flushSync(() => setBusy(false));
    document.querySelector<HTMLButtonElement>('.open-notebook')?.focus({preventScroll:true});
  }
  function adjacent(offset: number) {
    if (cover) {
      if ((cover === 'front' && offset > 0) || (cover === 'back' && offset < 0))
        void navigate(cover === 'front' ? 'intro' : 'connect');
      return;
    }
    const next = sequence[current + offset];
    if (next) void navigate(next.id, true, next.project);
    else void closeNotebook(offset < 0 ? 'front' : 'back');
  }
  return (
    <div
      className={`desk ${reduced ? "reduce-motion" : ""}`}
      data-renderer={renderer}
      data-arriving={arriving}
      data-cover={cover || 'open'}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || busy || arriving)
          return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          adjacent(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          adjacent(-1);
        }
      }}
    >
      <a
        className="skip-link"
        href="#section-heading"
        onClick={(event) => {
          event.preventDefault();
          if (cover) { void navigate(cover === 'front' ? 'intro' : 'connect'); return; }
          openingSkipped.current = true;
          engine.current?.finish();
          setArriving(false);
          focusPage();
        }}
      >
        Skip to notebook
      </a>
      <header className="desk-header">
        <a
          className="wordmark"
          href="#intro"
          onClick={(event) => {
            event.preventDefault();
            void navigate("intro");
          }}
          aria-label="Tin Grgić, introduction"
        >
          <img
            className="brand-logo"
            src={asset("logo.svg")}
            width="32"
            height="40"
            alt="t"
          />
        </a>
      </header>
      {arriving && (
        <button
          className="skip-opening"
          onClick={() => {
            openingSkipped.current = true;
            engine.current?.finish();
            setArriving(false);
          }}
        >
          Skip opening <span aria-hidden="true">→</span>
        </button>
      )}
      <main className="scene" id="notebook">
        <div
          ref={world}
          className={`notebook section-${section}`}
          aria-busy={busy}
          onPointerDown={(event) => {
            if (
              !event.isPrimary ||
              busy ||
              arriving ||
              (event.target as HTMLElement).closest("button")
            )
              return;
            gesture.current = {
              x: event.clientX,
              y: event.clientY,
              time: performance.now(),
            };
          }}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onPointerUp={(event) => {
            const start = gesture.current;
            gesture.current = null;
            if (!start) return;
            const dx = event.clientX - start.x,
              dy = event.clientY - start.y;
            if (
              Math.abs(dx) < 55 ||
              Math.abs(dx) < Math.abs(dy) * 1.4 ||
              performance.now() - start.time > 900
            )
              return;
            suppressClick.current = performance.now() + 500;
            adjacent(dx < 0 ? 1 : -1);
          }}
          onClickCapture={(event) => {
            if (performance.now() < suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          <div className="book-material" aria-hidden="true">
            {renderer === 'fallback' && <img
              src={asset("images/notebook-clay-fallback.webp")}
              width="1536"
              height="1024"
              alt=""
            />}
          </div>
          <div
            ref={content}
            data-page-key={`${section}/${project}`}
            className="book-content"
            inert={busy || arriving || !!cover}
            aria-hidden={cover ? true : undefined}
            aria-label={
              section === "work"
                ? "Selected work notebook page"
                : "Notebook pages"
            }
          >
            {section === "intro" ? (
              <Intro navigate={navigate} mobile={mobile} />
            ) : section === "work" ? (
              <Work mobile={mobile} projectIndex={project} />
            ) : (
              <Connect />
            )}
          </div>
          <nav
            ref={tabs}
            className="section-tabs"
            aria-label="Notebook sections"
            aria-hidden={cover ? true : undefined}
            inert={!!cover}
          >
            {sections.map((item) => (
              <button
                key={item.id}
                aria-label={`${item.number} ${item.label}`}
                className={`section-tab ${section === item.id ? "active" : ""}`}
                aria-current={section === item.id ? "page" : undefined}
                disabled={busy || arriving || !!cover}
                onClick={() => void navigate(item.id)}
              >
                <TabIcon section={item.id} />
              </button>
            ))}
          </nav>
          {cover && <button className="cover-hit-area" aria-label={`Open ${cover} cover`} disabled={busy || arriving} onClick={() => void navigate(cover === 'front' ? 'intro' : 'connect')} />}
        </div>
      </main>
      <footer className="desk-footer">
        <div className="footer-note">Personal notes & selected work</div>
        <div className="page-navigation">
          <button
            aria-label={!cover && current === 0 ? "Close front cover" : "Previous section"}
            title={!cover && current === 0 ? "Close front cover" : "Previous section"}
            disabled={cover === 'front' || busy || arriving}
            onClick={() => adjacent(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m10 3-5 5 5 5" />
            </svg>
          </button>
          {cover ? <button className="open-notebook" disabled={busy || arriving} onClick={() => void navigate(cover === 'front' ? 'intro' : 'connect')}>Open notebook</button> : <span>
            {String(current + 1).padStart(2, "0")}
            <span className="page-divider">/</span>0{sequence.length}
          </span>}
          <button
            aria-label={!cover && current === sequence.length - 1 ? "Close back cover" : "Next section"}
            title={!cover && current === sequence.length - 1 ? "Close back cover" : "Next section"}
            disabled={cover === 'back' || busy || arriving}
            onClick={() => adjacent(1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 3 5 5-5 5" />
            </svg>
          </button>
        </div>
        <button
          className="motion-toggle"
          aria-pressed={reduced}
          disabled={systemReduced}
          onClick={() => setManualReduced(!manualReduced)}
        >
          {reduced ? "Motion reduced" : "Reduce motion"}
        </button>
      </footer>
      <p className="sr-only" role="status" aria-live="polite">
        {arriving
          ? "Opening notebook"
          : busy
            ? "Turning page"
            : cover ? `Notebook closed, ${cover} cover. Open the notebook to continue.`
            : `${section}, page ${current + 1} of ${sequence.length}`}
      </p>
    </div>
  );
}
