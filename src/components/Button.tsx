import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANTS: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  primary:   { bg: '#6366f1', text: '#ffffff', border: 'transparent', shadow: '#6366f1' },
  secondary: { bg: 'rgba(255,255,255,0.06)', text: '#94a3b8', border: 'rgba(255,255,255,0.1)', shadow: 'transparent' },
  danger:    { bg: '#f43f5e', text: '#ffffff', border: 'transparent', shadow: '#f43f5e' },
  success:   { bg: '#10b981', text: '#ffffff', border: 'transparent', shadow: '#10b981' },
  outline:   { bg: 'transparent', text: '#818cf8', border: 'rgba(99,102,241,0.4)', shadow: 'transparent' },
};

const SIZES: Record<string, { py: number; px: number; fontSize: number; borderRadius: number }> = {
  sm: { py: 7,  px: 14, fontSize: 12, borderRadius: 9  },
  md: { py: 11, px: 20, fontSize: 14, borderRadius: 12 },
  lg: { py: 14, px: 28, fontSize: 16, borderRadius: 14 },
};

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md',
  loading = false, onPress, disabled = false, style,
}) => {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          backgroundColor: v.bg,
          borderWidth: 1, borderColor: v.border,
          borderRadius: s.borderRadius,
          paddingVertical: s.py, paddingHorizontal: s.px,
          opacity: isDisabled ? 0.55 : 1,
          shadowColor: v.shadow, shadowOpacity: v.shadow !== 'transparent' ? 0.4 : 0,
          shadowRadius: 10, elevation: v.shadow !== 'transparent' ? 4 : 0,
        },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator color={v.text} size="small" style={{ marginRight: 8 }} />
      )}
      {typeof children === 'string' ? (
        <Text style={{ color: v.text, fontWeight: '800', fontSize: s.fontSize }}>
          {children}
        </Text>
      ) : children}
    </TouchableOpacity>
  );
};
