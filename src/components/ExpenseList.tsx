import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingDown, Pencil, Trash2, Plus, Check } from 'lucide-react-native';
import { Expense, Aggregates } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  aggregates: Aggregates;
  toggleExpensePaid: (id: string) => void;
  deleteExpense: (id: string) => void;
  startEditExpense: (exp: Expense) => void;
  formatBRL: (val: number) => string;
  onShowAddExpense: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#38bdf8',
  Alimentação: '#fb923c',
  Transporte: '#a78bfa',
  Saúde: '#34d399',
  Educação: '#f472b6',
  Outros: '#94a3b8',
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  Recorrente: { label: 'Recorrente', color: '#818cf8' },
  Única:      { label: 'Único',      color: '#38bdf8'  },
  Parcelada:  { label: 'Parcelas',   color: '#f59e0b'  },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses, aggregates, toggleExpensePaid, deleteExpense,
  startEditExpense, formatBRL, onShowAddExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <View style={{
        backgroundColor: '#0f1629',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 22, paddingVertical: 48, alignItems: 'center', gap: 12,
      }}>
        <View style={{
          width: 64, height: 64, borderRadius: 20,
          backgroundColor: 'rgba(248,113,113,0.1)',
          borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingDown size={28} color="#f87171" />
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 14 }}>Nenhuma despesa cadastrada!</Text>
          <Text style={{ color: '#475569', fontSize: 12, textAlign: 'center', paddingHorizontal: 32 }}>
            Cadastre seus gastos para controlar seu orçamento.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onShowAddExpense}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: '#6366f1', borderRadius: 12,
            paddingVertical: 10, paddingHorizontal: 20,
            shadowColor: '#6366f1', shadowOpacity: 0.5, shadowRadius: 10,
            marginTop: 4,
          }}
        >
          <Plus size={14} color="white" />
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Cadastrar Primeira Despesa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Summary row */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{
          flex: 1, backgroundColor: 'rgba(16,185,129,0.08)',
          borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
          borderRadius: 14, padding: 12,
        }}>
          <Text style={miniLabel}>Pagos</Text>
          <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 15, marginTop: 4 }}>
            {formatBRL(aggregates.paidExpenses)}
          </Text>
        </View>
        <View style={{
          flex: 1, backgroundColor: 'rgba(244,63,94,0.08)',
          borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
          borderRadius: 14, padding: 12,
        }}>
          <Text style={miniLabel}>A Pagar</Text>
          <Text style={{ color: '#f43f5e', fontWeight: '900', fontSize: 15, marginTop: 4 }}>
            {formatBRL(aggregates.unpaidExpenses)}
          </Text>
        </View>
      </View>

      {/* Expense items */}
      {expenses.map((exp) => {
        const catColor = CATEGORY_COLORS[exp.categoria] || '#94a3b8';
        const typeConfig = TYPE_CONFIG[exp.tipo] || TYPE_CONFIG.Recorrente;
        const isPaid = exp.pago;

        return (
          <View key={exp.id} style={{
            backgroundColor: '#0f1629',
            borderWidth: 1, borderColor: isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            borderRadius: 18, overflow: 'hidden',
          }}>
            {/* Left accent bar */}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 3, backgroundColor: catColor, opacity: isPaid ? 0.4 : 1 }} />
              <View style={{ flex: 1, padding: 14, gap: 10 }}>
                {/* Top row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{
                      color: isPaid ? '#475569' : 'white',
                      fontWeight: '700', fontSize: 14,
                      textDecorationLine: isPaid ? 'line-through' : 'none',
                    }}>
                      {exp.descricao}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {/* Category badge */}
                      <View style={{
                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                        backgroundColor: `${catColor}15`,
                        borderWidth: 1, borderColor: `${catColor}30`,
                      }}>
                        <Text style={{ color: catColor, fontSize: 9, fontWeight: '800' }}>
                          {exp.categoria}
                        </Text>
                      </View>
                      {/* Type badge */}
                      <View style={{
                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                        backgroundColor: `${typeConfig.color}10`,
                        borderWidth: 1, borderColor: `${typeConfig.color}25`,
                      }}>
                        <Text style={{ color: typeConfig.color, fontSize: 9, fontWeight: '800' }}>
                          {exp.tipo === 'Parcelada'
                            ? `${exp.parcelaAtual}/${exp.parcelasTotais}x`
                            : typeConfig.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{
                    color: isPaid ? '#475569' : 'white',
                    fontWeight: '900', fontSize: 15,
                    textDecorationLine: isPaid ? 'line-through' : 'none',
                  }}>
                    {formatBRL(exp.valor)}
                  </Text>
                </View>

                {/* Bottom row */}
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10,
                }}>
                  <Text style={{ color: '#475569', fontSize: 10, fontWeight: '600' }}>
                    Vence dia {exp.vencimento}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* Paid toggle */}
                    <TouchableOpacity
                      onPress={() => toggleExpensePaid(exp.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                        backgroundColor: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                        borderWidth: 1,
                        borderColor: isPaid ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)',
                      }}
                    >
                      {isPaid && <Check size={10} color="#10b981" />}
                      <Text style={{
                        fontSize: 10, fontWeight: '800',
                        color: isPaid ? '#10b981' : '#f43f5e',
                      }}>
                        {isPaid ? 'Pago' : 'Pendente'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => startEditExpense(exp)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Pencil size={12} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteExpense(exp.id)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: 'rgba(244,63,94,0.08)',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={12} color="#f43f5e" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const miniLabel: any = {
  color: '#64748b', fontSize: 9, fontWeight: '700',
  letterSpacing: 0.8, textTransform: 'uppercase',
};
