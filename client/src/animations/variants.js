// Central Framer Motion variants library

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: { 
    transition: { staggerChildren, delayChildren } 
  }
});

export const cardHover = {
  rest: { scale: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  hover: { 
    scale: 1.03, 
    boxShadow: "0 12px 40px rgba(0,0,0,0.16)", 
    transition: { duration: 0.2 } 
  }
};

export const drawerSlideRight = {
  hidden: { x: "100%", opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1, 
    transition: { type: "spring", damping: 25, stiffness: 200 } 
  },
  exit: { 
    x: "100%", 
    opacity: 0, 
    transition: { duration: 0.25 } 
  }
};

export const drawerSlideUp = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", damping: 25, stiffness: 200 } 
  },
  exit: { 
    y: "100%", 
    opacity: 0 
  }
};

export const modalScale = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", damping: 20, stiffness: 200 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10, 
    transition: { duration: 0.2 } 
  }
};

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.3 } 
  }
};

export const kanbanCardDrag = {
  dragging: { 
    scale: 1.05, 
    rotate: 2, 
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)", 
    zIndex: 999 
  }
};

export const sectionReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  }
};
