import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { TrendingDown, X } from 'lucide-react-native';
import { Expense } from '../types';

interface ExpenseFormProps {
  editingExpense: Expense | null;
  onSubmit: (data: {
    descricao: string; valor: number; categoria: Expense['categoria'];
    vencimento: number; tipo: Expense['tipo'];
    parcelasTotais?: number; parcelaAtual?: number;
  }) => void;
  onCancel: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#38bdf8', Alimentação: '#fb923c', Transporte: '#a78bfa',
  Saúde: '#34d399', Educação: '#f472b6', Outros: '#94a3b8',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingExpense, onSubmit, onCancel }) => {
  const [expDesc, setExpDesc] = useState('');
  const [expVal,  setExpVal]  = useState('');
  const [expCat,  setExpCat]  = useState<Expense['categoria']>('Moradia');
  const [expDay,  setExpDay]  = useState('5');
  const [expTipo, setExpTipo] = useState<Expense['tipo']>('Recorrente');
  const [expParcelasTotais, setExpParcelasTotais] = useState('12');
  const [expParcelaAtual,   setExpParcelaAtual]   = useState('1');

  const categories: Expense['categoria'][] = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Outros'];
  const types: Expense['tipo'][] = ['Recorrente', 'Única', 'Parcelada'];

  useEffect(() => {
    if (editingExpense) {
      setExpDesc(editingExpense.descricao);
      setExpVal(editingExpense.valor.toString());
      setExpCat(editingExpense.categoria);
      setExpDay(editingExpense.vencimento.toString());
      setExpTipo(editingExpense.tipo || 'Recorrente');
      setExpParcelasTotais(editingExpense.parcelasTotais?.toString() || '12');
      setExpParcelaAtual(editingExpense.parcelaAtual?.toString() || '1');
    } else {
      setExpDesc(''); setExpVal(''); setExpCat('Moradia');
      setExpDay('5'); setExpTipo('Recorrente');
      setExpParcelasTotais('12'); setExpParcelaAtual('1');
    }
  }, [editingExpense]);

  const handleSubmit = () => {
    if (!expDesc || !expVal) return;
    onSubmit({
      descricao: expDesc, valor: parseFloat(expVal) || 0,
      categoria: expCat, vencimento: parseInt(expDay) || 5, tipo: expTipo,
      parcelasTotais: expTipo === 'Parcelada' ? parseInt(expParcelasTotais) || 12 : undefined,
      parcelaAtual:   expTipo === 'Parcelada' ? parseInt(expParcelaAtual)   || 1  : undefined,
    });
  };

  return (
    <View style={formCard}>
      {/* Header */}
      <View style={formHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(248,113,113,0.1)',
            borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingDown size={14} color="#f87171" />
          </View>
          <Text style={formTitle}>{editingExpense ? 'Editar Gasto' : 'Novo Gasto'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtn}>
          <X size={15} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        {/* Descrição */}
        <View>
          <Text style={fieldLabel}>Descrição</Text>
          <TextInput
            value={expDesc} onChangeText={setExpDesc}
            placeholder="Ex: Conta de Luz, Netflix..." placeholderTextColor="#334155"
            style={input}
          />
        </View>

        {/* Valor */}
        <View>
          <Text style={fieldLabel}>Valor (R$)</Text>
          <TextInput
            value={expVal} onChangeText={setExpVal}
            keyboardType="numeric" placeholder="0,00" placeholderTextColor="#334155"
            style={input}
          />
        </View>

        {/* Categoria */}
        <View>
          <Text style={fieldLabel}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, paddingVertical: 2 }}>
              {categories.map((c) => {
                const isActive = expCat === c;
                const color = CATEGORY_COLORS[c];
                return (
                  <TouchableOpacity
                    key={c} onPress={() => setExpCat(c)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                      backgroundColor: isActive ? `${color}20` : 'rgba(255,255,255,0.04)',
                      borderWidth: 1, borderColor: isActive ? `${color}60` : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{ color: isActive ? color : '#475569', fontSize: 12, fontWeight: '700' }}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Dia vencimento */}
        <View>
          <Text style={fieldLabel}>Dia de Vencimento</Text>
          <TextInput
            value={expDay} onChangeText={setExpDay}
            keyboardType="numeric" placeholderTextColor="#334155"
            style={input}
          />
        </View>

        {/* Tipo */}
        <View>
          <Text style={fieldLabel}>Frequência</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {types.map((t) => {
              const isActive = expTipo === t;
              return (
                <TouchableOpacity
                  key={t} onPress={() => setExpTipo(t)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    borderWidth: 1, borderColor: isActive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: isActive ? '#818cf8' : '#475569', fontSize: 12, fontWeight: '700' }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Parcelas */}
        {expTipo === 'Parcelada' && (
          <View style={{
            backgroundColor: 'rgba(245,158,11,0.06)',
            borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
            borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabel}>Total Parcelas</Text>
              <TextInput
                value={expParcelasTotais} onChangeText={setExpParcelasTotais}
                keyboardType="numeric" style={input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabel}>Parcela Atual</Text>
              <TextInput
                value={expParcelaAtual} onChangeText={setExpParcelaAtual}
                keyboardType="numeric" style={input}
              />
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity onPress={onCancel} style={btnSecondary}>
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimary}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingExpense ? 'Salvar Alterações' : 'Salvar Gasto'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Shared styles
const formCard: any = {
  backgroundColor: '#131b2e',
  borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
  borderRadius: 22, padding: 20, gap: 16,
  shadowColor: '#6366f1', shadowOpacity: 0.15, shadowRadius: 20,
};
const formHeader: any = {
  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 14,
};
const formTitle: any = { color: 'white', fontWeight: '800', fontSize: 15 };
const closeBtn: any = {
  width: 30, height: 30, borderRadius: 8,
  backgroundColor: 'rgba(255,255,255,0.05)',
  alignItems: 'center', justifyContent: 'center',
};
const fieldLabel: any = {
  color: '#64748b', fontSize: 10, fontWeight: '700',
  letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
};
const input: any = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
  color: 'white', fontSize: 14, fontWeight: '500',
};
const btnSecondary: any = {
  flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
};
const btnPrimary: any = {
  flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  backgroundColor: '#6366f1',
  shadowColor: '#6366f1', shadowOpacity: 0.5, shadowRadius: 10,
};
