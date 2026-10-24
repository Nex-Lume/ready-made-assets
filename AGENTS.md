<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Restaurant site: all business data (name, hours, phone, dishes, menu) lives in `src/lib/site.ts`; media URLs come from `src/lib/media.ts` (generated from `src/assets/media/*.asset.json`). Why: rename/retime without touching components.
- Raw Flow renders are processed by `scripts/process.sh` (delogo, keyframe-every-2 hero clips) then uploaded with lovable-assets. Why: hero is scrubbed by scroll and needs instant seeks.
- Scroll motion uses GSAP ScrollTrigger + Lenis via `src/lib/motion.ts`; hero clips are blob-loaded. Why: local seeks, no black frames.
