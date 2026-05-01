import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ActionCard = ({ title, description, icon: Icon, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <div
                onClick={onClick}
                className="group glass-card h-full flex flex-col p-6 cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:border-primary/50 relative overflow-hidden"
            >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                        <Icon size={28} strokeWidth={2.5} />
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary opacity-30 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>

                <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground relative z-10">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow relative z-10">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default ActionCard;