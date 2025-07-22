import { useState, useEffect } from "react";
import { QrCode, Heart, Pill, Syringe, User, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const AVCard = ({ initialName, initialCardNumber, initialGender, imageUrl }) => {
  const [formData, setFormData] = useState({ name: initialName, cardNumber: initialCardNumber, gender: initialGender, imageUrl });
  useEffect(() => setFormData({ name: initialName, cardNumber: initialCardNumber, gender: initialGender, imageUrl }), [initialName, initialCardNumber, initialGender, imageUrl]);

  const bgIcons = [{ Icon: Heart, pos: "top-4 right-28" }, { Icon: Pill, pos: "bottom-8 left-12" }, { Icon: Syringe, pos: "bottom-22 right-26" }];

  return (
    <motion.div style={{ fontFamily: 'var(--font-family)' }} initial={{ opacity: 0.85, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative w-[380px] h-[240px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[var(--primary-color)]/20 transition-shadow duration-300">
      <motion.div animate={{ background: ["linear-gradient(135deg, rgb(1, 212, 140) 0%, rgba(14, 22, 48, 0.95) 50%, rgba(14, 22, 48, 0.9) 100%)"] }} className="absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden">
        {bgIcons.map(({ Icon, pos }, i) => (
          <motion.div key={i} className={`absolute ${pos}`} animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 0], opacity: [0.12, 0.12, 0.16] }} transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}>
            <Icon size={24} className="text-[var(--accent-color)]" />
          </motion.div>
        ))}
      </div>
      <div className="relative h-full p-8 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} className="relative group">
              <motion.img src={formData.imageUrl || "https://img.freepik.com/vecteurs-premium/icone-profil-avatar-par-defaut-image-utilisateur-medias-sociaux-icone-avatar-gris-silhouette-profil-vide-illustration-vectorielle_561158-3383.jpg?ga=GA1.1.1895928303.1746111458&semt=ais_hybrid&w=740"} alt="User Avatar" className="w-25 h-12 rounded-full object-cover border-2 border-[var(--accent-color)] shadow-md" initial={{ opacity: 0.9 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
            </motion.div>
            <div className="space-y-1">
              <input type="text" name="name" value={formData.name} readOnly className="w-full bg-transparent text-lg font-medium text-[#f5f5f5] tracking-wide" placeholder="Enter Name" />
              <input type="text" name="cardNumber" value={formData.cardNumber} readOnly className="w-full bg-transparent text-sm text-[var(--accent-color)] tracking-wider font-medium" placeholder="Card Number" />
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-1.5 bg-[var(--accent-color)]/10 p-2.5 rounded-xl hover:bg-[var(--accent-color)]/20 transition-colors duration-300">
            <QrCode className="w-8 h-8 text-[var(--accent-color)]" />
          </motion.div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 bg-[var(--accent-color)]/10 p-3 rounded-xl hover:bg-[var(--accent-color)]/20 transition-colors duration-300">
            <User className="w-5 h-5 text-[var(--accent-color)]" />
            <input type="text" name="gender" value={formData.gender} readOnly className="w-full bg-transparent text-sm text-[#f5f5f5] font-medium" placeholder="Gender" />
          </motion.div>
        </div>
        <motion.div className="flex justify-end items-end mt-6" whileHover={{ scale: 1.02 }}>
          <div className="text-right">
            <div className="text-[var(--accent-color)] font-bold text-xl tracking-wider flex items-center gap-2">
              AV SWASTHYA
              <motion.div animate={{ scale: [1, 1.3, 1, 0.9, 1], transition: { duration: 1, repeat: Infinity } }}>
                <HeartPulse className="w-6 h-6 text-[var(--accent-color)]" />
              </motion.div>
            </div>
            <div className="text-xs text-[#f5f5f5]/80 tracking-wider mt-1">Healthcare Solutions</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AVCard;
