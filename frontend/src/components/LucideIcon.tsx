import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface LucideIconProps extends LucideProps {
  name: string;
}

export function LucideIcon({ name, ...rest }: LucideIconProps) {
  // Try to find the icon in the lucide-react exports
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Fallback if not a recognized Lucide icon name (might still be an emoji or other string)
    // We only render text if it's likely an emoji or single character
    if (name && name.length <= 4) {
      return <span style={{ fontSize: rest.size || '1em' }} className={rest.className}>{name}</span>;
    }
    return null;
  }

  return <IconComponent {...rest} />;
}
