import { HiArrowRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AVCard from "./microcomponents/AVCard";
const Calltoaction = () => {
  const navigate = useNavigate(), ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const textButtonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ opacity: 1, y: 0, transition: { delay: 0.5 + i * 0.2, duration: 0.5, ease: "easeOut" } })
  };
  return (
    <div ref={ref} className="flex justify-center items-center bg-[#F5F5F5] mb-24">
      <div className="w-7/9 h-9/10 rounded-3xl shadow-lg border-2 border-[var(--accent-color)]">
        <div className="relative bg-[#F5F5F5] p-6 z-10 container mx-auto px-6 py-10 lg:px-12 rounded-3xl">
          <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-10 lg:gap-16">
            <div className="w-full lg:w-1/2 flex flex-col items-center space-y-9"> <AVCard />
              <div className="flex flex-wrap gap-4 justify-center mt-6"> <button className="btn btn-primary" onClick={() => navigate("/healthcard")}>Generate HealthCard</button>  </div>  </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left space-y-5">
  <motion.h2
  initial={{ opacity: 0, x: -50 }}
  animate={isInView ? { opacity: 1, x: 0 } : {}}
  transition={{ duration: 0.6 }}
  className="h2-heading shimmer-text"
>
  Get expert advice from top doctors anytime, <span>anywhere!</span>
</motion.h2>
              <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay: 0.4 }} className="paragraph max-w-lg mx-auto lg:mx-0">
                Connect with qualified healthcare professionals and receive personalized medical consultation from the comfort of your home.
              </motion.p>
              <div className="flex flex-wrap items-center justify-center lg:justify-between w-full max-w-3xl bg-white rounded-full shadow-md border border-gray-200 overflow-hidden">
                {["Consult With Doctor", "Order Medicines", "Lab/Scans Booking", "My Medical Records"].map((text, i) => (
                  <motion.button key={i} custom={i} variants={textButtonVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
                    className={`relative flex items-center justify-center font-medium px-5 py-3 text-[var(--primary-color)] text-xs w-1/2 sm:w-1/4 text-sm transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none ${i < 3 ? "border-b sm:border-b-0 sm:border-r border-gray-300" : ""}`}
                    style={{ willChange: "transform" }} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                    <span className="z-20 flex items-center gap-1">
                      {text}
                      <motion.span whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <HiArrowRight size={16} />
                      </motion.span>
                    </span>
                  </motion.button> ))} </div>  </div> </div>  </div>  </div></div>
  );
};
export default Calltoaction;