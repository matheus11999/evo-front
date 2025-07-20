import { useState, useEffect } from 'react'
import { campaignsApi, logsApi } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  Activity
} from 'lucide-react'
import { formatDate } from '../lib/utils'

const Reports = () => {
  const [campaigns, setCampaigns] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalMessages: 0,
    successRate: 0,
    totalSuccess: 0,
    totalErrors: 0
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last year
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchLogs(),
        fetchStats()
      ])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsApi.getAll()
      setCampaigns(response.data)
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
    }
  }

  const fetchLogs = async () => {
    try {
      console.log('🔄 Buscando logs com filtros:', dateRange)
      const response = await logsApi.getAll({
        limit: 100,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      console.log('📊 Logs recebidos:', response.data)
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      setLogs([])
    }
  }

  const fetchStats = async () => {
    try {
      const campaignsResponse = await campaignsApi.getAll()
      const logsResponse = await logsApi.getAll({
        limit: 1000,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })

      const campaigns = campaignsResponse.data
      const logs = logsResponse.data.logs || []

      const totalSuccess = logs.filter(log => log.status === 'SUCCESS').length
      const totalErrors = logs.filter(log => log.status === 'ERROR').length
      const totalMessages = totalSuccess + totalErrors
      const successRate = totalMessages > 0 ? ((totalSuccess / totalMessages) * 100).toFixed(1) : 0

      setStats({
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        totalMessages,
        successRate: parseFloat(successRate),
        totalSuccess,
        totalErrors
      })
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
    }
  }

  const getCampaignPerformance = () => {
    return campaigns.map(campaign => {
      const campaignLogs = logs.filter(log => log.campaignId === campaign.id)
      const success = campaignLogs.filter(log => log.status === 'SUCCESS').length
      const errors = campaignLogs.filter(log => log.status === 'ERROR').length
      const total = success + errors
      const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0

      return {
        ...campaign,
        logsCount: total,
        successCount: success,
        errorCount: errors,
        successRate: parseFloat(successRate)
      }
    }).sort((a, b) => b.logsCount - a.logsCount)
  }

  const getRecentActivity = () => {
    return logs
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .slice(0, 10)
  }

  const exportReport = async () => {
    try {
      const response = await logsApi.export({
        format: 'csv',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      
      // Create download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${dateRange.startDate}-${dateRange.endDate}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Carregando relatórios...</span>
        </div>
      </div>
    )
  }

  const campaignPerformance = getCampaignPerformance()
  const recentActivity = getRecentActivity()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análise detalhada do desempenho das suas campanhas
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período de Análise
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Campanhas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Ativas</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mensagens</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sucesso</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.totalSuccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Erros</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.totalErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Taxa Sucesso</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho por Campanha</CardTitle>
            <CardDescription>
              Estatísticas detalhadas de cada campanha no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaignPerformance.slice(0, 5).map(campaign => (
                <div key={campaign.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {campaign.name}
                    </h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      campaign.successRate >= 90 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      campaign.successRate >= 70 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {campaign.successRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{campaign.logsCount} mensagens</span>
                    <span>{campaign.successCount} ✓ | {campaign.errorCount} ✗</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${campaign.successRate}%` }}
                    />
                  </div>
                </div>
              ))}
              {campaignPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma campanha com dados no período selecionado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription>
              Últimas mensagens enviadas pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map(log => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    log.status === 'SUCCESS' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {log.groupName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(log.sentAt)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {log.campaign?.name}
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Reports