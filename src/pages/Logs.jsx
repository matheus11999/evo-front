import { useState, useEffect } from 'react'
import { logsApi } from '../lib/api'
import { formatDate } from '../lib/utils'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  MessageSquare,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Activity,
  Server,
  Trash2,
  Smartphone
} from 'lucide-react'

const Logs = () => {
  const [activeTab, setActiveTab] = useState('messages')
  const [logs, setLogs] = useState([])
  const [apiLogs, setApiLogs] = useState([])
  const [apiStats, setApiStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState(new Set())
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  })
  const [apiFilters, setApiFilters] = useState({
    method: '',
    endpoint: '',
    instanceName: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [apiPagination, setApiPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchLogs()
    } else {
      fetchApiLogs()
      fetchApiStats()
    }
  }, [activeTab, pagination.page, filters, apiPagination.page, apiFilters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      const response = await logsApi.getAll(params)
      setLogs(response.data.logs)
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }))
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApiLogs = async () => {
    try {
      setApiLoading(true)
      const params = {
        page: apiPagination.page,
        limit: apiPagination.limit,
        ...apiFilters
      }
      
      const response = await logsApi.getApiLogs(params)
      setApiLogs(response.data.logs)
      setApiPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }))
    } catch (error) {
      console.error('Erro ao buscar logs da API:', error)
    } finally {
      setApiLoading(false)
    }
  }

  const fetchApiStats = async () => {
    try {
      const response = await logsApi.getApiStats()
      setApiStats(response.data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const toggleExpandedLog = (logId) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const handleExport = async (format) => {
    try {
      const params = { format, ...filters }
      const response = await logsApi.export(params)
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'logs.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'logs.json'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'ERROR':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return 'Sucesso'
      case 'ERROR': return 'Erro'
      case 'PENDING': return 'Pendente'
      default: return status
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleApiFilterChange = (field, value) => {
    setApiFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setApiPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearApiLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar os logs da API? Esta ação não pode ser desfeita.')) {
      return
    }
    
    try {
      await logsApi.clearApiLogs(30)
      fetchApiLogs()
      fetchApiStats()
      alert('Logs da API foram limpos com sucesso!')
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      alert('Erro ao limpar logs da API')
    }
  }

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'POST': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'PUT': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'DELETE': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    if (status >= 400 && status < 500) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    if (status >= 500) return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  }

  if (loading && logs.length === 0 && activeTab === 'messages') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs do Sistema</h1>
        <div className="flex space-x-2">
          {activeTab === 'messages' && (
            <>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </>
          )}
          {activeTab === 'api' && (
            <Button variant="outline" onClick={handleClearApiLogs}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Logs
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Logs de Mensagens
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Logs da Evolution API
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'messages' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="SUCCESS">Sucesso</option>
                  <option value="ERROR">Erro</option>
                  <option value="PENDING">Pendente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Inicial
                </label>
                <input
                  type="date"
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Final
                </label>
                <input
                  type="date"
                  className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'api' && (
        <>
          {/* API Stats */}
          {apiStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Estatísticas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiStats.stats.slice(0, 5).map((stat, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getMethodColor(stat.method)}`}>
                          {stat.method}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(stat.responseStatus)}`}>
                          {stat.responseStatus}
                        </span>
                        <span>{stat._count.id}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5" />
                    <span>Top Endpoints</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiStats.endpoints.slice(0, 5).map((endpoint, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate flex-1 mr-2">{endpoint.endpoint}</span>
                        <span className="font-medium">{endpoint._count.id}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <span>Instâncias</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiStats.instances.slice(0, 5).map((instance, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate flex-1 mr-2">{instance.instanceName}</span>
                        <span className="font-medium">{instance._count.id}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros da API</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Método
                  </label>
                  <select
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.method}
                    onChange={(e) => handleApiFilterChange('method', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.endpoint}
                    onChange={(e) => handleApiFilterChange('endpoint', e.target.value)}
                    placeholder="/instance/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instância
                  </label>
                  <input
                    type="text"
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.instanceName}
                    onChange={(e) => handleApiFilterChange('instanceName', e.target.value)}
                    placeholder="nome-instancia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.status}
                    onChange={(e) => handleApiFilterChange('status', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="200">200</option>
                    <option value="201">201</option>
                    <option value="400">400</option>
                    <option value="401">401</option>
                    <option value="404">404</option>
                    <option value="500">500</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.startDate}
                    onChange={(e) => handleApiFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data Final
                  </label>
                  <input
                    type="date"
                    className="w-full mt-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                    value={apiFilters.endDate}
                    onChange={(e) => handleApiFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'messages' && (
          <>
            {logs.map(log => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(log.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.campaign.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Grupo: {log.groupName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {getStatusText(log.status)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(log.sentAt)}
                          </p>
                        </div>
                      </div>
                      
                      {log.message && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {log.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {logs.length === 0 && !loading && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum log encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Não há logs de envio para os filtros selecionados.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'api' && (
          <>
            {apiLoading && apiLogs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Carregando logs da API...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {apiLogs.map(log => (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                              {log.method}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.responseStatus)}`}>
                              {log.responseStatus}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {log.responseTime}ms
                            </span>
                            {log.instanceName && (
                              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                                {log.instanceName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(log.createdAt)}
                            </span>
                            <button
                              onClick={() => toggleExpandedLog(log.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              {expandedLogs.has(log.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* URL and Endpoint */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.endpoint}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {log.url}
                          </p>
                        </div>

                        {/* Error */}
                        {log.error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                            <p className="text-sm text-red-800 dark:text-red-400">
                              <strong>Erro:</strong> {log.error}
                            </p>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedLogs.has(log.id) && (
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Request */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Requisição</h4>
                              <div className="space-y-2">
                                {log.requestHeaders && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Headers:</p>
                                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(JSON.parse(log.requestHeaders), null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.requestBody && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Body:</p>
                                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(JSON.parse(log.requestBody), null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Response */}
                            {log.responseBody && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Resposta</h4>
                                <pre className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(JSON.parse(log.responseBody), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {apiLogs.length === 0 && !apiLoading && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Globe className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum log da API encontrado</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Não há logs da Evolution API para os filtros selecionados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {activeTab === 'messages' && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} até{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Página {pagination.page} de {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'api' && apiPagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {((apiPagination.page - 1) * apiPagination.limit) + 1} até{' '}
            {Math.min(apiPagination.page * apiPagination.limit, apiPagination.total)} de{' '}
            {apiPagination.total} resultados
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={apiPagination.page <= 1}
              onClick={() => setApiPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </Button>
            
            <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Página {apiPagination.page} de {apiPagination.pages}
            </span>
            
            <Button
              variant="outline"
              disabled={apiPagination.page >= apiPagination.pages}
              onClick={() => setApiPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Logs