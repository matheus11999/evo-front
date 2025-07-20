import { useState, useEffect } from 'react'
import { groupsApi, dashboardApi } from '../lib/api'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Users, RefreshCw, Image as ImageIcon, Smartphone } from 'lucide-react'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [instances, setInstances] = useState([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchInstances()
  }, [])

  useEffect(() => {
    if (selectedInstance) {
      fetchGroups()
    }
  }, [selectedInstance])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    if (!selectedInstance) return
    
    try {
      setRefreshing(true)
      const response = await groupsApi.getAll(selectedInstance)
      setGroups(response.data)
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
      setGroups([])
    } finally {
      setRefreshing(false)
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Grupos do WhatsApp</h1>
        <Button onClick={fetchGroups} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                {group.image ? (
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                  <CardDescription>
                    ID: {group.id.split('@')[0]}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{group.participants} participantes</span>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 break-all">
                {group.id}
              </div>
            </CardContent>
          </Card>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum grupo encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Verifique se a Evolution API está conectada e se há grupos disponíveis.
                </p>
                <div className="mt-6">
                  <Button onClick={fetchGroups}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {groups.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Total de {groups.length} grupos encontrados
        </div>
      )}
    </div>
  )
}

export default Groups