import { useState, useEffect } from 'react'
import { configApi, logsApi } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Settings as SettingsIcon, Save, TestTube, Download, Database, Trash2 } from 'lucide-react'

const Settings = () => {
  const [config, setConfig] = useState({
    evolutionUrl: '',
    evolutionKey: '',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [backupLoading, setBackupLoading] = useState(false)
  const [clearingLogs, setClearingLogs] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await configApi.get()
      setConfig(response.data)
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await configApi.update(config)
      setMessage('Configurações salvas com sucesso!')
    } catch (error) {
      setMessage('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await fetch('/api/config/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup-${new Date().toISOString().split('T')[0]}.db`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setMessage('Backup baixado com sucesso!')
      } else {
        setMessage('Erro ao gerar backup')
      }
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
      setMessage('Erro ao gerar backup')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      return
    }
    
    setClearingLogs(true)
    try {
      await logsApi.clearAll()
      setMessage('Logs limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      setMessage('Erro ao limpar logs')
    } finally {
      setClearingLogs(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolution API</CardTitle>
            <CardDescription>
              Configure a conexão com a Evolution API para envio de mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL da Evolution API
              </label>
              <Input
                type="url"
                value={config.evolutionUrl}
                onChange={(e) => handleChange('evolutionUrl', e.target.value)}
                placeholder="http://localhost:8080"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL base da sua instância da Evolution API
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key
              </label>
              <Input
                type="password"
                value={config.evolutionKey}
                onChange={(e) => handleChange('evolutionKey', e.target.value)}
                placeholder="Sua chave da API"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chave de autenticação da Evolution API
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Personalize o comportamento da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Timezone
              </label>
              <select
                className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                value={config.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="America/Sao_Paulo">América/São Paulo (GMT-3)</option>
                <option value="America/New_York">América/Nova York (GMT-5)</option>
                <option value="Europe/London">Europa/Londres (GMT+0)</option>
                <option value="Asia/Tokyo">Ásia/Tóquio (GMT+9)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Fuso horário para agendamento de campanhas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Idioma
              </label>
              <select
                className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                value={config.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Idioma da interface da aplicação
              </p>
            </div>
          </CardContent>
        </Card>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('sucesso') 
              ? 'bg-green-50 border border-green-200 text-green-600' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="flex space-x-4">
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          <Button type="button" variant="outline">
            <TestTube className="w-4 h-4 mr-2" />
            Testar Conexão
          </Button>
        </div>
      </form>

      {/* Backup & Maintenance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Manutenção</CardTitle>
          <CardDescription>
            Gerencie backups do banco de dados e limpeza de logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Backup do Banco</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Baixe uma cópia completa do banco de dados SQLite
              </p>
              <Button 
                onClick={handleBackup} 
                disabled={backupLoading}
                variant="outline"
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                {backupLoading ? 'Gerando...' : 'Baixar Backup'}
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Limpar Logs</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Remove todos os logs de mensagens e APIs do sistema
              </p>
              <Button 
                onClick={handleClearLogs} 
                disabled={clearingLogs}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearingLogs ? 'Limpando...' : 'Limpar Todos os Logs'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings