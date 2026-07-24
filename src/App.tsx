import React, { useState, Suspense } from 'react';
import AppProvider, { useApp } from './app/AppProvider';
import { useAuth } from './hooks/useAuth';
import { useModules } from './hooks/useModules';
import { useSemAcesso } from './hooks/useSemAcesso';
import { Sidebar } from './components/Sidebar';
import { Headerbar } from './components/Headerbar';
import { Button } from './components/Button';
import { ShieldAlert, KeyRound, User, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useIncognitoBlocker } from './hooks/useIncognitoBlocker';
import { useSecurity } from './hooks/useSecurity';
const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', minHeight: '300px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Carregando módulo...</span>
  </div>
);

// Lock / Blocked Screen Component
const LockScreen: React.FC = () => {
  const { usuario, fazerLogout } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--semob-bg)', padding: '1.5rem' }}>
      <div className="glassmorphism animate-scale-up" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', borderRadius: '1.25rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1.5rem' }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--semob-text)', marginBottom: '0.75rem' }}>Acesso não Autorizado</h2>
        <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Olá, <strong style={{ color: 'var(--semob-text)' }}>{usuario?.nome}</strong>. Sua autenticação com o LDAP ocorreu com sucesso, mas você não possui perfis ou permissões de módulos configurados no **CDP (Controle de Dados e Perfis)**.
        </p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', borderRadius: '0.375rem', fontSize: '0.8rem', color: 'var(--semob-danger)', textAlign: 'left', marginBottom: '2rem' }}>
          Entre em contato com o administrador do sistema para liberar seu perfil.
        </div>
        <Button variant="danger" style={{ width: '100%' }} onClick={fazerLogout}>
          Voltar para o Login
        </Button>
      </div>
    </div>
  );
};

const SemAcessoGuard = () => {
  const [apiPermissionError, setApiPermissionError] = useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      setApiPermissionError(e.detail?.mensagem || 'Acesso Restrito');
    };
    window.addEventListener('cdp:sem-acesso', handler);
    return () => window.removeEventListener('cdp:sem-acesso', handler);
  }, []);

  if (apiPermissionError) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
        style={{ pointerEvents: 'all' }}
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full mx-6 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 text-center">
             <AlertTriangle className="w-12 h-12 text-white mx-auto mb-2" />
             <h2 className="text-white text-xl font-black uppercase tracking-widest">Acesso Negado</h2>
          </div>
          <div className="p-8 text-center space-y-6">
            <p className="text-slate-700 font-medium">{apiPermissionError}</p>
            <button
              onClick={() => setApiPermissionError(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // The SemAcessoModal is shown if blocked and there's no API error. 
  // Wait, padrao_front uses LockScreen for blocked users.
  // I will just use LockScreen logic instead of SemAcessoModal if bloqueado is true.
  return null;
};

const IncognitoBlockScreen = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-red-500/30">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Acesso Bloqueado</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        O acesso ao sistema não é permitido através de Guias Anônimas (Incognito Mode) por motivos de segurança e rastreabilidade.
      </p>
      <p className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
        Por favor, feche esta aba e acesse o sistema utilizando uma guia normal do seu navegador.
      </p>
    </div>
  </div>
);

const GeoBlockScreen = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md text-center border border-amber-500/30">
      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Geolocalização Necessária</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        Para acessar o sistema via celular, a geolocalização precisa estar ativada e com permissão concedida.
      </p>
      <p className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
        Por favor, ative o GPS do seu celular e autorize o navegador a acessar sua localização nas configurações para liberar o acesso.
      </p>
    </div>
  </div>
);

