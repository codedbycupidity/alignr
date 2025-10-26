import { forwardRef } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = 'md', className = '' }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base'
    };

    const getInitials = (name: string) => {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    };

    const getColorFromName = (name: string) => {
      // Generate a consistent color based on the name
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Various shades of purple to match the platform theme
      const colors = [
        'bg-[#75619D] text-white',      // Main purple
        'bg-[#624F8A] text-white',      // Darker purple
        'bg-[#8B78B3] text-white',      // Lighter purple
        'bg-[#9D8BC0] text-white',      // Soft purple
        'bg-[#B8A8D5] text-white',      // Light purple
        'bg-[#7B5FA8] text-white',      // Deep purple
        'bg-[#9370DB] text-white',      // Medium purple
        'bg-[#6A4C93] text-white',      // Rich purple
      ];

      return colors[Math.abs(hash) % colors.length];
    };

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error, fallback will show
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center font-semibold ${getColorFromName(name)}`}
          style={{ display: src ? 'none' : 'flex' }}
        >
          {getInitials(name)}
        </div>
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
