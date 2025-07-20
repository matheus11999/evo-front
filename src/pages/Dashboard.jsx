import { useState, useEffect } from 'react'
import { dashboardApi } from '../lib/api'
import { formatDate } from '../lib/utils'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import InstanceManager from '../components/InstanceManager'
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react'

const Dashboard = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await dashboardApi.getStatus()
      setStatus(response.data)
    } catch (error) {
      console.error('Erro ao buscar status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral do sistema e status das conexões</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da API</CardTitle>
            <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {status?.evolutionApi?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {status?.evolutionApi?.success ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Evolution API 2.2.3
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{status?.activeCampaigns || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Em execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{status?.totalLogs || 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mensagens enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timezone</CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{status?.timezone}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configuração atual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Último Envio</CardTitle>
            <CardDescription>
              Informações do último envio realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.lastSent ? (
              <div className="space-y-2">
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium">Campanha:</span> {status.lastSent.campaignName}
                </div>
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium">Grupo:</span> {status.lastSent.groupName}
                </div>
                <div className="text-gray-900 dark:text-white">
                  <span className="font-medium">Data:</span> {formatDate(status.lastSent.sentAt)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {status.lastSent.status === 'SUCCESS' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={status.lastSent.status === 'SUCCESS' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {status.lastSent.status === 'SUCCESS' ? 'Sucesso' : 'Erro'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum envio realizado ainda</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              Detalhes da conexão com a Evolution API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.evolutionApi?.success ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Conectado com sucesso</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  A API está funcionando corretamente e pronta para enviar mensagens.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400 font-medium">Erro de conexão</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {status?.evolutionApi?.error || 'Não foi possível conectar com a Evolution API'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchStatus}
                  className="mt-2"
                >
                  Testar Conexão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Instâncias */}
      <InstanceManager />
    </div>
  )
}

export default Dashboard