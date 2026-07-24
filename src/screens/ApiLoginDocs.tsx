import React from 'react';
import { BookOpen, Terminal, KeyRound } from 'lucide-react';

const ApiLoginDocs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consumo da API SISMOB</h1>
            <p className="text-gray-500">Documentação do Interceptor e Desafio de Login</p>
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          <p>
            O SISMOB utiliza uma abordagem baseada em tokens (JWT) e cabeçalhos customizados para garantir a rastreabilidade
            e segurança nas requisições ao backend. O arquivo <code>src/services/api.ts</code> contém as definições
            do interceptor global do Axios.
          </p>

          <h3 className="flex items-center gap-2 text-xl font-semibold mt-8 mb-4">
            <KeyRound className="text-blue-500" size={20} />
            Como o Interceptor Funciona
          </h3>
          <p>
            Toda vez que uma requisição é disparada pelo Axios, o interceptor (<code>api.interceptors.request.use</code>) 
            captura a requisição antes de ela ir para a rede e injeta os seguintes cabeçalhos se eles estiverem disponíveis:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Authorization</strong>: <code>Bearer &lt;token&gt;</code> (Token JWT armazenado no tokenStore)</li>
            <li><strong>x-user-id</strong>: ID do usuário autenticado</li>
            <li><strong>x-latitude</strong> e <strong>x-longitude</strong>: Coordenadas geográficas capturadas pelo <code>useSecurity</code></li>
          </ul>

          <h3 className="flex items-center gap-2 text-xl font-semibold mt-8 mb-4">
            <Terminal className="text-gray-700" size={20} />
            O Desafio
          </h3>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
            <h4 className="text-amber-800 font-bold mb-2">Desafio: Integração de Login Personalizado</h4>
            <p className="text-amber-900 mb-4">
              Crie uma função que consuma diretamente a rota <code>/api/auth/login</code> passando <code>username</code> e <code>password</code>.
              Após receber a resposta, você deve:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-amber-900 font-medium">
              <li>Extrair o token JWT e o ID do usuário da resposta.</li>
              <li>Armazenar o token usando <code>tokenStore.setToken()</code> e <code>tokenStore.setUserId()</code>.</li>
              <li>Testar se uma chamada para a rota protegida <code>/api/user/me</code> usando a instância <code>api</code> do axios passa com sucesso.</li>
            </ol>
            
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>
{`// Exemplo de como você deve estruturar a sua solução
import api from '../services/api';
import { tokenStore } from '../services/tokenStore';

export async function desafioLogin(username, password) {
  // 1. Fazer POST para /api/auth/login
  // 2. Extrair dados
  // 3. Salvar no tokenStore
  // 4. Testar Rota Protegida
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiLoginDocs;
