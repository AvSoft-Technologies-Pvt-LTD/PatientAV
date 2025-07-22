import { useState, useEffect } from 'react';
import { UserRound, Users, FlaskRound as Flask, Building2, Phone, Activity, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import output from '../assets/output (1).jpg';

const Counter = ({ end, duration = 2000, label, icon: Icon, delay = 0 }) => {
  const [count, setCount] = useState(0), [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(`counter-${label}`),
      obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    el && obs.observe(el); return () => el && obs.unobserve(el);
  }, [label]);
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => {
      let start = null;
      const animate = t => {
        if (!start) start = t;
        const progress = (t - start) / duration;
        progress < 1 ? (setCount(Math.floor(end * progress)), requestAnimationFrame(animate)) : setCount(end);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [visible, end, duration, delay]);
  return (
    <div id={`counter-${label}`} className="flex flex-col items-center p-4 rounded-2xl shadow-lg transition duration-500 bg-white/90 hover:shadow-[var(--accent-color)]/20 hover:scale-105">
      <div className="relative">
        <div className="absolute -inset-1 rounded-full animate-pulse"></div>
        <Icon className="text-[var(--primary-color)] w-6 h-6 relative" strokeWidth={2} />
      </div>
      <div className="text-2xl font-bold text-[var(--primary-color)] mt-2">{count}+</div>
      <div className="text-xs text-[var(--primary-color)]/70 font-medium text-center mt-0.5">{label}</div>
    </div>
  );
};

export default function App() {
  const [displayText, setDisplayText] = useState(''), [isDeleting, setIsDeleting] = useState(false), [msgIdx, setMsgIdx] = useState(0), [inView, setInView] = useState(false);
  const navigate = useNavigate();
  const messages = ['schedule online consultations', 'book lab tests', 'get health insights', 'connect with experts'];

  useEffect(() => {
    const el = document.querySelector('.hero-content'),
      obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    el && obs.observe(el);
    return () => el && obs.unobserve(el);
  }, []);

  useEffect(() => {
    const current = messages[msgIdx], typingSpeed = 100, deletingSpeed = 50, wordDelay = 2000;
    const type = () => {
      setDisplayText(prev => isDeleting ? current.substring(0, prev.length - 1) : current.substring(0, prev.length + 1));
      if (!isDeleting && displayText === current) setTimeout(() => setIsDeleting(true), wordDelay);
      if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setMsgIdx(i => (i + 1) % messages.length);
      }
    };
    const timer = setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, msgIdx, messages]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative py-12 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 rotate-bg">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--accent-color)]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-20 w-[30rem] h-[30rem] bg-[var(--accent-color)]/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className={`lg:w-1/2 space-y-10 hero-content transition-all duration-1000 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h1 className="h1-heading space-y-3 font-bold text-4xl sm:text-5xl leading-tight">
              <div className="reveal-text-wrapper">
                <span className="reveal-text relative z-20">Your Digital</span>
                <span className="reveal-block" style={{ animationDelay: '0.2s' }}></span>
              </div>
              <div className="reveal-text-wrapper block">
                <span className="reveal-text text-[var(--accent-color)] relative z-20">Healthcare Partner</span>
                <span className="reveal-block" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </h1>
            <div className="flex items-center text-lg backdrop-blur-sm px-4 py-2">
              <Activity className="text-[var(--accent-color)] w-6 h-6 mr-2" />
              <span className="text-[var(--primary-color)] font-medium">{displayText}</span>
              <span className="animate-blink border-r-4 border-[var(--accent-color)] h-6 ml-1"></span>
            </div>
            <p className="paragraph">
              Experience modern healthcare solutions at your fingertips. We bring quality medical services right to your doorstep with advanced technology and expert care.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Counter end={500} label="Expert Doctors" icon={UserRound} />
              <Counter end={25000} label="Happy Patients" icon={Users} delay={200} />
              <Counter end={1000} label="Lab Tests" icon={Flask} delay={400} />
              <Counter end={50} label="Medical Centers" icon={Building2} delay={600} />
            </div>
            <div className="flex gap-4 flex-wrap">
              <button className="btn btn-primary "
                onClick={() => navigate('/bookconsultation')}
              >
                <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="cursor-pointer">Book Consultation</span>
              </button>

              <button onClick={() => navigate('/services')} className="btn-secondary">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Explore Services</span>
              </button>
            </div>
          </div>
          <div className="relative w-full lg:w-1/2 aspect-square max-w-2xl">
            <div className="absolute inset-0 rounded-blob shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-[var(--primary-color)]/10"></div>
              <img src={output} alt="Digital Healthcare" className="w-full h-full object-cover scale-in" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
