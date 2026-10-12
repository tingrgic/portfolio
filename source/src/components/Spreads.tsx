import { profile, projects } from "../config";
import type { Section } from "../config";
import { asset } from "../asset";

const art = asset("images/clay/");
export function ExternalLink({ href, children, className = "" }: {
  href: string; children: React.ReactNode; className?: string;
}) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {children}<span className="sr-only"> (opens in a new tab)</span>
  </a>;
}
function PageFoot({ number }: { number: string }) {
  return <div className="page-foot"><span>{number}</span></div>;
}
function Identity({ heading = false, navigate }: {
  heading?: boolean; navigate?: (section: Section) => void;
}) {
  const Title = heading ? "h1" : "h2";
  return <div className="paper-page title-page">
    <Title className="clay-title name-block" id={heading ? "section-heading" : undefined} tabIndex={heading ? -1 : undefined}>
      <span className="sr-only">Tin Grgić</span>
      <img src={asset("images/optimized/name.webp")} width="1200" height="800" alt="" aria-hidden="true" draggable={false}/>
    </Title>
    <p className="identity">{profile.role}<br/>at {profile.company}.</p>
    <div className="mustard-underline" aria-hidden="true"/>
    <p className="about">By day, a systems thinker.<br/>After hours, a curious maker.</p>
    <img className="clay-motif" src={asset("images/optimized/bulb-cloud.webp")} width="1200" height="400" alt="" aria-hidden="true" draggable={false}/>
    {navigate && <button className="intro-work-link" onClick={() => navigate("work")}>See my work <span aria-hidden="true">↗</span></button>}
    <PageFoot number="01"/>
  </div>;
}
function ProjectPrint({ projectIndex, compact = false }: {projectIndex: number; compact?: boolean}) {
  const project = projects[projectIndex];
  return <div className={`project-print project-${project.id} ${compact ? "compact-print" : ""}`}>
    <div className="collage">
      <a className="image-print" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`}>
        <span className="tape" aria-hidden="true"/>
        <img draggable={false} src={project.image} alt={project.alt} width="1000" height="694"/>
        <span className="print-caption">{project.domain}</span>
      </a>
      <span className="project-sticker" aria-hidden="true">{projectIndex === 0 ? <>Less,<br/>but better.</> : <>Right<br/>on target.</>}</span>
    </div>
    {!compact && <div className="project-description">
      <div className="project-name"><span className="project-index">0{projectIndex + 1}</span><h2>{project.name}</h2></div><p>{project.description}</p>
      <ExternalLink className="project-link" href={project.url}>Visit live site <span aria-hidden="true">↗</span></ExternalLink>
    </div>}
  </div>;
}
function SelectedWork({ heading = false }: {heading?: boolean}) {
  const Title = heading ? "h1" : "h2";
  return <div className="paper-page selected-work-page intro-copy-page">
    <Title className="work-page-heading" id={heading ? "section-heading" : undefined} tabIndex={heading ? -1 : undefined}>Selected work.</Title>
    <div className="dotted-underline" aria-hidden="true"/>
    <div className="stacked-projects"><ProjectPrint projectIndex={0} compact/><ProjectPrint projectIndex={1} compact/></div>
    <PageFoot number="02"/>
  </div>;
}
export function Intro({ navigate, mobile }: { navigate: (section: Section) => void; mobile: boolean }) {
  return <section className="spread intro-spread" aria-labelledby="section-heading">
    <Identity heading navigate={navigate}/>{!mobile && <SelectedWork/>}
  </section>;
}
export function Work({ mobile, projectIndex }: {mobile: boolean; projectIndex: number}) {
  return <section className="spread work-spread" aria-labelledby="section-heading">
    {mobile ? <article className={`paper-page project-page project-${projects[projectIndex].id}`}>
      <h1 className="work-page-heading" id="section-heading" tabIndex={-1}>Selected work.</h1>
      <div className="dotted-underline" aria-hidden="true"/>
      <ProjectPrint projectIndex={projectIndex}/><PageFoot number={projectIndex === 0 ? "02" : "03"}/>
    </article> : <><Identity/><SelectedWork heading/></>}
  </section>;
}
export function Connect() {
  return <section className="spread connect-spread" aria-labelledby="section-heading">
    <div className="paper-page connect-title">
      <h1 className="clay-title connect-display" id="section-heading" tabIndex={-1}>
        <span className="sr-only">Good things start with a hello.</span>
        <img src={asset("images/optimized/good-things.webp")} width="1122" height="1232" alt="" aria-hidden="true" draggable={false}/>
      </h1>
      <img className="clay-motif plane-motif" src={asset("images/optimized/paper-plane.webp")} width="1200" height="400" alt="" aria-hidden="true" draggable={false}/>
      <PageFoot number="04"/>
    </div>
    <div className="paper-page connect-copy">
      <h2 className="connect-heading">Let’s connect</h2>
      <div className="mustard-underline" aria-hidden="true"/>
      <div className="contact-actions">
        <ExternalLink href={profile.linkedin} className="contact-action linkedin-action">
          <span className="tape" aria-hidden="true"/>
          <img src={`${art}clay-linkedin.webp`} width="128" height="128" alt="" aria-hidden="true"/>
          <span><strong>Stalk me</strong><br/>on LinkedIn</span><span className="action-arrow" aria-hidden="true">→</span>
        </ExternalLink>
        {profile.email && <a className="contact-action email-action" href={`mailto:${profile.email}`}>
          <span className="tape" aria-hidden="true"/>
          <img src={`${art}clay-envelope.webp`} width="128" height="128" alt="" aria-hidden="true"/>
          <span><strong>Contact me</strong><br/>{profile.email}</span><span className="action-arrow" aria-hidden="true">→</span>
        </a>}
      </div>
      <PageFoot number="05"/>
    </div>
  </section>;
}
