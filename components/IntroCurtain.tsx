/**
 * Page-load intro curtain. Server-rendered so the overlay exists before
 * hydration — the site is never seen half-assembled.
 *
 * Behavior:
 * - First visit in a session: curtain shows, the wordmark types itself in
 *   letter by letter ("O" → "ON" → "ON_" with a caret that rides each
 *   letter), holds a beat, then wipes upward and stamps
 *   <html data-curtain-done>, releasing the held hero entrances.
 * - Every later load (and reduced motion): the inline boot script stamps
 *   data-curtain-done before first paint — CSS hides the curtain instantly,
 *   zero flicker, zero cost.
 * - No JS: boot never marks [data-curtain-js], so hero entrances are NOT
 *   held; the panel runs its typing + wipe via pure-CSS animation and the
 *   overlay collapses via animation-delayed display:none.
 *
 * IMPORTANT: the curtain NODE is never removed from the DOM — scripts only
 * stamp attributes. Removing it pre-hydration would desync React's tree
 * and log a hydration mismatch (#418). Hidden is indistinguishable to the
 * user and harmless to hydration.
 */

/** Boot: runs pre-paint inside the curtain node. Applies the persisted
 * theme before first paint (no flash), marks JS presence, then stamps done
 * (CSS hides the curtain) on repeat visits / reduced motion. */
const BOOT_SNIPPET = `try{var d=document.documentElement;var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){d.setAttribute("data-theme",t);}d.setAttribute("data-curtain-js","");if(sessionStorage.getItem("intro-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-curtain-done","");}}catch(e){}`;

/** Finish: first visit only — when the wipe ends (or a stalled animation
 * clock trips the fallback), release the page and remember the visit. */
const FINISH_SNIPPET = `(function(){try{var d=document.documentElement;if(d.hasAttribute("data-curtain-done"))return;var done=false;function finish(){if(done)return;done=true;d.setAttribute("data-curtain-done","");try{sessionStorage.setItem("intro-seen","1")}catch(e){}}var c=document.getElementById("intro-curtain"),p=c&&c.querySelector(".intro-curtain-panel");p&&p.addEventListener("animationend",function(e){if(e.animationName==="intro-wipe")finish()});setTimeout(finish,2000);}catch(e){}})();`;

const WORDMARK = "ON_";

export function IntroCurtain() {
  return (
    <div id="intro-curtain" aria-hidden>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SNIPPET }} />
      <div className="intro-curtain-panel">
        <span className="intro-curtain-mark">
          {WORDMARK.split("").map((char, index) => (
            <span
              key={index}
              className="intro-curtain-letter"
              style={{ "--letter-i": index } as React.CSSProperties}
            >
              {char}
            </span>
          ))}
          <span className="intro-curtain-caret" aria-hidden />
        </span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: FINISH_SNIPPET }} />
    </div>
  );
}
