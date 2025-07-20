import { useState, useEffect } from 'react'
import { campaignsApi, groupsApi, dashboardApi } from '../lib/api'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Card, CardContent } from '../components/ui/Card'
import CampaignForm from '../components/CampaignForm'
import CampaignCard from '../components/CampaignCard'
import { Plus, MessageSquare, Loader2, Search, Filter, RefreshCw, CheckCircle, XCircle, Pause } from 'lucide-react'

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [filteredCampaigns, setFilteredCampaigns] = useState([])
  const [groups, setGroups] = useState([])
  const [instances, setInstances] = useState([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [nextExecutionTimes, setNextExecutionTimes] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    fetchCampaigns()
    fetchInstances()
  }, [])

  // Filter campaigns based on search and filters
  useEffect(() => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(campaign => campaign.type === typeFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    if (selectedInstance) {
      // Clear groups first to show loading state
      setGroups([])
      // Force refresh every time instance changes
      fetchGroups(true)
    } else {
      setGroups([])
    }
  }, [selectedInstance])

  // Calcular próximos horários de execução
  useEffect(() => {
    const calculateNextExecution = () => {
      const times = {}
      campaigns.forEach(campaign => {
        if (campaign.status === 'ACTIVE' && campaign.nextExecution) {
          times[campaign.id] = new Date(campaign.nextExecution)
        }
      })
      setNextExecutionTimes(times)
    }

    calculateNextExecution()
    const interval = setInterval(calculateNextExecution, 1000) // Atualizar a cada segundo

    return () => clearInterval(interval)
  }, [campaigns])

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsApi.getAll()
      setCampaigns(response.data)
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInstances = async () => {
    try {
      const response = await dashboardApi.getInstances()
      if (response.data.success) {
        const instanceList = response.data.data
        setInstances(instanceList)
        
        // Selecionar a primeira instância automaticamente
        if (instanceList.length > 0) {
          setSelectedInstance(instanceList[0].instanceName)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
    }
  }

  const fetchGroups = async (forceRefresh = false) => {
    if (!selectedInstance) return
    
    try {
      // Always fetch fresh data, no caching
      console.log(`🔄 Buscando grupos para instância: ${selectedInstance}`)
      const response = await groupsApi.getAll(selectedInstance)
      console.log(`📊 Grupos encontrados:`, response.data?.length || 0)
      setGroups(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
      setGroups([])
    }
  }


  const handleCreateCampaign = async (formDataToSend) => {
    try {
      await campaignsApi.create(formDataToSend)
      await fetchCampaigns()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      alert('Erro ao criar campanha: ' + error.response?.data?.error || error.message)
    }
  }

  const handleEditCampaign = async (formDataToSend) => {
    try {
      await campaignsApi.update(editingCampaign.id, formDataToSend)
      await fetchCampaigns()
      setEditingCampaign(null)
    } catch (error) {
      console.error('Erro ao editar campanha:', error)
      alert('Erro ao editar campanha: ' + error.response?.data?.error || error.message)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await campaignsApi.updateStatus(id, status)
      await fetchCampaigns()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status: ' + error.response?.data?.error || error.message)
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (confirm('Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.')) {
      try {
        await campaignsApi.delete(id)
        await fetchCampaigns()
      } catch (error) {
        console.error('Erro ao deletar campanha:', error)
        alert('Erro ao deletar campanha: ' + error.response?.data?.error || error.message)
      }
    }
  }

  const startEditing = (campaign) => {
    setEditingCampaign(campaign)
    setSelectedInstance(campaign.instance || selectedInstance)
  }

  const handleCancelForm = () => {
    setShowCreateForm(false)
    setEditingCampaign(null)
  }

  const getCampaignStats = () => {
    const total = campaigns.length
    const active = campaigns.filter(c => c.status === 'ACTIVE').length
    const paused = campaigns.filter(c => c.status === 'PAUSED').length
    const finished = campaigns.filter(c => c.status === 'FINISHED').length
    
    return { total, active, paused, finished }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  const stats = getCampaignStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campanhas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie suas campanhas de envio de mensagens</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={fetchCampaigns}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              <p className="text-sm text-gray-600">Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.paused}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pausadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.finished}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Finalizadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar campanhas por nome ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="min-w-0 flex-1 sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="ALL">📊 Todos os Status</option>
                    <option value="ACTIVE">🟢 Ativas</option>
                    <option value="PAUSED">🟡 Pausadas</option>
                    <option value="FINISHED">⚫ Finalizadas</option>
                  </select>
                </div>
                <div className="min-w-0 flex-1 sm:w-auto">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="ALL">📝 Todos os Tipos</option>
                    <option value="TEXT">📝 Texto</option>
                    <option value="IMAGE">🖼️ Imagem</option>
                    <option value="DOCUMENT">📄 Documento</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Filter Summary */}
            {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtros ativos:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Busca: {searchTerm}
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Status: {statusFilter}
                  </span>
                )}
                {typeFilter !== 'ALL' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Tipo: {typeFilter}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                    setTypeFilter('ALL')
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={handleCancelForm}
        title="Criar Nova Campanha"
        size="xl"
      >
        <CampaignForm
          instances={instances}
          groups={groups}
          selectedInstance={selectedInstance}
          onInstanceChange={setSelectedInstance}
          onSubmit={handleCreateCampaign}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        isOpen={!!editingCampaign}
        onClose={handleCancelForm}
        title={`Editar Campanha: ${editingCampaign?.name || ''}`}
        size="xl"
      >
        <CampaignForm
          isEditing={true}
          campaign={editingCampaign}
          instances={instances}
          groups={groups}
          selectedInstance={selectedInstance}
          onInstanceChange={setSelectedInstance}
          onSubmit={handleEditCampaign}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            nextExecutionTime={nextExecutionTimes[campaign.id]}
            onStatusChange={handleStatusChange}
            onEdit={startEditing}
            onDelete={handleDeleteCampaign}
          />
        ))}
      </div>

      {/* Empty States */}
      {filteredCampaigns.length === 0 && campaigns.length > 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma campanha encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tente ajustar os filtros de busca.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma campanha</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando sua primeira campanha de envio.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Campaigns