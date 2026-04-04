import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Tentar logar normalmente
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      // 2. Se falhar por credenciais inválidas, verificar se é um convite pendente
      if (signInError) {
        // Buscar se existe um convite para este email e senha literal
        const { data: invite, error: inviteError } = await supabase
          .from('invitations')
          .select('*')
          .eq('email', email)
          .eq('temporary_password', password)
          .maybeSingle();

        if (invite && !inviteError) {
          // É o primeiro acesso! Faremos o cadastro automático
          const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            setError("Erro ao ativar sua conta. Contate o administrador.");
          } else if (signUpData.user) {
            // Criar o perfil oficial com as permissões do convite
            await supabase.from('profiles').insert({
              id: signUpData.user.id,
              name: invite.name,
              email: invite.email,
              role: invite.role,
              status: 'ativo',
              permissions: invite.permissions
            });

            // Deletar o convite usado
            await supabase.from('invitations').delete().eq('id', invite.id);
            
            // Tentar logar novamente para garantir a sessão
            await supabase.auth.signInWithPassword({ email, password });
          }
        } else {
          const msgs: Record<string, string> = {
            'Invalid login credentials': 'E-mail ou senha incorretos.',
            'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
          };
          setError(msgs[signInError.message] ?? signInError.message);
        }
      }
    } catch (err: any) {
      setError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Brand */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">U</div>
            <div>
              <p className="auth-brand-name">UniTudo <span className="auth-brand-erp">ERP</span></p>
              <p className="auth-brand-tagline">Sistema de Gestão Empresarial</p>
            </div>
          </div>

          <div className="auth-feature-list">
            {[
              { icon: '📊', title: 'Dashboard completo', desc: 'Visão geral do negócio em tempo real' },
              { icon: '📦', title: 'Gestão de Estoque', desc: 'Controle total de produtos e inventário' },
              { icon: '💰', title: 'Financeiro', desc: 'Receitas, despesas e fluxo de caixa' },
              { icon: '🛒', title: 'PDV Integrado', desc: 'Ponto de venda rápido e eficiente' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="auth-feature-item"
              >
                <span className="auth-feature-icon">{f.icon}</span>
                <div>
                  <p className="auth-feature-title">{f.title}</p>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="auth-left-footer">
            © {new Date().getFullYear()} UniTudo ERP · Todos os direitos reservados
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="auth-right">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="auth-form-container"
        >
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="auth-brand-icon" style={{ width: 36, height: 36, fontSize: '1rem', background: '#2563eb', color: 'white' }}>U</div>
            <span className="auth-brand-name" style={{ fontSize: '1.1rem', color: '#1e3a8a' }}>
              UniTudo <span className="auth-brand-erp" style={{ color: '#94a3b8' }}>ERP</span>
            </span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Bem-vindo de volta</h1>
            <p className="auth-form-subtitle">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-fields">
            <div className="auth-field-group">
              <label className="auth-field-label">E-mail</label>
              <div className="auth-field-wrap">
                <Mail size={15} className="auth-field-ico" />
                <input
                  type="email"
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="auth-field-input"
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label">Senha</label>
              <div className="auth-field-wrap">
                <Lock size={15} className="auth-field-ico" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="auth-field-input"
                />
                <button
                  type="button"
                  className="auth-field-eye"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="auth-msg auth-msg--error"
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="auth-submit-btn"
            >
              {loading ? <Loader2 size={17} className="auth-spin" /> : 'Entrar no Sistema'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
