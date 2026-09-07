/* The curtain boot logic is intentionally inlined in components/IntroCurtain.tsx
   (dangerouslySetInnerHTML) so it ships inside the HTML document itself —
   no extra network request before first paint, no flash window. This file
   exists only to document that decision; it is never loaded. */
