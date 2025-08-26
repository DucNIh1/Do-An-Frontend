import { useEffect, useRef, useState } from "react";

const Counter = ({ target, label, sublabel }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          let start = 0;
          const duration = 2000;
          const step = Math.ceil(target / (duration / 30));

          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(start);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [target]);

  return (
    <div ref={ref} className="text-center px-4">
      <h3 className="text-4xl font-bold text-deepBlue">{count}</h3>
      <p className="text-lg font-semibold text-deepBlue">{label}</p>
      {sublabel && <p className="text-sm text-deepBlue">{sublabel}</p>}
    </div>
  );
};
export default Counter;
