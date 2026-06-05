import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { PiggyBank, X } from 'lucide-react-native';
import { Caixinha } from '../types';

interface CaixinhaFormProps {
  editingCaixinha: Caixinha | null;
  onSubmit: (data: {
    nome: string; valorAtual: number; aporteMensal: number; rendimentoCdiPct: number;
  }) => void;
  onCancel: () => void;
}

export const CaixinhaForm: React.FC<CaixinhaFormProps> = ({ editingCaixinha, onSubmit, onCancel }) => {
  const [cxNome,       setCxNome]       = useState('');
  const [cxValor,      setCxValor]      = useState('');
  const [cxAporte,     setCxAporte]     = useState('');
  const [cxRendimento, setCxRendimento] = useState('100');

  useEffect(() => {
    if (editingCaixinha) {
      setCxNome(editingCaixinha.nome);
      setCxValor(editingCaixinha.valorAtual.toString());
      setCxAporte(editingCaixinha.aporteMensal.toString());
      setCxRendimento(editingCaixinha.rendimentoCdiPct?.toString() || '100');
    } else {
      setCxNome(''); setCxValor(''); setCxAporte(''); setCxRendimento('100');
    }
  }, [editingCaixinha]);

  const handleSubmit = () => {
    if (!cxNome || !cxValor || !cxAporte) return;
    onSubmit({
      nome: cxNome,
      valorAtual: parseFloat(cxValor) || 0,
      aporteMensal: parseFloat(cxAporte) || 0,
      rendimentoCdiPct: parseFloat(cxRendimento) || 100,
    });
  };

  const CDI_PREVIEW = ((parseFloat(cxRendimento) || 100) / 100) * 10.75;

  return (
    <View style={formCard}>
      {/* Header */}
      <View style={formHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(52,211,153,0.1)',
            borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <PiggyBank size={14} color="#34d399" />
          </View>
          <Text style={formTitle}>{editingCaixinha ? 'Editar Caixinha' : 'Nova Caixinha'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtn}>
          <X size={15} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        <View>
          <Text style={fieldLabel}>Nome da Caixinha</Text>
          <TextInput
            value={cxNome} onChangeText={setCxNome}
            placeholder="Ex: Emergência, Viagem..." placeholderTextColor="#334155"
            style={input}
          />
        </View>

        <View>
          <Text style={fieldLabel}>Valor Acumulado Inicial (R$)</Text>
          <TextInput
            value={cxValor} onChangeText={setCxValor}
            keyboardType="numeric" placeholder="0,00" placeholderTextColor="#334155"
            style={input}
          />
        </View>

        <View>
          <Text style={fieldLabel}>Aporte Mensal (R$)</Text>
          <TextInput
            value={cxAporte} onChangeText={setCxAporte}
            keyboardType="numeric" placeholder="Ex: 200" placeholderTextColor="#334155"
            style={input}
          />
        </View>

        <View>
          <Text style={fieldLabel}>Rendimento (% do CDI)</Text>
          <TextInput
            value={cxRendimento} onChangeText={setCxRendimento}
            keyboardType="numeric" placeholder="100" placeholderTextColor="#334155"
            style={input}
          />
          {/* CDI preview */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            marginTop: 8, backgroundColor: 'rgba(52,211,153,0.06)',
            borderWidth: 1, borderColor: 'rgba(52,211,153,0.15)',
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#34d399' }} />
            <Text style={{ color: '#34d399', fontSize: 10, fontWeight: '700' }}>
              {cxRendimento}% CDI = {CDI_PREVIEW.toFixed(2)}% a.a. · CDI atual: ~10,75%
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <TouchableOpacity onPress={onCancel} style={btnSecondary}>
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimary}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingCaixinha ? 'Salvar Alterações' : 'Criar Caixinha'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formCard: any = {
  backgroundColor: '#131b2e',
  borderWidth: 1, borderColor: 'rgba(52,211,153,0.15)',
  borderRadius: 22, padding: 20, gap: 16,
  shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20,
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
  backgroundColor: '#10b981',
  shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 10,
};
