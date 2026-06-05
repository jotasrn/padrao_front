import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Target, X, Check } from 'lucide-react-native';
import { Goal, Caixinha } from '../types';

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

  return (
    <View style={formCard}>
      {/* Header */}
      <View style={formHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(251,146,60,0.1)',
            borderWidth: 1, borderColor: 'rgba(251,146,60,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={14} color="#fb923c" />
          </View>
          <Text style={formTitle}>{editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtn}>
          <X size={15} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        <View>
          <Text style={fieldLabel}>Nome do Objetivo</Text>
          <TextInput
            value={gNome} onChangeText={setGNome}
            placeholder="Ex: Comprar Notebook..." placeholderTextColor="#334155"
            style={input}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabel}>Valor da Meta (R$)</Text>
            <TextInput
              value={gValor} onChangeText={setGValor}
              keyboardType="numeric" placeholder="0,00" placeholderTextColor="#334155"
              style={input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fieldLabel}>Mês Alvo</Text>
            <TextInput
              value={gData} onChangeText={setGData}
              placeholder="YYYY-MM" placeholderTextColor="#334155"
              style={input}
            />
          </View>
        </View>

        <View>
          <Text style={fieldLabel}>Aporte Direto do Salário (R$)</Text>
          <TextInput
            value={gAporteSalarioDireto} onChangeText={setGAporteSalarioDireto}
            keyboardType="numeric" placeholder="0,00 (além das caixinhas)" placeholderTextColor="#334155"
            style={input}
          />
        </View>

        {/* Caixinhas selector */}
        <View>
          <Text style={fieldLabel}>Vincular Caixinhas</Text>
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
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      borderWidth: 1, borderColor: isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 6,
                        backgroundColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.05)',
                        borderWidth: 1, borderColor: isSelected ? '#6366f1' : 'rgba(255,255,255,0.15)',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={11} color="white" />}
                      </View>
                      <Text style={{ color: isSelected ? 'white' : '#64748b', fontWeight: '700', fontSize: 13 }}>
                        {cx.nome}
                      </Text>
                    </View>
                    <Text style={{ color: isSelected ? '#818cf8' : '#475569', fontSize: 11, fontWeight: '800' }}>
                      {formatBRL(cx.valorAtual)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View>
          <Text style={fieldLabel}>Descrição (opcional)</Text>
          <TextInput
            value={gDesc} onChangeText={setGDesc}
            placeholder="Uma nota para se motivar..." placeholderTextColor="#334155"
            style={input}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity onPress={onCancel} style={btnSecondary}>
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimary}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingGoal ? 'Salvar Alterações' : 'Salvar Objetivo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formCard: any = {
  backgroundColor: '#131b2e',
  borderWidth: 1, borderColor: 'rgba(251,146,60,0.15)',
  borderRadius: 22, padding: 20, gap: 16,
  shadowColor: '#fb923c', shadowOpacity: 0.1, shadowRadius: 20,
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
  backgroundColor: '#fb923c',
  shadowColor: '#fb923c', shadowOpacity: 0.5, shadowRadius: 10,
};
