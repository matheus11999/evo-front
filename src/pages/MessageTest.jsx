import { useState, useEffect } from 'react'
import { dashboardApi, groupsApi } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { 
  Send,
  MessageCircle,
  Users,
  Image,
  FileText,
  MapPin,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

const MessageTest = () => {
  const [instances, setInstances] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedInstance, setSelectedInstance] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [recipientType, setRecipientType] = useState('number')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [messageText, setMessageText] = useState('')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaCaption, setMediaCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchInstances()
  }, [])

  useEffect(() => {
    if (selectedInstance && recipientType === 'group') {
      fetchGroups()
    }
  }, [selectedInstance, recipientType])

  const fetchInstances = async () => {
    try {
      const response = await dashboardApi.getInstances()
      if (response.data.success) {
        setInstances(response.data.data)
        // Auto-selecionar primeira instância conectada
        const connectedInstance = response.data.data.find(
          instance => instance.connectionStatus === 'open' || instance.connectionStatus === 'connected'
        )
        if (connectedInstance) {
          setSelectedInstance(connectedInstance.instanceName)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error)
    }
  }

  const fetchGroups = async () => {
    if (!selectedInstance) return
    
    try {
      setLoadingGroups(true)
      const response = await groupsApi.getAll(selectedInstance)
      setGroups(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
      setGroups([])
    } finally {
      setLoadingGroups(false)
    }
  }

  const sendTestMessage = async () => {
    if (!selectedInstance) {
      setResult({ success: false, error: 'Selecione uma instância' })
      return
    }

    const recipient = recipientType === 'number' ? phoneNumber : selectedGroup
    if (!recipient) {
      setResult({ success: false, error: 'Informe o destinatário' })
      return
    }

    if (messageType === 'text' && !messageText.trim()) {
      setResult({ success: false, error: 'Digite uma mensagem' })
      return
    }

    if (messageType === 'media' && !mediaFile) {
      setResult({ success: false, error: 'Selecione um arquivo de mídia' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      let response

      if (messageType === 'text') {
        // Enviar mensagem de texto
        response = await fetch(`/api/test/send-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            instanceName: selectedInstance,
            number: recipient,
            text: messageText
          })
        })
      } else if (messageType === 'media') {
        // Enviar mídia
        const formData = new FormData()
        formData.append('instanceName', selectedInstance)
        formData.append('number', recipient)
        formData.append('media', mediaFile)
        formData.append('caption', mediaCaption)

        response = await fetch(`/api/test/send-media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getToken()}`
          },
          body: formData
        })
      }

      const data = await response.json()
      setResult(data)

      // Limpar campos se sucesso
      if (data.success) {
        setMessageText('')
        setMediaFile(null)
        setMediaCaption('')
        setPhoneNumber('')
        setSelectedGroup('')
      }

    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Erro na requisição: ' + error.message 
      })
    } finally {
      setLoading(false)
    }
  }

  const getInstanceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100'
      case 'close':
      case 'disconnected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teste de Envio de Mensagens</h1>
        <p className="text-gray-600">Teste o envio de mensagens via Evolution API</p>
      </div>

      {/* Seleção de Instância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Configuração</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instância WhatsApp
            </label>
            <div className="flex space-x-2">
              <select
                className="flex-1 rounded-md border border-input bg-background px-3 py-2"
                value={selectedInstance}
                onChange={(e) => setSelectedInstance(e.target.value)}
              >
                <option value="">Selecione uma instância</option>
                {instances.map((instance) => (
                  <option key={instance.instanceName} value={instance.instanceName}>
                    {instance.instanceName}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={fetchInstances}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {selectedInstance && (
              <div className="mt-2">
                {instances
                  .filter(i => i.instanceName === selectedInstance)
                  .map(instance => (
                    <span
                      key={instance.instanceName}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInstanceStatusColor(instance.connectionStatus)}`}
                    >
                      Status: {instance.connectionStatus || 'Desconhecido'}
                    </span>
                  ))
                }
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Destinatário
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="number"
                  checked={recipientType === 'number'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="mr-2"
                />
                <User className="w-4 h-4 mr-1" />
                Número
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="group"
                  checked={recipientType === 'group'}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="mr-2"
                />
                <Users className="w-4 h-4 mr-1" />
                Grupo
              </label>
            </div>
          </div>

          {recipientType === 'number' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Telefone
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="5511999999999"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: código do país + DDD + número (ex: 5511999999999)
              </p>
            </div>
          )}

          {recipientType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo WhatsApp
              </label>
              <div className="flex space-x-2">
                <select
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={!selectedInstance}
                >
                  <option value="">Selecione um grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.participants} participantes)
                    </option>
                  ))}
                </select>
                <Button 
                  variant="outline" 
                  onClick={fetchGroups}
                  disabled={!selectedInstance || loadingGroups}
                >
                  {loadingGroups ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {groups.length === 0 && selectedInstance && !loadingGroups && (
                <p className="text-xs text-gray-500 mt-1">
                  Nenhum grupo encontrado para esta instância
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tipo de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Mensagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={messageType === 'text'}
                onChange={(e) => setMessageType(e.target.value)}
                className="mr-2"
              />
              <MessageCircle className="w-4 h-4 mr-1" />
              Texto
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="media"
                checked={messageType === 'media'}
                onChange={(e) => setMessageType(e.target.value)}
                className="mr-2"
              />
              <Image className="w-4 h-4 mr-1" />
              Mídia
            </label>
          </div>

          {messageType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem de Texto
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
                rows={4}
              />
            </div>
          )}

          {messageType === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo de Mídia
                </label>
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={(e) => setMediaFile(e.target.files[0])}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suporta: imagens, vídeos, áudios, PDF, DOC, DOCX
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legenda (Opcional)
                </label>
                <textarea
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  placeholder="Legenda da mídia..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Envio */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={sendTestMessage}
            disabled={loading || !selectedInstance}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Resultado do Envio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✅ Mensagem enviada com sucesso!</p>
                {result.data && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>ID da Mensagem:</strong> {result.data.key?.id}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Status:</strong> {result.data.status}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">❌ Erro ao enviar mensagem</p>
                <div className="bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-800">{result.error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MessageTest