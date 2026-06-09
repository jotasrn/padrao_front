import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { PiggyBank, X } from 'lucide-react-native';
import { Caixinha } from '../types';
import { useApp } from '../context/AppProvider';
import { aplicarMascaraMoeda, formatarMoeda, desformatarMoeda } from '../utils/formatters';

interface CaixinhaFormProps {
  editingCaixinha: Caixinha | null;
  onSubmit: (data: {
    nome: string; valorAtual: number; aporteMensal: number; rendimentoCdiPct: number;
  }) => void;
  onCancel: () => void;
}

export const CaixinhaForm: React.FC<CaixinhaFormProps> = ({ editingCaixinha, onSubmit, onCancel }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#131b2e' : '#ffffff';
  const cardBorder = isDark ? 'rgba(52,211,153,0.15)' : 'rgba(52,211,153,0.3)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const headerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const btnSecondaryBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const placeholderColor = isDark ? '#334155' : '#94a3b8';

  const [cxNome,       setCxNome]       = useState('');
  const [cxValor,      setCxValor]      = useState('');
  const [cxAporte,     setCxAporte]     = useState('');
  const [cxRendimento, setCxRendimento] = useState('100');

  useEffect(() => {
    if (editingCaixinha) {
      setCxNome(editingCaixinha.nome);
      setCxValor(formatarMoeda(editingCaixinha.valorAtual));
      setCxAporte(formatarMoeda(editingCaixinha.aporteMensal));
      setCxRendimento(editingCaixinha.rendimentoCdiPct?.toString() || '100');
    } else {
      setCxNome(''); setCxValor(''); setCxAporte(''); setCxRendimento('100');
    }
  }, [editingCaixinha]);

  const handleSubmit = () => {
    if (!cxNome || !cxValor || !cxAporte) return;
    onSubmit({
      nome: cxNome,
      valorAtual: desformatarMoeda(cxValor),
      aporteMensal: desformatarMoeda(cxAporte),
      rendimentoCdiPct: parseFloat(cxRendimento) || 100,
    });
  };

  const CDI_PREVIEW = ((parseFloat(cxRendimento) || 100) / 100) * 10.75;

  const formCardStyle = {
    backgroundColor: cardBg,
    borderWidth: 1, borderColor: cardBorder,
    borderRadius: 22, padding: 20, gap: 16,
    shadowColor: '#10b981', shadowOpacity: isDark ? 0.1 : 0.05, shadowRadius: 20,
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
    backgroundColor: '#10b981',
    shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 10,
  };

  return (
    <View style={formCardStyle as any}>
      {/* Header */}
      <View style={formHeaderStyle as any}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9,
            backgroundColor: 'rgba(52,211,153,0.1)',
            borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <PiggyBank size={14} color="#34d399" />
          </View>
          <Text style={formTitleStyle as any}>{editingCaixinha ? 'Editar Caixinha' : 'Nova Caixinha'}</Text>
        </View>
        <TouchableOpacity onPress={onCancel} style={closeBtnStyle as any}>
          <X size={15} color={textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: 14 }}>
        <View>
          <Text style={fieldLabelStyle as any}>{fieldLabelStyle.letterSpacing ? 'Nome da Caixinha' : 'Nome'}</Text>
          <TextInput
            value={cxNome} onChangeText={setCxNome}
            placeholder="Ex: Emergência, Viagem..." placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        <View>
          <Text style={fieldLabelStyle as any}>Valor Acumulado Inicial (R$)</Text>
          <TextInput
            value={cxValor} onChangeText={(text) => setCxValor(aplicarMascaraMoeda(text))}
            keyboardType="numeric" placeholder="0,00" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        <View>
          <Text style={fieldLabelStyle as any}>Aporte Mensal (R$)</Text>
          <TextInput
            value={cxAporte} onChangeText={(text) => setCxAporte(aplicarMascaraMoeda(text))}
            keyboardType="numeric" placeholder="Ex: 200,00" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
          />
        </View>

        <View>
          <Text style={fieldLabelStyle as any}>Rendimento (% do CDI)</Text>
          <TextInput
            value={cxRendimento} onChangeText={setCxRendimento}
            keyboardType="numeric" placeholder="100" placeholderTextColor={placeholderColor}
            style={inputStyle as any}
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
        <TouchableOpacity onPress={onCancel} style={btnSecondaryStyle as any}>
          <Text style={{ color: textSecondary, fontWeight: '700', fontSize: 13 }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={btnPrimaryStyle as any}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
            {editingCaixinha ? 'Salvar Alterações' : 'Criar Caixinha'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
