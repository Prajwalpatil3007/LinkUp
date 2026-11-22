import React from 'react';
import { 
  GraduationCap, 
  Terminal, 
  HeartHandshake, 
  Rocket, 
  Briefcase, 
  Leaf, 
  Landmark, 
  Activity, 
  Tag 
} from 'lucide-react';
import { CATEGORY_DETAILS } from '../utils/constants';

const ICON_MAP = {
  GraduationCap,
  Terminal,
  HeartHandshake,
  Rocket,
  Briefcase,
  Leaf,
  Landmark,
  Activity
};

export default function CategoryBadge({ category, size = 'sm', showIcon = true }) {
  const details = CATEGORY_DETAILS[category] || {
    icon: 'Tag',
    color: '#176B87',
    tag: category
  };

  const IconComponent = ICON_MAP[details.icon] || Tag;

  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${details.color}15`,
        color: details.color,
        border: `1px solid ${details.color}30`,
        fontSize: size === 'sm' ? '12px' : '13px',
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }}
      title={category}
    >
      {showIcon && <IconComponent size={size === 'sm' ? 13 : 15} />}
      <span>{category}</span>
    </span>
  );
}
