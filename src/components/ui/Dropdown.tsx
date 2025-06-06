import { useEffect, useRef } from 'react';
import { join } from '../../utils';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
}

export default function Dropdown({
  isOpen,
  onClose,
  children,
  className,
  closeOnOverlayClick = true,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !closeOnOverlayClick) return;
    const handleMouseAction = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handlePointerAction = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerAction);
    document.addEventListener('mousedown', handleMouseAction);
    return () => {
      document.removeEventListener('pointerdown', handlePointerAction);
      document.removeEventListener('mousedown', handleMouseAction);
    };
  }, [isOpen, onClose, closeOnOverlayClick]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={join(
        'bg-surface-light dark:bg-surface-dark animate-slide-down z-20 absolute top-full mt-2 w-48 origin-top transform rounded-md py-1 shadow-lg transition-transform duration-1000 ease-out',
        className,
      )}
    >
      {children}
    </div>
  );
}
