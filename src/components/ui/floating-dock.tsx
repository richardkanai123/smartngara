"use client";

/**
 * Desktop navbar is positioned fixed at the bottom center.
 * Mobile navbar is positioned fixed at the bottom right.
 */

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

export type DockItem = {
  title: string;
  icon: React.ReactNode;
  href?: string;
  value?: string;
  onClick?: () => void;
};

export const FloatingDock = ({
  items,
  activeValue,
  desktopClassName,
  mobileClassName,
}: {
  items: DockItem[];
  activeValue?: string;
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} activeValue={activeValue} className={desktopClassName} />
      <FloatingDockMobile items={items} activeValue={activeValue} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  activeValue,
  className,
}: {
  items: DockItem[];
  activeValue?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("sticky bottom-4 float-right z-40 md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full right-0 mb-2 flex flex-col items-end gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <DockItemWrapper item={item} onClick={() => setOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-full border border-border/40 bg-card px-3 py-2 shadow-lg",
                      activeValue && item.value === activeValue && "ring-2 ring-primary bg-background"
                    )}
                  >
                    <div className="size-5 shrink-0">{item.icon}</div>
                    <span className="text-xs font-medium text-foreground whitespace-nowrap pr-1">
                      {item.title}
                    </span>
                  </div>
                </DockItemWrapper>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex size-12 items-center justify-center rounded-full border border-border/40 bg-card shadow-lg transition-transform duration-150 ease-out active:scale-95",
          open && "rotate-180"
        )}
      >
        <IconLayoutNavbarCollapse className="size-5 text-muted-foreground" />
      </button>
    </div>
  );
};

function DockItemWrapper({
  item,
  children,
  onClick,
}: {
  item: DockItem;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (item.href) {
    return (
      <a href={item.href} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        item.onClick?.();
        onClick?.();
      }}
      className="cursor-pointer"
    >
      {children}
    </button>
  );
}

const FloatingDockDesktop = ({
  items,
  activeValue,
  className,
}: {
  items: DockItem[];
  activeValue?: string;
  className?: string;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "sticky bottom-4 z-40 mx-auto hidden h-16 w-fit items-end gap-4 rounded-2xl border border-border/40 bg-card/80 px-4 pb-3 shadow-lg backdrop-blur-md md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          item={item}
          isActive={activeValue !== undefined && item.value === activeValue}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  item,
  isActive,
}: {
  mouseX: MotionValue;
  item: DockItem;
  isActive: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <DockItemWrapper item={item}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full bg-muted transition-colors duration-150",
          isActive && "bg-background ring-2 ring-primary/60"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-border bg-card px-2 py-0.5 text-xs whitespace-pre text-foreground"
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {item.icon}
        </motion.div>
      </motion.div>
    </DockItemWrapper>
  );
}
