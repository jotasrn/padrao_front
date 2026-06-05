import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  Platform, Animated, Pressable, StatusBar,
} from 'react-native';
import {
  TrendingUp, TrendingDown, Plus, Trash2, PiggyBank,
  Target, Sparkles, PieChart, CalendarDays, RotateCcw,
} from 'lucide-react-native';
import { useVest } from '../hooks/useVest';
import { formatarData } from '../utils/formatters';
import { Expense, Caixinha, Goal } from '../types';

import { SalarySection } from '../components/SalarySection';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { CaixinhaForm } from '../components/CaixinhaForm';
import { CaixinhaCard } from '../components/CaixinhaCard';
import { GoalForm } from '../components/GoalForm';
import { GoalCard } from '../components/GoalCard';
import { ProjectionsSection } from '../components/ProjectionsSection';

type Tab = 'overview' | 'expenses' | 'caixinhas' | 'goals' | 'projections';

const TABS: { key: Tab; label: string; icon: any; color: string }[] = [
  { key: 'overview',     label: 'Geral',     icon: PieChart,      color: '#818cf8' },
  { key: 'expenses',     label: 'Gastos',    icon: TrendingDown,  color: '#f87171' },
  { key: 'caixinhas',   label: 'Caixinhas', icon: PiggyBank,     color: '#34d399' },
  { key: 'goals',        label: 'Metas',     icon: Target,        color: '#fb923c' },
  { key: 'projections',  label: 'Previsões', icon: CalendarDays,  color: '#38bdf8' },
];

