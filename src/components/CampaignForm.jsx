import { useState, useEffect } from 'react'
import { Plus, Edit, XCircle, FileDown, Upload } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import MessagePreview from './MessagePreview'
import GroupSelector from './GroupSelector'

const CampaignForm = ({ 
  isEditing = false, 
  campaign = null, 
  instances = [], 
  groups = [], 
  selectedInstance, 
  onInstanceChange,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT',
    content: '',
    groups: [],
    interval: '',
    scheduledTime: '',
    instance: selectedInstance
  })
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [selectedGroupNames, setSelectedGroupNames] = useState([])

  useEffect(() => {
    if (isEditing && campaign) {
      setFormData({
        name: campaign.name,
        type: campaign.type,
        content: campaign.content,
        groups: campaign.groups ? JSON.parse(campaign.groups) : [],
        interval: campaign.interval?.toString() || '',
        scheduledTime: campaign.scheduledTime || '',
        instance: campaign.instance || selectedInstance
      })
      
      if (campaign.mediaPath) {
        setMediaPreview(`http://localhost:3001${campaign.mediaPath}`)
      }
    } else {
      setFormData(prev => ({ ...prev, instance: selectedInstance }))
    }
  }, [isEditing, campaign, selectedInstance])

  useEffect(() => {
    // Update selected group names for preview
    const names = formData.groups.map(groupId => {
      const group = groups.find(g => g.id === groupId)
      return group ? group.name : groupId
    })
    setSelectedGroupNames(names)
  }, [formData.groups, groups])

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setMediaPreview(e.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        setMediaPreview(null)
      }
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedInstance) {
      alert('Selecione uma instância antes de continuar')
      return
    }
    
    if (formData.groups.length === 0) {
      alert('Selecione pelo menos um grupo')
      return
    }
    
    if ((formData.type === 'IMAGE' || formData.type === 'DOCUMENT') && !mediaFile && !mediaPreview) {
      alert(`Selecione um ${formData.type === 'IMAGE' ? 'arquivo de imagem' : 'documento'} para continuar`)
      return
    }
    
    const formDataToSend = new FormData()
    
    Object.keys(formData).forEach(key => {
      if (key === 'groups') {
        formDataToSend.append(key, JSON.stringify(formData[key]))
      } else {
        formDataToSend.append(key, formData[key])
      }
    })

    if (mediaFile) {
      formDataToSend.append('media', mediaFile)
    }

    await onSubmit(formDataToSend)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'TEXT',
      content: '',
      groups: [],
      interval: '',
      scheduledTime: '',
      instance: selectedInstance
    })
    setMediaFile(null)
    setMediaPreview(null)
  }

  const borderColor = isEditing ? 'border-orange-200' : 'border-blue-200'
  const bgColor = isEditing ? 'bg-orange-50' : 'bg-blue-50'
  const iconColor = isEditing ? 'text-orange-600' : 'text-blue-600'
  const focusColor = isEditing ? 'focus:border-orange-500 focus:ring-orange-500' : 'focus:border-blue-500 focus:ring-blue-500'

  return (
    <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Campanha *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Digite o nome da campanha"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Mensagem
                    </label>
                    <select
                      className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 ${focusColor}`}
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="TEXT">📝 Texto</option>
                      <option value="IMAGE">🖼️ Imagem</option>
                      <option value="DOCUMENT">📄 Documento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                    Instância WhatsApp *
                  </label>
                  <select
                    className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 ${focusColor}`}
                    value={selectedInstance}
                    onChange={(e) => {
                      onInstanceChange(e.target.value)
                      setFormData({...formData, instance: e.target.value})
                    }}
                    required
                  >
                    <option value="">Selecione uma instância</option>
                    {instances.map(instance => (
                      <option key={instance.instanceName} value={instance.instanceName}>
                        {instance.instanceName} ({instance.connectionStatus})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Conteúdo da Mensagem
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2">
                    Mensagem {formData.type !== 'TEXT' ? '(Legenda)' : ''} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 ${focusColor}`}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder={
                      formData.type === 'TEXT' 
                        ? "Digite sua mensagem..." 
                        : "Digite a legenda para sua mídia..."
                    }
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.content.length} caracteres
                  </p>
                </div>

                {/* Media Upload */}
                {(formData.type === 'IMAGE' || formData.type === 'DOCUMENT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.type === 'IMAGE' ? '🖼️ Imagem' : '📄 Documento'} *
                    </label>
                    
                    {mediaPreview && (
                      <div className="mb-3">
                        <div className="relative inline-block">
                          {formData.type === 'IMAGE' ? (
                            <img 
                              src={mediaPreview} 
                              alt="Preview" 
                              className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                            />
                          ) : (
                            <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg border border-gray-300">
                              <FileDown className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {mediaFile ? mediaFile.name : 'Arquivo selecionado'}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={removeMedia}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Escolher {formData.type === 'IMAGE' ? 'imagem' : 'documento'}
                          </span>
                        </div>
                        <input
                          type="file"
                          onChange={handleMediaChange}
                          accept={formData.type === 'IMAGE' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
                          className="hidden"
                        />
                      </label>
                      {mediaFile && (
                        <span className="text-sm text-green-600 font-medium">
                          ✓ Arquivo selecionado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.type === 'IMAGE' 
                        ? 'Formatos: JPG, PNG, GIF (máx. 10MB)'
                        : 'Formatos: PDF, DOC, DOCX, TXT (máx. 10MB)'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Targeting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Grupos de Destino
                </h3>
                
                <GroupSelector
                  groups={groups}
                  selectedGroups={formData.groups}
                  onChange={(selected) => setFormData({...formData, groups: selected})}
                  required={true}
                />
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Agendamento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ⏱️ Intervalo (segundos)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: e.target.value})}
                      placeholder="Ex: 30"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tempo entre envios para cada grupo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📅 Horário Agendado
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ou escolha um horário específico
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t">
                <Button type="submit" className="flex-1">
                  {isEditing ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Campanha
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm()
                    onCancel()
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Preview da Mensagem
            </h3>
            <div className="sticky top-4">
              <MessagePreview
                type={formData.type}
                content={formData.content}
                mediaFile={mediaFile}
                mediaPreview={mediaPreview}
                groups={selectedGroupNames}
              />
            </div>
          </div>
        </div>
    </div>
  )
}

export default CampaignForm