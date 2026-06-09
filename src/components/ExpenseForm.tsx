import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { TrendingDown, X } from 'lucide-react-native';
import { Expense } from '../types';
import { useApp } from '../context/AppProvider';
import { aplicarMascaraMoeda, formatarMoeda, desformatarMoeda } from '../utils/formatters';

interface ExpenseFormProps {
  editingExpense: Expense | null;
  onSubmit: (data: {
    descricao: string; valor: number; categoria: Expense['categoria'];
    vencimento: number; tipo: Expense['tipo'];
    parcelasTotais?: number; parcelaAtual?: number;
    pago: boolean;
  }) => void;
  onCancel: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Moradia: '#38bdf8', Alimentação: '#fb923c', Transporte: '#a78bfa',
  Saúde: '#34d399', Educação: '#f472b6', Outros: '#94a3b8',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingExpense, onSubmit, onCancel }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#131b2e' : '#ffffff';
  const cardBorder = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.35)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const headerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const placeholderColor = isDark ? '#334155' : '#94a3b8';
  const parcelasBg = isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)';
  const parcelasBorder = isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.25)';

  const [expDesc, setExpDesc] = useState('');
  const [expVal,  setExpVal]  = useState('');
  const [expCat,  setExpCat]  = useState<Expense['categoria']>('Moradia');
  const [expDay,  setExpDay]  = useState('5');
  const [expTipo, setExpTipo] = useState<Expense['tipo']>('Recorrente');
  const [expParcelasTotais, setExpParcelasTotais] = useState('12');
  const [expParcelaAtual,   setExpParcelaAtual]   = useState('1');
  const [expPago, setExpPago] = useState(false);

  const categories: Expense['categoria'][] = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Outros'];
  const types: Expense['tipo'][] = ['Recorrente', 'Única', 'Parcelada'];

  useEffect(() => {
    if (editingExpense) {
      setExpDesc(editingExpense.descricao);
      setExpVal(formatarMoeda(editingExpense.valor));
      setExpCat(editingExpense.categoria);
      setExpDay(editingExpense.vencimento.toString());
      setExpTipo(editingExpense.tipo || 'Recorrente');
      setExpParcelasTotais(editingExpense.parcelasTotais?.toString() || '12');
      setExpParcelaAtual(editingExpense.parcelaAtual?.toString() || '1');
      setExpPago(editingExpense.pago || false);
    } else {
      setExpDesc(''); setExpVal(''); setExpCat('Moradia');
      setExpDay('5'); setExpTipo('Recorrente');
      setExpParcelasTotais('12'); setExpParcelaAtual('1');
      setExpPago(false);
    }
  }, [editingExpense]);

  const handleSubmit = () => {
    if (!expDesc || !expVal) return;
    onSubmit({
      descricao: expDesc, valor: desformatarMoeda(expVal),
      categoria: expCat, vencimento: parseInt(expDay) || 5, tipo: expTipo,
      parcelasTotais: expTipo === 'Parcelada' ? parseInt(expParcelasTotais) || 12 : undefined,
      parcelaAtual:   expTipo === 'Parcelada' ? parseInt(expParcelaAtual)   || 1  : undefined,
      pago: expPago,
    });
  };

  const formCardStyle = {
    backgroundColor: cardBg,
    borderWidth: 1, borderColor: cardBorder,
    borderRadius: 22, padding: 20, gap: 16,
    shadowColor: '#6366f1', shadowOpacity: isDark ? 0.15 : 0.05, shadowRadius: 20,
  };
  const formHeaderStyle = {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: headerBorder, paddingBottom: 14,
  };
  const formTitleStyle = { color: textPrimary, fontWeight: '800', fontSize: 15 };
  const closeBtnStyle = {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: closeBtnBg,
    alignItems: 'center', justifyContent: 'center',
  };
  const fieldLabelStyle = {
    color: textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  };
  const inputStyle = {
    backgroundColor: inputBg,
    borderWidth: 1, borderColor: inputBorder,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    color: textPrimary, fontSize: 14, fontWeight: '500',
  };
  const btnSecondaryStyle = {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: btnSecondaryBg,
    borderWidth: 1, borderColor: btnSecondaryBorder,
  };
  const btnPrimaryStyle = {
    flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1', shadowOpacity: 0.5, shadowRadius: 10,
  };

  return (
    <View style={formCardStyle as any}>
      {/* Header */}
      <View style={formHeaderStyle as any}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(248,113,113,0.1)',
            borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingDown size={14} color="#f87171" />
          </View>
          <Text style={formTitleStyle as any}>{editingExpense ? 'Editar Gasto' : 'Novo Gasto'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtnStyle as any}>
          <X size={15} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        {/* Descrição */}
        <View>
          <Text style={fieldLabelStyle as any}>Descrição</Text>
          <TextInput
            value={expDesc} onChangeText={setExpDesc}
            placeholder="Ex: Conta de Luz, Netflix..." placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        {/* Valor */}
        <View>
          <Text style={fieldLabelStyle as any}>Valor (R$)</Text>
          <TextInput
            value={expVal} onChangeText={(text) => setExpVal(aplicarMascaraMoeda(text))}
            keyboardType="numeric" placeholder="0,00" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        {/* Categoria */}
        <View>
          <Text style={fieldLabelStyle as any}>Categoria</Text>
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
                      backgroundColor: isActive ? `${color}20` : inputBg,
                      borderWidth: 1, borderColor: isActive ? `${color}60` : inputBorder,
                    }}
                  >
                    <Text style={{ color: isActive ? color : textSecondary, fontSize: 12, fontWeight: '700' }}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Dia vencimento */}
        <View>
          <Text style={fieldLabelStyle as any}>Dia de Vencimento</Text>
          <TextInput
            value={expDay} onChangeText={setExpDay}
            keyboardType="numeric" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        {/* Status de Pagamento */}
        <View>
          <Text style={fieldLabelStyle as any}>Status do Gasto</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setExpPago(false)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                backgroundColor: !expPago ? 'rgba(244,63,94,0.1)' : inputBg,
                borderWidth: 1, borderColor: !expPago ? 'rgba(244,63,94,0.3)' : inputBorder,
              }}
            >
              <Text style={{ color: !expPago ? '#f43f5e' : textSecondary, fontSize: 12, fontWeight: '700' }}>Pendente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setExpPago(true)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                backgroundColor: expPago ? 'rgba(16,185,129,0.1)' : inputBg,
                borderWidth: 1, borderColor: expPago ? 'rgba(16,185,129,0.3)' : inputBorder,
              }}
            >
              <Text style={{ color: expPago ? '#10b981' : textSecondary, fontSize: 12, fontWeight: '700' }}>Pago</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipo */}
        <View>
          <Text style={fieldLabelStyle as any}>Frequência</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {types.map((t) => {
              const isActive = expTipo === t;
              return (
                <TouchableOpacity
                  key={t} onPress={() => setExpTipo(t)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : inputBg,
                    borderWidth: 1, borderColor: isActive ? 'rgba(99,102,241,0.4)' : inputBorder,
                  }}
                >
                  <Text style={{ color: isActive ? '#818cf8' : textSecondary, fontSize: 12, fontWeight: '700' }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Parcelas */}
        {expTipo === 'Parcelada' && (
          <View style={{
            backgroundColor: parcelasBg,
            borderWidth: 1, borderColor: parcelasBorder,
            borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabelStyle as any}>Total Parcelas</Text>
              <TextInput
                value={expParcelasTotais} onChangeText={setExpParcelasTotais}
                keyboardType="numeric" style={inputStyle as any}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={fieldLabelStyle as any}>Parcela Atual</Text>
              <TextInput
                value={expParcelaAtual} onChangeText={setExpParcelaAtual}
                keyboardType="numeric" style={inputStyle as any}
              />
            </View>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity onPress={onCancel} style={btnSecondaryStyle as any}>
          <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimaryStyle as any}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingExpense ? 'Salvar Alterações' : 'Salvar Gasto'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