export default function VestDashboard() {
  const {
    salary, expenses, caixinhas, goals, aggregates, projections,
    goalPredictions, updateSalary, addExpense, updateExpense, deleteExpense,
    toggleExpensePaid, addCaixinha, updateCaixinha, deleteCaixinha,
    addGoal, updateGoal, deleteGoal, resetToDefault,
  } = useVest();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCaixinha, setShowAddCaixinha] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCaixinha, setEditingCaixinha] = useState<Caixinha | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // FAB pulse animation
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fabPulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(fabGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fabPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(fabGlow, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const showFab = activeTab === 'expenses' || activeTab === 'caixinhas' || activeTab === 'goals';

  const formatBRL = (val: number) =>
    `R$ ${val.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;

  const handleExpenseSubmit = (data: any) => {
    if (editingExpense) { updateExpense({ ...editingExpense, ...data }); setEditingExpense(null); }
    else addExpense({ ...data, pago: false });
    setShowAddExpense(false);
  };

  const handleCaixinhaSubmit = (data: any) => {
    if (editingCaixinha) { updateCaixinha({ ...editingCaixinha, ...data }); setEditingCaixinha(null); }
    else addCaixinha(data);
    setShowAddCaixinha(false);
  };

  const handleGoalSubmit = (data: any) => {
    if (editingGoal) {
      updateGoal({ ...editingGoal, ...data, caixinhaVinculadaId: data.caixinhaVinculadaIds[0] || '' });
      setEditingGoal(null);
    } else {
      addGoal({ ...data, caixinhaVinculadaId: data.caixinhaVinculadaIds[0] || '' });
    }
    setShowAddGoal(false);
  };

  const handleOptimizeAporte = (caixinhaId: string, requiredAporte: number) => {
    const cx = caixinhas.find(c => c.id === caixinhaId);
    if (cx) updateCaixinha({ ...cx, aporteMensal: Math.ceil(requiredAporte) });
  };

  const onFabPress = () => {
    if (activeTab === 'expenses') { setEditingExpense(null); setShowAddExpense(v => !v); }
    if (activeTab === 'caixinhas') { setEditingCaixinha(null); setShowAddCaixinha(v => !v); }
    if (activeTab === 'goals') { setEditingGoal(null); setShowAddGoal(v => !v); }
  };

  const fabOpacity = fabGlow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#080b14' }}>
      <StatusBar barStyle="light-content" backgroundColor="#080b14" />

      {/* ── HEADER ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: '#080b14',
        borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.15)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Logo badge */}
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#6366f1',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#6366f1', shadowOpacity: 0.7, shadowRadius: 12, elevation: 8,
          }}>
            <TrendingUp size={18} color="white" />
          </View>
          <View>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 17, letterSpacing: -0.5 }}>
              vest
            </Text>
            <Text style={{ color: '#6366f1', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: -1 }}>
              FINANCE
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={resetToDefault}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: 'rgba(244,63,94,0.1)',
            borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <RotateCcw size={15} color="#f43f5e" />
        </TouchableOpacity>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <SalarySection salary={salary} aggregates={aggregates} updateSalary={updateSalary} formatBRL={formatBRL} />

        <View style={{ height: 24 }} />

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={{ gap: 16 }}>
            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard label="Patrimônio" value={formatBRL(aggregates.totalSaved)} color="#818cf8" flex />
              <StatCard label="Gastos/mês" value={formatBRL(aggregates.totalExpenses)} color="#f87171" flex />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatCard label="Metas Ativas" value={String(goals.length)} color="#fb923c" flex />
              <StatCard label="Caixinhas" value={String(caixinhas.length)} color="#34d399" flex />
            </View>

            {/* Budget breakdown */}
            <BudgetCard aggregates={aggregates} salary={salary} formatBRL={formatBRL} />

            {/* Quick tips banner */}
            {salary.salario === 0 && (
              <View style={{
                backgroundColor: 'rgba(99,102,241,0.08)',
                borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
                borderRadius: 20, padding: 20,
                flexDirection: 'row', alignItems: 'flex-start', gap: 14,
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: 'rgba(99,102,241,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={20} color="#818cf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
                    👋 Bem-vindo ao vest!
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    Comece cadastrando seu Salário Mensal para analisarmos seu orçamento.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB: EXPENSES */}
        {activeTab === 'expenses' && (
          <View style={{ gap: 16 }}>
            <TabHeader title="Receitas e Despesas" subtitle="Gerencie seus custos mensais." />
            {showAddExpense && (
              <ExpenseForm
                editingExpense={editingExpense}
                onSubmit={handleExpenseSubmit}
                onCancel={() => { setShowAddExpense(false); setEditingExpense(null); }}
              />
            )}
            <ExpenseList
              expenses={expenses} aggregates={aggregates}
              toggleExpensePaid={toggleExpensePaid} deleteExpense={deleteExpense}
              startEditExpense={(exp) => { setEditingExpense(exp); setShowAddExpense(true); }}
              formatBRL={formatBRL}
              onShowAddExpense={() => { setEditingExpense(null); setShowAddExpense(true); }}
            />
          </View>
        )}

        {/* TAB: CAIXINHAS */}
        {activeTab === 'caixinhas' && (
          <View style={{ gap: 16 }}>
            <TabHeader title="Minhas Caixinhas" subtitle="Guarde dinheiro mensalmente com juros." />
            {showAddCaixinha && (
              <CaixinhaForm
                editingCaixinha={editingCaixinha}
                onSubmit={handleCaixinhaSubmit}
                onCancel={() => { setShowAddCaixinha(false); setEditingCaixinha(null); }}
              />
            )}
            {caixinhas.length === 0 ? (
              <EmptyState icon={PiggyBank} message="Nenhuma caixinha criada!" color="#34d399" />
            ) : (
              caixinhas.map((cx) => (
                <CaixinhaCard key={cx.id} cx={cx}
                  onDelete={deleteCaixinha}
                  onEdit={(c) => { setEditingCaixinha(c); setShowAddCaixinha(true); }}
                  formatBRL={formatBRL}
                />
              ))
            )}
          </View>
        )}

        {/* TAB: GOALS */}
        {activeTab === 'goals' && (
          <View style={{ gap: 16 }}>
            <TabHeader title="Metas Financeiras" subtitle="Acompanhe e conquiste seus objetivos." />
            {showAddGoal && (
              <GoalForm
                caixinhas={caixinhas} editingGoal={editingGoal}
                onSubmit={handleGoalSubmit}
                onCancel={() => { setShowAddGoal(false); setEditingGoal(null); }}
                formatBRL={formatBRL}
              />
            )}
            {goalPredictions.length === 0 ? (
              <EmptyState icon={Target} message="Nenhuma meta criada!" color="#fb923c" />
            ) : (
              goalPredictions.map((goal) => (
                <GoalCard key={goal.id} goal={goal} goals={goals}
                  onEdit={(g) => { setEditingGoal(g); setShowAddGoal(true); }}
                  onDelete={deleteGoal} onOptimize={handleOptimizeAporte}
                  formatBRL={formatBRL} formatarData={formatarData}
                />
              ))
            )}
          </View>
        )}

        {/* TAB: PROJECTIONS */}
        {activeTab === 'projections' && (
          <ProjectionsSection
            caixinhas={caixinhas} aggregates={aggregates} projections={projections}
            projectionMonths={projectionMonths} setProjectionMonths={setProjectionMonths}
            formatBRL={formatBRL} onNavigateToCaixinhas={() => setActiveTab('caixinhas')}
          />
        )}
      </ScrollView>

      {/* ── FAB ── */}
      {showFab && (
        <View style={{
          position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 80, right: 24,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Glow ring */}
          <Animated.View style={{
            position: 'absolute',
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: 'rgba(99,102,241,0.35)',
            opacity: fabOpacity,
            transform: [{ scale: fabPulse }],
          }} />
          <Animated.View style={{ transform: [{ scale: fabPulse }] }}>
            <TouchableOpacity
              onPress={onFabPress}
              activeOpacity={0.85}
              style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: '#6366f1',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#6366f1', shadowOpacity: 0.8, shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Plus size={26} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* ── BOTTOM TAB BAR ── */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#0f1629',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        paddingHorizontal: 4,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', gap: 4 }}
            >
              <View style={{
                width: 44, height: 32, borderRadius: 10,
                backgroundColor: isActive ? `${tab.color}20` : 'transparent',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? `${tab.color}40` : 'transparent',
              }}>
                <Icon size={20} color={isActive ? tab.color : '#475569'} />
              </View>
              <Text style={{
                fontSize: 9, fontWeight: isActive ? '800' : '500',
                color: isActive ? tab.color : '#475569',
                letterSpacing: 0.2,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ──

function StatCard({ label, value, color, flex }: { label: string; value: string; color: string; flex?: boolean }) {
  return (
    <View style={{
      flex: flex ? 1 : undefined,
      backgroundColor: '#0f1629',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
      borderRadius: 18, padding: 16,
    }}>
      <View style={{
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: color, marginBottom: 10,
        shadowColor: color, shadowOpacity: 1, shadowRadius: 6,
      }} />
      <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '900', marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function BudgetCard({ aggregates, salary, formatBRL }: any) {
  const salarioBase = salary.salario || 1;
  const expPct = Math.min(100, (aggregates.totalExpenses / salarioBase) * 100);
  const aportePct = Math.min(100, (aggregates.totalAportes / salarioBase) * 100);
  const livreVal = Math.max(0, aggregates.remainingAvailable);
  const livrePct = Math.min(100, (livreVal / salarioBase) * 100);

  return (
    <View style={{
      backgroundColor: '#0f1629',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
      borderRadius: 20, padding: 20, gap: 16,
    }}>
      <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Distribuição do Orçamento</Text>

      {[
        { label: 'Despesas', pct: expPct, val: aggregates.totalExpenses, color: '#f87171' },
        { label: 'Caixinhas', pct: aportePct, val: aggregates.totalAportes, color: '#818cf8' },
        { label: 'Livre', pct: livrePct, val: livreVal, color: '#34d399' },
      ].map(item => (
        <View key={item.label} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700' }}>
              {item.label} ({Math.round(item.pct)}%)
            </Text>
            <Text style={{ color: item.color, fontSize: 11, fontWeight: '800' }}>
              {formatBRL(item.val)}
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 }}>
            <View style={{
              height: 6, width: `${item.pct}%`, borderRadius: 4,
              backgroundColor: item.color,
              shadowColor: item.color, shadowOpacity: 0.6, shadowRadius: 4,
            }} />
          </View>
        </View>
      ))}
    </View>
  );
}

function TabHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={{ color: 'white', fontWeight: '900', fontSize: 20, letterSpacing: -0.3 }}>{title}</Text>
      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
    </View>
  );
}

function EmptyState({ icon: Icon, message, color }: { icon: any; message: string; color: string }) {
  return (
    <View style={{
      backgroundColor: '#0f1629',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
      borderRadius: 20, paddingVertical: 48, alignItems: 'center', gap: 12,
    }}>
      <View style={{
        width: 64, height: 64, borderRadius: 20,
        backgroundColor: `${color}15`,
        borderWidth: 1, borderColor: `${color}30`,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={30} color={color} />
      </View>
      <Text style={{ color: '#475569', fontWeight: '700', fontSize: 14 }}>{message}</Text>
    </View>
  );
}