// Login View
const LoginScreen: React.FC = () => {
  const { fazerLogin, erroLogin, loadingAuth } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password) return;
    try {
      await fazerLogin(nickname, password);
    } catch {
      // erroLogin is managed inside AuthContext
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--semob-bg)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background graphic glow */}
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: '350px', height: '350px', background: 'rgba(16, 185, 129, 0.02)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="glassmorphism animate-scale-up" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)' }}>
        
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', margin: '0 auto 1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--semob-text)', margin: 0 }}>SISMOB Portal</h2>
          <p style={{ color: 'var(--semob-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem', fontWeight: 700 }}>
            Secretaria de Mobilidade DF
          </p>
        </div>

        {/* Info Credentials Guide */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--semob-border)', padding: '0.85rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: 'var(--semob-text)', lineHeight: '1.5' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--semob-primary)', display: 'block', marginBottom: '0.25rem' }}>💡 Usuários CDP Disponíveis (Teste):</span>
          <ul style={{ paddingLeft: '1rem', margin: 0 }}>
            <li><strong>admin</strong> (Acesso Total / CDP Super)</li>
            <li><strong>auditor.silva</strong> (Acesso SUOP e SIF)</li>
            <li><strong>preposto.carvalho</strong> (Acesso SUOP Leitura)</li>
            <li><strong>sem.acesso</strong> (Sem Permissão)</li>
          </ul>
          <span style={{ display: 'block', marginTop: '0.5rem', color: 'var(--semob-text-muted)' }}>Senha: Qualquer valor.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Email/Nickname Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--semob-text-muted)' }}>Nickname / Matrícula</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--semob-text-muted)' }} />
              <input
                type="text"
                placeholder="Ex: auditor.silva"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem', color: 'var(--semob-text)', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--semob-primary)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--semob-border)' }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--semob-text-muted)' }}>Senha LDAP</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--semob-text-muted)' }} />
              <input
                type="password"
                placeholder="Digite sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--semob-bg)', border: '1px solid var(--semob-border)', borderRadius: '0.5rem', color: 'var(--semob-text)', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--semob-primary)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--semob-border)' }}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {erroLogin && (
            <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 500 }}>
              ⚠️ {erroLogin}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" loading={loadingAuth} style={{ width: '100%', marginTop: '0.5rem' }}>
            Acessar Sistema <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
          </Button>
        </form>
      </div>
    </div>
  );
};

// Main Layout Shell wrapper
const MainLayoutShell: React.FC = () => {
  const { modulos } = useModules();
  const { activeModuleId, activeSubMenuId } = useApp();

  // Find target component
  const activeMod = modulos.find(m => m.id === activeModuleId);
  const activeSub = activeMod?.subMenus?.find(s => s.id === activeSubMenuId);
  
  const ViewComponent = activeSub 
    ? activeSub.componente 
    : (activeMod ? activeMod.componente : null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--semob-bg)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* SemAcessoGuard Listener */}
      <SemAcessoGuard />

      {/* Right Column content container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Headerbar */}
        <Headerbar />

        {/* Content scrolling frame */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            {ViewComponent ? <ViewComponent /> : (
              <div style={{ padding: '2rem', background: 'var(--semob-surface)', border: '1px solid var(--semob-border)', borderRadius: '0.75rem' }}>
                <h3 style={{ color: 'var(--semob-text)' }}>Nenhum módulo selecionado</h3>
              </div>
            )}
          </Suspense>
        </main>

        {/* Footer info banner */}
        <footer
          style={{
            height: '40px',
            background: 'var(--semob-surface)',
            borderTop: '1px solid var(--semob-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            color: 'var(--semob-text-muted)',
            flexShrink: 0
          }}
        >
          Secretaria de Estado de Mobilidade do Distrito Federal • SEMOB-DF • 2026
        </footer>
      </div>
    </div>
  );
};

// Application Main Selector
const AppContent: React.FC = () => {
  const { isIncognito } = useIncognitoBlocker();
  const { geoBlocked, geoLoading } = useSecurity();
  const { estaAutenticado } = useAuth();
  const { bloqueado } = useSemAcesso();

  if (isIncognito === null || geoLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isIncognito === true) {
    return <IncognitoBlockScreen />;
  }

  if (geoBlocked) {
    return <GeoBlockScreen />;
  }

  if (!estaAutenticado) {
    return <LoginScreen />;
  }

  if (bloqueado) {
    return <LockScreen />;
  }

  return <MainLayoutShell />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
