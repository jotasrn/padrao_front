import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarDays, Info, Minus, Plus, TrendingUp, Sparkles } from 'lucide-react-native';
import { Caixinha, Aggregates } from '../types';

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
  if (caixinhas.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>Previsão e Simulação</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Veja o saldo planejado mês a mês.</Text>
        </View>
        <View style={{
          backgroundColor: '#0f1629', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
          borderRadius: 22, paddingVertical: 48, alignItems: 'center', gap: 12,
        }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarDays size={28} color="#38bdf8" />
          </View>
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 14 }}>Sem caixinhas para simular!</Text>
          <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', paddingHorizontal: 32 }}>
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

  return (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 20, letterSpacing: -0.3 }}>Previsão e Simulação</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Projeção com juros compostos.</Text>
      </View>

      {/* Month selector */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#0f1629', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 16, padding: 14,
      }}>
        <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 13 }}>Simular período:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setProjectionMonths(Math.max(6, projectionMonths - 6))}
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Minus size={16} color="#94a3b8" />
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
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary cards */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: '#0f1629',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#94a3b8', marginBottom: 8 }} />
            <Text style={miniLabel}>Patrimônio Atual</Text>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(aggregates.totalSaved)}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: '#0f1629',
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginBottom: 8 }} />
            <Text style={miniLabel}>Poupado ({projectionMonths}m)</Text>
            <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(aggregates.totalAportes * projectionMonths)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: '#0f1629',
            borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#818cf8', marginBottom: 8 }} />
            <Text style={miniLabel}>Juros Ganhos</Text>
            <Text style={{ color: '#818cf8', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              +{formatBRL(totalInterest)}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: 'rgba(56,189,248,0.05)',
            borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
            borderRadius: 16, padding: 14,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#38bdf8', marginBottom: 8, shadowColor: '#38bdf8', shadowOpacity: 1, shadowRadius: 4 }} />
            <Text style={miniLabel}>Saldo Final</Text>
            <Text style={{ color: '#38bdf8', fontWeight: '900', fontSize: 16, marginTop: 4 }}>
              {formatBRL(finalBalance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <View style={{
        backgroundColor: '#0f1629',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 22, overflow: 'hidden',
      }}>
        <View style={{
          padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#818cf8" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Evolução do Saldo</Text>
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
                  backgroundColor: isLast ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  borderWidth: 1,
                  borderColor: isLast ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 14, padding: 14, gap: 8,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: isLast ? '#818cf8' : '#94a3b8', fontWeight: '800', fontSize: 12 }}>
                      {p.mesAno}
                    </Text>
                    <Text style={{ color: isLast ? '#38bdf8' : '#e2e8f0', fontWeight: '900', fontSize: 14 }}>
                      {formatBRL(p.saldoCaixinhasTotal)}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 8,
                  }}>
                    <View>
                      <Text style={{ color: '#475569', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Aportado</Text>
                      <Text style={{ color: '#94a3b8', fontWeight: '700', fontSize: 12, marginTop: 2 }}>
                        {formatBRL(p.investimentoAporte)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#475569', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Juros</Text>
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

const miniLabel: any = {
  color: '#64748b', fontSize: 9, fontWeight: '700',
  letterSpacing: 0.8, textTransform: 'uppercase',
};
