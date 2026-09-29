/**
 * SectionTint
 * -----------
 * A soft-edged background tint for sections that want to read as a
 * distinct "band" (e.g. HowItWorks, PrivacySection, Resources) while
 * still sitting on the page-level continuous ambient layer
 * (AmbientBackground) without creating a hard seam.
 *
 * The problem this solves: applying `bg-bg-alt/60` directly to a
 * `<section>` paints a flat rectangle that stops abruptly at the
 * section's exact top/bottom edge. Since the ambient mesh underneath
 * is continuous, that abrupt stop reads as a visible hairline border
 * across the full width of the page — even though no border is
 * actually declared anywhere.
 *
 * The fix: render the tint as its own absolutely-positioned layer
 * with a mask-image gradient that fades it to transparent over the
 * first/last ~15% of the section's height. The tint is still clearly
 * visible in the middle of the section (so the section still reads
 * as visually distinct), but it blends smoothly into whatever's above
 * and below instead of cutting off in a straight line.
 *
 * Usage: mount as the first child of a `relative` section, then wrap
 * the section's real content in a `relative z-10` wrapper so it
 * stacks above this tint layer.
 *
 *   <section className="relative px-6 py-24">
 *     <SectionTint />
 *     <div className="relative z-10"> ...content... </div>
 *   </section>
 *
 * Design notes:
 *  - `mask-image` (+ `-webkit-mask-image` for Safari) is used instead
 *    of a manual multi-stop background-image gradient, since it lets
 *    us keep using the existing `bg-bg-alt` color token as-is (no new
 *    color values to maintain) and just control its alpha falloff.
 *  - Pure CSS, no JS/animation — effectively free at render and
 *    scroll time, same performance profile as the flat color it
 *    replaces.
 *  - `pointer-events-none` + `aria-hidden` since this is a decorative
 *    background layer, not content.
 *
 * Props:
 *  - opacity: peak opacity of the tint at its strongest point (default 0.6,
 *    matching the previous bg-bg-alt/60 value).
 *  - fade: how much of the section's height (as a %) the fade-in/out
 *    occupies at each edge (default 15).
 */
export default function SectionTint({ opacity = 0.6, fade = 15 }) {
  const maskImage = `linear-gradient(to bottom, transparent 0%, black ${fade}%, black ${100 - fade}%, transparent 100%)`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 bg-bg-alt"
      style={{
        opacity,
        maskImage,
        WebkitMaskImage: maskImage,
      }}
    />
  );
}