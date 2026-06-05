import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export const DashboardDocs: React.FC = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 24 }}>
        <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          🏛️ SEMOB — Padrão Front-End
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 22 }}>
          Documentação do padrão front-end da Secretaria de Estado de Mobilidade do Distrito Federal (SEMOB).
        </Text>
      </View>
    </ScrollView>
  );
};

export default DashboardDocs;
