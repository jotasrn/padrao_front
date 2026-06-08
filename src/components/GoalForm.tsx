import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Target, X, Check } from 'lucide-react-native';
import { Goal, Caixinha } from '../types';
import { useApp } from '../context/AppProvider';

interface GoalFormProps {
  caixinhas: Caixinha[];
  editingGoal: Goal | null;
  onSubmit: (data: {
    nome: string; valorObjetivo: number; dataAlvo: string;
    caixinhaVinculadaIds: string[]; aporteSalarioDireto: number; descricao?: string;
  }) => void;
  onCancel: () => void;
  formatBRL: (val: number) => string;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  caixinhas, editingGoal, onSubmit, onCancel, formatBRL,
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#131b2e' : '#ffffff';
  const cardBorder = isDark ? 'rgba(251,146,60,0.15)' : 'rgba(251,146,60,0.3)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const headerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const placeholderColor = isDark ? '#334155' : '#94a3b8';
  const checkboxBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const checkboxBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

  const [gNome,               setGNome]               = useState('');
  const [gValor,              setGValor]              = useState('');
  const [gData,               setGData]               = useState('2026-12');
  const [gCaixinhaIds,        setGCaixinhaIds]        = useState<string[]>([]);
  const [gAporteSalarioDireto, setGAporteSalarioDireto] = useState('');
  const [gDesc,               setGDesc]               = useState('');

  useEffect(() => {
    if (editingGoal) {
      setGNome(editingGoal.nome);
      setGValor(editingGoal.valorObjetivo.toString());
      setGData(editingGoal.dataAlvo);
      setGCaixinhaIds(editingGoal.caixinhaVinculadaIds || []);
      setGAporteSalarioDireto(editingGoal.aporteSalarioDireto?.toString() || '');
      setGDesc(editingGoal.descricao || '');
    } else {
      setGNome(''); setGValor(''); setGData('2026-12');
      setGCaixinhaIds([]); setGAporteSalarioDireto(''); setGDesc('');
    }
  }, [editingGoal]);

  const handleSubmit = () => {
    if (!gNome || !gValor || !gData) return;
    onSubmit({
      nome: gNome, valorObjetivo: parseFloat(gValor) || 0,
      dataAlvo: gData, caixinhaVinculadaIds: gCaixinhaIds,
      aporteSalarioDireto: parseFloat(gAporteSalarioDireto) || 0,
      descricao: gDesc,
    });
  };

  const toggleCaixinha = (id: string) =>
    setGCaixinhaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const formCardStyle = {
    backgroundColor: cardBg,
    borderWidth: 1, borderColor: cardBorder,
    borderRadius: 22, padding: 20, gap: 16,
    shadowColor: '#fb923c', shadowOpacity: isDark ? 0.1 : 0.05, shadowRadius: 20,
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
    backgroundColor: '#fb923c',
    shadowColor: '#fb923c', shadowOpacity: 0.5, shadowRadius: 10,
  };

  return (
    <View style={formCardStyle as any}>
      {/* Header */}
      <View style={formHeaderStyle as any}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(251,146,60,0.1)',
            borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={14} color="#fb923c" />
          </View>
          <Text style={formTitleStyle}>{editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtnStyle}>
          <X size={15} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        <View>
          <Text style={fieldLabelStyle}>Nome do Objetivo</Text>
          <TextInput
            value={gNome} onChangeText={setGNome}
            placeholder="Ex: Comprar Notebook..." placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabelStyle}>Valor da Meta (R$)</Text>
            <TextInput
              value={gValor} onChangeText={setGValor}
              keyboardType="numeric" placeholder="0,00" placeholderTextColor={placeholderColor}
              style={inputStyle as any}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabelStyle}>Mês Alvo</Text>
            <TextInput
              value={gData} onChangeText={setGData}
              placeholder="YYYY-MM" placeholderTextColor={placeholderColor}
              style={inputStyle as any}
            />
          </View>
        </View>

        <View>
          <Text style={fieldLabelStyle}>Aporte Direto do Salário (R$)</Text>
          <TextInput
            value={gAporteSalarioDireto} onChangeText={setGAporteSalarioDireto}
            keyboardType="numeric" placeholder="0,00 (além das caixinhas)" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        {/* Caixinhas selector */}
        <View>
          <Text style={fieldLabelStyle}>Vincular Caixinhas</Text>
          {caixinhas.length === 0 ? (
            <View style={{
              backgroundColor: 'rgba(245,158,11,0.06)',
              borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
              borderRadius: 12, padding: 12,
            }}>
              <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '600', lineHeight: 16 }}>
                ⚠ Nenhuma caixinha criada ainda. Crie uma na aba "Caixinhas" para vincular.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {caixinhas.map(cx => {
                const isSelected = gCaixinhaIds.includes(cx.id);
                return (
                  <TouchableOpacity
                    key={cx.id}
                    onPress={() => toggleCaixinha(cx.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.12)' : inputBg,
                      borderWidth: 1, borderColor: isSelected ? 'rgba(99,102,241,0.4)' : inputBorder,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 6,
                        backgroundColor: isSelected ? '#6366f1' : checkboxBg,
                        borderWidth: 1, borderColor: isSelected ? '#6366f1' : checkboxBorder,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={11} color="white" />}
                      </View>
                      <Text style={{ color: isSelected ? textPrimary : textSecondary, fontWeight: '700', fontSize: 13 }}>
                        {cx.nome}
                      </Text>
                    </View>
                    <Text style={{ color: isSelected ? '#818cf8' : textSecondary, fontSize: 11, fontWeight: '800' }}>
                      {formatBRL(cx.valorAtual)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View>
          <Text style={fieldLabelStyle}>Descrição (opcional)</Text>
          <TextInput
            value={gDesc} onChangeText={setGDesc}
            placeholder="Uma nota para se motivar..." placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity onPress={onCancel} style={btnSecondaryStyle}>
          <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimaryStyle}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingGoal ? 'Salvar Alterações' : 'Salvar Objetivo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
