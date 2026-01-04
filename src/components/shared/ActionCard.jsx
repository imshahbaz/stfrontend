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
                className="group h-full flex flex-col p-6 rounded-3xl bg-card border border-border cursor-pointer transition-all hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/50"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                        <Icon size={32} />
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary opacity-30 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>

                <h3 className="text-xl font-extrabold tracking-tight mb-2">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default ActionCard;