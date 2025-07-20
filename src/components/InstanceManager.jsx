import { useState, useEffect } from 'react'
import { dashboardApi } from '../lib/api'
import Button from './ui/Button'
import Input from './ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { 
  Plus,
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone
} from 'lucide-react'

const InstanceManager = () => {
  const [instances, setInstances] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [instanceName, setInstanceName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [qrCode, setQrCode] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState('')

  useEffect(() => {
    fetchInstances()
  }, [])

  const fetchInstances = async () => {
    try {
      const response = await dashboardApi.getInstances()
      if (response.data.success) {
        setInstances(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstance = async (e) => {
    e.preventDefault()
    if (!instanceName.trim() || !phoneNumber.trim()) return

    setCreating(true)
    try {
      const response = await dashboardApi.createInstance(instanceName, phoneNumber)
      if (response.data.success) {
        await fetchInstances()
        setInstanceName('')
        setPhoneNumber('')
        setShowCreateForm(false)
        
        // Buscar QR Code automaticamente após criar
        setTimeout(() => {
          handleGetQRCode(instanceName)
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleGetQRCode = async (name) => {
    try {
      setQrCode(null)
      setSelectedInstance(name)
      setShowQrModal(true)
      
      const response = await dashboardApi.getQRCode(name)
      if (response.data.success) {
        const qrCodeData = response.data.data?.qrcode || response.data.data?.base64
        if (qrCodeData) {
          // Se for base64, adicionar o prefixo se necessário
          const qrCodeFormatted = qrCodeData.startsWith('data:image') 
            ? qrCodeData 
            : `data:image/png;base64,${qrCodeData}`
          setQrCode(qrCodeFormatted)
        } else {
          console.log('QR Code não disponível ainda')
        }
      } else {
        console.log('Erro ao buscar QR Code:', response.data.error)
        alert(`Erro: ${response.data.error}`)
      }
    } catch (error) {
      console.error('Erro ao buscar QR Code:', error)
      alert('Erro ao buscar QR Code. Verifique se a Evolution API está configurada corretamente.')
    }
  }

  const handleDeleteInstance = async (name) => {
    if (!confirm(`Tem certeza que deseja deletar a instância "${name}"?`)) return

    try {
      await dashboardApi.deleteInstance(name)
      await fetchInstances()
    } catch (error) {
      console.error('Erro ao deletar instância:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'connected':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900'
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900'
      case 'close':
      case 'disconnected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'connected':
        return <CheckCircle className="h-4 w-4" />
      case 'connecting':
        return <Clock className="h-4 w-4" />
      case 'close':
      case 'disconnected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Instâncias WhatsApp</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie suas conexões com o WhatsApp</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchInstances}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Instância
          </Button>
        </div>
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Instância</CardTitle>
            <CardDescription>
              Digite um nome único e o número de telefone para sua nova instância do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInstance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Instância
                  </label>
                  <Input
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="minha-empresa"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de Telefone
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="5511999999999"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Formato: código do país + DDD + número (ex: 5511999999999)
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button type="submit" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Instância'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setInstanceName('')
                    setPhoneNumber('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de instâncias */}
      <div className="grid gap-4">
        {instances.map((instance) => (
          <Card key={instance.instanceName}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {instance.instanceName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(instance.connectionStatus)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.connectionStatus)}`}>
                          {instance.connectionStatus || 'Desconhecido'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGetQRCode(instance.instanceName)}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteInstance(instance.instanceName)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {instances.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma instância</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Crie uma nova instância para começar a enviar mensagens.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Instância
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                QR Code - {selectedInstance}
              </h3>
              
              {qrCode ? (
                <div className="space-y-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code" 
                    className="mx-auto border rounded-lg"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Escaneie este QR Code com seu WhatsApp para conectar a instância
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Carregando QR Code...</p>
                </div>
              )}
              
              <div className="mt-6 flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleGetQRCode(selectedInstance)}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar QR Code
                </Button>
                <Button 
                  onClick={() => {
                    setShowQrModal(false)
                    setQrCode(null)
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstanceManager