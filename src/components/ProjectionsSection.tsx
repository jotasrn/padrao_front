import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDays, Info, Minus, Plus, TrendingUp, Sparkles } from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { Caixinha, Aggregates } from '../types';
import { useApp } from '../context/AppProvider';

interface ProjectionsSectionProps {
  caixinhas: Caixinha[];
  aggregates: Aggregates;
  projections: any[];
  projectionMonths: number;
  setProjectionMonths: (val: number) => void;
  formatBRL: (val: number) => string;
  onNavigateToCaixinhas: () => void;
}

export const ProjectionsSection: React.FC<ProjectionsSectionProps> = ({
  caixinhas, aggregates, projections, projectionMonths, setProjectionMonths,
  formatBRL, onNavigateToCaixinhas,
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
  const shadowOpacityVal = isDark ? 0.15 : 0.05;

  const miniLabelStyle = {
    color: textSecondary, fontSize: 9, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  };

  if (caixinhas.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 20 }}>Previsão e Simulação</Text>
          <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>Veja o saldo planejado mês a mês.</Text>
        </View>
        <View style={{
          backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder,
          borderRadius: 22, paddingVertical: 48, alignItems: 'center', gap: 12,
        }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarDays size={28} color="#38bdf8" />
          </View>
          <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 14 }}>Sem caixinhas para simular!</Text>
          <Text style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 12, textAlign: 'center', paddingHorizontal: 32 }}>
            Você precisa de pelo menos uma caixinha cadastrada.
          </Text>
          <TouchableOpacity
            onPress={onNavigateToCaixinhas}
            style={{
              backgroundColor: '#6366f1', borderRadius: 12,
              paddingVertical: 10, paddingHorizontal: 24,
              shadowColor: '#6366f1', shadowOpacity: 0.5, shadowRadius: 10, marginTop: 4,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Ir para Caixinhas</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalInterest = Math.max(
    0,
    (projections[projectionMonths - 1]?.saldoCaixinhasTotal || 0) -
    aggregates.totalSaved -
    (aggregates.totalAportes * projectionMonths)
  );

  const finalBalance = projections[projectionMonths - 1]?.saldoCaixinhasTotal || 0;

  // Draw custom SVG chart
  const activeProjections = projections.slice(0, projectionMonths);
  const minVal = aggregates.totalSaved;
  const maxVal = finalBalance || 1;
  const range = maxVal - minVal || 1;

  const chartWidth = 300;
  const chartHeight = 100;
  const chartPadding = 10;

  const points = activeProjections.map((p, idx) => {
    const x = chartPadding + (idx / (activeProjections.length - 1 || 1)) * (chartWidth - 2 * chartPadding);
    const y = chartHeight - chartPadding - ((p.saldoCaixinhasTotal - minVal) / range) * (chartHeight - 2 * chartPadding);
    return { x, y };
  });

  const linePath = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 20, letterSpacing: -0.3 }}>Previsão e Simulação</Text>
        <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>Projeção com juros compostos.</Text>
      </View>

      {/* Month selector */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder,
        borderRadius: 16, padding: 14,
      }}>
        <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 13 }}>Simular período:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setProjectionMonths(Math.max(6, projectionMonths - 6))}
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={16} color={textSecondary} />
          </TouchableOpacity>
          <View style={{
            backgroundColor: 'rgba(99,102,241,0.12)',
            borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
            borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
          }}>
            <Text style={{ color: '#818cf8', fontWeight: '800', fontSize: 13 }}>{projectionMonths} meses</Text>
          </View>
          <TouchableOpacity
            onPress={() => setProjectionMonths(Math.min(36, projectionMonths + 6))}
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={16} color={textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary cards */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: cardBg,
            borderWidth: 1, borderColor: cardBorder,
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textSecondary, marginBottom: 8 }} />
            <Text style={miniLabelStyle as any}>Patrimônio Atual</Text>
            <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(aggregates.totalSaved)}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: cardBg,
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginBottom: 8 }} />
            <Text style={miniLabelStyle as any}>Poupado ({projectionMonths}m)</Text>
            <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(aggregates.totalAportes * projectionMonths)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: cardBg,
            borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#818cf8', marginBottom: 8 }} />
            <Text style={miniLabelStyle as any}>Juros Ganhos</Text>
            <Text style={{ color: '#818cf8', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              +{formatBRL(totalInterest)}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: isDark ? 'rgba(56,189,248,0.05)' : 'rgba(56,189,248,0.02)',
            borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8', marginBottom: 8, shadowColor: '#38bdf8', shadowOpacity: 1, shadowRadius: 4 }} />
            <Text style={miniLabelStyle as any}>Saldo Final</Text>
            <Text style={{ color: '#38bdf8', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(finalBalance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Area Chart Card */}
      <View style={{
        backgroundColor: cardBg,
        borderWidth: 1, borderColor: cardBorder,
        borderRadius: 22, padding: 16, gap: 12,
      }}>
        <Text style={{ color: textPrimary, fontWeight: '800', fontSize: 14 }}>Curva de Crescimento</Text>
        <View style={{ height: 100, width: '100%', overflow: 'hidden' }}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <Defs>
              <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            
            {/* Filled area under path */}
            {areaPath !== '' && (
              <Path d={areaPath} fill="url(#glowGrad)" />
            )}
            
            {/* Outline path */}
            {linePath !== '' && (
              <Path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            )}
            
            {/* Draw first and last points */}
            {points.length > 0 && (
              <>
                <SvgCircle cx={points[0].x} cy={points[0].y} r="4" fill="#38bdf8" stroke={cardBg} strokeWidth="1.5" />
                <SvgCircle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#38bdf8" stroke={cardBg} strokeWidth="2" />
              </>
            )}
          </Svg>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700' }}>Hoje ({formatBRL(minVal)})</Text>
          <Text style={{ color: '#38bdf8', fontSize: 9, fontWeight: '800' }}>{projectionMonths}m ({formatBRL(maxVal)})</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={{
        backgroundColor: cardBg,
        borderWidth: 1, borderColor: cardBorder,
        borderRadius: 22, overflow: 'hidden',
      }}>
        <View style={{
          padding: 16, borderBottomWidth: 1, borderBottomColor: dividerColor,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#818cf8" />
            <Text style={{ color: textPrimary, fontWeight: '800', fontSize: 14 }}>Evolução do Saldo</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={12} color="#818cf8" />
            <Text style={{ color: '#818cf8', fontSize: 9, fontWeight: '800', letterSpacing: 1 }}>
              JUROS COMPOSTOS
            </Text>
          </View>
        </View>

        <View style={{ padding: 12, gap: 8 }}>
          {projections
            .slice(0, projectionMonths)
            .filter((_, idx) => idx % 2 === 0 || idx === projectionMonths - 1)
            .map((p, idx, arr) => {
              const realIdx = projections.indexOf(p);
              const totalAportesSimulados = aggregates.totalAportes * (realIdx + 1);
              const juros = Math.max(0, p.saldoCaixinhasTotal - aggregates.totalSaved - totalAportesSimulados);
              const isLast = idx === arr.length - 1;

              return (
                <View key={idx} style={{
                  backgroundColor: isLast ? 'rgba(99,102,241,0.08)' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                  borderWidth: 1,
                  borderColor: isLast ? 'rgba(99,102,241,0.3)' : dividerColor,
                  borderRadius: 14, padding: 14, gap: 8,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: isLast ? '#818cf8' : textSecondary, fontWeight: '800', fontSize: 12 }}>
                      {p.mesAno}
                    </Text>
                    <Text style={{ color: isLast ? '#38bdf8' : textPrimary, fontWeight: '900', fontSize: 14 }}>
                      {formatBRL(p.saldoCaixinhasTotal)}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    borderTopWidth: 1, borderTopColor: dividerColor, paddingTop: 8,
                  }}>
                    <View>
                      <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Aportado</Text>
                      <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 12, marginTop: 2 }}>
                        {formatBRL(p.investimentoAporte)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Juros</Text>
                      <Text style={{ color: '#818cf8', fontWeight: '700', fontSize: 12, marginTop: 2 }}>
                        +{formatBRL(juros)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};
