import { profile, projects } from "../config";
import type { Section } from "../config";

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="external-mark" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 13 13 3M3 3h10v10" /></svg>
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
function PageFoot({
  number,
  children,
}: {
  number: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-foot">
      <span>{children || "TIN GRGIĆ / PERSONAL NOTEBOOK"}</span>
      <span>{number}</span>
    </div>
  );
}
export function Intro({ navigate }: { navigate: (section: Section) => void }) {
  return (
    <section className="spread intro-spread" aria-labelledby="section-heading">
      <div className="paper-page title-page">
        <div className="eyebrow">
          A PERSONAL NOTEBOOK
        </div>
        <div className="name-block">
          <p className="serif pretitle">Hello, I’m</p>
          <h1 id="section-heading" tabIndex={-1}>
            Tin
            <br />
            <span>
              Grgić<span className="name-period">.</span>
            </span>
          </h1>
          <div className="pencil-underline" aria-hidden="true" />
          <p className="name-caption">Systems thinker. Curious maker.</p>
        </div>
        <div className="ownership">
          <span className="ownership-stamp">TG</span>
          <span>
            A few things about me.
            <br />A few things I’ve made.
          </span>
        </div>
        <PageFoot number="01">OPEN FOR A CLOSER LOOK</PageFoot>
      </div>
      <div className="paper-page intro-copy-page">
        <div className="eyebrow page-category">
          A LITTLE INTRODUCTION{" "}
        </div>
        <div className="intro-copy">
          <p className="serif intro-headline">
            Good systems.
            <br />
            <em>Unexpected ideas.</em>
          </p>
          <p className="identity">
            {profile.role}
            <br />
            at <strong>{profile.company}</strong>.
          </p>
          <p className="about">
            Occasional AI tinkerer.
            <br />I build systems, interfaces,
            <br className="desktop-break" /> and experiments.
          </p>
          <button className="ink-button" onClick={() => navigate("work")}>
            See my work{" "}
            <span className="button-page" aria-hidden="true">
              02
            </span>
          </button>
          <div className="intro-links">
            <ExternalLink href={profile.linkedin}>LinkedIn</ExternalLink>
            {profile.email && <a href={`mailto:${profile.email}`}>Email</a>}
          </div>
        </div>
        <div className="margin-note">
          <p>
            Some structure.
            <br />
            Room for a little curiosity.
          </p>
        </div>
        <PageFoot number="02" />
      </div>
    </section>
  );
}
export function Work({ mobile, projectIndex }: { mobile: boolean; projectIndex: number }) {
  return (
    <section className="spread work-spread" aria-labelledby="section-heading">
      {projects.map((project, index) => (!mobile || index === projectIndex) && (
        <article
          key={project.id}
          className={`paper-page project-page project-${project.id}`}
        >
          <div className="work-page-heading">
            {index === 0 || mobile ? (
              <h1 id="section-heading" tabIndex={-1}>
                Selected work<span className="red-dot">.</span>
              </h1>
            ) : (
              <span className="eyebrow">
                CONTINUED / A FEW THINGS I’VE MADE
              </span>
            )}
            <span className="project-counter">0{index + 1} / 02</span>
          </div>
          <div className="collage">
            <div className="halftone" aria-hidden="true" />
            <a className="image-print" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`}>
              <span className="tape" aria-hidden="true" />
              <span className="tape tape-second" aria-hidden="true" />
              <img
                draggable={false}
                src={project.image}
                alt={project.alt}
                width="1000"
                height="694"
              />
              <span className="print-caption">{project.domain}</span>
            </a>
            <span className="project-sticker" aria-hidden="true">
              {index === 0 ? "less, but better" : "right on target"}
            </span>
          </div>
          <div className="project-description">
            <div className="project-name">
              <span className="project-index">0{index + 1}</span>
              <h2>{project.name}</h2>
            </div>
            <p>{project.description}</p>
            <ExternalLink className="project-link" href={project.url}>
              Visit live site
            </ExternalLink>
          </div>
        </article>
      ))}
    </section>
  );
}
export function Connect({
  navigate,
}: {
  navigate: (section: Section) => void;
}) {
  return (
    <section
      className="spread connect-spread"
      aria-labelledby="section-heading"
    >
      <div className="paper-page connect-title">
        <div className="eyebrow">THE NEXT PAGE</div>
        <div className="connect-display">
          <h1 id="section-heading" tabIndex={-1}>
            Good things{" "}
            <br />
            start with{" "}
            <br />
            <em>a hello.</em>
          </h1>
        </div>
        <PageFoot number="05">LEAVE A LITTLE ROOM FOR WHAT’S NEXT</PageFoot>
      </div>
      <div className="paper-page connect-copy">
        <div className="eyebrow">LET’S CONNECT</div>
        <div className="contact-card">
          <span className="tape" aria-hidden="true" />
          <p className="serif">
            Have something
            <br />
            on your mind?
          </p>
          <p>
            A project, a question,
            <br />
            or just a shared curiosity.
          </p>
          <ExternalLink href={profile.linkedin} className="ink-button">
            Connect on LinkedIn
          </ExternalLink>
          {profile.email && (
            <a className="email-link" href={`mailto:${profile.email}`}>
              Send me an email
            </a>
          )}
          <span className="contact-signature">Tin.</span>
        </div>
        <button
          className="text-button back-intro"
          onClick={() => navigate("intro")}
        >
          Back to the beginning
        </button>
        <PageFoot number="06" />
      </div>
    </section>
  );
}
