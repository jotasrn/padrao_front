import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { PiggyBank, Pencil, Trash2, TrendingUp } from 'lucide-react-native';
import { Caixinha } from '../types';
import { useApp } from '../context/AppProvider';

interface CaixinhaCardProps {
  cx: Caixinha;
  onDelete: (id: string) => void;
  onEdit: (cx: Caixinha) => void;
  formatBRL: (val: number) => string;
}

const ACCENT_COLORS = ['#818cf8', '#34d399', '#38bdf8', '#fb923c', '#f472b6', '#a78bfa'];

function getAccent(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

export const CaixinhaCard: React.FC<CaixinhaCardProps> = ({ cx, onDelete, onEdit, formatBRL }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const innerBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const innerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const miniLabelStyle = {
    color: textSecondary, fontSize: 9, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  };

  const CDI_ANUAL = 10.75;
  const cdiPct = cx.rendimentoCdiPct !== undefined && !isNaN(cx.rendimentoCdiPct) ? cx.rendimentoCdiPct : 100;
  const rendimentoAnualCdi = (cdiPct / 100) * (CDI_ANUAL / 100);
  const r = Math.pow(1 + rendimentoAnualCdi, 1 / 12) - 1;

  const balance6  = cx.valorAtual * Math.pow(1 + r, 6)  + cx.aporteMensal * ((Math.pow(1 + r, 6) - 1)  / (r || 1));
  const balance12 = cx.valorAtual * Math.pow(1 + r, 12) + cx.aporteMensal * ((Math.pow(1 + r, 12) - 1) / (r || 1));
  const actualAnnualPct = cdiPct * (CDI_ANUAL / 100);

  const accent = getAccent(cx.id);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={{
        backgroundColor: cardBg,
        borderWidth: 1, borderColor: cardBorder,
        borderRadius: 22, overflow: 'hidden',
      }}>
        {/* Accent stripe */}
        <View style={{ height: 3, backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.8, shadowRadius: 6 }} />

        <View style={{ padding: 20, gap: 16 }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: `${accent}15`,
                borderWidth: 1, borderColor: `${accent}30`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <PiggyBank size={20} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: textPrimary, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                  {cx.nome}
                </Text>
                <Text style={{ color: accent, fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                  {cdiPct}% CDI · {actualAnnualPct.toFixed(2)}% a.a.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => onEdit(cx)}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  backgroundColor: 'rgba(99,102,241,0.1)',
                  borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Pencil size={14} color="#818cf8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(cx.id)}
                style={{
                  width: 32, height: 32, borderRadius: 9,
                  backgroundColor: 'rgba(244,63,94,0.1)',
                  borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Trash2 size={14} color="#f43f5e" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Values row */}
          <View style={{
            flexDirection: 'row', gap: 10,
            backgroundColor: innerBg,
            borderWidth: 1, borderColor: innerBorder,
            borderRadius: 14, padding: 14,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={miniLabelStyle as any}>Acumulado</Text>
              <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 17, marginTop: 4 }}>
                {formatBRL(cx.valorAtual)}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: dividerColor }} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={miniLabelStyle as any}>Aporte/mês</Text>
              <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 17, marginTop: 4 }}>
                {formatBRL(cx.aporteMensal)}
              </Text>
            </View>
          </View>

          {/* Projections */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={12} color={textSecondary} />
              <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
                Simulação de Crescimento
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{
                flex: 1,
                backgroundColor: `${accent}08`,
                borderWidth: 1, borderColor: `${accent}20`,
                borderRadius: 12, padding: 12, gap: 4,
              }}>
                <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>6 meses</Text>
                <Text style={{ color: accent, fontWeight: '800', fontSize: 14 }}>{formatBRL(balance6)}</Text>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: `${accent}12`,
                borderWidth: 1, borderColor: `${accent}30`,
                borderRadius: 12, padding: 12, gap: 4,
              }}>
                <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>12 meses</Text>
                <Text style={{ color: accent, fontWeight: '800', fontSize: 14 }}>{formatBRL(balance12)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
