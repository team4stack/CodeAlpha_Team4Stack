// Lenis smooth scroll has been removed on user request.
// This file kept as a no-op hook to avoid import errors if anything still references it.
import { useRef } from 'react';

export const useLenis = () => {
  const ref = useRef<null>(null);
  return ref;
};

export default useLenis;


