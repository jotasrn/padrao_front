import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  Platform, Animated, Pressable, StatusBar, Share, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import {
  TrendingUp, TrendingDown, Plus, Trash2, PiggyBank,
  Target, Sparkles, PieChart, CalendarDays, RotateCcw, Download, Eye, EyeOff
} from 'lucide-react-native';
import { useVest } from '../hooks/useVest';
import { useAuthStore } from '../store/useAuthStore';
import { useApp } from '../context/AppProvider';
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
    addGoal, updateGoal, deleteGoal, resetToDefault, isLoading,
  } = useVest();

  const { privacidadeAtiva, togglePrivacidade } = useAuthStore();
  const { theme, toggleTheme } = useApp();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#080b14' : '#f8fafc';
  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#475569' : '#94a3b8';
  const borderLight = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)';

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
    privacidadeAtiva
      ? 'R$ ••••'
      : `R$ ${val.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;

  const handleExportCSV = async () => {
    try {
      let csv = '\uFEFF';
      csv += 'Categoria,Nome,Valor,Pago/Meta,Detalhes\n';
      csv += `Receita,Salário Mensal,${salary.salario},Recebido no dia ${salary.diaRecebimento},\n`;
      
      expenses.forEach(exp => {
        csv += `Despesa,${exp.descricao.replace(/,/g, ' ')},${exp.valor},${exp.pago ? 'Pago' : 'Pendente'},Vence dia ${exp.diaVencimento}\n`;
      });
      
      caixinhas.forEach(cx => {
        csv += `Caixinha,${cx.nome.replace(/,/g, ' ')},${cx.saldo},Aporte ${cx.aporteMensal},Rendimento ${cx.taxaRendimento}%/ano\n`;
      });
      
      goals.forEach(g => {
        csv += `Meta,${g.nome.replace(/,/g, ' ')},${g.valorObjetivo},Prazo ${g.prazoMeses} meses,\n`;
      });

      await Share.share({
        message: csv,
        title: 'Vest Finance Export.csv'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados em CSV.');
    }
  };

  const handleImportText = (text: string) => {
    if (!text.trim()) return;
    
    const moneyRegex = /(?:R\$|r\$)\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)|([0-9]+,[0-9]{2})/i;
    const match = text.match(moneyRegex);
    
    let parsedValue = 0;
    if (match) {
      const valueStr = (match[1] || match[2])
        .replace(/\./g, '')
        .replace(',', '.');
      parsedValue = parseFloat(valueStr) || 0;
    }
    
    let description = 'Gasto Importado';
    if (text.toLowerCase().includes('pix')) {
      description = 'Transação Pix';
    } else if (text.toLowerCase().includes('compra') || text.toLowerCase().includes('aprovada')) {
      description = 'Compra Cartão';
    }
    
    setEditingExpense({
      id: '',
      descricao: description,
      valor: parsedValue,
      diaVencimento: new Date().getDate(),
      pago: false
    } as any);
    setShowAddExpense(true);
  };

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

  const handleExportData = async () => {
    const exportData = { salary, expenses, caixinhas, goals };
    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: 'Vest Finance Backup'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    }
  };

  const fabOpacity = fabGlow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />

      {/* ── HEADER ── */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: bgColor,
        borderBottomWidth: 1, borderBottomColor: borderLight,
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
            <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 17, letterSpacing: -0.5 }}>
              vest
            </Text>
            <Text style={{ color: '#6366f1', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: -1 }}>
              FINANCE
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: isDark ? 'rgba(251,146,60,0.1)' : 'rgba(99,102,241,0.1)',
              borderWidth: 1, borderColor: isDark ? 'rgba(251,146,60,0.2)' : 'rgba(99,102,241,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isDark ? <Sun size={15} color="#fb923c" /> : <Moon size={15} color="#6366f1" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePrivacidade}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: privacidadeAtiva ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              borderWidth: 1, borderColor: privacidadeAtiva ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {privacidadeAtiva ? <EyeOff size={15} color="#ef4444" /> : <Eye size={15} color="#10b981" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportCSV}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(56,189,248,0.1)',
              borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Download size={15} color="#38bdf8" />
          </TouchableOpacity>
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
            
            {/* PIX/SMS Fast Import Box */}
            <View style={{
              backgroundColor: '#0f1629',
              borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
              borderRadius: 18, padding: 14, gap: 10,
            }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Importação Rápida PIX / SMS</Text>
              <Text style={{ color: '#64748b', fontSize: 11 }}>Cole a mensagem de texto ou PIX recebida para preencher automaticamente.</Text>
              <TextInput
                placeholder="Cole aqui. Ex: Compra de R$ 45,90 aprovada..."
                placeholderTextColor="#475569"
                onChangeText={(val) => {
                  if (val.length > 10) {
                    handleImportText(val);
                  }
                }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
                  color: 'white', fontSize: 12,
                }}
              />
            </View>

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
        backgroundColor: isDark ? '#0f1629' : '#ffffff',
        borderTopWidth: 1, borderTopColor: cardBorder,
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
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';

  return (
    <View style={{
      flex: flex ? 1 : undefined,
      backgroundColor: cardBg,
      borderWidth: 1, borderColor: cardBorder,
      borderRadius: 18, padding: 16,
    }}>
      <View style={{
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: color, marginBottom: 10,
        shadowColor: color, shadowOpacity: 1, shadowRadius: 6,
      }} />
      <Text style={{ color: textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '900', marginTop: 4 }}>
        {value}
      </Text>
    </View>
  );
}

function BudgetCard({ aggregates, salary, formatBRL }: any) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#ffffff' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';

  const salarioBase = salary.salario || 1;
  const totalVal = aggregates.totalExpenses + aggregates.totalAportes + Math.max(0, aggregates.remainingAvailable);
  const total = totalVal || 1;

  const expPct = (aggregates.totalExpenses / total) * 100;
  const aportePct = (aggregates.totalAportes / total) * 100;
  const livreVal = Math.max(0, aggregates.remainingAvailable);
  const livrePct = (livreVal / total) * 100;

  const circumference = 251.3;
  const r = 40;
  
  const strokeDash1 = (expPct / 100) * circumference;
  const strokeDash2 = (aportePct / 100) * circumference;
  const strokeDash3 = (livrePct / 100) * circumference;
  
  const offset1 = 0;
  const offset2 = -strokeDash1;
  const offset3 = -(strokeDash1 + strokeDash2);

  return (
    <View style={{
      backgroundColor: cardBg,
      borderWidth: 1, borderColor: cardBorder,
      borderRadius: 20, padding: 20, gap: 16,
    }}>
      <Text style={{ color: textPrimary, fontWeight: '800', fontSize: 15 }}>Distribuição do Orçamento</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        {/* Donut Chart */}
        <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <G rotation="-90" origin="50, 50">
              <Circle cx="50" cy="50" r={r} stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="8" fill="none" />
              {totalVal === 0 ? (
                <Circle cx="50" cy="50" r={r} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="8" fill="none" />
              ) : (
                <>
                  {strokeDash1 > 0 && (
                    <Circle cx="50" cy="50" r={r} stroke="#f87171" strokeWidth="8"
                      strokeDasharray={`${strokeDash1} ${circumference}`}
                      strokeDashoffset={offset1} strokeLinecap="round" fill="none" />
                  )}
                  {strokeDash2 > 0 && (
                    <Circle cx="50" cy="50" r={r} stroke="#818cf8" strokeWidth="8"
                      strokeDasharray={`${strokeDash2} ${circumference}`}
                      strokeDashoffset={offset2} strokeLinecap="round" fill="none" />
                  )}
                  {strokeDash3 > 0 && (
                    <Circle cx="50" cy="50" r={r} stroke="#34d399" strokeWidth="8"
                      strokeDasharray={`${strokeDash3} ${circumference}`}
                      strokeDashoffset={offset3} strokeLinecap="round" fill="none" />
                  )}
                </>
              )}
            </G>
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ color: textSecondary, fontSize: 7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</Text>
            <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '900', marginTop: 1 }}>{formatBRL(totalVal)}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={{ flex: 1, gap: 10 }}>
          {[
            { label: 'Despesas', pct: (aggregates.totalExpenses / salarioBase) * 100, val: aggregates.totalExpenses, color: '#f87171' },
            { label: 'Caixinhas', pct: (aggregates.totalAportes / salarioBase) * 100, val: aggregates.totalAportes, color: '#818cf8' },
            { label: 'Livre', pct: (livreVal / salarioBase) * 100, val: livreVal, color: '#34d399' },
          ].map(item => (
            <View key={item.label} style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                  <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700' }}>{item.label}</Text>
                </View>
                <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '800' }}>{formatBRL(item.val)}</Text>
              </View>
              <Text style={{ color: isDark ? '#475569' : '#94a3b8', fontSize: 10, marginLeft: 14 }}>{Math.round(item.pct)}% do salário</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function TabHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';

  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 20, letterSpacing: -0.3 }}>{title}</Text>
      <Text style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
    </View>
  );
}

function EmptyState({ icon: Icon, message, color }: { icon: any; message: string; color: string }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textMuted = isDark ? '#475569' : '#94a3b8';

  return (
    <View style={{
      backgroundColor: cardBg,
      borderWidth: 1, borderColor: cardBorder,
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
      <Text style={{ color: textMuted, fontWeight: '700', fontSize: 14 }}>{message}</Text>
    </View>
  );
}
