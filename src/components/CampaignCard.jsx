import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  FileText, 
  Image, 
  FileDown, 
  Users, 
  MessageSquare, 
  Clock, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react'
import { useState } from 'react'
import Button from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { formatDate } from '../lib/utils'

const CampaignCard = ({ 
  campaign, 
  nextExecutionTime, 
  onStatusChange, 
  onEdit, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
      case 'PAUSED': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700'
      case 'FINISHED': return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'IMAGE': return <Image className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'DOCUMENT': return <FileDown className="h-4 w-4 text-green-600 dark:text-green-400" />
      default: return <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'PAUSED': return <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case 'FINISHED': return <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const formatTimeRemaining = (nextTime) => {
    if (!nextTime) return 'N/A'
    
    const now = new Date()
    const diff = nextTime - now
    
    if (diff <= 0) return 'Executando...'
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'IMAGE': return 'Imagem'
      case 'DOCUMENT': return 'Documento'
      default: return 'Texto'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Ativa'
      case 'PAUSED': return 'Pausada'
      case 'FINISHED': return 'Finalizada'
      default: return status
    }
  }

  const groupsCount = campaign.groups ? JSON.parse(campaign.groups).length : 0

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 h-full">
      <div className={`h-1 rounded-t-lg ${campaign.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-green-600' : campaign.status === 'PAUSED' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gray-300'}`}></div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center space-x-2 mb-2 text-lg">
              <div className="flex items-center space-x-2">
                {getTypeIcon(campaign.type)}
                <span className="truncate font-bold text-gray-900 dark:text-white">{campaign.name}</span>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campaign.status)}`}>
                {getStatusLabel(campaign.status)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(campaign.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-20 min-w-[140px]">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(campaign)
                      setShowActions(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  
                  {campaign.status === 'PAUSED' ? (
                    <button
                      onClick={() => {
                        onStatusChange(campaign.id, 'ACTIVE')
                        setShowActions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Ativar</span>
                    </button>
                  ) : campaign.status === 'ACTIVE' ? (
                    <button
                      onClick={() => {
                        onStatusChange(campaign.id, 'PAUSED')
                        setShowActions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900 flex items-center space-x-2"
                    >
                      <Pause className="h-4 w-4" />
                      <span>Pausar</span>
                    </button>
                  ) : null}
                  
                  <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                  
                  <button
                    onClick={() => {
                      onDelete(campaign.id)
                      setShowActions(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Deletar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1">
        {/* Message Preview */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                {campaign.content}
              </p>
              {campaign.content.length > 80 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1 font-medium"
                >
                  {isExpanded ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
            {campaign.mediaPath && (
              <div className="ml-3 flex-shrink-0">
                <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  {campaign.type === 'IMAGE' ? (
                    <Image className="h-4 w-4 text-blue-600 dark:text-blue-400" title="Imagem anexada" />
                  ) : (
                    <FileDown className="h-4 w-4 text-green-600 dark:text-green-400" title="Documento anexado" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-blue-700 dark:text-blue-300">
                <Users className="h-3 w-3" />
                <span className="text-xs font-medium">Grupos</span>
              </div>
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{groupsCount}</span>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 p-2.5 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-green-700 dark:text-green-300">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs font-medium">Enviadas</span>
              </div>
              <span className="text-sm font-bold text-green-900 dark:text-green-100">{campaign.totalSent}</span>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-purple-700 dark:text-purple-300">
                <Clock className="h-3 w-3" />
                <span className="text-xs font-medium">Intervalo</span>
              </div>
              <span className="text-xs font-bold text-purple-900 dark:text-purple-100">
                {campaign.interval ? `${campaign.interval}s` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900 p-2.5 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-orange-700 dark:text-orange-300">
                <Calendar className="h-3 w-3" />
                <span className="text-xs font-medium">Próximo</span>
              </div>
              <div>
                {campaign.status === 'ACTIVE' ? (
                  <div className="flex items-center space-x-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${campaign.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-xs font-bold text-orange-900 dark:text-orange-100">
                      {formatTimeRemaining(nextExecutionTime)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-orange-600 dark:text-orange-400">Pausada</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          {campaign.status === 'PAUSED' ? (
            <Button
              size="sm"
              onClick={() => onStatusChange(campaign.id, 'ACTIVE')}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 h-8 text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Ativar
            </Button>
          ) : campaign.status === 'ACTIVE' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(campaign.id, 'PAUSED')}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 flex-1 h-8 text-xs"
            >
              <Pause className="w-3 h-3 mr-1" />
              Pausar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="border-gray-300 text-gray-400 flex-1 h-8 text-xs"
            >
              Finalizada
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onEdit(campaign)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-1 h-8 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        ></div>
      )}
    </Card>
  )
}

export default CampaignCard