/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

// Para corrigir o erro dos ícones do lucide no TS
declare module 'lucide-react-native' {
  import { SvgProps } from 'react-native-svg';
  import { StyleProp, ViewStyle } from 'react-native';
  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    className?: string;
    style?: StyleProp<ViewStyle>;
  }
  export const PiggyBank: React.FC<LucideProps>;
  export const Pencil: React.FC<LucideProps>;
  export const Trash2: React.FC<LucideProps>;
  export const Target: React.FC<LucideProps>;
  export const TrendingUp: React.FC<LucideProps>;
  export const TrendingDown: React.FC<LucideProps>;
  export const CalendarDays: React.FC<LucideProps>;
  export const PieChart: React.FC<LucideProps>;
  export const Plus: React.FC<LucideProps>;
  export const Info: React.FC<LucideProps>;
  export const Sparkles: React.FC<LucideProps>;
  export const Check: React.FC<LucideProps>;
  export const X: React.FC<LucideProps>;
  export const DollarSign: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const ChevronDown: React.FC<LucideProps>;
  export const List: React.FC<LucideProps>;
  export const ArrowRight: React.FC<LucideProps>;
  export const LogOut: React.FC<LucideProps>;
  export const Minus: React.FC<LucideProps>;
}
