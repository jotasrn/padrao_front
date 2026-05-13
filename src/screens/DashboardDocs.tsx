import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardDocs: React.FC = () => {
  const { usuario } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'docs' | 'demo'>('docs');
  const [activeSection, setActiveSection] = useState<string>('intro');

  const docSections = [
    {
      id: 'intro',
      title: '🏛️ Introdução & Visão Geral',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
            Bem-vindo à documentação viva do padrão front-end da <strong>Secretaria de Estado de Mobilidade do Distrito Federal (SEMOB)</strong>. 
            Esta interface serve como demonstração viva e validadora das diretrizes de arquitetura, estrutura de arquivos e conexões.
          </p>
          
          <div style={{ padding: '1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase' }}>💡 Dica de Padrão</span>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem', margin: 0 }}>
              Este projeto base une <strong>React.js</strong>, <strong>TypeScript</strong> e <strong>Capacitor</strong> para empacotamento nativo Android, utilizando builds rápidos sob o motor do <strong>Vite</strong>.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#60a5fa' }}>Tecnologia</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#60a5fa' }}>Padrão Adotado</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#60a5fa' }}>Versão Referência</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Framework</td>
                <td style={{ padding: '0.75rem' }}>React.js</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: '#34d399' }}>^18.3.x</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Build Tool</td>
                <td style={{ padding: '0.75rem' }}>Vite</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: '#34d399' }}>^5.4.x</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Mobile Híbrido</td>
                <td style={{ padding: '0.75rem' }}>Capacitor</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: '#34d399' }}>^6.0.x</code></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Linguagem Mobile</td>
                <td style={{ padding: '0.75rem' }}>Java (JDK)</td>
                <td style={{ padding: '0.75rem' }}><code style={{ color: '#34d399' }}>21 (LTS)</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 'directories',
      title: '📂 Estrutura de Diretórios',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
            A arquitetura segue rigorosamente a divisão na pasta <code style={{ color: '#60a5fa' }}>src/</code> para garantir manutenibilidade:
          </p>
          <pre style={{ background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b', overflowX: 'auto', fontSize: '0.85rem', color: '#34d399' }}>
{`src/
├── app/          # Centralizador de rotas e injeção de provedores
├── assets/       # Imagens, Ícones e Styles globais (CSS Base)
├── components/   # UI Atoms/Molecules sem regra de negócio (ex: Botões)
├── config/       # Configurações do Capacitor e instâncias Axios/Fetch
├── context/      # Gerenciamento de estados globais (Tema, Usuário)
├── core/         # Adaptadores e interceptores de API padronizados
├── hooks/        # Lógica de negócio e orquestração de estados das telas
├── screens/      # Views (Telas) - Componentes 90% JSX, 10% lógica
├── services/     # Camada de comunicação de rede (API / Axios isolado)
├── types/        # Tipagens estáticas centralizadas (types/index.ts)
└── utils/        # Formatadores (CPF, Datas) e validadores`}
          </pre>
        </div>
      )
    },
    {
      id: 'architecture',
      title: '🏗️ Fluxo e Camadas (Regra de Ouro)',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
            O fluxo de requisição e dados deve sempre respeitar a dependência unidirecional:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '3px solid #3b82f6', paddingLeft: '1rem' }}>
            <div>
              <strong style={{ color: '#ffffff' }}>1. Screen (View)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#9ca3af' }}>Renders JSX e chama o Hook customizado. Não faz chamadas diretas para o Axios.</p>
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>2. Hook (Controller)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#9ca3af' }}>Consome os services, lida com estados locais de tela (loading, data) e orquestra regras.</p>
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>3. Service (Data Layer)</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#9ca3af' }}>Camada exclusiva de isolamento HTTP. Faz a requisição e devolve tipos estritos.</p>
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: '#ef444415', border: '1px solid #ef444430', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
            <strong style={{ color: '#f87171', display: 'block' }}>⚠️ Regra 90/10 & Limite de 50 Linhas</strong>
            <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Se um componente visual ou tela possuir mais de 50 linhas de lógicas ou estados, toda essa lógica de estado deve obrigatoriamente ser abstraída para um Custom Hook.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'docker',
      title: '🐳 Docker & Produção',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
            O boilerplate de front-end SEMOB conta com suporte nativo de containerização via **Multi-stage Docker build**:
          </p>
          <ol style={{ paddingLeft: '1.25rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
            <li>Compilação dos estáticos otimizada via Node Alpine</li>
            <li>Serviço ultra-leve através do servidor **Nginx Alpine**</li>
            <li>Configurações de redirecionamento nativas para suportar SPA Routing (React Router)</li>
          </ol>
          <pre style={{ background: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b', overflowX: 'auto', fontSize: '0.85rem', color: '#34d399' }}>
{`# Para buildar com variáveis do Vite:
docker build --build-arg VITE_API_URL=https://api.semob.df.gov.br -t semob-front-app .

# Para rodar localmente com compose:
docker compose up -d --build`}
          </pre>
        </div>
      )
    }
  ];

  const currentSectionData = docSections.find(s => s.id === activeSection);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: '#f3f4f6', 
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{ 
        background: '#1e293b', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.5px' }}>SEMOB</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Padrão Front-End</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === 'docs' ? '#3b82f6' : 'transparent',
              color: '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📘 Documentação
          </button>
          <button 
            onClick={() => setActiveTab('demo')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: activeTab === 'demo' ? '#10b981' : 'transparent',
              color: '#ffffff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚀 Demonstração Viva
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex' }}>
        {activeTab === 'docs' ? (
          <>
            {/* Sidebar para Documentos */}
            <aside style={{ 
              width: '280px', 
              background: '#1e293b', 
              borderRight: '1px solid #334155',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', padding: '0 0.5rem' }}>Capítulos</span>
              {docSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    textAlign: 'left',
                    background: activeSection === s.id ? '#334155' : 'transparent',
                    color: activeSection === s.id ? '#ffffff' : '#9ca3af',
                    fontWeight: activeSection === s.id ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {s.title}
                </button>
              ))}
              
              <div style={{ marginTop: 'auto', padding: '0.75rem', background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#60a5fa', fontWeight: 'bold' }}>👤 Logged Auditor</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', fontWeight: 'bold' }}>{usuario?.nome}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>{usuario?.cargo}</p>
              </div>
            </aside>

            {/* Content Area */}
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem' }}>
                {currentSectionData?.title}
              </h2>
              {currentSectionData?.content}
            </main>
          </>
        ) : (
          <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>🚀 Sandbox de Teste (Front-end SEMOB)</h2>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  Esta seção é a simulação viva do fluxo da arquitetura SEMOB. Ao clicar em filtrar, a tela aciona o Hook customizado (<code style={{ color: '#34d399' }}>/hooks/useOperadoras.ts</code>), que chama o Service (<code style={{ color: '#34d399' }}>/services/OperadoraService.ts</code>) isolando o Axios.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#60a5fa' }}>⚡ Hook State (useOperadoras)</h4>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                    O hook controla o estado reativo da view. O estado de carregamento e as coleções de retorno são isolados de forma limpa.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#34d399' }}>👤 Zustand Store (useAuthStore)</h4>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                    O estado global mantém as permissões do usuário <code style={{ color: '#34d399' }}>{usuario?.nome}</code> autenticado do sistema de forma síncrona.
                  </p>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        background: '#1e293b', 
        padding: '0.75rem 2rem', 
        textAlign: 'center', 
        borderTop: '1px solid #334155',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        Secretaria de Estado de Mobilidade do Distrito Federal • SEMOB-DF • 2026
      </footer>
    </div>
  );
};
export default DashboardDocs;
