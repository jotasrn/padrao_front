import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { DollarSign, Check, X, Edit3 } from 'lucide-react-native';
import { Salary, Aggregates } from '../types';
import { useApp } from '../context/AppProvider';

interface SalarySectionProps {
  salary: Salary;
  aggregates: Aggregates;
  updateSalary: (val: number, day: number) => void;
  formatBRL: (val: number) => string;
}

export const SalarySection: React.FC<SalarySectionProps> = ({
  salary, aggregates, updateSalary, formatBRL,
}) => {
  const [editingSalary, setEditingSalary] = useState(false);
  const [newSalaryVal, setNewSalaryVal] = useState(salary.salario.toString());
  const [newSalaryDay, setNewSalaryDay] = useState(salary.diaRecebimento.toString());

  const { theme } = useApp();
  const isDark = theme === 'dark';

  const cardBg = isDark ? '#0f1629' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#475569';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSaveSalary = () => {
    updateSalary(parseFloat(newSalaryVal) || 0, parseInt(newSalaryDay) || 5);
    setEditingSalary(false);
  };

  const remainingColor = aggregates.remainingAvailable >= 0 ? '#10b981' : '#f43f5e';
  const remainingBg   = aggregates.remainingAvailable >= 0 
    ? (isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)') 
    : (isDark ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.05)');
  const remainingBorder = aggregates.remainingAvailable >= 0 
    ? (isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.15)') 
    : (isDark ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.15)');

  const labelStyleDynamic = {
    color: textSecondary, fontSize: 10, fontWeight: '700',
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
  };

  const inputStyleDynamic = {
    backgroundColor: inputBg,
    borderWidth: 1, borderColor: inputBorder,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    color: textPrimary, fontSize: 14, fontWeight: '600',
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={{
        backgroundColor: cardBg,
        borderWidth: 1, borderColor: cardBorder,
        borderRadius: 24, padding: 20, gap: 16,
      }}>
        {/* Top row: icon + salary info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: 'rgba(16,185,129,0.1)',
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)',
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 8,
          }}>
            <DollarSign size={22} color="#10b981" />
          </View>

          {editingSalary ? (
            <View style={{ flex: 1, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyleDynamic as any}>Salário (R$)</Text>
                  <TextInput
                    value={newSalaryVal}
                    onChangeText={setNewSalaryVal}
                    keyboardType="numeric"
                    style={inputStyleDynamic as any}
                    placeholderTextColor={textSecondary}
                  />
                </View>
                <View style={{ width: 72 }}>
                  <Text style={labelStyleDynamic as any}>Dia</Text>
                  <TextInput
                    value={newSalaryDay}
                    onChangeText={setNewSalaryDay}
                    keyboardType="numeric"
                    style={inputStyleDynamic as any}
                    placeholderTextColor={textSecondary}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={handleSaveSalary}
                  style={{
                    flex: 1, height: 40, borderRadius: 12,
                    backgroundColor: '#10b981',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 8,
                  }}
                >
                  <Check size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditingSalary(false)}
                  style={{
                    flex: 1, height: 40, borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} color={textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                  Salário Mensal
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setNewSalaryVal(salary.salario.toString());
                    setNewSalaryDay(salary.diaRecebimento.toString());
                    setEditingSalary(true);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
                    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
                  }}
                >
                  <Edit3 size={9} color="#818cf8" />
                  <Text style={{ color: '#818cf8', fontSize: 9, fontWeight: '700' }}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -1, marginTop: 2 }}>
                {formatBRL(salary.salario)}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 11, marginTop: 2 }}>
                todo dia {salary.diaRecebimento}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom row: mini cards */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)',
            borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)',
            borderRadius: 14, padding: 12,
          }}>
            <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Aportes Mensais
            </Text>
            <Text style={{ color: '#818cf8', fontSize: 15, fontWeight: '900', marginTop: 4 }}>
              {formatBRL(aggregates.totalAportes)}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: remainingBg,
            borderWidth: 1, borderColor: remainingBorder,
            borderRadius: 14, padding: 12,
          }}>
            <Text style={{ color: textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Livre p/ Gastar
            </Text>
            <Text style={{ color: remainingColor, fontSize: 15, fontWeight: '900', marginTop: 4 }}>
              {formatBRL(aggregates.remainingAvailable)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
