// Test-only Vite module. Drive the real GSAP timeline without freezing the
// browser clock used by font loading and html2canvas's isolated iframe.
import gsap from 'gsap';

export function freezeMotion() {
  gsap.globalTimeline.pause();
}

export function seekTurn(time: number) {
  const turn = gsap.globalTimeline.getChildren(false, false, true)
    .find((timeline) => Math.abs(timeline.duration() - 1.95) < 0.001);
  if (!turn) throw new Error('No active notebook turn timeline');
  turn.totalTime(time, false);
}

export function resumeMotion() {
  gsap.globalTimeline.resume();
}

export function seekOpening(time: number) {
  const opening = gsap.globalTimeline.getChildren(false, false, true)
    .find((timeline) => Math.abs(timeline.duration() - 4.8) < 0.001);
  if (!opening) throw new Error('No active opening timeline');
  opening.totalTime(time, false);
}

export function seekCover(time: number) {
  const cover = gsap.globalTimeline.getChildren(false, false, true)
    .find((timeline) => Math.abs(timeline.duration() - 1.8) < 0.001);
  if (!cover) throw new Error('No active cover timeline');
  cover.totalTime(time, false);
}
