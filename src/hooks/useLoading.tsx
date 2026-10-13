import { useEffect, useState } from "react";

function useLoading(delay = 1600) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return { loading };
}

export default useLoading;
