import React, { useEffect, useRef } from 'react';
import { Users, FlaskRound as Flask, Star, Stethoscope } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StatusCard = ({ number, suffix = "", description, icon, color, index }) => {
  const [count, setCount] = React.useState(0);
  const refs = {
    card: useRef(null),
    icon: useRef(null),
    number: useRef(null),
    suffix: useRef(null),
    description: useRef(null),
    accent: useRef(null),
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => (prev < number ? Math.ceil(prev + number / 100) : number));
      if (count >= number) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [number]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(refs.card.current, { opacity: 0, y: 30 });
      gsap.set(refs.icon.current, { scale: 0 });
      gsap.set(refs.accent.current, { height: 0 });
      gsap.set([refs.number.current, refs.suffix.current], { opacity: 0, filter: "blur(4px)" });
      gsap.set(refs.description.current, { opacity: 0, y: 10 });

      ScrollTrigger.create({
        trigger: refs.card.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(refs.card.current, { opacity: 1, y: 0, duration: 0.7, delay: index * 0.2 });
          gsap.to(refs.icon.current, { scale: 1, duration: 0.5, delay: (index * 0.2) + 0.3 });
          gsap.to(refs.accent.current, { height: "100%", duration: 0.6, delay: (index * 0.2) + 0.4 });
          gsap.to([refs.number.current, refs.suffix.current], { opacity: 1, filter: "blur(0px)", stagger: 0.1, duration: 0.4, delay: (index * 0.2) + 0.5 });
          gsap.to(refs.description.current, { opacity: 1, y: 0, duration: 0.4, delay: (index * 0.2) + 0.6 });
        }
      });

      const hoverAnimation = (isHover) => {
        gsap.to(refs.card.current, { y: isHover ? -5 : 0, boxShadow: isHover ? "0 10px 15px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.1)", duration: 0.3 });
        gsap.to(refs.icon.current, { y: isHover ? -3 : 0, scale: isHover ? 1.1 : 1, duration: 0.4 });
      };

      refs.card.current.addEventListener("mouseenter", () => hoverAnimation(true));
      refs.card.current.addEventListener("mouseleave", () => hoverAnimation(false));
    });
    return () => ctx.revert();
  }, [index]);

  return (
    <div ref={refs.card} className="relative p-6 rounded-2xl bg-[#F5F5F5]" style={{ fontFamily: 'var(--font-family)' }}>
      <div ref={refs.icon} className="absolute -top-4 left-6 w-14 h-14 flex items-center justify-center rounded-2xl" style={{ color, backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        {icon}
      </div>
      <div className="mt-6">
        <div className="flex items-baseline space-x-1 mb-3">
          <span ref={refs.number} className="h2-heading" style={{ color }}>{count}</span>
          <span ref={refs.suffix} className="h3-heading" style={{ color }}>{suffix}</span>
        </div>
        <p ref={refs.description} className="paragraph">{description}</p>
      </div>
      <div ref={refs.accent} className="absolute top-0 right-0 w-2 rounded-r-2xl" style={{ backgroundColor: color }} />
    </div>
  );
};

const Statusbar = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: -20 });
      gsap.set(lineRef.current, { width: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(titleRef.current, { opacity: 1, y: 0, duration: 0.7 });
          gsap.to(lineRef.current, { width: "6rem", duration: 0.8, delay: 0.4 });
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 ref={titleRef} className="h2-heading">Making Healthcare Better</h2>
          <div ref={lineRef} className="w-24 h-1 mx-auto bg-[var(--accent-color)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <StatusCard index={0} number={746} suffix="k" description="Successful Healthcard Registration" icon={<Users className="w-7 h-7" />} color="var(--primary-color)" />
          <StatusCard index={1} number={850} description="Lab & Pharmacies integrated" icon={<Flask className="w-7 h-7" />} color="var(--accent-color)" />
          <StatusCard index={2} number={93} suffix="%" description="Patient Satisfaction Rate" icon={<Star className="w-7 h-7" />} color="var(--primary-color)" />
          <StatusCard index={3} number={275} suffix="+" description="Top Specialists" icon={<Stethoscope className="w-7 h-7" />} color="var(--accent-color)" />
        </div>
      </div>
    </div>
  );
};

export default Statusbar;
