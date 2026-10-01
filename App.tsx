import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Intro, Work, Connect } from "./components/Spreads";
import { projects, sections } from "./config";
import type { Section } from "./config";
import type { NotebookScene } from "./scene/NotebookScene";

function readSection(): Section {
  const id = location.hash.slice(1).split("/")[0];
  return sections.some((section) => section.id === id)
    ? (id as Section)
    : "intro";
}
export default function App() {
  const [section, setSection] = useState<Section>(readSection);
  const [project, setProject] = useState(() =>
    location.hash.endsWith("/normal") ? 1 : 0,
  );
  const [mobile, setMobile] = useState(() => innerWidth < 700);
  const [busy, setBusy] = useState(false);
  const [arriving, setArriving] = useState(true);
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
            readSection() === "intro" &&
            !openingSkipped.current,
        );
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
      (next === section && (!mobile || nextProject === project))
    )
      return;
    const token = ++navigation.current;
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
      if (engine.current && !reduced)
        await engine.current.turn(index < current, commit);
      else {
        engine.current?.cancel();
        commit();
        engine.current?.layout();
      }
    } catch {
      commit();
      fallback();
    }
    if (token !== navigation.current) return;
    lock.current = false;
    setBusy(false);
    focusPage();
  }
  useEffect(() => {
    const history = () => {
      navigation.current++;
      engine.current?.cancel();
      lock.current = false;
      setBusy(false);
      setArriving(false);
      setSection(readSection());
      setProject(location.hash.endsWith("/normal") ? 1 : 0);
      focusPage();
    };
    window.addEventListener("popstate", history);
    return () => window.removeEventListener("popstate", history);
  }, []);
  function adjacent(offset: number) {
    const next = sequence[current + offset];
    if (next) void navigate(next.id, true, next.project);
  }
  return (
    <div
      className={`desk ${reduced ? "reduce-motion" : ""}`}
      data-renderer={renderer}
      data-arriving={arriving}
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
        onClick={() => {
          openingSkipped.current = true;
          engine.current?.finish();
          setArriving(false);
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
            src="/logo.svg"
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
            <img
              src="/images/notebook-open.webp"
              width="1536"
              height="1024"
              alt=""
            />
          </div>
          <div
            ref={content}
            data-page-key={`${section}/${project}`}
            className="book-content"
            inert={busy || arriving}
            tabIndex={mobile ? 0 : undefined}
            aria-label={
              section === "work"
                ? "Selected work notebook page"
                : "Notebook pages; scroll for more content"
            }
          >
            {section === "intro" ? (
              <Intro navigate={navigate} />
            ) : section === "work" ? (
              <Work mobile={mobile} projectIndex={project} />
            ) : (
              <Connect navigate={navigate} />
            )}
          </div>
          <nav
            ref={tabs}
            className="section-tabs"
            aria-label="Notebook sections"
          >
            {sections.map((item) => (
              <button
                key={item.id}
                aria-label={`${item.number} ${item.label}`}
                className={`section-tab ${section === item.id ? "active" : ""}`}
                aria-current={section === item.id ? "page" : undefined}
                disabled={busy || arriving}
                onClick={() => void navigate(item.id)}
              >
                <span>{item.number}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </main>
      <footer className="desk-footer">
        <div className="footer-note">Personal notes & selected work</div>
        <div className="page-navigation">
          <button
            aria-label="Previous section"
            disabled={current === 0 || busy || arriving}
            onClick={() => adjacent(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m10 3-5 5 5 5" />
            </svg>
          </button>
          <span>
            {String(current + 1).padStart(2, "0")}
            <span className="page-divider">/</span>0{sequence.length}
          </span>
          <button
            aria-label="Next section"
            disabled={current === sequence.length - 1 || busy || arriving}
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
            : `${section}, page ${current + 1} of ${sequence.length}`}
      </p>
    </div>
  );
}
