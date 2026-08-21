export default function Logo({ size = 'medium', variant = 'full', className = '' }) {
  const iconSrc = variant === 'icon' ? '/logo-icon.svg' : '/logo-full.svg';
  
  const heightMap = {
    small: 32,
    medium: 48,
    large: 120,
    xlarge: 180
  };

  const height = heightMap[size] || heightMap.medium;

  return (
    <img
      src={iconSrc}
      alt="HealBuddy Logo"
      className={`app-brand-logo ${className}`}
      style={{ height: height, width: 'auto', objectFit: 'contain' }}
    />
  );
}
