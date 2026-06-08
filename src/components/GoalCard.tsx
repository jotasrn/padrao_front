import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Pencil, Trash2, AlertTriangle, CheckCircle2, Target, Zap } from 'lucide-react-native';
import { Goal } from '../types';
import { useApp } from '../context/AppProvider';

interface GoalCardProps {
  goal: any;
  goals: Goal[];
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onOptimize: (caixinhaId: string, requiredAporte: number) => void;
  formatBRL: (val: number) => string;
  formatarData: (val: string) => string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal, goals, onEdit, onDelete, onOptimize, formatBRL, formatarData,
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const innerBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const innerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const barBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const percentComplete = Math.min(100, Math.round((goal.currentSavedForGoal / goal.valorObjetivo) * 100 || 0));
  const isOnTrack = goal.achievable;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const barWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    // bar animation uses non-native driver (layout)
    Animated.timing(barWidth, { toValue: percentComplete, duration: 700, delay: 300, useNativeDriver: false }).start();
  }, []);

  const barColor    = percentComplete === 100 ? '#10b981' : isOnTrack ? '#818cf8' : '#f59e0b';
  const statusColor = isOnTrack ? '#10b981' : '#f59e0b';
  const statusBg    = isOnTrack ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
  const statusBorder = isOnTrack ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={{
        backgroundColor: cardBg,
        borderWidth: 1, borderColor: cardBorder,
        borderRadius: 22, padding: 20, gap: 16,
      }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 13,
            backgroundColor: 'rgba(251,146,60,0.1)',
            borderWidth: 1, borderColor: 'rgba(251,146,60,0.25)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={20} color="#fb923c" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ color: textPrimary, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                {goal.nome}
              </Text>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                backgroundColor: statusBg, borderWidth: 1, borderColor: statusBorder,
              }}>
                <Text style={{ color: statusColor, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                  {isOnTrack ? '✓ NO PRAZO' : '⚠ AJUSTE'}
                </Text>
              </View>
            </View>
            {goal.descricao ? (
              <Text style={{ color: textSecondary, fontSize: 12, lineHeight: 16, marginTop: 4 }}>{goal.descricao}</Text>
            ) : null}
            <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '700', marginTop: 4 }}>
              📦 {goal.linkedCaixinhaName}
            </Text>
          </View>
 
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => { const g = goals.find(g => g.id === goal.id); if (g) onEdit(g); }}
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
              onPress={() => onDelete(goal.id)}
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

        {/* Progress bar */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700' }}>
              Progresso · {percentComplete}%
            </Text>
            <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700' }}>
              {formatBRL(goal.currentSavedForGoal)} / {formatBRL(goal.valorObjetivo)}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: barBg, borderRadius: 6 }}>
            <Animated.View style={{
              height: 8, borderRadius: 6,
              backgroundColor: barColor,
              width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              shadowColor: barColor, shadowOpacity: 0.7, shadowRadius: 6,
            }} />
          </View>
        </View>

        {/* Info grid */}
        <View style={{
          backgroundColor: innerBg,
          borderWidth: 1, borderColor: innerBorder,
          borderRadius: 14, padding: 14, gap: 10,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Data Alvo:</Text>
            <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '700' }}>
              {formatarData(`${goal.dataAlvo}-01`)}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: dividerColor }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>Previsão Real:</Text>
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '800' }}>
              {goal.reachedDateStr === 'N/A'
                ? 'Sem aportes ativos'
                : `${goal.reachedDateStr} (${goal.monthsNeeded}m)`}
            </Text>
          </View>
        </View>

        {/* Adjustment alert */}
        {!isOnTrack && (goal.caixinhaVinculadaIds?.length || goal.caixinhaVinculadaId) ? (
          <View style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
            borderRadius: 14, padding: 14, gap: 10,
          }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="#f59e0b" style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f59e0b', fontWeight: '800', fontSize: 12 }}>Ajuste Recomendado</Text>
                <Text style={{ color: '#fbbf24', fontSize: 11, lineHeight: 16, marginTop: 3 }}>
                  Aumente o aporte para {formatBRL(goal.requiredAporte)}/mês para atingir no prazo.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                const targetId = goal.caixinhaVinculadaIds?.[0] || goal.caixinhaVinculadaId;
                if (targetId) onOptimize(targetId, goal.requiredAporte);
              }}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: '#f59e0b', borderRadius: 10,
                paddingVertical: 10, paddingHorizontal: 16,
                shadowColor: '#f59e0b', shadowOpacity: 0.4, shadowRadius: 8,
              }}
            >
              <Zap size={13} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 11 }}>Aplicar Aporte Sugerido</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* On track */}
        {isOnTrack && (goal.caixinhaVinculadaIds?.length || goal.caixinhaVinculadaId) ? (
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.08)',
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
            borderRadius: 14, padding: 14,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <CheckCircle2 size={18} color="#10b981" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 12 }}>Tudo sob controle!</Text>
              <Text style={{ color: '#34d399', fontSize: 11, marginTop: 2 }}>
                Seu ritmo de poupança atual é suficiente.
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};
